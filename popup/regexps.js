function getPatternMatchingFromConfig(target_page, url_contains) {
    if (target_page.trim() === '') target_page = '*';

    const patterns = new Array();
    if (url_contains) url_contains = url_contains.trim();
    target_page = removeConsecutiveChar(target_page, ';');
    target_page = removeLastChar(target_page, ';');
    target_page.split(';').forEach((page) => {
        let patternsForOneTargetPage = getPatternMatchingForOneTargetPage(page.trim(), url_contains);
        if (patternsForOneTargetPage != null) {
            patternsForOneTargetPage.forEach((elem) => {
                patterns.push(elem);
            });
        }
    });
    return patterns;
}

function getPatternMatchingForOneTargetPage(page, url_contains) {
    page = removeConsecutiveChar(page, '*');
    if (!url_contains || url_contains.length === 0) {
        if (!page.endsWith('*')) page += '|';
        return [page];
    }
    url_contains = removeConsecutiveChar(url_contains, ';');
    url_contains = removeLastChar(url_contains, ';');

    isUrl_containsInPage = false;
    url_contains.split(';').forEach((elem) => {
        if (page.includes(elem)) isUrl_containsInPage = true;
    });
    if (isUrl_containsInPage) {
        if (!page.endsWith('*')) page += '|';
        return [page];
    } else if (page.indexOf('*') === -1) return null;

    let patterns = new Array();
    url_contains.split(';').forEach((elem) => {
        for (let i = 0; i < page.length; i++) {
            if (page.charAt(i) === '*') {
                let pattern = page.slice(0, i) + '*' + elem + '*' + page.slice(i + 1);
                if (!pattern.endsWith('*')) pattern += '|';
                patterns.push(pattern);
            }
        }
    });

    return patterns;
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
