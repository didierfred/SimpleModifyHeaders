
const useManifestV3 = navigator.userAgent.toLowerCase().indexOf('chrome') !== -1;

function debug(message) {
    if (debug_mode) console.log(new Date() + ' SimpleModifyHeader : ' + message);
}


function applyConfigWithManifestV3() {
    if (started === 'on')
        removeConfigWithManifestV3(() =>
            loadFromBrowserStorage(['config'], function (result) {
                const config = JSON.parse(result.config);
                if (!config.headers) return;

                debug('Load config :' + JSON.stringify(config));

                const rules = new Array();
                let ruleId = 1;
                config.headers.forEach((header) => {
                    if (header.status === 'on') {
                        convertConfigLineAsRules(config.target_page, config.use_url_contains, header).forEach(
                            (rule) => {
                                rule.id = ruleId;
                                rules.push(rule);
                                ruleId++;
                            }
                        );
                    }
                });
                debug('Add rules : ' + JSON.stringify(rules));
                debug('Rules number: ' + rules.length);
                if (rules.length >= chrome.declarativeNetRequest.MAX_NUMBER_OF_UNSAFE_DYNAMIC_RULES)
                    alert(
                        'You\'ve reached the maximum number of url filtered allowed by the browser. Please disable some rules or remove some "url contains".'
                    );
                else chrome.declarativeNetRequest.updateDynamicRules({addRules: rules});
                chrome.action.setIcon({path: '../icons/modify-green-32.png'});
            })
        );
}

function convertConfigLineAsRules(target_page, use_url_contains, header) {
    if (header.header_name == '') return [];
    let rules = new Array();
    let patterns = new Array();
    if (use_url_contains) patterns = getPatternMatchingFromConfig(target_page, header.url_contains);
    else patterns = getPatternMatchingFromConfig(target_page);

    patterns.forEach((pattern) => {
        const rule = {
            priority: 2,
            action: {
                type: 'modifyHeaders'
            },
            condition: {
                urlFilter: pattern,
                resourceTypes: [
                    'main_frame',
                    'sub_frame',
                    'stylesheet',
                    'script',
                    'image',
                    'font',
                    'object',
                    'xmlhttprequest',
                    'ping',
                    'csp_report',
                    'media',
                    'websocket',
                    'webtransport',
                    'webbundle',
                    'other'
                ]
            }
        };

        const ruleHeaders = [{header: header.header_name}];
        if (header.apply_on === 'res') rule.action.responseHeaders = ruleHeaders;
        else rule.action.requestHeaders = ruleHeaders;

        if (header.action === 'delete') ruleHeaders[0].operation = 'remove';
        else {
            ruleHeaders[0].operation = 'set';
            ruleHeaders[0].value = header.header_value;
        }
        rules.push(rule);
    });

    return rules;
}

function removeConfigWithManifestV3(callback) {
    chrome.declarativeNetRequest.getDynamicRules(function (Rules) {
        if (!!Rules) {
            const rulesToDelete = new Array();
            Rules.forEach((rule) => {
                rulesToDelete.push(rule.id);
            });
            chrome.action.setIcon({path: '../icons/modify-32.png'});
            debug('Delete rules ' + JSON.stringify(Rules));
            chrome.declarativeNetRequest.updateDynamicRules(
                {
                    removeRuleIds: rulesToDelete
                },
                callback
            );
        }
    });
}
