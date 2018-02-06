
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 *
 * @author didierfred@gmail.com
 * @version 0.1
 */


"use strict";

//var targetPage = "https://httpbin.org/*";
//var modifyTable = [];
var config ;
var started = "off";

// if configuration exist 
if (localStorage.getItem('config'))  
	{
	console.log("Load standard config");
	config= JSON.parse(localStorage.getItem('config'));
	}
else 
	{
	// else check if old config exist
	if (localStorage.getItem('targetPage')&& localStorage.getItem('modifyTable'))
		{
			console.log("Load old config");
			var headers = [];
			var modifyTable=JSON.parse(localStorage.getItem("modifyTable"));
			for (var to_modify of modifyTable)
				{
					headers.push({action:to_modify[0],header_name:to_modify[1],header_value:to_modify[2],status:to_modify[3]});
				}
			config = {format_version:"1.0",target_page:localStorage.getItem('targetPage'),headers:headers};
			// save old config in new format 
			localStorage.setItem("config",JSON.stringify(config));
		}
	//else no config exists, create a default one
	else 
		{
				console.log("Load default config");
				var headers = [];
				headers.push({action:"add",header_name:"test_header_name",header_value:"test_header_value",status:"on"});
				config = {format_version:"1.0",target_page:"https://httpbin.org/*",headers:headers};
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
* Rewrite the header (add , modify or delete)
*
*/
function rewriteHeader(e) 
{

  for (var to_modify of config.headers)
	{
		if (to_modify.status=="on")
			{
			if (to_modify.action=="add")  
				{
					var new_header = {"name" :to_modify.header_name,"value":to_modify.header_value};
					e.requestHeaders.push(new_header);
				}
			else if (to_modify.action=="modify")
				{
				for (var header of e.requestHeaders) 
					{
					if (header.name.toLowerCase() == to_modify.header_name.toLowerCase()) header.value = to_modify.header_value;
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
					}
				}
			}
	}
	
  return {requestHeaders: e.requestHeaders};
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
		config=JSON.parse(localStorage.getItem("config"));
		if (started=="on")
			{		
			browser.webRequest.onBeforeSendHeaders.removeListener(rewriteHeader);
			addListener();
			}
		}

	else if (message=="off")
		{
		browser.webRequest.onBeforeSendHeaders.removeListener(rewriteHeader);
		browser.browserAction.setIcon({ path: "icons/modify-32.png"});
		started="off";
		}

	else if (message=="on")
		{
		addListener();
		browser.browserAction.setIcon({ path: "icons/modify-green-32.png"});
		started="on";
		}
  	}

/*
* Add rewriteHeader as a listener to onBeforeSendHeaders, only for the target page.
* Make it "blocking" so we can modify the headers.
*/
function addListener()
	{
	browser.webRequest.onBeforeSendHeaders.addListener(rewriteHeader,
                                          {urls: [config.target_page]},
                                          ["blocking", "requestHeaders"]);
	}


