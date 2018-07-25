
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 *
 * @author didierfred@gmail.com
 * @version 0.4
 */


"use strict";

var config ;
var started = "off";
var debug_mode = false;

// if configuration exist 
if (localStorage.getItem('config'))  
	{
	console.log("Load standard config");
	config= JSON.parse(localStorage.getItem('config'));
	
	// If config 1.0 (Simple Modify headers V1.2) , save to format 1.1	
	if (config.format_version=="1.0") 
		{
		config.format_version="1.1";
		for (var line of config.headers) line.apply_on="req";
		config.debug_mode=false;
		console.log("save new config"+JSON.stringify(config));
		localStorage.setItem("config",JSON.stringify(config));
		}
	}
else 
	{
	// else check if old config exist (Simple Modify headers V1.1)
	if (localStorage.getItem('targetPage')&& localStorage.getItem('modifyTable'))
		{
			console.log("Load old config");
			var headers = [];
			var modifyTable=JSON.parse(localStorage.getItem("modifyTable"));
			for (var to_modify of modifyTable)
				{
					headers.push({action:to_modify[0],header_name:to_modify[1],header_value:to_modify[2],comment:"",apply_on:"req",status:to_modify[3]});
				}
			config = {format_version:"1.1",target_page:localStorage.getItem('targetPage'),headers:headers,debug_mode:false};
			// save old config in new format 
			localStorage.setItem("config",JSON.stringify(config));
		}
	//else no config exists, create a default one
	else 
		{
				console.log("Load default config");
				var headers = [];
				headers.push({action:"add",header_name:"test-header-name",header_value:"test-header-value",comment:"test",apply_on:"req",status:"on"});
				config = {format_version:"1.1",target_page:"https://httpbin.org/*",headers:headers,debug_mode:false};
				// save configuration 
				localStorage.setItem("config",JSON.stringify(config));
		}
	}
		
		
// If no started value stored , use a default one 
if (!localStorage.getItem('started')) localStorage.setItem('started',started);
else started = localStorage.getItem('started');


if (started=="on") 
		{
		addListener();
		browser.browserAction.setIcon({ path: "icons/modify-green-32.png"});
		}

// listen for change in configuration or start/stop 
browser.runtime.onMessage.addListener(notify);


/*
* Standard function to log messages 
*
*/

function log(message)
{
console.log(new Date() + " SimpleModifyHeader : " + message);
}

/*
* Rewrite the request header (add , modify or delete)
*
*/
function rewriteRequestHeader(e) 
{
  if (config.debug_mode) log("Start modify request headers for url " + e.url);
  for (var to_modify of config.headers)
	{
		if ((to_modify.status=="on")&&(to_modify.apply_on=="req"))
			{
			if (to_modify.action=="add")  
				{
					var new_header = {"name" :to_modify.header_name,"value":to_modify.header_value};
					e.requestHeaders.push(new_header);
					if (config.debug_mode) log("Add request header : name=" + to_modify.header_name + ",value=" + to_modify.header_value + " for url " + e.url);
				}
			else if (to_modify.action=="modify")
				{
				for (var header of e.requestHeaders) 
					{
					if (header.name.toLowerCase() == to_modify.header_name.toLowerCase()) 
						{
						if (config.debug_mode) log("Modify request header :  name= " + to_modify.header_name + ",old value=" + header.value +  ",new value=" + to_modify.header_value + " for url " + e.url);
						header.value = to_modify.header_value;
						}
					}
				}
			else if (to_modify.action=="delete")
				{
				var index = -1;
			
				for (var i=0; i < e.requestHeaders.length; i++)
					{
				 	if (e.requestHeaders[i].name.toLowerCase() == to_modify.header_name.toLowerCase())  index=i;
					}
				if (index!=-1) 
					{
					e.requestHeaders.splice(index,1);	
					if (config.debug_mode) log("Delete request header :  name=" + to_modify.header_name.toLowerCase() + " for url " + e.url);
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
function rewriteResponseHeader(e) 
{
  if (config.debug_mode) log("Start modify response headers for url " + e.url);
  for (var to_modify of config.headers)
	{
		if ((to_modify.status=="on")&&(to_modify.apply_on=="res"))
			{
			if (to_modify.action=="add")  
				{
					var new_header = {"name" :to_modify.header_name,"value":to_modify.header_value};
					e.responseHeaders.push(new_header);
					if (config.debug_mode) log("Add response header : name=" + to_modify.header_name + ",value=" + to_modify.header_value + " for url " + e.url);
				}
			else if (to_modify.action=="modify")
				{
				for (var header of e.responseHeaders) 
					{
					if (header.name.toLowerCase() == to_modify.header_name.toLowerCase())
						{
						if (config.debug_mode) log("Modify response header :  name= " + to_modify.header_name + ",old value=" + header.value +  ",new value=" + to_modify.header_value  + " for url " + e.url);
						header.value = to_modify.header_value;
						}
					}
				}
			else if (to_modify.action=="delete")
				{
				var index = -1;
			
				for (var i=0; i < e.responseHeaders.length; i++)
					{
				 	if (e.responseHeaders[i].name.toLowerCase() == to_modify.header_name.toLowerCase())  index=i;
					}
				if (index!=-1) 
					{
					e.responseHeaders.splice(index,1);
					if (config.debug_mode) log("Delete response header :  name=" + to_modify.header_name.toLowerCase() + " for url " + e.url);					
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
function notify(message) 
	{
	if (message=="reload") 
		{
		if (config.debug_mode) log("Reload configuration");
		config=JSON.parse(localStorage.getItem("config"));
		if (started=="on")
			{		
			removeListener();
			addListener();
			}
		}

	else if (message=="off")
		{
		removeListener();
		browser.browserAction.setIcon({ path: "icons/modify-32.png"});
		started="off";
		if (config.debug_mode) log("Stop modifying headers");
		}

	else if (message=="on")
		{
		addListener();
		browser.browserAction.setIcon({ path: "icons/modify-green-32.png"});
		started="on";
		if (config.debug_mode) log("Start modifying headers");
		}
  	}

/*
* Add rewriteRequestHeader as a listener to onBeforeSendHeaders, only for the target pages.
* Add rewriteResponseHeader as a listener to onHeadersReceived, only for the target pages.
* Make it "blocking" so we can modify the headers.
*/
function addListener()
	{
	var target = config.target_page;

	if ((target=="*")||(target=="")||(target==" ")) target="<all_urls>";
	
	browser.webRequest.onBeforeSendHeaders.addListener(rewriteRequestHeader,
                                          {urls: target.split(";")},
                                          ["blocking", "requestHeaders"]);

	browser.webRequest.onHeadersReceived.addListener(rewriteResponseHeader,
                                          {urls: target.split(";")},
                                          ["blocking", "responseHeaders"]);


	}


/*
* Remove the two listener 
*
*/
function removeListener()
	{
	browser.webRequest.onBeforeSendHeaders.removeListener(rewriteRequestHeader);
	browser.webRequest.onHeadersReceived.removeListener(rewriteResponseHeader);

	}


