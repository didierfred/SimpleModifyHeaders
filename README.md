# SimpleModifyHeaders V 1.8.1

This extension, available for [Firefox](https://addons.mozilla.org/firefox/addon/simple-modify-header/) and [Chrome](https://chrome.google.com/webstore/detail/simple-modify-headers/gjgiipmpldkpbdfjkgofildhapegmmic), allows you to rewrite headers based on a rules table. 

You can easily start and stop the extension using the button on the top right. Remember to click the save button to apply your modifications.

The extension also provides the ability to:
- Export your configuration to a file (in JSON format)
- Import your configuration from a file, supporting the Modifyheaders plugin format. You can choose to append rules instead of replacing the existing configuration.
  
## Rules table

The rules table consists of the following parameters:
- `Action`: Specifies whether to add, modify, or delete a header field or cookie.
- `Header Field Name`: The name of the header field or cookie.
- `Header Field Value`: The value of the header field or cookie.
- `Comment`: Any additional comments.
- `Apply On`: Determines if the rule applies to request headers ("request") or response headers ("response").
- `Status`: Indicates if the rule is active ("on") or inactive ("off").
- `Export`: If set to "To export", the rule will be included when using the export function.

## Url pattern
We can choose the URLs on which the modifications are applied by modifying the URL pattern :  
- The URL pattern must follow the syntax defined by https://developer.chrome.com/extensions/match_patterns
- Putting an empty string on the field will select all URLs
- It's possible to select multiple URL patterns using a semicolon (;) separator

## Parameters
The parameters button permits to:
- Activate debug mode: shows detailed log messages in the extension debugging console of the browser.
- Show comments: show comments field on the config panel 
- Filter URL by rules: activate the possibility to filter URL for each rule in the config panel. The header field will be modified only if the URL contains one of the configured values (using semicolon as separator)


## Firefox-specific issue
According to the version of Firefox, the addition of a new header behaves differently. In the latest version, when you choose the "add" action and the header exists, it appends the value, while in the old version, it replaces it. If you want to modify an exiting header, you should use "modify" instead of "add".

It's not possible to define a specific port number in url pattern, https://stackoverflow.com/questions/11425591/match-port-in-chrome-extension-pattern

## Chrome / Edge  specific issue 

The introduction of Manifest V3, mandatory on Chromium-based browsers starting approximately in june 2024, has imposed restrictions on header modifications (refer to [Chromium Blog](https://developer.chrome.com/blog/resuming-the-transition-to-mv3?hl=en)). Direct access to header  and custom request filtering are no longer possible. All modifications must now be done via the declarativeNetRequest API, which has its own limitations, including a cap on the number of filtering rules and the size of regular expressions.

Attempting to maintain similar behavior to Manifest V2 presents several challenges, resulting in the following issues:

- Individual cookie modification is no longer possible so the option to manage cookies has been removed.
- The 'add' and 'modify' options behave identically (modifying a non-existing header will result in it being added).
- You may reach the browser's maximum filtering rules limit. If this occurs, a message will prompt you to deactivate some rules. However, this issue should be rare.
- The previous method of first filtering via global "URL patterns" followed by an "URL contains" filtering is no longer possible. Instead, multiple patterns are used for filtering. For example:
  - `URL pattern = "http://*/*"` and `when URL contains = "test"` results in two rules: `http://*test*/*` and `http://*/*test*`.
  - `URL pattern = "http://test/myurl*"` and `when URL contains = "test"` results in one rule: `http://test/myurl*`.
  - `URL pattern = "http://te*/myurl*"` and `when URL contains = "test"` results in two rules: `http://te*test*/myurl*` and `http://te*/myurl*test*`. This accepts `http://tetest/myurl` but excludes `http://test/myurl`, which was valid with the Manifest V2 version.
  
  
## Extension Permissions

The extension requires the following permissions to function properly:

### Firefox 
- `storage`: Stores the configuration and rules.
- `activeTab`, `tabs`: Displays the configuration screen in the browser tab.
- `webRequest`, `webRequestBlocking`, `<all_urls>`: Modifies headers based on the rules table.

### Chrome & Edge 
- `storage`: Stores the configuration and rules.
- `activeTab`, `tabs`: Displays the configuration screen in the browser tab.
- `declarativeNetRequest`, `declarativeNetRequestWithHostAccess`: Modifies headers based on the rules table.


## Personal Information
The extension does not collect personal information.

## License
The code is Open Source under Mozilla Public License 2.0 
