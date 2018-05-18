 

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 *
 * @author didierfred@gmail.com
 * @version 0.2
 */


var started = "off";

window.onload = function() {
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
		chrome.runtime.sendMessage("on");
		started = "on";
		document.getElementById("start_stop").value = "Stop";		
		}
	else 
		{
		localStorage.setItem("started","off");
		chrome.runtime.sendMessage("off");
		started = "off";
		document.getElementById("start_stop").value = "Start";
		}

	// if exists reload config tab , to get the start/stop information correct 
	chrome.tabs.query({currentWindow: true},reloadConfigTab);
	
		
	}
	
	
function reloadConfigTab(tabs)
	{
	var config_tab;
	
	// search for config tab 
	for (let tab of tabs) 
		{
			if (tab.url.startsWith(chrome.extension.getURL(""))) config_tab = tab;
		}
		
	// config tab exists , reload it 
    if (config_tab) chrome.tabs.reload(config_tab.id);

	
	}

	

function start_config()
	{
	chrome.tabs.query({currentWindow: true},loadConfigTab);
	}	
	
	
function loadConfigTab(tabs)
	{
	var config_tab;
	
	// search for config tab 
	for (let tab of tabs) 
		{
			if (tab.url.startsWith(chrome.extension.getURL(""))) config_tab = tab;
		}
		
	// config tab exits , put the focus on it 
    if (config_tab) chrome.tabs.update(config_tab.id,{active:true})

	// else create a new tab
	else chrome.tabs.create({url:"popup/config.html"});
	}
