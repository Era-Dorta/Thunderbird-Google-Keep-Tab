/**
 * Bootstrap.js template is taken from next link
 * https://developer.mozilla.org/en-US/Add-ons/Bootstrapped_extensions
 * but different in way that there is no loadIntoWindow function because
 * CustomizeUI has own events that are fired on ui modification (after new
 * xulWindow openned)
 */

const Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');

const extensionLink = 'chrome://ThunderKeepPlus/',
	contentLink = extensionLink + 'content/',
	uiModuleLink = contentLink + 'ui.jsm',
	mainScriptLink = contentLink + 'overlay.js';
	prefsScriptLink = contentLink + 'defaultprefs.js';

function startup(data,reason) {
	Cu.import(uiModuleLink);
	Cu.import(mainScriptLink);   

	loadDefaultPreferences();
	loadThunderKeepPlus();
}
function shutdown(data,reason) {
	if (reason == APP_SHUTDOWN)
	return;

	unloadDefaultPreferences();
	unloadThunderKeepPlus();

	Cu.unload(uiModuleLink);

	// HACK WARNING: The Addon Manager does not properly clear all addon related caches on update;
	//               in order to fully update images and locales, their caches need clearing here
	Services.obs.notifyObservers(null, "chrome-flush-caches", null);
}
function loadThunderKeepPlus() {
	tkpManager.onLoad();
	ui.attach();
}
function unloadThunderKeepPlus() {
	tkpManager.onUnload();
	ui.destroy();
}
function loadDefaultPreferences() {	
	Services.scriptloader.loadSubScript(prefsScriptLink,
		{'extensions.thunderkeepplus.googleKeepTabId':""} );
}
function unloadDefaultPreferences() {

}
function install(data) {
	/** Present here only to avoid warning on addon installation **/
}
function uninstall() {
	/** Present here only to avoid warning on addon removal **/
}
