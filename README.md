# SimpleModifyHeaders

Extension for firefox . 

The extension rewrite the headers based on a rules table. 

The rules table contains lines with the following parameters :
- action : add, modify or delete a header field
- header field name
- header field value 
- comment : a comment 
- status : on if the modification is active , off otherwise 

We can choose the urls on which the modifications applies by modifying the url pattern. The url pattern must follow the syntaxe define by https://developer.chrome.com/extensions/match_patterns

To save and apply the modification , you need to click on the save button

It's possible to: 
-  export the configuration in a file (json format)
-  import the configuration from a file , it support the format of  the Modifyheaders plugin  


The extension can be start and stop via the button on the top right.

The code is opensource under Mozilla Public License 2.0 




