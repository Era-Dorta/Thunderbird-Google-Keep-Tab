"use strict";

var EXPORTED_SYMBOLS = ["TKPManager"];

const Cu = ChromeUtils;
const Ci = Components.interfaces;
const Cc = Components.classes;

Cu.import("resource://gre/modules/Services.jsm");

class TKPManager {
	constructor(enableDebug) {
		this.enableDebug = enableDebug;
		this.prompt = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
		this.strings = Services.strings.createBundle("chrome://ThunderKeepPlus/locale/overlay.properties?" + Math.random());
		this.mailPane = null;
		this.tabManager = null;
		this.tabsArray = null;
		this.loaded = false;
	}
	
	debug(aMessage) {
		if(this.enableDebug) {
			let consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
			consoleService.logStringMessage("ThunderKeepPlus: " + aMessage);
		}
	}
	
	onLoad(document)
	{
		try{
			if(this.loaded){
				return;
			}
			
			this.debug("TKPManager onLoad");
			
			// Main button
			let customButton = document.getElementById("thunderkeepplus-toolbar-button");
			
			if(customButton == null){
				return;
			}
			
			var self = this;
			customButton.addEventListener("click", function(event) {
				self.onToolbarButtonClick(event);
			});
			
			// Sign out in main menu item
			customButton = document.getElementById("thunderkeepplus_signout");
			
			if(customButton != null){
				customButton.addEventListener("command", function(event) {
					self.onSignOut(event);
				}, false);
			}
			
			// Sign out in app menu item
			customButton = document.getElementById("appmenu_thunderkeepplus_signout");
			
			if(customButton != null){
				customButton.addEventListener("command", function(event) {
					self.onSignOut(event);
				}, false);
			}
			
			this.debug("tabTitle1 is:\"" + this.strings.GetStringFromName("ThunderKeepPlus.tabTitle1") + 
				"\" and 2 is:\"" + this.strings.GetStringFromName("ThunderKeepPlus.tabTitle2") + "\"");
			
			this.mailPane = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("mail:3pane");
			this.tabManager = this.mailPane.document.getElementById("tabmail");
			this.tabsArray = this.tabManager.tabInfo;

			this.loaded = true;

			this.debug("TKPManager onLoad successful");
		} catch(e) {Cu.reportError("ThunderKeepPlus: onLoad " + e);}
	}
	
	onUnload()
	{
		this.debug("TKPManager onUnLoad");
		
		if(!this.loaded){
			this.debug("TKPManager onUnLoad, loaded is false");
			return;
		}

		this.loaded = false;

		this.closeGoogleKeepTab();
	}
	
	onToolbarButtonClick(event) {

		// Open a new tab with Google Keep or focus on the already opened one
		try{
			// Handle only left click
			if(event.button !== 0){
				return;
			}
			this.debug("TKPManager trying to open a Google Keep Tab ");
			this.debug("\tFound " + String(this.tabsArray.length) + " tabs");
			
			for (let i = 0; i < this.tabsArray.length; i++) {
				let tabBrowser = this.tabsArray[i].browser;
				if(tabBrowser != null){
					this.debug("\tTab " + i +  " with id \"" + tabBrowser.id + "\" and title \"" + this.tabsArray[i].title + "\"");
					if(this.tabsArray[i].title === this.strings.GetStringFromName("ThunderKeepPlus.tabTitle1")
						|| this.tabsArray[i].title === this.strings.GetStringFromName("ThunderKeepPlus.tabTitle2")){
						this.debug("\tSwitching to tab " + i);
						this.tabManager.switchToTab(i);
						return;
					}
				} else {
					this.debug("\tTab " + i + " without id and title \"" + this.tabsArray[i].title + "\"");
				}
			}
			
			this.debug("\tTab not found, opening new one");
			
			let gtab = this.tabManager.openTab("contentTab", {contentPage: "https://keep.google.com"});
			
			this.debug("\tTab opened successfully");
			
		} catch(e) {Cu.reportError("ThunderKeepPlus: onToolbarButtonClick " + e);}
	}
	
	onSignOut(event) {
		// Log out the user by removing the google.com cookies
		try{
			this.debug("TKPManager trying to sign out");
			let cookieOrigin = "google.com"; // Cookies from this address will be removed
			let cookieManager = Services.cookies;
		
			let numCookies = cookieManager.countCookiesFromHost(cookieOrigin);
			this.debug("\tFound " + numCookies + " cookies from " + cookieOrigin);
		
			if (numCookies > 0) {
				let cookies = cookieManager.getCookiesFromHost(cookieOrigin, {});
				let cookie = null;
				while (cookies.hasMoreElements()){
					cookie = cookies.getNext().QueryInterface(Ci.nsICookie2);
					this.debug("\tRemoving cookie [" + cookie.host + "], [" +  cookie.name + "], [" + cookie.path + "]");
					cookieManager.remove(cookie.host, cookie.name, cookie.path, false, cookie.originAttributes);
				}
			}
		
			this.debug("\tDone removing cookies");
			
			this.closeGoogleKeepTab();

		} catch(event) {Cu.reportError("ThunderKeepPlus: onSignOut " + event);}
	}
	
	closeGoogleKeepTab() {
		// Close the Google Keep tab
		try{
			this.debug("TKPManager trying to close the Google Keep Tab ");
			this.debug("\tFound " + String(this.tabsArray.length) + " tabs");
			for (let i = 0; i < this.tabsArray.length; i++) {
				let tabBrowser = this.tabsArray[i].browser;
				if(tabBrowser != null){
					this.debug("\tTab " + i +  " with id \"" + tabBrowser.id + "\" and title \"" + this.tabsArray[i].title + "\"");
					if(this.tabsArray[i].title === this.strings.GetStringFromName("ThunderKeepPlus.tabTitle1")
						|| this.tabsArray[i].title === this.strings.GetStringFromName("ThunderKeepPlus.tabTitle2")){
						this.debug("\tClosing tab " + i);
						this.tabManager.closeTab(i);
						return;
					}
				} else {
					this.debug("\tTab " + i + " without id and title \"" + this.tabsArray[i].title + "\"");
				}
			}
			this.debug("\tTab not found");
		} catch(e) { Cu.reportError("ThunderKeepPlus: closeGoogleKeepTab " + e);}
	}
}
