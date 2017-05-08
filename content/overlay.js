"use strict";

var EXPORTED_SYMBOLS = ["TKPManager"];

const Cu = Components.utils;
const Ci = Components.interfaces;
const Cc = Components.classes;

Cu.import("resource://gre/modules/Services.jsm");

/** Log into console (also shown in terminal that runs firefox **/
Cu.import("resource://gre/modules/devtools/Console.jsm");

function TKPManager(enableDebug)
{
	this.enableDebug = enableDebug;
	this.prompt = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
	this.strings = Services.strings.createBundle("chrome://ThunderKeepPlus/locale/overlay.properties?" + Math.random());
	this.mailPane = null;
	this.tabManager = null;
	this.tabsArray = null;
	this.loaded = false;
}
TKPManager.prototype.debug= function (aMessage) {
	if(this.enableDebug) {
		let consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
		consoleService.logStringMessage("ThunderKeepPlus: " + aMessage);
	}
}
TKPManager.prototype.onLoad = function(document)
{
	try{
		if(this.loaded){
			return;
		}
		
		this.debug("TKPManager onLoad");
		
		let customButton = document.getElementById("thunderkeepplus-toolbar-button");
		
		if(customButton == null){
			return;
		}
		
		var self = this;
		customButton.addEventListener("click", function(event) {
			self.onToolbarButtonClick(event);
		});
		
		this.debug("tabTitle1 is:\"" + this.strings.GetStringFromName("ThunderKeepPlus.tabTitle1") + 
			"\" and 2 is:\"" + this.strings.GetStringFromName("ThunderKeepPlus.tabTitle2") + "\"");
		
		this.mailPane = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("mail:3pane");
		this.tabManager = this.mailPane.document.getElementById("tabmail");
		this.tabsArray = this.tabManager.tabInfo;

		this.loaded = true;

		this.debug("TKPManager onLoad successful");
	} catch(e) {Cu.reportError("ThunderKeepPlus: onLoad " + e);}
}
TKPManager.prototype.onUnload = function()
{
	this.debug("TKPManager onUnLoad");
	
	if(!this.loaded){
		this.debug("TKPManager onUnLoad, loaded is false");
		return;
	}

	this.loaded = false;

	// Close the Google Keep tab
	try{
		this.debug("Found " + String(this.tabsArray.length) + " tabs");
		for (let i = 0; i < this.tabsArray.length; i++) {
			let tabBrowser = this.tabsArray[i].browser;
			if(tabBrowser != null){
				this.debug("Tab " + i +  " with id \"" + tabBrowser.id + "\" and title \"" + this.tabsArray[i].title + "\"");
				if(this.tabsArray[i].title === this.strings.GetStringFromName("ThunderKeepPlus.tabTitle1")
					|| this.tabsArray[i].title === this.strings.GetStringFromName("ThunderKeepPlus.tabTitle2")){
					this.debug("Closing tab " + i);
					this.tabManager.closeTab(i);
					return;
				}
			} else {
				this.debug("Tab " + i + " without id and title \"" + this.tabsArray[i].title + "\"");
			}
		}		
		this.debug("TKPManager onUnLoad it didn't find the tab");
	} catch(e) { Cu.reportError("ThunderKeepPlus: onUnload " + e);}
}
TKPManager.prototype.onToolbarButtonClick = function(event) {

	// Open a new tab with Google Keep or focus on the already opened one
	try{
		// Handle only left click
		if(event.button !== 0){
			return;
		}
		this.debug("Found " + String(this.tabsArray.length) + " tabs");
		
		for (let i = 0; i < this.tabsArray.length; i++) {
			let tabBrowser = this.tabsArray[i].browser;
			if(tabBrowser != null){
				this.debug("Tab " + i +  " with id \"" + tabBrowser.id + "\" and title \"" + this.tabsArray[i].title + "\"");
				if(this.tabsArray[i].title === this.strings.GetStringFromName("ThunderKeepPlus.tabTitle1")
					|| this.tabsArray[i].title === this.strings.GetStringFromName("ThunderKeepPlus.tabTitle2")){
					this.debug("Switching to tab " + i);
					this.tabManager.switchToTab(i);
					return;
				}
			} else {
				this.debug("Tab " + i + " without id and title \"" + this.tabsArray[i].title + "\"");
			}
		}
		
		this.debug("Tab no found, opening new one");
		
		let gtab = this.tabManager.openTab("contentTab", {contentPage: "http://keep.google.com"});
		
		this.debug("Tab opened successfully");
		
	} catch(e) {Cu.reportError("ThunderKeepPlus: onToolbarButtonClick " + e);}
}

