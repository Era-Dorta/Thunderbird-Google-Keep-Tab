/*function tkpShutdownObserver()
{
  this.register();
}
tkpShutdownObserver.prototype = {
	observe: function(subject, topic, data) {
		
		let consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

		let mailPane = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("mail:3pane");
		let tabManager = mailPane.document.getElementById("tabmail");
		let tabsArray = tabManager.tabInfo;

		let googleKeepTabId = thunderkeepplus.getGoogleKeepTabId();

		// Manually update the tabId so that it matches the one it will have next time thunderbird restarts
		let j = 0; // Tab numbers will start from zero
		for (i = 0; i < tabsArray.length; i++) {
			let tabBrowser = tabsArray[i].browser;
			if(tabBrowser && tabBrowser.id.includes("contentTabBrowser")){
				if(googleKeepTabId.localeCompare(tabBrowser.id) === 0){
					thunderkeepplus.setGoogleKeepTabId("contentTabBrowser" + j);
					break;
				}
				j++;		
			}
		}
		this.unregister();
	},
	register: function() {
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
			.getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(this, "quit-application-granted", false);
	},
	unregister: function() {
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
			.getService(Components.interfaces.nsIObserverService);
		observerService.removeObserver(this, "quit-application-granted");
	}
};*/

'use strict';

var EXPORTED_SYMBOLS = ['tkpManager'];

const Cu = Components.utils;
const Ci = Components.interfaces;

Cu.import('resource://gre/modules/Services.jsm');

/** Log into console (also shown in terminal that runs firefox **/
Cu.import("resource://gre/modules/devtools/Console.jsm");

var TKPManager = function()
{
	this.enableDebug = true;
	this.document = null;
	this.prompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
}
TKPManager.prototype.debug= function (aMessage) {
	if(this.enableDebug) {
		let consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
		consoleService.logStringMessage("ThunderKeepPlus: " + aMessage);
	}
}
TKPManager.prototype.onLoad = function()
{
	try{
		this.debug("TKPManager onLoad");
		
		let customButton = this.document.getElementById("thunderkeepplus-toolbar-button");
		
		var self = this;
		customButton.addEventListener("click", function() {
        	self.onToolbarButtonClick();
    	});    	    	

		this.debug("TKPManager added onClick event listener");
	} catch(e) { this.prompt.alert(null, "ThunderKeepPlus Error", "onLoad: " + e);}
}
TKPManager.prototype.onUnload = function()
{
}
TKPManager.prototype.onShutdown = function()
{
	try{
		let mailPane = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator).getMostRecentWindow("mail:3pane");
		let tabManager = mailPane.document.getElementById("tabmail");
		let tabsArray = tabManager.tabInfo;

		let googleKeepTabId = this.getGoogleKeepTabId();

		// Manually update the tabId so that it matches the one it will have next time thunderbird restarts
		let j = 0; // Tab numbers will start from zero
		for (let i = 0; i < tabsArray.length; i++) {
			let tabBrowser = tabsArray[i].browser;
			if(tabBrowser && tabBrowser.id.includes("contentTabBrowser")){
				if(googleKeepTabId.localeCompare(tabBrowser.id) === 0){
					this.setGoogleKeepTabId("contentTabBrowser" + j);
					this.debug("Saving as contentTabBrowser" + j);
					return;
				}
				j++;		
			}
		}
		// If it didn't find it, the user closed the tab, set the id to empty
		this.setGoogleKeepTabId("");
	} catch(e) { this.prompt.alert(null, "ThunderKeepPlus Error", "onShutdown: "+ e );}
}
TKPManager.prototype.getPrefBranch = function(){
	let prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
	prefBranch = prefBranch.getBranch("extensions.thunderkeepplus.");
	return prefBranch;
}
TKPManager.prototype.setInstallComplete = function(value){
	let prefBranch = this.getPrefBranch();
	prefBranch.setBoolPref("installComplete", value);
}
TKPManager.prototype.setGoogleKeepTabId = function(value){
	let prefBranch = this.getPrefBranch();
	prefBranch.setCharPref("googleKeepTabId", value);
}
TKPManager.prototype.getGoogleKeepTabId = function(){
	let prefBranch = this.getPrefBranch();
	return prefBranch.getCharPref("googleKeepTabId");
}
TKPManager.prototype.onToolbarButtonClick = function() {

	// Open a new tab with Google Keep or focus on the already opened one
	try{	
		let mailPane = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator).getMostRecentWindow("mail:3pane");
		let tabManager = mailPane.document.getElementById("tabmail");
		let tabsArray = tabManager.tabInfo;
	
		let googleKeepTabId = this.getGoogleKeepTabId();
	
		this.debug("Found " + String(tabsArray.length) + " tabs");
		this.debug("Gtab browser id is \"" + googleKeepTabId + "\"");
	
		for (let i = 0; i < tabsArray.length; i++) {			
			let tabBrowser = tabsArray[i].browser;
			if(tabBrowser){
				this.debug("Tab " + i +  " with id \"" + tabBrowser.id + "\" and title \"" + tabsArray[i].title + "\"");
				if(googleKeepTabId.localeCompare(tabBrowser.id) === 0){
					this.debug("Switching to tab " + i);
					tabManager.switchToTab(i);
					return;
				}
			} else {
				this.debug("Tab " + i + " without id and title \"" + tabsArray[i].title + "\"");
			}
		}

		this.debug("Tab no found, opening new one");
	
		let gtab = tabManager.openTab("contentTab", {contentPage: "http://keep.google.com"});
	
		this.debug("Tab opened successfully");
		
		this.setGoogleKeepTabId(gtab.browser.id);
		
		this.debug("Tab id " + this.getGoogleKeepTabId() + " saved");	
		
	} catch(e) { this.prompt.alert(null, "ThunderKeepPlus Error", "onToolbarButtonClick: "+ e );}
}

var tkpManager = new TKPManager();
