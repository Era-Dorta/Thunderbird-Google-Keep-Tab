/**
 * Bootstrap.js template is taken from next link
 * https://developer.mozilla.org/en-US/Add-ons/Bootstrapped_extensions
 * but different in way that there is no loadIntoWindow function because
 * CustomizeUI has own events that are fired on ui modification (after new
 * xulWindow openned)
 */

const Cu = Components.utils;
const Cc = Components.classes;
const Ci = Components.interfaces;

Cu.import('resource://gre/modules/Services.jsm');

const extensionLink = 'chrome://ThunderKeepPlus/',
	contentLink = extensionLink + 'content/',
	uiModuleLink = contentLink + 'ui.jsm',
	mainScriptLink = contentLink + 'overlay.js';
	
const PREF_BRANCH = "";
const PREFS = {};

function startup(data,reason) {
	Cu.import(uiModuleLink);
	Cu.import(mainScriptLink);

	//loadDefaultPreferences();
	loadThunderKeepPlus();
}
function shutdown(data,reason) {
	if (reason == APP_SHUTDOWN){
		return;
	}
	
	//unloadDefaultPreferences();
	unloadThunderKeepPlus();

	Cu.unload(uiModuleLink);

	// HACK WARNING: The Addon Manager does not properly clear all addon related caches on update;
	//               in order to fully update images and locales, their caches need clearing here
	Services.obs.notifyObservers(null, "chrome-flush-caches", null);
}
function loadThunderKeepPlus() {
	let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

	// For thunderbird we only care about the first window
	let windows = wm.getEnumerator(null);
	if(windows.hasMoreElements()) {
		
		let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
		
		// If not ready set a listener
		if(domWindow.document.readyState == "complete"){
        	loadIntoWindow(domWindow);
        } else {
        	domWindow.addEventListener("load", loadIntoWindow);
        }
    
	} else {
		// If there aren't any windows, set a listener for window opening
		wm.addListener(WindowListener);
		return;
	}
}
function unloadThunderKeepPlus() {
	tkpManager.onUnload();
	ui.destroy();
}
function loadDefaultPreferences() {
	let branch = Services.prefs.getDefaultBranch(PREF_BRANCH);
	for (let [key, val] in Iterator(PREFS)) {
		switch (typeof val) {
		case "boolean":
			branch.setBoolPref(key, val);
			break;
		case "number":
			branch.setIntPref(key, val);
			break;
		case "string":
			branch.setCharPref(key, val);
			break;
		}
	}
}
function unloadDefaultPreferences() {
	let branch = Services.prefs.getDefaultBranch(PREF_BRANCH);
	branch.deleteBranch("");
}
function install(data) {
	/** Present here only to avoid warning on addon installation **/
}
function uninstall() {
	/** Present here only to avoid warning on addon removal **/
}
function loadIntoWindow(window) {
	tkpManager.document = window.document;
	ui.document = window.document;

	ui.attach();
	tkpManager.onLoad();
}

var WindowListener =
{
    onOpenWindow: function(xulWindow)
    {
        var window = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                              .getInterface(Ci.nsIDOMWindow);
        function onWindowLoad()
        {
			// Only need to be loaded once, so remove all the listeners
			window.removeEventListener("load",onWindowLoad);

			let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
			wm.removeListener(WindowListener);

			loadIntoWindow(window);
        }
        window.addEventListener("load",onWindowLoad);
    },
    onCloseWindow: function(xulWindow) { },
    onWindowTitleChange: function(xulWindow, newTitle) { }
};
