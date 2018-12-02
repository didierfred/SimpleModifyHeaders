
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

loadFromBrowserStorage(['config','started'],function(result) {
  config = result.config;
 
 // if old storage method
  if (config===undefined)  loadConfigurationFromLocalStorage();
  else started = result.started;

  if (started==='on') {
    addListener();
    chrome.browserAction.setIcon({ path: 'icons/modify-green-32.png'});
  }
  else if (started !== 'off') { 
    started = 'off';
    storeInBrowserStorage({started:'off'});    
  }
  // listen for change in configuration or start/stop
  chrome.runtime.onMessage.addListener(notify);
});


function  loadConfigurationFromLocalStorage() {
  // if configuration exist 
  if (localStorage.getItem('config')) {
    console.log("Load standard config");
    config= JSON.parse(localStorage.getItem('config'));
 
    // If config 1.0 (Simple Modify headers V1.2) , save to format 1.1
    if (config.format_version==="1.0") {
      config.format_version="1.2";
      for (let line of config.headers) {
        line.apply_on="req";
        line.url_contains="";
      }
      config.debug_mode=false;
      config.use_url_contains=false;
      console.log("save new config"+JSON.stringify(config));
    }
    // If config 1.1 (Simple Modify headers V1.3 to version 1.5) , save to format 1.2	
    if (config.format_version==="1.1") {
      config.format_version="1.2";
      for (let line of config.headers) line.url_contains="";
      config.use_url_contains=false;
      console.log("save new config"+JSON.stringify(config));
    }
  }
  else {
    // else check if old config exist (Simple Modify headers V1.1)
    if (localStorage.getItem('targetPage')&& localStorage.getItem('modifyTable')) {
      console.log("Load old config");
      let headers = [];
      let modifyTable=JSON.parse(localStorage.getItem("modifyTable"));
      for (const to_modify of modifyTable) {
        headers.push({action:to_modify[0],url_contains:"",header_name:to_modify[1],header_value:to_modify[2],comment:"",apply_on:"req",status:to_modify[3]});
      }
      config = {format_version:"1.1",target_page:localStorage.getItem('targetPage'),headers:headers,debug_mode:false,use_url_contains:false};
    }
    //else no config exists, create a default one
    else {
      console.log("Load default config");
      let headers = [];
      headers.push({url_contains:"",action:"add",header_name:"test-header-name",header_value:"test-header-value",comment:"test",apply_on:"req",status:"on"});
      config = {format_version:"1.1",target_page:"https://httpbin.org/*",headers:headers,debug_mode:false,use_url_contains:false};
    }
  }
  storeInBrowserStorage({config:JSON.stringify(config)});
  started=localStorage.getItem('started');
  if (started!==undefined) storeInBrowserStorage({started:started});
}	




function loadFromBrowserStorage(item,callback_function) { 
  chrome.storage.local.get(item, callback_function);
}

function storeInBrowserStorage(item,callback_function)  {
  chrome.storage.local.set(item,callback_function);
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
    if ((to_modify.status==="on")&&(to_modify.apply_on==="req")&& (!config.use_url_contains || (config.use_url_contains && e.url.includes(to_modify.url_contains)))) {
      if (to_modify.action==="add"){
        let new_header = {"name" :to_modify.header_name,"value":to_modify.header_value};
        e.requestHeaders.push(new_header);
		if (config.debug_mode) log("Add request header : name=" + to_modify.header_name +
		  ",value=" + to_modify.header_value + " for url " + e.url);
      }
      else if (to_modify.action==="modify") {
	for (let header of e.requestHeaders) {
          if (header.name.toLowerCase() === to_modify.header_name.toLowerCase()) {
            if (config.debug_mode) log("Modify request header :  name= " + to_modify.header_name +
			  ",old value=" + header.value +  ",new value=" + to_modify.header_value +
			  " for url " + e.url);
            header.value = to_modify.header_value;
          }
        }
      }
      else if (to_modify.action==="delete") {
        let index = -1;
        for (let i=0; i < e.requestHeaders.length; i++) {
          if (e.requestHeaders[i].name.toLowerCase() === to_modify.header_name.toLowerCase())  index=i;
        }
	if (index!==-1) {
          e.requestHeaders.splice(index,1);
          if (config.debug_mode) log("Delete request header :  name=" + to_modify.header_name.toLowerCase() +
		    " for url " + e.url);
        }
      }
    }
  }
  if (config.debug_mode) log("End modify request headers for url " + e.url);
  return {requestHeaders: e.requestHeaders};
}


/*
* Rewrite the response header (add , modify or delete)
*
*/
function rewriteResponseHeader(e) {
  if (config.debug_mode) log("Start modify response headers for url " + e.url);
  for (let to_modify of config.headers) {
    if ((to_modify.status==="on")&&(to_modify.apply_on==="res")&& (!config.use_url_contains || (config.use_url_contains && e.url.includes(to_modify.url_contains)))) {
      if (to_modify.action==="add") {
        let new_header = {"name" :to_modify.header_name,"value":to_modify.header_value};
	e.responseHeaders.push(new_header);
	if (config.debug_mode) log("Add response header : name=" + to_modify.header_name
							+ ",value=" + to_modify.header_value + " for url " + e.url);
      }
      else if (to_modify.action==="modify") {
        for (let header of e.responseHeaders) {
          if (header.name.toLowerCase() === to_modify.header_name.toLowerCase()) {
            if (config.debug_mode) log("Modify response header :  name= " + to_modify.header_name + ",old value="
										+ header.value +  ",new value=" + to_modify.header_value  + " for url " + e.url);
            header.value = to_modify.header_value;
          }
        }
      }
      else if (to_modify.action==="delete") {
        let index = -1;
        for (let i=0; i < e.responseHeaders.length; i++) {
          if (e.responseHeaders[i].name.toLowerCase() === to_modify.header_name.toLowerCase())  index=i;
	}
        if (index!==-1) {
          e.responseHeaders.splice(index,1);
          if (config.debug_mode) log("Delete response header :  name=" + to_modify.header_name.toLowerCase()
									+ " for url " + e.url);		
        }
      }
    }
  }
  if (config.debug_mode) log("End modify response headers for url " + e.url);
  return {responseHeaders: e.responseHeaders};
}


/*
* Listen for message form config.js
* if message is reload : reload the configuration
* if message is on : start the modify header
* if message is off : stop the modify header
*
**/
function notify(message) {
  if (message==="reload") {
    if (config.debug_mode) log("Reload configuration");
    loadFromBrowserStorage(['config'],function (result) {
      config=JSON.parse(result.config);
      if (started==="on") {
        removeListener();
        addListener();
      }
    });
  }
  else if (message==="off") {
    removeListener();
    chrome.browserAction.setIcon({ path: "icons/modify-32.png"});
    started="off";
    if (config.debug_mode) log("Stop modifying headers");
  }
  else if (message==="on") {
    addListener();
    chrome.browserAction.setIcon({ path: "icons/modify-green-32.png"});
    started="on";
    if (config.debug_mode) log("Start modifying headers");
  }
}

/*
* Add rewriteRequestHeader as a listener to onBeforeSendHeaders, only for the target pages.
* Add rewriteResponseHeader as a listener to onHeadersReceived, only for the target pages.
* Make it "blocking" so we can modify the headers.
*/
function addListener() {
  let target = config.target_page;
  if ((target==="*")||(target==="")||(target===" ")) target="<all_urls>";
  chrome.webRequest.onBeforeSendHeaders.addListener(rewriteRequestHeader,
                                          {urls: target.split(";")},
                                          ["blocking", "requestHeaders"]);

  chrome.webRequest.onHeadersReceived.addListener(rewriteResponseHeader,
                                          {urls: target.split(";")},
                                          ["blocking", "responseHeaders"]);
}


/*
* Remove the two listener
*
*/
function removeListener() {
  chrome.webRequest.onBeforeSendHeaders.removeListener(rewriteRequestHeader);
  chrome.webRequest.onHeadersReceived.removeListener(rewriteResponseHeader);
}


