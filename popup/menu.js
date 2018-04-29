 

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
		browser.runtime.sendMessage("on");
		started = "on";
		document.getElementById("start_stop").value = "Stop";		
		}
	else 
		{
		localStorage.setItem("started","off");
		browser.runtime.sendMessage("off");
		started = "off";
		document.getElementById("start_stop").value = "Start";
		}

	}

function start_config()
	{
	var promise_tabs =  browser.tabs.query({currentWindow: true});
	promise_tabs.then(loadConfigTab);
	}	
	
	
function loadConfigTab(tabs)
	{
	var config_tab;
	
	// search for config tab 
	for (let tab of tabs) 
		{
			if (tab.url.startsWith(browser.extension.getURL(""))) config_tab = tab;
		}
		
	// config tab exits , put the focus on it 
    if (config_tab) browser.tabs.update(config_tab.id,{active:true})

	// else create a new tab
	else browser.tabs.create({url:"config.html"});
	}
