function getRegExpFromConfig(target_page, url_contains) {
    if (target_page.trim() === '') target_page = '*';
    else target_page = escapeRegexpMetaCharacters(target_page);

    const regexps = new Array();
    if (url_contains) url_contains = url_contains.trim();
    target_page = removeConsecutiveChar(target_page, ';');
    target_page = removeLastChar(target_page, ';');
    target_page.split(';').forEach((page) => {
        
        let regexpsForOneTargetPage = buildRegexpsForOneTargetPage( page.trim(), url_contains);
        if (regexpsForOneTargetPage != null) {
            regexpsForOneTargetPage.forEach((elem) => {
                regexps.push(elem);
            });
        }
    });
    return regexps;
}

function buildRegexpsForOneTargetPage(page, url_contains) {
    page = removeConsecutiveChar(page, '*');
    page = setWildCardsForRegexp(page);
    if (!url_contains || url_contains.length === 0) {
        if (!page.endsWith('*')) page += '$';
        return [page];
    }
    url_contains = escapeRegexpMetaCharacters(url_contains);
    url_contains = url_contains.replaceAll('*', '\\*');
    url_contains = removeConsecutiveChar(url_contains, ';');
    url_contains = removeLastChar(url_contains, ';');

    if (page.indexOf('*') === -1) {
        isUrl_containsInPage = false;
        url_contains.split(';').forEach((elem) => {
            if (page.includes(elem)) isUrl_containsInPage = true;
        });
        if (isUrl_containsInPage) {
            if (!page.endsWith('*')) page += '$';
            return [page];
        } else return null;
    }

    if (url_contains.includes(';')) {
        url_contains = url_contains.replaceAll(';', '|');
        url_contains = '(' + url_contains + ')';
    }

    let regexps = new Array();
    for (let i = 0; i < page.length; i++) {
        if (page.charAt(i) === '*') {
            regexp = page.slice(0, i) + '*' + url_contains + '.*' + page.slice(i + 1);
            if (!regexp.endsWith('*')) regexp += '$';
            regexps.push(regexp);
        }
    }

    return regexps;
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
