# SimpleModifyHeaders V 1.8.1

Extension for Firefox and Chrome.  
The extension can be installed via [this link](https://addons.mozilla.org/firefox/addon/simple-modify-header/) for Firefox and [this link](https://chrome.google.com/webstore/detail/simple-modify-headers/gjgiipmpldkpbdfjkgofildhapegmmic) for Chrome.

The extension rewrites the headers based on a rules table. 

The extension can be started and stopped via the button on the top right.

To save and apply the modification, you need to click the save button.

It's possible to: 
-  export the configuration into a file (JSON format)
-  import the configuration from a file. It supports the format of the Modifyheaders plugin. It is possible to append rules instead of replacing the configuration.

## Rules table
The rules table contains lines with the following parameters:
- action: add, modify or delete a header field or a cookie
- header field name or cookie name
- header field value or cookie value 
- comment: a comment 
- apply on: "request" if the modification applies to the request headers or "response" if the modification applies to the response headers
- status: on if the modification is active, off otherwise 
- export: if set to value "To export" the rule is exported when using the export function 

## URL pattern
We can choose the URLs on which the modifications are applied by modifying the URL pattern :  
- The URL pattern must follow the syntax defined by https://developer.chrome.com/extensions/match_patterns
- Putting an empty string on the field will select all URLs
- It's possible to select multiple URL patterns using a semicolon (;) separator
- It's not possible to specify a specific port number https://stackoverflow.com/questions/11425591/match-port-in-chrome-extension-pattern

## Parameters
The parameters button allows you to:
- Activate debug mode: shows detailed log messages in the extension debugging console of the browser.
- Show comments: show comments field on the config panel 
- Filter URL by rules: activate the possibility to filter URL for each rule in the config panel. The header field will be modified only if the URL contains the configured value.


## Firefox-specific issue
Depending on the version of Firefox, the addition of a new header behaves differently. In the latest Firefox versions, when you choose the "add" action, and the header exists, it appends the value, whereas in old Firefox versions, it replaces it. If you want to modify an exiting header, you should use "modify" instead of "add"

## Limitation

Due to limitations in the webRequest API of browsers, headers of requests, which are invoked by JavaScript, cannot be modified. 
  
## Extension permissions
The following browser permissions are needed for this extension: 
- storage: needed to store the configuration and rules
- activeTab, tabs: needed to show the configuration screen in the browser tab
- webRequest, webRequestBlocking ,<all_urls>: needed to modify the headers according to the rules table
  
## License
The code is Open Source under Mozilla Public License 2.0 
