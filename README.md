# SimpleModifyHeaders V 1.6

Extension for firefox and chrome. 

The extension can be install via [this link](https://addons.mozilla.org/fr/firefox/addon/simple-modify-header/) for firefox and via [this link](https://chrome.google.com/webstore/detail/simple-modify-headers/gjgiipmpldkpbdfjkgofildhapegmmic) for chrome

The extension rewrite the headers based on a rules table. 

The extension can be start and stop via the button on the top right.

To save and apply the modification, you need to click on the save button.

It's possible to: 
-  export the configuration in a file (json format)
-  import the configuration from a file , it support the format of  the Modifyheaders plugin 

## Rules table
The rules table contains lines with the following parameters :
- action : add, modify or delete a header field
- header field name
- header field value 
- comment : a comment 
- apply on : "request" if the modification apply on the request headers or "response" if the modification apply on the response headers
- status : on if the modification is active , off otherwise 

## Url pattern
We can choose the urls on which the modifications applies by modifying the url pattern :  
- The url pattern must follow the syntaxe define by https://developer.chrome.com/extensions/match_patterns
- Putting an empty string on the field will select all urls
- It's possible to select mutliple url patterns using semicolon(;) separator
- It's not possible to define a specific port number https://stackoverflow.com/questions/11425591/match-port-in-chrome-extension-pattern

## Parameters
The parameters button permits to :
- Activate debug mode: show detail log messages in the extension debugging console of the browser.
- Show comments : show comments field on the config panel 
- Filter URL per rules : activate the possiblity to filter url for each rules on the config panel, the header field will be modify only if the url contains the configurated value.


## Firefox specific issue
According to the version of Firefox, the addition of a new header behaves differently. In the latest version, when you choose the "add" action and the header exist, it appends the value, while in the old version, it replaces it. If you want to modify an exiting header, you should use "modify" instead of "add"
  

## License
The code is opensource under Mozilla Public License 2.0 




