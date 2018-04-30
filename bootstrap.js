const Cu = ChromeUtils;
const Cc = Components.classes;
const Ci = Components.interfaces;

Cu.import("resource://gre/modules/Services.jsm");

const extensionLink = "chrome://ThunderKeepPlus/",
	contentLink = extensionLink + "content/",
	uiModuleLink = contentLink + "ui.jsm",
	mainScriptLink = contentLink + "overlay.js";

const PREF_BRANCH = "extensions.thunderkeepplus.";
// Default button position
const PREFS = {parentNodeId: "mail-bar3", nextNodeId: "button-tag"};

var ui = undefined;
var tkpManager = undefined;

var enableDebug = false;

function startup(data,reason) {
	debug("startup");
	
	if(reason == ADDON_UPGRADE){
		// Version 0.9 never unloads the scripts, do it here to fix upgrade issues
		Cu.unload(uiModuleLink);
		Cu.unload(mainScriptLink);
	}

	Cu.import(uiModuleLink);
	Cu.import(mainScriptLink);

	loadDefaultPreferences();

	ui = new Ui(enableDebug);
	tkpManager = new TKPManager(enableDebug);

	forEachOpenWindow(loadIntoWindow);
	maybeAddWindowListener();
}
function shutdown(data,reason) {
	debug("shutdown");
	
	if (reason == APP_SHUTDOWN){
		return;
	}
	debug("shutdown not APP_SHUTDOWN");

	unloadDefaultPreferences();

	unloadThunderKeepPlus();
	Services.wm.removeListener(WindowListener);
	
	Cu.unload(uiModuleLink);
	Cu.unload(mainScriptLink);

	// HACK WARNING: The Addon Manager does not properly clear all addon related caches on update;
	// in order to fully update images and locales, their caches need clearing here
	Services.obs.notifyObservers(null, "chrome-flush-caches", null);
}
function unloadThunderKeepPlus() {
	debug("unloadThunderKeepPlus");

	tkpManager.onUnload();
	ui.destroy();
}
function install(data) {
	/** Present here only to avoid warning on addon installation **/
}
function uninstall() {
	/** Present here only to avoid warning on addon removal **/
}
function loadIntoWindow(window) {
	debug("loadIntoWindow");

	if(window.document != null){
		debug("loadIntoWindow dom title: " + window.document.title);
		ui.attach(window);
		tkpManager.onLoad(window.document);
	}
	return (ui.loaded && tkpManager.loaded);
}
function forEachOpenWindow(fnc)  // Apply a function to all open browser windows
{
	debug("forEachOpenWindow");

	var windows = Services.wm.getEnumerator(null);
	while (windows.hasMoreElements()){
		if(fnc(windows.getNext().QueryInterface(Ci.nsIDOMWindow))){
			return;
		}
	}
}
function maybeAddWindowListener(){
	debug("maybeAddWindowListener");

	if(!(ui.loaded && tkpManager.loaded)){
		debug("maybeAddWindowListener adding listener");
		Services.wm.addListener(WindowListener);
	}
}
function maybeRemoveWindowListener(){
	debug("maybeRemoveWindowListener");

	if(ui.loaded && tkpManager.loaded){
		debug("maybeRemoveWindowListener removing listener");
		Services.wm.removeListener(WindowListener);
	}
}
function loadDefaultPreferences() {
	debug("loadDefaultPreferences");

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
	debug("unloadDefaultPreferences");

	let branch = Services.prefs.getDefaultBranch(PREF_BRANCH);
	branch.deleteBranch("");
}
function debug(aMessage) {
	if(enableDebug) {
		let consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
		consoleService.logStringMessage("ThunderKeepPlus: " + aMessage);
	}
}
var WindowListener =
{
	onOpenWindow: function(xulWindow)
	{
		debug("WindowListener: onOpenWindow");
		
		var window = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
								.getInterface(Ci.nsIDOMWindow);
		function onWindowLoad()
		{
			window.removeEventListener("load", onWindowLoadFnc);
			debug("WindowListener: onWindowLoad");
			loadIntoWindow(window);
			maybeRemoveWindowListener();
		}
		var onWindowLoadFnc = onWindowLoad.bind(this);
		window.addEventListener("load", onWindowLoadFnc);
	},
	onCloseWindow: function(xulWindow) { },
	onWindowTitleChange: function(xulWindow, newTitle) { }
};
