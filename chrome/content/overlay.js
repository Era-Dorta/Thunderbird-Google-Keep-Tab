var thunderkeepplus = {
/* Simple debugging to the error console */
enableDebug: true,
debug: function (aMessage) {
	if(thunderkeepplus.enableDebug) {
		let consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		consoleService.logStringMessage("ThunderKeepPlus: " + aMessage);
	}
},


onLoad: function() {
    // initialisation code:
 	// If the completeInstall flag is true, the button has already been installed
	try{
		thunderkeepplus.debug("start");
		let installButton = true;
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
		}
	} catch(e) { alert("Error ThunderKeepPlus onLoad: " + e); }
},

getPrefBranch: function(){
	let prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	prefBranch = prefBranch.getBranch("extensions.thunderkeepplus@gmail.com.");
	return prefBranch;
},

setInstallComplete: function(value){
	let prefBranch = thunderkeepplus.getPrefBranch();
	prefBranch.setBoolPref("installComplete", value);
},

setGoogleKeepTabId: function(value){
	let prefBranch = thunderkeepplus.getPrefBranch();
	prefBranch.setCharPref("googleKeepTabId", value);
},

getGoogleKeepTabId: function(){
	let prefBranch = thunderkeepplus.getPrefBranch();
	return prefBranch.getCharPref("googleKeepTabId");
},

beingDisabled: false,
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
},

onTabTitleChanged: function(aTab){
	thunderkeepplus.setGoogleKeepTabId("thunderkeepplus:" + aTab.title);
	thunderkeepplus.debug("New tab title " + aTab.browser.contentTitle);
},

onTabSwitched: function(aTab, aOldTab){
},

onTabOpened: function(aTab, aIsFirstTab, aWasCurrentTab){
},

onTabClosing: function(aTab){
},

onTabPersist: function(aTab){
},

onTabRestored: function(aTab, aState, aIsFirstTab){
},

onToolbarButtonCommand: function(e) {

	// Open a new tab with Google Keep or focus on the already opened one
	try{	
		let mailPane = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("mail:3pane");
		let tabManager = mailPane.document.getElementById("tabmail");
		let tabsArray = tabManager.tabInfo;
	
		let googleKeepTabId = thunderkeepplus.getGoogleKeepTabId();
	
		thunderkeepplus.debug("Found " + String(tabsArray.length) + " tabs");
		thunderkeepplus.debug("Gtab browser id is \"" + googleKeepTabId + "\"");
	
		for (i = 0; i < tabsArray.length; i++) {
			thunderkeepplus.debug("Tab " + i + " is \"" + tabsArray[i].title + "\"");
			
			let tabBrowser = tabsArray[i].browser;
			if(googleKeepTabId.localeCompare("thunderkeepplus:" + tabsArray[i].title) === 0){
					thunderkeepplus.debug("Switch to tab \"" + tabsArray[i].title + "\"");
					
					tabManager.switchToTab(i);
					return;
			}
		}

		thunderkeepplus.debug("Tab no found, opening new one");
	
		let gtab = tabManager.openTab("contentTab", {contentPage: "http://keep.google.com"});
	
		thunderkeepplus.debug("Tab opened successfully");
		
		tabManager.registerTabMonitor(thunderkeepplus);		
		
		thunderkeepplus.setGoogleKeepTabId("thunderkeepplus:" + tabsArray[i].title);
		
		thunderkeepplus.debug("Tab id " + thunderkeepplus.getGoogleKeepTabId() + " saved");	
		
	} catch(e) { alert("Error ThunderKeepPlus onToolbarButtonCommand: " + e); }
}
};

window.addEventListener("load", thunderkeepplus.onLoad, false);

Components.utils.import("resource://gre/modules/AddonManager.jsm");
AddonManager.addAddonListener(thunderkeepplus);
