function getRegExpFromConfig(target_page, url_contains) {
    if (target_page.trim() === '') target_page = '*';
    else target_page = escapeRegexpMetaCharacters(target_page);

    const regexps = new Array();
    if (url_contains) url_contains = url_contains.trim();
    target_page = removeConsecutiveChar(target_page, ';');
    target_page = removeLastChar(target_page, ';');
    target_page.split(';').forEach((page) => {
        let regexp = page.trim();
        regexp = buildRegexForOneTargetPage(regexp, url_contains);
        if (regexp != null) regexps.push(regexp);
    });
    return regexps;
}

function buildRegexForOneTargetPage(page, url_contains) {
    page = removeConsecutiveChar(page, '*');
    page = setWildCardsForRegexp(page);
    if (!url_contains || url_contains.length === 0 || page.includes(url_contains)) {
        if (!page.endsWith('*')) page += '$';
        return page;
    }
    url_contains = escapeRegexpMetaCharacters(url_contains);
    url_contains = url_contains.replaceAll('*', '\\*');
    if (page.indexOf('*') === -1) {
        if (page.includes(url_contains)) {
            return page;
        } else return undefined;
    }

    let regexp = '';
    let elements = new Array();
    for (let i = 0; i < page.length; i++) {
        if (page.charAt(i) === '*') {
            elements.push(page.slice(0, i) + '*' + url_contains + '.*' + page.slice(i + 1));
        }
    }

    elements.forEach((elem, index) => {
        if (index > 0) {
            regexp += '|';
        }
        regexp += elem;
        if (!regexp.endsWith('*')) regexp += '$';
    });
    return regexp;
}

function removeConsecutiveChar(str, char) {
    let newStr = '';
    for (let i = 0; i < str.length; i++) {
        if (str.charAt(i) === char && str.charAt(i + 1) === char) {
            continue;
        }
        newStr += str.charAt(i);
    }
    return newStr;
}

function removeLastChar(str, char) {
    if (str.charAt(str.length - 1) === char) {
        return str.slice(0, str.length - 1);
    }
    return str;
}

function setWildCardsForRegexp(regexp) {
    return regexp.replaceAll('*', '.*');
}

function escapeRegexpMetaCharacters(aString) {
    return aString.replaceAll('.', '\\.').replaceAll('?', '\\?').replaceAll('+', '\\+').replaceAll('$', '\\$');
}
