
// Mock the Storage as the chrome.storage is not available outside of webextension
function loadFromBrowserStorage(item,callback_function) { 
  var result = new Object;
  Object.defineProperty(result, item, {
  value: localStorage.getItem(item[0]),
  writable: true
});
  callback_function.call(this,result);
}

function storeInBrowserStorage(item,callback_function)  { 
  localStorage.setItem(Object.entries(item)[0][0],Object.entries(item)[0][1]);
  callback_function.call();
}



describe("Config", function() {
  
  function cleanConfigTableForTest() {
    let tr_elements = document.querySelectorAll("#config_tab tr");
     for (let i=0;i<tr_elements.length;i++) {
      tr_elements[i].parentNode.removeChild(tr_elements[i]);
     }
  }

  function createDefaultConfigForTest() {
     let headers = [];
     headers.push({url_contains:"",action:"add",header_name:"test-header-name",header_value:"test-header-value",comment:"test",apply_on:"req",status:"on"});
     config = {format_version:"1.2",target_page:"https://httpbin.org/*",headers:headers,debug_mode:false};
     // save configuration
     localStorage.setItem("config",JSON.stringify(config));
  }

  describe("#function initConfigurationPage", function() {
 
    beforeEach(function() {
	createDefaultConfigForTest();
    });
	
    it("init default value should be ok ", function() {
      initConfigurationPage();
      expect(document.getElementById("debug_mode").checked).toEqual(false);
      expect(document.getElementById("show_comments").checked).toEqual(true);
      expect(document.getElementById("use_url_contains").checked).toEqual(false);
      expect(document.getElementById("targetPage").value).toEqual("https://httpbin.org/*");
      expect(document.getElementById("url_contains1").value).toEqual("");
      expect(document.getElementById("select_action1").value).toEqual("add");
      expect(document.getElementById("header_name1").value).toEqual("test-header-name");
      expect(document.getElementById("header_value1").value).toEqual("test-header-value");
      expect(document.getElementById("comment1").value).toEqual("test");
      expect(document.getElementById("apply_on1").value).toEqual("req");
      expect(document.getElementById("activate_button1").className).toEqual("btn btn-primary btn-sm");
    });

    afterEach(function() {
     cleanConfigTableForTest();
    });
  });


  describe("#function create_configuration_data", function() {
 
    beforeEach(function() {
	createDefaultConfigForTest();
    });
	
    it("configuration data should reflect the configuration on the screen ", function() {
      initConfigurationPage();
      var config = JSON.parse(create_configuration_data());
      expect(config.format_version).toEqual("1.2");
      expect(config.target_page).toEqual("https://httpbin.org/*");
      expect(config.show_comments).toEqual(true);
      expect(config.use_url_contains).toEqual(false);
      expect(config.debug_mode).toEqual(false);
      expect(config.headers[0].url_contains).toEqual("");
      expect(config.headers[0].action).toEqual("add");
      expect(config.headers[0].header_name).toEqual("test-header-name");
      expect(config.headers[0].header_value).toEqual("test-header-value");
      expect(config.headers[0].comment).toEqual("test");
      expect(config.headers[0].apply_on).toEqual("req");
      expect(config.headers[0].status).toEqual("on");
    });

    afterEach(function() {
     cleanConfigTableForTest();
    });
  });

  describe("#function loadConfiguration", function() {

  // mock 
   let mockAlertMessage="";
   reloadConfigPage= function() {};
   alert = function(message) {mockAlertMessage= message;}



    it("should load configuration on format 1.0  ", function() {
      const config= '{"format_version":"1.0","target_page":"https://httpbin.org/*","headers":[{"action":"add","header_name":"test-header-name","header_value":"test-header-value","comment":"test","status":"on"}]}';

      loadConfiguration(config);
      const result = JSON.parse(localStorage.getItem("config"));
      expect(result.format_version).toEqual("1.2");
      expect(result.target_page).toEqual("https://httpbin.org/*");
      expect(result.show_comments).toEqual(true);
      expect(result.use_url_contains).toEqual(false);
      expect(result.debug_mode).toEqual(false);
      expect(result.headers[0].url_contains).toEqual("");
      expect(result.headers[0].action).toEqual("add");
      expect(result.headers[0].header_name).toEqual("test-header-name");
      expect(result.headers[0].header_value).toEqual("test-header-value");
      expect(result.headers[0].comment).toEqual("test");
      expect(result.headers[0].apply_on).toEqual("req");
      expect(result.headers[0].status).toEqual("on");
    });

    it("should load configuration on format 1.1  ", function() {
      const config= '{"format_version":"1.1","target_page":"https://httpbin.org/*","headers":[{"action":"add","header_name":"test-header-name","header_value":"test-header-value","comment":"test","apply_on":"res","status":"on"}]}';

      loadConfiguration(config);
      const result = JSON.parse(localStorage.getItem("config"));
      expect(result.format_version).toEqual("1.2");
      expect(result.target_page).toEqual("https://httpbin.org/*");
      expect(result.show_comments).toEqual(true);
      expect(result.use_url_contains).toEqual(false);
      expect(result.headers[0].url_contains).toEqual("");
      expect(result.headers[0].action).toEqual("add");
      expect(result.headers[0].header_name).toEqual("test-header-name");
      expect(result.headers[0].header_value).toEqual("test-header-value");
      expect(result.headers[0].comment).toEqual("test");
      expect(result.headers[0].apply_on).toEqual("res");
      expect(result.headers[0].status).toEqual("on");
    });


    it("should load configuration on format 1.2  ", function() {
      const config= '{"format_version":"1.2","target_page":"https://httpbin.org/*","debug_mode":true,"headers":[{"url_contains":"test","action":"add","header_name":"test-header-name","header_value":"test-header-value","comment":"test","apply_on":"res","status":"on"},{"url_contains":"test2","action":"add","header_name":"test-header-name2","header_value":"test-header-value2","comment":"test2","apply_on":"res","status":"on"}]}';

      loadConfiguration(config);
      const result = JSON.parse(localStorage.getItem("config"));
      expect(result.format_version).toEqual("1.2");
      expect(result.target_page).toEqual("https://httpbin.org/*");
      expect(result.debug_mode).toEqual(true);
      expect(result.headers[0].url_contains).toEqual("test");
      expect(result.headers[0].action).toEqual("add");
      expect(result.headers[0].header_name).toEqual("test-header-name");
      expect(result.headers[0].header_value).toEqual("test-header-value");
      expect(result.headers[0].comment).toEqual("test");
      expect(result.headers[0].apply_on).toEqual("res");
      expect(result.headers[0].status).toEqual("on");
      expect(result.headers[1].header_name).toEqual("test-header-name2");
      expect(result.headers[1].header_value).toEqual("test-header-value2");
    });


    it("should load configuration on modify header format  ", function() {
      const config= '[{"action":"Add","name":"test-header-name","value":"test-header-value","comment":"test","enabled":"true"},{"action":"Add","name":"test-header-name2","value":"test-header-value2","comment":"test","enabled":"true"}]';

      loadConfiguration(config);
      const result = JSON.parse(localStorage.getItem("config"));
      expect(result.format_version).toEqual("1.2");
      expect(result.target_page).toEqual("");
      expect(result.debug_mode).toEqual(false);
      expect(result.headers[0].url_contains).toEqual("");
      expect(result.headers[0].action).toEqual("add");
      expect(result.headers[0].header_name).toEqual("test-header-name");
      expect(result.headers[0].header_value).toEqual("test-header-value");
      expect(result.headers[0].comment).toEqual("test");
      expect(result.headers[0].apply_on).toEqual("req");
      expect(result.headers[0].status).toEqual("on");
      expect(result.headers[1].header_name).toEqual("test-header-name2");
    });




    it("should popup an alert if json is invalid ", function() {
      const config= '{"formaversion":"1.2","target_pae":"https://httpbin.org/*","debu_mode":true,"header":[{"url_contains":"test","action":"add","header_name":"test-header-name","headevalue":"test-header-value","comment":"test","apply_on":"res","status":"on"}]}';
      mockAlertMessage ="";
      loadConfiguration(config);
      expect(mockAlertMessage).toEqual("Invalid file format");
    });

    it("should popup an alert if data is not json", function() {
      const config= 'nothing useful';
      mockAlertMessage ="";
      loadConfiguration(config);
      expect(mockAlertMessage).toEqual("Invalid file format");
    });

  });



  describe("#function appendLine", function() {
 
    beforeEach(function() {
	createDefaultConfigForTest();
    });
	
    it("append one line should create a new line and not more  ", function() {
      initConfigurationPage();
      appendLine("test","add","-","-","","req","on");
      expect(document.getElementById("url_contains2")).not.toEqual(null); 
      expect(document.getElementById("url_contains3")).toEqual(null); 
    });


    it("append two lines should create two lines and not more ", function() {
      initConfigurationPage();
      appendLine("test","add","-","-","","req","on");
      appendLine("test","add","-","-","","req","on");
      expect(document.getElementById("url_contains2")).not.toEqual(null); 
      expect(document.getElementById("url_contains3")).not.toEqual(null); 
      expect(document.getElementById("url_contains4")).toEqual(null); 
    });

    it("append three lines should create three lines and not more ", function() {
      initConfigurationPage();
      appendLine("test","add","-","-","","req","on");
      appendLine("test","add","-","-","","req","on");
      appendLine("test","add","-","-","","req","on");
      expect(document.getElementById("url_contains2")).not.toEqual(null); 
      expect(document.getElementById("url_contains3")).not.toEqual(null); 
      expect(document.getElementById("url_contains4")).not.toEqual(null); 
      expect(document.getElementById("url_contains5")).toEqual(null); 
    });

    afterEach(function() {
     cleanConfigTableForTest();
    });
  });



 describe("#function deleteLine", function() {
 
    beforeEach(function() {
	createDefaultConfigForTest();
    });
	

    it("delete line 3 should delete line 3 form the GUI ", function() {
      initConfigurationPage();
      appendLine("line2","add","header_name2","header_value2","comment2","req","on");
      appendLine("line3","add","header_name3","header_value3","comment3","req","on");
      appendLine("line4","modify","test_name","test_value","test_comment","res","off");
      deleteLine(3); 
      expect(document.getElementById("url_contains4")).toEqual(null); 
      expect(document.getElementById("url_contains3").value).toEqual("line4");
      expect(document.getElementById("select_action3").value).toEqual("modify");
      expect(document.getElementById("header_name3").value).toEqual("test_name");
      expect(document.getElementById("header_value3").value).toEqual("test_value");
      expect(document.getElementById("comment3").value).toEqual("test_comment");
      expect(document.getElementById("apply_on3").value).toEqual("res");
      expect(document.getElementById("activate_button3").className).toEqual("btn btn-default btn-sm");
      expect(document.getElementById("url_contains2").value).toEqual("line2"); 
      expect(document.getElementById("header_name2").value).toEqual("header_name2");
      expect(document.getElementById("header_value2").value).toEqual("header_value2");
      expect(document.getElementById("comment2").value).toEqual("comment2");
    });


    it("delete line 1 should delete line 1 form the GUI ", function() {
      initConfigurationPage();
      appendLine("line2","add","-","-","","req","on");
      appendLine("line3","add","-","-","","req","on");
      appendLine("line4","add","-","-","","req","on");
      deleteLine(1); 
      expect(document.getElementById("url_contains4")).toEqual(null); 
      expect(document.getElementById("url_contains3").value).toEqual("line4");
      expect(document.getElementById("url_contains2").value).toEqual("line3"); 
      expect(document.getElementById("url_contains1").value).toEqual("line2"); 
    });


    afterEach(function() {
     cleanConfigTableForTest();
    });
  });


describe("#function invertLine", function() {
 
    beforeEach(function() {
	createDefaultConfigForTest();
    });
	

    it("invert line 2 with line 3 should invert line on the GUI ", function() {
      initConfigurationPage();
      appendLine("line2","add","header_name2","header_value2","comment2","res","off");
      appendLine("line3","delete","header_name3","header_value3","comment3","req","on");
      appendLine("line4","modify","test_name","test_value","test_comment","res","off");
      invertLine(2,3); 
      expect(document.getElementById("url_contains4").value).toEqual("line4"); 
      expect(document.getElementById("url_contains3").value).toEqual("line2");
      expect(document.getElementById("url_contains2").value).toEqual("line3");
      expect(document.getElementById("select_action3").value).toEqual("add");
      expect(document.getElementById("select_action2").value).toEqual("delete");
      expect(document.getElementById("header_name3").value).toEqual("header_name2");
      expect(document.getElementById("header_name2").value).toEqual("header_name3")
      expect(document.getElementById("header_value3").value).toEqual("header_value2");
      expect(document.getElementById("header_value2").value).toEqual("header_value3");
      expect(document.getElementById("comment3").value).toEqual("comment2");
      expect(document.getElementById("comment2").value).toEqual("comment3");
      expect(document.getElementById("apply_on3").value).toEqual("res");
      expect(document.getElementById("apply_on2").value).toEqual("req");
      expect(document.getElementById("activate_button3").className).toEqual("btn btn-default btn-sm"); // button off
      expect(document.getElementById("activate_button2").className).toEqual("btn btn-primary btn-sm"); // button on 
    });


    it("invert line 0 with line 3 should do nothing  ", function() {
      initConfigurationPage();
      appendLine("line2","add","header_name2","header_value2","comment2","res","off");
      appendLine("line3","delete","header_name3","header_value3","comment3","req","on");
      appendLine("line4","modify","test_name","test_value","test_comment","res","off");
      invertLine(0,3); 

      expect(document.getElementById("url_contains1").value).toEqual("");
      expect(document.getElementById("select_action1").value).toEqual("add");
      expect(document.getElementById("header_name1").value).toEqual("test-header-name");
      expect(document.getElementById("header_value1").value).toEqual("test-header-value");
      expect(document.getElementById("comment1").value).toEqual("test");
      expect(document.getElementById("apply_on1").value).toEqual("req");
      expect(document.getElementById("activate_button1").className).toEqual("btn btn-primary btn-sm");


      expect(document.getElementById("url_contains4").value).toEqual("line4"); 
      expect(document.getElementById("url_contains3").value).toEqual("line3");
      expect(document.getElementById("url_contains2").value).toEqual("line2");
      expect(document.getElementById("select_action3").value).toEqual("delete");
      expect(document.getElementById("select_action2").value).toEqual("add");
      expect(document.getElementById("header_name3").value).toEqual("header_name3");
      expect(document.getElementById("header_name2").value).toEqual("header_name2")
      expect(document.getElementById("header_value3").value).toEqual("header_value3");
      expect(document.getElementById("header_value2").value).toEqual("header_value2");
      expect(document.getElementById("comment3").value).toEqual("comment3");
      expect(document.getElementById("comment2").value).toEqual("comment2");
      expect(document.getElementById("apply_on3").value).toEqual("req");
      expect(document.getElementById("apply_on2").value).toEqual("res");
      expect(document.getElementById("activate_button2").className).toEqual("btn btn-default btn-sm"); // button off
      expect(document.getElementById("activate_button3").className).toEqual("btn btn-primary btn-sm"); // button on 
    });

   it("invert line 4 with line 5 should do nothing  ", function() {
      initConfigurationPage();
      appendLine("line2","add","header_name2","header_value2","comment2","res","off");
      appendLine("line3","delete","header_name3","header_value3","comment3","req","on");
      appendLine("line4","modify","test_name","test_value","test_comment","res","off");
      invertLine(4,5); 

      expect(document.getElementById("url_contains1").value).toEqual("");
      expect(document.getElementById("select_action1").value).toEqual("add");
      expect(document.getElementById("header_name1").value).toEqual("test-header-name");
      expect(document.getElementById("header_value1").value).toEqual("test-header-value");
      expect(document.getElementById("comment1").value).toEqual("test");
      expect(document.getElementById("apply_on1").value).toEqual("req");
      expect(document.getElementById("activate_button1").className).toEqual("btn btn-primary btn-sm");// button on 

      expect(document.getElementById("url_contains4").value).toEqual("line4");
      expect(document.getElementById("select_action4").value).toEqual("modify");
      expect(document.getElementById("header_name4").value).toEqual("test_name");
      expect(document.getElementById("header_value4").value).toEqual("test_value");
      expect(document.getElementById("comment4").value).toEqual("test_comment");
      expect(document.getElementById("apply_on4").value).toEqual("res");
      expect(document.getElementById("activate_button4").className).toEqual("btn btn-default btn-sm");// button off

      expect(document.getElementById("url_contains3").value).toEqual("line3");
      expect(document.getElementById("url_contains2").value).toEqual("line2");
      expect(document.getElementById("select_action3").value).toEqual("delete");
      expect(document.getElementById("select_action2").value).toEqual("add");
      expect(document.getElementById("header_name3").value).toEqual("header_name3");
      expect(document.getElementById("header_name2").value).toEqual("header_name2")
      expect(document.getElementById("header_value3").value).toEqual("header_value3");
      expect(document.getElementById("header_value2").value).toEqual("header_value2");
      expect(document.getElementById("comment3").value).toEqual("comment3");
      expect(document.getElementById("comment2").value).toEqual("comment2");
      expect(document.getElementById("apply_on3").value).toEqual("req");
      expect(document.getElementById("apply_on2").value).toEqual("res");
      expect(document.getElementById("activate_button2").className).toEqual("btn btn-default btn-sm"); // button off
      expect(document.getElementById("activate_button3").className).toEqual("btn btn-primary btn-sm"); // button on 
    });

    afterEach(function() {
     cleanConfigTableForTest();
    });
  });

  describe("#function isTargetValid ", function() {

    it("should validate the * pattern", function() {
      expect(isTargetValid("*")).toEqual(true);
    });

    it("should validate the empty pattern", function() {
      expect(isTargetValid("")).toEqual(true);
    });

    it("should validate the \" \" pattern", function() {
      expect(isTargetValid(" ")).toEqual(true);
    });

    it("should validate the *://*/* pattern", function() {
      expect(isTargetValid("*://*/*")).toEqual(true);
    });

    it("should validate the http://*/* pattern", function() {
      expect(isTargetValid("http://*/*")).toEqual(true);
    });

    it("should validate the http://test/* pattern", function() {
      expect(isTargetValid("http://test/*")).toEqual(true);
    });

    it("should  validate the *://*/ pattern", function() {
      expect(isTargetValid("*://*/")).toEqual(true);
    });

    it("should validate the http://test/ pattern", function() {
      expect(isTargetValid("http://test/")).toEqual(true);
    });

    it("should validate the https://test/test pattern", function() {
      expect(isTargetValid("https://test/test")).toEqual(true);
    });

    it("should not validate the *://*.test/ pattern", function() {
      expect(isTargetValid("*://*.test/")).toEqual(true);
    });

    it("should not validate the test pattern", function() {
      expect(isTargetValid("test")).toEqual(false);
    });

    it("should not validate the *://* pattern", function() {
      expect(isTargetValid("*://*")).toEqual(false);
    });

    it("should not validate the tty://*/ pattern", function() {
      expect(isTargetValid("tty://*/")).toEqual(false);
    });

    it("should not validate the *:/*/ pattern", function() {
      expect(isTargetValid("*:/*/")).toEqual(false);
    });

  });

  describe("#function checkTargetPageField ", function() {

    it("text field url pattern should be black id pattern is valid", function() {
	document.getElementById('targetPage').value = "*"
	checkTargetPageField();
        expect(document.getElementById('targetPage').style.color).toEqual("black");
    });

    it("text field url pattern should be red if pattern is invalid", function() {
	document.getElementById('targetPage').value = "test"
	checkTargetPageField();
        expect(document.getElementById('targetPage').style.color).toEqual("red");
    });
  });

});
