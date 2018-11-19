 

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 *
 * @author didierfred@gmail.com
 * @version 0.2
 */


var started = "off";

let generic_browser ;
let is_chrome = false;

window.onload = function() {



	// check if chrome 
	if (browser!=undefined) generic_browser=browser;
	else {
		generic_browser= chrome;
		is_chrome=true;
	     }
console.log("is_chrome set to" + is_chrome);

	document.getElementById('config').addEventListener('click',function (e) {start_config();});
	document.getElementById('start_stop').addEventListener('click',function (e) {start_modify();});
	started = localStorage.getItem("started");
	if (started=="on") document.getElementById("start_stop").value = "Stop";	
} ;



function start_modify()
	{
	if (started=="off") 
		{
		localStorage.setItem("started","on");
		generic_browser.runtime.sendMessage("on");
		started = "on";
		document.getElementById("start_stop").value = "Stop";		
		}
	else 
		{
		localStorage.setItem("started","off");
		generic_browser.runtime.sendMessage("off");
		started = "off";
		document.getElementById("start_stop").value = "Start";
		}

	// if exists reload config tab , to get the start/stop information correct 
	if (is_chrome) generic_browser.tabs.query({currentWindow: true},reloadConfigTab);
	else {
		var promise_tabs =  generic_browser.tabs.query({currentWindow: true});
		promise_tabs.then(reloadConfigTab);
	     }
		
	}
	
	
function reloadConfigTab(tabs)
	{
	var config_tab;
	
	// search for config tab 
	for (let tab of tabs) 
		{
			if (tab.url.startsWith(generic_browser.extension.getURL(""))) config_tab = tab;
		}
		
	// config tab exists , reload it 
        if (config_tab) generic_browser.tabs.reload(config_tab.id);

	}

	

function start_config()
	{
	if (is_chrome) generic_browser.tabs.query({currentWindow: true},loadConfigTab);
	else {
		var promise_tabs =  generic_browser.tabs.query({currentWindow: true});
	        promise_tabs.then(loadConfigTab);
	      }
	}	
	
	
function loadConfigTab(tabs)
	{
	var config_tab;
	
	// search for config tab 
	for (let tab of tabs) 
		{
			if (tab.url.startsWith(generic_browser.extension.getURL(""))) config_tab = tab;
		}
		
	// config tab exits , put the focus on it 
        if (config_tab) generic_browser.tabs.update(config_tab.id,{active:true})

	// else create a new tab
	else 
		{
console.log("is chrome=" + is_chrome);
		if (is_chrome) generic_browser.tabs.create({url:"popup/config.html"});
		else generic_browser.tabs.create({url:"config.html"});
		}
	}
