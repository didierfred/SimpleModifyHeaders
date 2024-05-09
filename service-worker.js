function setExtensionIcon() {
    chrome.storage.local.get(['started'], (result) => {
        if (result.started === 'on') {
            chrome.action.setIcon({path: '../icons/modify-green-32.png'});
            console.log('ModifyHeader started');
        } else {
            chrome.action.setIcon({path: '../icons/modify-32.png'});
            console.log('ModifyHeader stopped');
        }
    });
}

chrome.runtime.onStartup.addListener(setExtensionIcon);
chrome.runtime.onInstalled.addListener(setExtensionIcon)

