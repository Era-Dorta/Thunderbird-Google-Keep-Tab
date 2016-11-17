"use strict";

var EXPORTED_SYMBOLS = ["tkpManager"];

const Cu = Components.utils;
const Ci = Components.interfaces;
const Cc = Components.classes;

Cu.import("resource://gre/modules/Services.jsm");

/** Log into console (also shown in terminal that runs firefox **/
Cu.import("resource://gre/modules/devtools/Console.jsm");

var TKPManager = function()
{
	this.prompt = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
	this.strings = Services.strings.createBundle("chrome://ThunderKeepPlus/locale/overlay.properties?" + Math.random());
	this.mailPane = null;
	this.tabManager = null;
	this.tabsArray = null;
	this.loaded = false;
}
TKPManager.prototype.onLoad = function(document)
{
	try{		
		let customButton = document.getElementById("thunderkeepplus-toolbar-button");
		
		var self = this;
		customButton.addEventListener("click", function(event) {
        	self.onToolbarButtonClick(event);
    	});
    				
		this.mailPane = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("mail:3pane");
		this.tabManager = this.mailPane.document.getElementById("tabmail");
		this.tabsArray = this.tabManager.tabInfo;

		this.loaded = true;
	} catch(e) { this.prompt.alert(null, "ThunderKeepPlus Error", "onLoad: " + e);}
}
TKPManager.prototype.onUnload = function()
{
	if(!this.loaded){
		return;
	}
	// Close the Google Keep tab
	try{
		for (let i = 0; i < this.tabsArray.length; i++) {
			let tabBrowser = this.tabsArray[i].browser;
			if(tabBrowser){
				if(this.tabsArray[i].title === this.strings.GetStringFromName("ThunderKeepPlus.tabTitle1")
					|| this.tabsArray[i].title === this.strings.GetStringFromName("ThunderKeepPlus.tabTitle2")){
					this.tabManager.closeTab(i);
					return;
				}
			}
		}
		this.loaded = false;
	} catch(e) { this.prompt.alert(null, "ThunderKeepPlus Error", "onUnload: "+ e );}
}
TKPManager.prototype.onToolbarButtonClick = function(event) {

	// Open a new tab with Google Keep or focus on the already opened one
	try{
		// Handle only left click
		if(event.button !== 0){
			return;
		}
		for (let i = 0; i < this.tabsArray.length; i++) {
			let tabBrowser = this.tabsArray[i].browser;
			if(tabBrowser){
				if(this.tabsArray[i].title === this.strings.GetStringFromName("ThunderKeepPlus.tabTitle1")
					|| this.tabsArray[i].title === this.strings.GetStringFromName("ThunderKeepPlus.tabTitle2")){
					this.tabManager.switchToTab(i);
					return;
				}
			}
		}
				
		let gtab = this.tabManager.openTab("contentTab", {contentPage: "http://keep.google.com"});
				
	} catch(e) { this.prompt.alert(null, "ThunderKeepPlus Error", "onToolbarButtonClick: "+ e );}
}

var tkpManager = new TKPManager();
