var thunderkeepplus = {
/* Simple debugging to the error console */
enableDebug: false,
debug: function (aMessage) {
	if(thunderkeepplus.enableDebug) {
		let consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		consoleService.logStringMessage("thunderkeepplus: " + aMessage);
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
		thunderkeepplus.debug("InstallComplete is " + !installButton);
		
		if (installButton) {
			thunderkeepplus.debug("Installing button");
			// Find the navigation bar and append the CloseAllTabs button
			prefBranch.setBoolPref("InstallComplete", true);
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
	} catch(e) { alert("Error installing thunderkeepplus: " + e); }
},

onToolbarButtonCommand: function(e) {

	// Open a new tab with Google Keep or focus on the already opened one
	try{
		let mailPane = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("mail:3pane");
		let tabManager = mailPane.document.getElementById("tabmail");
		let tabsArray = tabManager.tabInfo;
	
		thunderkeepplus.debug("Found " + String(tabsArray.length) + " tabs");
	
		for (i = 0; i < tabsArray.length; i++) {
			thunderkeepplus.debug("Tab " + i + " is \"" + tabsArray[i].title + "\"");
		
			if(tabsArray[i].title === "Sign in - Google Accounts" || tabsArray[i].title === "Google Keep"){
				thunderkeepplus.debug("Switch to tab \"" + tabsArray[i].title + "\"");
			
				tabManager.switchToTab(i);
				return;
			}
		}

		thunderkeepplus.debug("Tab no found, opening new one");
	
		tabManager.openTab("contentTab", {contentPage: "http://keep.google.com"});
	
		thunderkeepplus.debug("Tab successfully created");
	} catch(e) { alert("Error opening/swithing to Google Keep tab: " + e); }
}
};

window.addEventListener("load", thunderkeepplus.onLoad, false);
