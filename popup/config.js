 /* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @author didierfred@gmail.com
 */

let line_number;
let started;
let show_comments;
let use_url_contains;
let input_field_style;


window.onload = function() {
   initConfigurationPage();
 }

function initConfigurationPage() {
	initGlobalValue();
	// load configuration from local storage
        loadFromBrowserStorage(['config'],function (result) {
	  config = JSON.parse(result.config);
	  if (config.debug_mode) document.getElementById("debug_mode").checked = true;

	  if (typeof config.show_comments === 'undefined') document.getElementById("show_comments").checked = true;
	  else if (config.show_comments) document.getElementById("show_comments").checked = true;
	  else show_comments=false;

	  if (config.use_url_contains) {
            document.getElementById("use_url_contains").checked = true;
            use_url_contains=true;
          }

	  for (let to_add of config.headers) appendLine(to_add.url_contains,to_add.action,to_add.header_name,to_add.header_value,to_add.comment,to_add.apply_on,to_add.status);
	  document.getElementById('save_button').addEventListener('click',function (e) {saveData();});
	  document.getElementById('export_button').addEventListener('click',function (e) {exportData();});
	  document.getElementById('import_button').addEventListener('click',function (e) {importData(e);});
	  document.getElementById('parameters_button').addEventListener('click',function (e) {showParametersScreen();});
	  document.getElementById('add_button').addEventListener('click',function (e) {appendLine("","add","-","-","","req","on");});
	  document.getElementById('start_img').addEventListener('click',function (e) {startModify();});
	  document.getElementById('targetPage').value=config.target_page;
	  checkTargetPageField();
	  document.getElementById('targetPage').addEventListener('keyup',function (e) {checkTargetPageField();});
	  document.getElementById('exit_parameters_screen_button').addEventListener('click',function (e) {hideParametersScreen();});

          loadFromBrowserStorage(['started'], function (result) {
	    started = result.started;
	    if (started==="on") document.getElementById("start_img").src = "img/stop.png";
          });

	  document.getElementById('show_comments').addEventListener('click',function (e) {showCommentsClick();});
	  document.getElementById('use_url_contains').addEventListener('click',function (e) {useUrlContainsClick();});
	  reshapeTable();
        });
}

function initGlobalValue()
 {
  line_number = 1;
  started = "off";
  show_comments = true;
  use_url_contains = false;
  input_field_style="form_control input_field_small";
 }


function loadFromBrowserStorage(item,callback_function) {
  chrome.storage.local.get(item, callback_function);
}

function storeInBrowserStorage(item,callback_function)  {
  chrome.storage.local.set(item,callback_function);
}

function log(message) {
  console.log(new Date() + " SimpleModifyHeader : " + message);
}

/** PARAMETERS SCREEN MANAGEMENT **/

function showParametersScreen() {
  document.getElementById('main_screen').hidden=true;
  document.getElementById('parameters_screen').hidden=false;
}

function hideParametersScreen() {
  document.getElementById('main_screen').hidden=false;
  document.getElementById('parameters_screen').hidden=true;
}

function showCommentsClick() {
  if (document.getElementById('show_comments').checked) show_comments = true;
  else show_comments = false;
  reshapeTable();
}

function useUrlContainsClick() {
  if (document.getElementById('use_url_contains').checked) use_url_contains = true;
  else use_url_contains = false;
  reshapeTable();
}

/** END PARAMETERS SCREEN MANAGEMENT **/



/**
* Add a new configuration line on the UI
**/
function appendLine(url_contains,action,header_name,header_value,comment,apply_on,status) {
  let html = `
    <td ${use_url_contains ? '' : ' hidden'}>
      <input class="${input_field_style}" id="url_contains${line_number}" />
    </td>
    <td>
      <select class="form_control select_field" id="select_action${line_number}"> disable="false">
        <option value="add">Add</option>
        <option value="modify">Modify</option>
        <option value="delete">Delete</option>
      </select>
    </td>
    <td>
      <input class="${input_field_style}" id="header_name${line_number}" />
    </td>
    <td>
      <input class="${input_field_style}" id="header_value${line_number}" />
    </td>
    <td${show_comments ? '' : ' hidden'}>
      <input class="${input_field_style}" id="comment${line_number}" />
    </td>
    <td>
      <select class="form_control select_field" id="apply_on${line_number}">
        <option value="req">Request</option>
        <option value="res">Response</option>
      </select>
    </td>
    <td>
      <button type="button" class="btn btn-primary btn-sm" title="Activate/deactivate rule" id="activate_button${line_number}">ON <span class="glyphicon glyphicon-ok"></span></button>
    </td>
    <td>
      <button type="button" class="btn btn-default btn-sm" title="Move line up" id="up_button${line_number}">
        <span class="glyphicon glyphicon-arrow-up"></span>
      </button>
    </td>
    <td>
      <button type="button" class="btn btn-default btn-sm" title="Move line down" id="down_button${line_number}">
        <span class="glyphicon glyphicon-arrow-down"></span>
      </button>
    </td>
    <td>
      <button type="button" class="btn btn-default btn-sm" title="Delete line" id="delete_button${line_number}">
        <span class="glyphicon glyphicon-trash"></span>
      </button>
    </td>
  `;

  let newTR = document.createElement("tr");
  newTR.id="line" + line_number;
  newTR.innerHTML = html;
  document.getElementById("config_tab").appendChild(newTR);
  document.getElementById("select_action"+line_number).value = action;
  document.getElementById("apply_on"+line_number).value = apply_on;
  document.getElementById("url_contains"+line_number).value = url_contains;
  document.getElementById("header_name"+line_number).value = header_name;
  document.getElementById("header_value"+line_number).value = header_value;
  document.getElementById("comment"+line_number).value = comment;

  const line_number_to_modify = line_number;
  document.getElementById('activate_button'+line_number).addEventListener('click',function (e) {switchActivateButton(line_number_to_modify)});
  setButtonStatus(document.getElementById('activate_button'+line_number),status);
  document.getElementById('delete_button'+line_number).addEventListener('click',function (e) {deleteLine(line_number_to_modify)});
  document.getElementById('up_button'+line_number).addEventListener('click',function (e) {invertLine(line_number_to_modify,line_number_to_modify-1)});
  document.getElementById('down_button'+line_number).addEventListener('click',function (e) {invertLine(line_number_to_modify,line_number_to_modify+1)});
  line_number++;
}


/** ACTIVATE BUTTON MANAGEMENT **/

function setButtonStatus(button,status) {
  if (status==="on") {
    button.className="btn btn-primary btn-sm";
    button.innerHTML="ON  <span class=\"glyphicon glyphicon-ok\"></span>";
  }
  else {
    button.className="btn btn-default btn-sm";
    button.innerHTML="OFF <span class=\"glyphicon glyphicon-ban-circle\"></span>";
  }
}

function getButtonStatus(button) {
  if (button.className==="btn btn-primary btn-sm") return "on";
  return "off";
}

function switchActivateButton(button_number) {
  const activate_button = document.getElementById("activate_button"+button_number);
  // Button is ON
  if (getButtonStatus(activate_button)==="on") setButtonStatus(activate_button,"off");
  // Button is OFF
  else setButtonStatus(activate_button,"on");
}

/** END ACTIVATE BUTTON MANAGEMENT **/


function reshapeTable() {
  let th_elements = document.querySelectorAll("#config_table_head th");
  let tr_elements = document.querySelectorAll("#config_tab tr");

  if (show_comments) {
    if (use_url_contains) input_field_style = "form_control input_field_small";
    else input_field_style = "form_control input_field_medium";
  }
  else {
    if (use_url_contains) input_field_style = "form_control input_field_medium";
    else input_field_style = "form_control input_field_large";
  }

  for (let i=0;i<tr_elements.length;i++) {
    tr_elements[i].children[4].children[0].className=input_field_style;
    tr_elements[i].children[4].hidden = (!show_comments);
    tr_elements[i].children[3].children[0].className=input_field_style;
    tr_elements[i].children[2].children[0].className=input_field_style;
    tr_elements[i].children[0].children[0].className=input_field_style;
    tr_elements[i].children[0].hidden = (!use_url_contains);
  }
  th_elements[4].hidden = (!show_comments);
  th_elements[0].hidden = (!use_url_contains);
}

/**
* Create a JSON String representing the configuration data
*
**/
function create_configuration_data() {
  let tr_elements = document.querySelectorAll("#config_tab tr");
  let headers = [];
  let debug_mode=false;
  let show_comments=false;
  for (let i=0;i<tr_elements.length;i++) {
    const url_contains = tr_elements[i].children[0].children[0].value;
    const action = tr_elements[i].children[1].children[0].value;
    const header_name = tr_elements[i].children[2].children[0].value;
    const header_value = tr_elements[i].children[3].children[0].value;
    const comment = tr_elements[i].children[4].children[0].value;
    const apply_on = tr_elements[i].children[5].children[0].value;
    const status = getButtonStatus(tr_elements[i].children[6].children[0]);
    headers.push({url_contains:url_contains,action:action,header_name:header_name,header_value:header_value,comment:comment,apply_on:apply_on,status:status});
  }
  if (document.getElementById("debug_mode").checked) debug_mode=true;
  if (document.getElementById("show_comments").checked) show_comments=true;
  if (document.getElementById("use_url_contains").checked) use_url_contains=true;
  let to_export = {format_version:"1.2",target_page:document.getElementById('targetPage').value,headers:headers,
				  debug_mode:debug_mode,show_comments:show_comments,use_url_contains:use_url_contains};
  return JSON.stringify(to_export);
}

/**
*  check if url pattern is valid , if not set the font color to red
**/
function checkTargetPageField() {
  if (isTargetValid(document.getElementById('targetPage').value)) document.getElementById('targetPage').style.color="black";
  else document.getElementById('targetPage').style.color="red";
}

/**
* check if url patterns are valid
**/
function isTargetValid(target) {
  if (target==="") return true;
  if (target===" ") return true;
  if (target==="*") return true;
  let targets=target.split(";");
  for (let i in targets) {
    if (!targets[i].match("(http|https|[\*]):\/\/([\*][\.][^\*]*|[^\*]*|[\*])\/")) return false;
  }
  return true;
}

/**
*  save the data to the local storage and restart modify header
* show a warning if url patterns are invalid
**/
function saveData() {
  if (!isTargetValid(document.getElementById('targetPage').value)) alert("Warning: Url patterns are invalid");
  storeInBrowserStorage({config:create_configuration_data()},function() {
    chrome.runtime.sendMessage("reload");
  });
  return true;
}

/**
* If url pattern is valid save the data in a file
**/
function exportData() {
  // Create file data
  let to_export= create_configuration_data();

  // Create file to save
  let a         = document.createElement('a');
  a.href        = 'data:attachment/json,' +  encodeURIComponent(to_export);
  a.target      = 'download';
  a.download    = 'SimpleModifyHeader.conf';

  // use iframe "download" to put the link (in order not to be redirect in the parent frame)
  let myf = document.getElementById("download");
  myf = myf.contentWindow.document || myf.contentDocument;
  myf.body.appendChild(a);
  a.click();
}

/**
* Choose a file and import data from the choosen file
*
**/
function importData(evt) {
  // create an input field in the iframe
  if (window.confirm("This will erase your actual configuration, do you want to continue ?")) {
    let input = document.createElement("input");
    input.type="file";
    input.addEventListener('change', readSingleFile, false);
    let myf = document.getElementById("download");
    myf = myf.contentWindow.document || myf.contentDocument;
    myf.body.appendChild(input);
    input.click();
  }
}

/**
* Import configuration from a file
*
*
*
**/
function readSingleFile(e) {
  let file = e.target.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = function(e) {
    loadConfiguration(e.target.result);
  }
  reader.readAsText(file);
}

/**
* Load configuration from a string
* If format is not recognized , try modify header add-an file format
**/
function loadConfiguration(configuration) {
  let config="";
  try {
    config = JSON.parse(configuration);
    // check file format
    if (config.format_version) {
      if (config.format_version==="1.0") config = convertConfigurationFormat1dot0ToCurrentFormat(config);
      else if (config.format_version==="1.1") config = convertConfigurationFormat1dot1ToCurrentFormat(config);
    }
    else {
      if (config[0].action) config = convertHistoricalModifyHeaderFormatToCurrentFormat (config);
      else {
        alert("Invalid file format");
	return;
      }
    }
  }
  catch(error) {
    console.log(error);
    alert("Invalid file format");
    return;
  }

  // store the conf in the local storage
  storeInBrowserStorage({config:JSON.stringify(config)},function() {
   // load the new conf
   reloadConfigPage();
  });
}

function convertConfigurationFormat1dot0ToCurrentFormat(config) {
  config.format_version="1.2";
  for (let line of config.headers) {
    line.apply_on="req";
    line.url_contains="";
  }
  config.debug_mode=false;
  config.show_comments=true;
  config.use_url_contains=false;
  return config;
 }


function convertConfigurationFormat1dot1ToCurrentFormat(config) {
  config.format_version="1.2";
  for (let line of config.headers) line.url_contains="";
    config.show_comments=true;
    config.use_url_contains=false;
  return config;
 }

/**
* Historical Modify header add-on file format  : array of {action,name,value,comment,enabled}
**/
function convertHistoricalModifyHeaderFormatToCurrentFormat(config) {
  let headers = [];
  for (let line_to_load of config) {
    var enabled = "off";
    if (line_to_load.enabled) enabled = "on";
    if (line_to_load.action==="Filter") line_to_load.action="delete";		        
    headers.push({url_contains:"",action:line_to_load.action.toLowerCase(),header_name:line_to_load.name,
					header_value:line_to_load.value,comment:line_to_load.comment,apply_on:"req",status:enabled});
  }
  return {format_version:"1.2",target_page:"",headers:headers,debug_mode:false,show_comments:true,use_url_contains:false};
}

function reloadConfigPage() {
  chrome.runtime.sendMessage("reload");
  document.location.href="config.html";
  }

/**
* Delete a configuration line on the UI
**/
function deleteLine(line_number_to_delete) {
  if (line_number_to_delete !== line_number) {
    for (let i=line_number_to_delete;i<line_number-1;i++) {
      const j = i+1;
      document.getElementById("select_action"+i).value = document.getElementById("select_action"+j).value;
      document.getElementById("url_contains"+i).value = document.getElementById("url_contains"+j).value;
      document.getElementById("header_name"+i).value = document.getElementById("header_name"+j).value;
      document.getElementById("header_value"+i).value = document.getElementById("header_value"+j).value;
      document.getElementById("comment"+i).value = document.getElementById("comment"+j).value;
      setButtonStatus(document.getElementById("activate_button"+i),getButtonStatus(document.getElementById("activate_button"+j)));
      document.getElementById("apply_on"+i).value = document.getElementById("apply_on"+j).value;
    }
  }

  let Node_to_delete = document.getElementById("line"+(line_number-1));
  Node_to_delete.parentNode.removeChild(Node_to_delete);
  line_number--;
}

/**
* Invert two configuration lines on the UI
**/
function invertLine(line1, line2) {
  // if a line does not exist , do nothing
  if ((line1===0)||(line2===0)||(line1>=line_number)||(line2>=line_number)) return;

  // Save data for line 1
  const select_action1= document.getElementById("select_action"+line1).value;
  const url_contains1 = document.getElementById("url_contains"+line1).value;
  const header_name1 = document.getElementById("header_name"+line1).value;
  const header_value1= document.getElementById("header_value"+line1).value;
  const comment1 = document.getElementById("comment"+line1).value;
  const select_status1 = getButtonStatus(document.getElementById("activate_button"+line1));
  const apply_on1 = document.getElementById("apply_on"+line1).value;

  // Copy line 2 to line 1
  document.getElementById("select_action"+line1).value = document.getElementById("select_action"+line2).value;
  document.getElementById("url_contains"+line1).value = document.getElementById("url_contains"+line2).value;
  document.getElementById("header_name"+line1).value = document.getElementById("header_name"+line2).value;
  document.getElementById("header_value"+line1).value = document.getElementById("header_value"+line2).value;
  document.getElementById("comment"+line1).value = document.getElementById("comment"+line2).value;
  setButtonStatus(document.getElementById("activate_button"+line1),getButtonStatus(document.getElementById("activate_button"+line2)));
  document.getElementById("apply_on"+line1).value = document.getElementById("apply_on"+line2).value;

  // Copy line 1 to line 2
  document.getElementById("select_action"+line2).value = select_action1;
  document.getElementById("url_contains"+line2).value = url_contains1;
  document.getElementById("header_name"+line2).value = header_name1;
  document.getElementById("header_value"+line2).value = header_value1;
  document.getElementById("comment"+line2).value = comment1;
  setButtonStatus(document.getElementById("activate_button"+line2),select_status1);
  document.getElementById("apply_on"+line2).value = apply_on1;
}

/**
* Stop or Start modify header
**/
function startModify() {
  if (started==="off") {
      saveData();
      storeInBrowserStorage({started:'on'},function() {
        chrome.runtime.sendMessage("on");
        started = "on";
        document.getElementById("start_img").src = "img/stop.png";
      });
  }
  else {
    storeInBrowserStorage({started:'off'},function() {
      chrome.runtime.sendMessage("off");
      started = "off";
      document.getElementById("start_img").src = "img/start.png";
    });
  }
}
