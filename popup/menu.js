 

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 *
 * @author didierfred@gmail.com
 * @version 0.1
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
	//var strWindowFeatures = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=800,height=600";
	// window.open("config.html","Simple Modify Headers",strWindowFeatures);
	browser.tabs.create({url:"config.html"});
	}
