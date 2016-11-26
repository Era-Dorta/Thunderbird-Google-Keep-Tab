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

Cu.import("resource://gre/modules/Services.jsm");

const extensionLink = "chrome://ThunderKeepPlus/",
	contentLink = extensionLink + "content/",
	uiModuleLink = contentLink + "ui.jsm",
	mainScriptLink = contentLink + "overlay.js";

const PREF_BRANCH = "extensions.thunderkeepplus.";
const PREFS = {parentNodeId: "mail-bar3", nextNodeId: "button-tag"};

var ui = undefined;
var tkpManager = undefined;

function startup(data,reason) {
	Cu.import(uiModuleLink);
	Cu.import(mainScriptLink);

	loadDefaultPreferences();

	ui = new Ui();
	tkpManager = new TKPManager();

	forEachOpenWindow(loadIntoWindow);
	maybeAddWindowListener();
}
function shutdown(data,reason) {
	if (reason == APP_SHUTDOWN){
		return;
	}

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
	if(window.document != null){
		ui.attach(window.document);
		tkpManager.onLoad(window.document);
	}
	return (ui.loaded && tkpManager.loaded);
}
function forEachOpenWindow(fnc)  // Apply a function to all open browser windows
{
	var windows = Services.wm.getEnumerator(null);
	while (windows.hasMoreElements()){
		if(fnc(windows.getNext().QueryInterface(Ci.nsIDOMWindow))){
			return;
		}
	}
}
function maybeAddWindowListener(){
	if(!(ui.loaded && tkpManager.loaded)){
		Services.wm.addListener(WindowListener);
	}
}
function maybeRemoveWindowListener(){
	if(ui.loaded && tkpManager.loaded){
		Services.wm.removeListener(WindowListener);
	}
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
var WindowListener =
{
	onOpenWindow: function(xulWindow)
	{
		var window = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
								.getInterface(Ci.nsIDOMWindow);
		function onWindowLoad()
		{
			window.removeEventListener("load", onWindowLoadFnc);
			loadIntoWindow(window);
			maybeRemoveWindowListener();
		}
		var onWindowLoadFnc = onWindowLoad.bind(this);
		window.addEventListener("load", onWindowLoadFnc);
	},
	onCloseWindow: function(xulWindow) { },
	onWindowTitleChange: function(xulWindow, newTitle) { }
};
