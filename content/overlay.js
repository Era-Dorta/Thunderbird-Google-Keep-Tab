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

Cu.import('resource://gre/modules/Services.jsm');

/** Log into console (also shown in terminal that runs firefox **/
Cu.import("resource://gre/modules/devtools/Console.jsm");

var TKPManager = function()
{
	this.enableDebug = true;
}
TKPManager.prototype.debug= function (aMessage) {
	if(this.enableDebug) {
		let consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		consoleService.logStringMessage("ThunderKeepPlus: " + aMessage);
	}
}
TKPManager.prototype.onLoad = function()
{
    // initialisation code:
 	// If the completeInstall flag is true, the button has already been installed
	try{
		this.debug("start");
		
		document.getElementById("thunderkeepplus-toolbar-button").addEventListener("click", function(event) {
        	thunderkeepplus.onToolbarButtonCommand(event);
    	});
		/*let installButton = true;
		let prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		
		prefBranch = prefBranch.getBranch("extensions.thunderkeepplus@gmail.com.");
		if (prefBranch && prefBranch.getPrefType("installComplete") == prefBranch.PREF_BOOL){
			installButton = !prefBranch.getBoolPref("installComplete");
		}
		thunderkeepplus.debug("installComplete is " + !installButton);
		
		if (installButton) {
			thunderkeepplus.debug("Installing button");
			// Find the navigation bar and append the CloseAllTabs button
			prefBranch.setBoolPref("installComplete", true);
			let mainNavBar = document.getElementById("mail-bar3");
			
			if(!mainNavBar || !mainNavBar.currentSet) {
				thunderkeepplus.debug("Error installing button: toolbar not present.");
				return;
			}
			
			let curSet = mainNavBar.currentSet;
			if (curSet.indexOf("thunderkeepplus-toolbar-button") == -1) {
				let insertPos = curSet.indexOf("button-address");
				if (insertPos > -1) {
					// Insert the button after the address book button:
					insertPos += 14; // "button-address".length
					curSet = curSet.substring(0,insertPos) + ",thunderkeepplus-toolbar-button"+ curSet.substring(insertPos);
				} else {
					curSet = curSet + ",thunderkeepplus-toolbar-button";
				}
				
				thunderkeepplus.debug("curSet: " + curSet);
				
				// Tutorial says that we have to perform the following steps
				mainNavBar.setAttribute("currentset", curSet);
				mainNavBar.currentSet = curSet;
				document.persist("mail-bar3", "currentset");
				try {
					BrowserToolboxCustomizeDone(true);
				} catch (e) { }
				thunderkeepplus.debug("Button successfully installed");
			} 
		}*/
	} catch(e) { alert("Error ThunderKeepPlus onLoad: " + e); }
}
TKPManager.prototype.onUnload = function()
{
}
TKPManager.prototype.getPrefBranch = function(){
	let prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
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
/*beingDisabled: false,
beingUninstalled: false,

onUninstalling: function(addon, needsRestart) {
	if (addon.id == "thunderkeepplus@gmail.com") {
		thunderkeepplus.debug("uninstalling");
		thunderkeepplus.beingUninstalled = true;
		thunderkeepplus.setInstallComplete(false);
	}
},

// TODO Implement disable
onDisabling: function(addon){
thunderkeepplus.debug("onDisabling");
	if (addon.id == "thunderkeepplus@gmail.com") {
		thunderkeepplus.debug("disabling");
		beingDisabled = true;
	}
},

onOperationCancelled: function(addon) {
	if (addon.id == "thunderkeepplus@gmail.com"){
		if (!(addon.pendingOperations & AddonManager.PENDING_UNINSTALL) && thunderkeepplus.beingUninstalled) {
			thunderkeepplus.debug("uninstall cancelled");
			thunderkeepplus.beingUninstalled = false;
			thunderkeepplus.setInstallComplete(true);
		 	return;
		}
		if (!(addon.pendingOperations & AddonManager.PENDING_DISABLE) && thunderkeepplus.beingDisabled) {
			thunderkeepplus.debug("disable cancelled");
			thunderkeepplus.beingDisabled = false;
		 	return;
		}

	}
},*/

TKPManager.prototype.onToolbarButtonCommand = function(e) {

	// Open a new tab with Google Keep or focus on the already opened one
	try{	
		let mailPane = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("mail:3pane");
		let tabManager = mailPane.document.getElementById("tabmail");
		let tabsArray = tabManager.tabInfo;
	
		let googleKeepTabId = this.getGoogleKeepTabId();
	
		thunderkeepplus.debug("Found " + String(tabsArray.length) + " tabs");
		thunderkeepplus.debug("Gtab browser id is \"" + googleKeepTabId + "\"");
	
		for (i = 0; i < tabsArray.length; i++) {			
			let tabBrowser = tabsArray[i].browser;
			if(tabBrowser){
				thunderkeepplus.debug("Tab " + i +  " with id \"" + tabBrowser.id + "\" and title \"" + tabsArray[i].title + "\"");
				if(googleKeepTabId.localeCompare(tabBrowser.id) === 0){
					thunderkeepplus.debug("Switching to tab " + i);
					tabManager.switchToTab(i);
					return;
				}
			} else {
				thunderkeepplus.debug("Tab " + i + " without id and title \"" + tabsArray[i].title + "\"");
			}
		}

		thunderkeepplus.debug("Tab no found, opening new one");
	
		let gtab = tabManager.openTab("contentTab", {contentPage: "http://keep.google.com"});
	
		thunderkeepplus.debug("Tab opened successfully");
		
		thunderkeepplus.setGoogleKeepTabId(gtab.browser.id);
		
		thunderkeepplus.debug("Tab id " + thunderkeepplus.getGoogleKeepTabId() + " saved");	
		
	} catch(e) { alert("Error ThunderKeepPlus onToolbarButtonCommand: " + e); }
}

var tkpManager = new TKPManager();

//window.addEventListener("load", thunderkeepplus.onLoad, false);

//Components.utils.import("resource://gre/modules/AddonManager.jsm");
//AddonManager.addAddonListener(thunderkeepplus);

//let observer = new tkpShutdownObserver();
