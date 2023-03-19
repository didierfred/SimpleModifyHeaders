
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 *
 * @author didierfred@gmail.com
 * @version 0.4
 */


"use strict";

let config;
let started = 'off';
let debug_mode = false;
const isChrome = (navigator.userAgent.toLowerCase().indexOf("chrome") !== -1);

loadFromBrowserStorage(['config', 'started'], function (result) {

  // if old storage method
  if (result.config === undefined) loadConfigurationFromLocalStorage();
  else {
    started = result.started;
    config = JSON.parse(result.config);
  }

  if (started === 'on') {
    addListener();
    chrome.browserAction.setIcon({ path: 'icons/modify-green-32.png' });
  }
  else if (started !== 'off') {
    started = 'off';
    storeInBrowserStorage({ started: 'off' });
  }
  // listen for change in configuration or start/stop
  chrome.runtime.onMessage.addListener(notify);
});


function loadConfigurationFromLocalStorage() {
  // if configuration exist 
  if (localStorage.getItem('config')) {
    console.log("Load standard config");
    config = JSON.parse(localStorage.getItem('config'));

    // If config 1.0 (Simple Modify headers V1.2) , save to format 1.1
    if (config.format_version === "1.0") {
      config.format_version = "1.2";
      for (let line of config.headers) {
        line.apply_on = "req";
        line.url_contains = "";
      }
      config.debug_mode = false;
      config.use_url_contains = false;
      console.log("save new config" + JSON.stringify(config));
    }
    // If config 1.1 (Simple Modify headers V1.3 to version 1.5) , save to format 1.2	
    if (config.format_version === "1.1") {
      config.format_version = "1.2";
      for (let line of config.headers) line.url_contains = "";
      config.use_url_contains = false;
      console.log("save new config" + JSON.stringify(config));
    }
  }
  else {
    // else check if old config exist (Simple Modify headers V1.1)
    if (localStorage.getItem('targetPage') && localStorage.getItem('modifyTable')) {
      console.log("Load old config");
      let headers = [];
      let modifyTable = JSON.parse(localStorage.getItem("modifyTable"));
      for (const to_modify of modifyTable) {
        headers.push({ action: to_modify[0], url_contains: "", header_name: to_modify[1], header_value: to_modify[2], comment: "", apply_on: "req", status: to_modify[3] });
      }
      config = { format_version: "1.1", target_page: localStorage.getItem('targetPage'), headers: headers, debug_mode: false, use_url_contains: false };
    }
    //else no config exists, create a default one
    else {
      console.log("Load default config");
      let headers = [];
      headers.push({ url_contains: "", action: "add", header_name: "test-header-name", header_value: "test-header-value", comment: "test", apply_on: "req", status: "on" });
      config = { format_version: "1.1", target_page: "https://httpbin.org/*", headers: headers, debug_mode: false, use_url_contains: false };
    }
  }
  storeInBrowserStorage({ config: JSON.stringify(config) });
  started = localStorage.getItem('started');
  if (started !== undefined) storeInBrowserStorage({ started: started });
}




function loadFromBrowserStorage(item, callback_function) {
  chrome.storage.local.get(item, callback_function);
}

function storeInBrowserStorage(item, callback_function) {
  chrome.storage.local.set(item, callback_function);
}

/*
 * This function set a key-value pair in HTTP header "Cookie", 
 *   and returns the value of HTTP header after modification. 
 * If key already exists, it modify the value. 
 * If key doesn't exist, it add the key-value pair. 
 * If value is undefined, it delete the key-value pair from cookies. 
 *
 * Assuming that, the same key SHOULD NOT appear twice in cookies. 
 * Also assuming that, all cookies doesn't contains semicolon. 
 *   (99.9% websites are following these rules)
 *
 * Example: 
 *   cookie_keyvalues_set("msg=good; user=recolic; password=test", "user", "p")
 *     => "msg=good; user=p; password=test"
 *   cookie_keyvalues_set("msg=good; user=recolic; password=test", "time", "night")
 *     => "msg=good; user=recolic; password=test;time=night"
 *
 * Recolic K <root@recolic.net>
 */
function cookie_keyvalues_set(original_cookies, key, value) {
    let new_element = " " + key + "=" + value; // not used if value is undefined. 
    let cookies_ar = original_cookies.split(";").filter(e => e.trim().length > 0);
    let selected_cookie_index = cookies_ar.findIndex(kv => kv.trim().startsWith(key+"="));
    if ((selected_cookie_index == -1) && (value != undefined)) cookies_ar.push(new_element);
    else {
        if (value === undefined)
            cookies_ar.splice(selected_cookie_index, 1);
        else
            cookies_ar.splice(selected_cookie_index, 1, new_element);
    }
    return cookies_ar.join(";");
}
/* 
 * This function modify the HTTP response header "Set-Cookie", 
 *   and replace the value of its cookie, to some new_value. 
 * If key doesn't match original_set_cookie_header_content, new key is used in result. 
 *
 * Example: 
 *   set_cookie_modify_cookie_value("token=123; path=/; expires=Sat, 30 Oct 2021 17:57:32 GMT; secure; HttpOnly", "token", "bar")
 *     => "token=bar; path=/; expires=Sat, 30 Oct 2021 17:57:32 GMT; secure; HttpOnly"
 *   set_cookie_modify_cookie_value("  user=recolic", "user", "hacker")
 *     => "user=hacker"
 *   set_cookie_modify_cookie_value("user=recolic; path=/; HttpOnly", "token", "bar")
 *     => "token=bar; path=/; HttpOnly"
 *
 * Recolic K <root@recolic.net>
 */
function set_cookie_modify_cookie_value(original_set_cookie_header_content, key, new_value) {
    let trimmed = original_set_cookie_header_content.trimStart();
    let original_attributes = trimmed.indexOf(";") === -1 ? "" : trimmed.substring(trimmed.indexOf(";"))
    return key + "=" + new_value + original_attributes;
}


/*
* Standard function to log messages
*
*/

function log(message) {
  console.log(new Date() + " SimpleModifyHeader : " + message);
}

/*
* Rewrite the request header (add , modify or delete)
*
*/
function rewriteRequestHeader(e) {
  if (config.debug_mode) log("Start modify request headers for url " + e.url);
  for (let to_modify of config.headers) {
    if ((to_modify.status === "on") && (to_modify.apply_on === "req") && (!config.use_url_contains || (config.use_url_contains && e.url.includes(to_modify.url_contains.trim())))) {
      if (to_modify.action === "add") {
        let new_header = { "name": to_modify.header_name, "value": to_modify.header_value };
        e.requestHeaders.push(new_header);
        if (config.debug_mode) log("Add request header : name=" + to_modify.header_name +
          ",value=" + to_modify.header_value + " for url " + e.url);
      }
      else if (to_modify.action === "modify") {
        for (let header of e.requestHeaders) {
          if (header.name.toLowerCase() === to_modify.header_name.toLowerCase()) {
            if (config.debug_mode) log("Modify request header :  name= " + to_modify.header_name +
              ",old value=" + header.value + ",new value=" + to_modify.header_value +
              " for url " + e.url);
            header.value = to_modify.header_value;
          }
        }
      }
      else if (to_modify.action === "delete") {
        let index = -1;
        for (let i = 0; i < e.requestHeaders.length; i++) {
          if (e.requestHeaders[i].name.toLowerCase() === to_modify.header_name.toLowerCase()) index = i;
        }
        if (index !== -1) {
          e.requestHeaders.splice(index, 1);
          if (config.debug_mode) log("Delete request header :  name=" + to_modify.header_name.toLowerCase() +
            " for url " + e.url);
        }
      }
      else if (to_modify.action === "cookie_add_or_modify") {
        let header_cookie = e.requestHeaders.find(header => header.name.toLowerCase() === "cookie");
        let new_cookie = cookie_keyvalues_set(header_cookie === undefined ? "" : header_cookie.value, to_modify.header_name, to_modify.header_value);
        if (header_cookie === undefined) {
          e.requestHeaders.push({"name": "Cookie", "value": new_cookie});
          if (config.debug_mode) log("cookie_add_or_modify.req new_header : name=Cookie,value=" + new_cookie + " for url " + e.url);
        }
        else {
          header_cookie.value = new_cookie;
          if (config.debug_mode) log("cookie_add_or_modify.req modify_header : name=Cookie,value=" + new_cookie + " for url " + e.url);
        }
      }
      else if (to_modify.action === "cookie_delete") {
        let header_cookie = e.requestHeaders.find(header => header.name.toLowerCase() === "cookie");
        let new_cookie = cookie_keyvalues_set(header_cookie === undefined ? "" : header_cookie.value, to_modify.header_name, undefined);
        if (header_cookie === undefined) {
          if (config.debug_mode) log("cookie_delete.req: no cookie header found. doing nothing for url " + e.url);
        }
        else {
          header_cookie.value = new_cookie;
          if (config.debug_mode) log("cookie_delete.req modify_header : name=Cookie,value=" + new_cookie + " for url " + e.url);
        }
      }
    }
  }
  if (config.debug_mode) log("End modify request headers for url " + e.url);
  return { requestHeaders: e.requestHeaders };
}


/*
* Rewrite the response header (add , modify or delete)
*
*/
function rewriteResponseHeader(e) {
  if (config.debug_mode) log("Start modify response headers for url " + e.url);
  for (let to_modify of config.headers) {
    if ((to_modify.status === "on") && (to_modify.apply_on === "res") && (!config.use_url_contains || (config.use_url_contains && e.url.includes(to_modify.url_contains.trim())))) {
      if (to_modify.action === "add") {
        let new_header = { "name": to_modify.header_name, "value": to_modify.header_value };
        e.responseHeaders.push(new_header);
        if (config.debug_mode) log("Add response header : name=" + to_modify.header_name
          + ",value=" + to_modify.header_value + " for url " + e.url);
      }
      else if (to_modify.action === "modify") {
        for (let header of e.responseHeaders) {
          if (header.name.toLowerCase() === to_modify.header_name.toLowerCase()) {
            if (config.debug_mode) log("Modify response header :  name= " + to_modify.header_name + ",old value="
              + header.value + ",new value=" + to_modify.header_value + " for url " + e.url);
            header.value = to_modify.header_value;
          }
        }
      }
      else if (to_modify.action === "delete") {
        let index = -1;
        for (let i = 0; i < e.responseHeaders.length; i++) {
          if (e.responseHeaders[i].name.toLowerCase() === to_modify.header_name.toLowerCase()) index = i;
        }
        if (index !== -1) {
          e.responseHeaders.splice(index, 1);
          if (config.debug_mode) log("Delete response header :  name=" + to_modify.header_name.toLowerCase()
            + " for url " + e.url);
        }
      }
      else if (to_modify.action === "cookie_add_or_modify") {
        let header_cookie = e.responseHeaders.find(header => 
            header.name.toLowerCase() === "set-cookie" && 
            header.value.toLowerCase().trim().startsWith(to_modify.header_name.toLowerCase()+"=")
        );
        let new_header_value = set_cookie_modify_cookie_value(header_cookie === undefined ? "" : header_cookie.value, to_modify.header_name, to_modify.header_value);
        if (header_cookie === undefined) {
          log("SimpleModifyHeaders.Warning: you're using cookie_add_or_modify in Response. While adding new cookie in response, this plugin only generates `Set-Cookie: cookie-name=cookie-value `, without ANY additional attributes. Add a `Set-Cookie` header if you need them. ");
          e.responseHeaders.push({"name": "Set-Cookie", "value": new_header_value});
          if (config.debug_mode) log("cookie_add_or_modify.resp new_header : name=Cookie,value=" + new_header_value + " for url " + e.url);
        }
        else {
          header_cookie.value = new_header_value;
          if (config.debug_mode) log("cookie_add_or_modify.resp modify_header : name=Cookie,value=" + new_header_value + " for url " + e.url);
        }
      }
      else if (to_modify.action === "cookie_delete") {
        let index = e.responseHeaders.findIndex(header => 
            header.name.toLowerCase() === "set-cookie" && 
            header.value.toLowerCase().trim().startsWith(to_modify.header_name.toLowerCase()+"=")
        );
        if (index === -1) {
          if (config.debug_mode) log("cookie_delete.resp: no matching set-cookie header. doing nothing for url " + e.url);
        }
        else {
          e.responseHeaders.splice(index, 1);
          if (config.debug_mode) log("cookie_delete.resp delete_header : name=" + to_modify.header_name + " for url " + e.url);
        }
      }
    }
  }
  if (config.debug_mode) log("End modify response headers for url " + e.url);
  return { responseHeaders: e.responseHeaders };
}


/*
* Listen for message form config.js
* if message is reload : reload the configuration
* if message is on : start the modify header
* if message is off : stop the modify header
*
**/
function notify(message) {
  if (message === "reload") {
    if (config.debug_mode) log("Reload configuration");
    loadFromBrowserStorage(['config'], function (result) {
      config = JSON.parse(result.config);
      if (started === "on") {
        removeListener();
        addListener();
      }
    });
  }
  else if (message === "off") {
    removeListener();
    chrome.browserAction.setIcon({ path: "icons/modify-32.png" });
    started = "off";
    if (config.debug_mode) log("Stop modifying headers");
  }
  else if (message === "on") {
    addListener();
    chrome.browserAction.setIcon({ path: "icons/modify-green-32.png" });
    started = "on";
    if (config.debug_mode) log("Start modifying headers");
  }
}

/*
* Add rewriteRequestHeader as a listener to onBeforeSendHeaders, only for the target pages.
* Add rewriteResponseHeader as a listener to onHeadersReceived, only for the target pages.
* Make it "blocking" so we can modify the headers.
*/
function addListener() {
  let target = config.target_page.replaceAll(' ',''); 
  if ((target === "*") || (target === "")) target = "<all_urls>";

  // need to had "extraHeaders" option for chrome https://developer.chrome.com/extensions/webRequest#life_cycle_footnote
  if (isChrome) {
    chrome.webRequest.onBeforeSendHeaders.addListener(rewriteRequestHeader,
      { urls: target.split(";") },
      ["blocking", "requestHeaders", "extraHeaders"]);

    chrome.webRequest.onHeadersReceived.addListener(rewriteResponseHeader,
      { urls: target.split(";") },
      ["blocking", "responseHeaders", "extraHeaders"]);
  }

  else {
    chrome.webRequest.onBeforeSendHeaders.addListener(rewriteRequestHeader,
      { urls: target.split(";") },
      ["blocking", "requestHeaders"]);
    chrome.webRequest.onHeadersReceived.addListener(rewriteResponseHeader,
      { urls: target.split(";") },
      ["blocking", "responseHeaders"]);
  }

}


/*
* Remove the two listener
*
*/
function removeListener() {
  chrome.webRequest.onBeforeSendHeaders.removeListener(rewriteRequestHeader);
  chrome.webRequest.onHeadersReceived.removeListener(rewriteResponseHeader);
}


