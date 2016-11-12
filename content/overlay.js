'use strict';

var EXPORTED_SYMBOLS = ['tkpManager'];

const Cu = Components.utils;
const Ci = Components.interfaces;

Cu.import('resource://gre/modules/Services.jsm');

/** Log into console (also shown in terminal that runs firefox **/
Cu.import("resource://gre/modules/devtools/Console.jsm");

var TKPManager = function()
{
	this.enableDebug = false;
	this.document = null;
	this.prompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
	this.strings = Services.strings.createBundle('chrome://ThunderKeepPlus/locale/overlay.properties?' + Math.random());
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
    	
    	this.debug("tabTitle1 is:\"" + this.strings.GetStringFromName('ThunderKeepPlus.tabTitle1') + 
			"\" and 2 is:\"" + this.strings.GetStringFromName('ThunderKeepPlus.tabTitle2') + "\"");

		this.debug("TKPManager added onClick event listener");
	} catch(e) { this.prompt.alert(null, "ThunderKeepPlus Error", "onLoad: " + e);}
}
TKPManager.prototype.onUnload = function()
{
	// Close the Google Keep tab
	try{
		let mailPane = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator).getMostRecentWindow("mail:3pane");
		let tabManager = mailPane.document.getElementById("tabmail");
		let tabsArray = tabManager.tabInfo;
		
		this.debug("Found " + String(tabsArray.length) + " tabs");
		
		for (let i = 0; i < tabsArray.length; i++) {
			let tabBrowser = tabsArray[i].browser;
			if(tabBrowser){
				this.debug("Tab " + i +  " with id \"" + tabBrowser.id + "\" and title \"" + tabsArray[i].title + "\"");
				if(tabsArray[i].title === this.strings.GetStringFromName('ThunderKeepPlus.tabTitle1')
					|| tabsArray[i].title === this.strings.GetStringFromName('ThunderKeepPlus.tabTitle2')){
					this.debug("Closing tab " + i);
					tabManager.closeTab(i);
					return;
				}
			} else {
				this.debug("Tab " + i + " without id and title \"" + tabsArray[i].title + "\"");
			}
		}
		
	} catch(e) { this.prompt.alert(null, "ThunderKeepPlus Error", "onUnload: "+ e );}
}
TKPManager.prototype.onToolbarButtonClick = function() {

	// Open a new tab with Google Keep or focus on the already opened one
	try{
		let mailPane = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator).getMostRecentWindow("mail:3pane");
		let tabManager = mailPane.document.getElementById("tabmail");
		let tabsArray = tabManager.tabInfo;
		
		this.debug("Found " + String(tabsArray.length) + " tabs");
		
		for (let i = 0; i < tabsArray.length; i++) {
			let tabBrowser = tabsArray[i].browser;
			if(tabBrowser){
				this.debug("Tab " + i +  " with id \"" + tabBrowser.id + "\" and title \"" + tabsArray[i].title + "\"");
				if(tabsArray[i].title === this.strings.GetStringFromName('ThunderKeepPlus.tabTitle1')
					|| tabsArray[i].title === this.strings.GetStringFromName('ThunderKeepPlus.tabTitle2')){
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
		
	} catch(e) { this.prompt.alert(null, "ThunderKeepPlus Error", "onToolbarButtonClick: "+ e );}
}

var tkpManager = new TKPManager();
