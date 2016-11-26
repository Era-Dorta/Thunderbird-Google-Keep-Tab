/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab filetype=javascript: */

"use strict";

var EXPORTED_SYMBOLS = ["Ui"];

const Cu = Components.utils;
const Ci = Components.interfaces;
const Cc = Components.classes;

Cu.import("resource://gre/modules/Services.jsm");

/**
 * Add and remove addon user interface - replacement over overlay.xul
 */
function Ui() {
	this.buttonNode = null;
	this.document = null;
	this.loaded = false;

	/** Css components initialization **/
	this.sss = Cc["@mozilla.org/content/style-sheet-service;1"]
		.getService(Ci.nsIStyleSheetService);
	let ios = Cc["@mozilla.org/network/io-service;1"]
		.getService(Ci.nsIIOService);
	this.cssUri = ios.newURI("chrome://ThunderKeepPlus/skin/overlay.css", null, null);
	
	/** User alerts **/
	this.prompt = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);

	/** Import localization properties **/
	this.stringBundle = Services.strings.createBundle("chrome://ThunderKeepPlus/locale/overlay.properties?" + Math.random()); // Randomize URI to work around bug 719376
}

Ui.prototype = {
	attach: function(document) {
		try{
			if(this.loaded){
				return;
			}
			this.document = document;
			if(!this.sss.sheetRegistered(this.cssUri, this.sss.AUTHOR_SHEET)){
				this.sss.loadAndRegisterSheet(this.cssUri, this.sss.AUTHOR_SHEET);
			}

			this.createOverlay();
		} catch(e) {Cu.reportError("ThunderKeepPlus: Ui.attach " + e);}
	},

	destroy: function() {
		try{
			if(this.sss.sheetRegistered(this.cssUri, this.sss.AUTHOR_SHEET)){
				this.sss.unregisterSheet(this.cssUri, this.sss.AUTHOR_SHEET);
			}
			if(!this.loaded){
				return;
			}
			this.loaded = false;
			if(this.buttonNode != null && this.buttonNode.parentNode != null){
				this.buttonNode.parentNode.removeChild(this.buttonNode);
			}
			this.buttonNode = null;
			this.document = null;
		} catch(e) {Cu.reportError("ThunderKeepPlus: Ui.destroy " + e);}
	},

	createOverlay: function() {
		try{
				let toolbox = this.document.getElementById("mail-toolbox");
				if(toolbox != null){
					// Create the Google Keep button
					this.buttonNode = this.document.createElement("toolbarbutton");
					this.buttonNode.setAttribute("id","thunderkeepplus-toolbar-button");
					this.buttonNode.setAttribute("label", this.stringBundle.GetStringFromName("ThunderKeepPlus.label"));
					this.buttonNode.setAttribute("tooltiptext", this.stringBundle.GetStringFromName("ThunderKeepPlus.tooltip"));
					this.buttonNode.setAttribute("class","toolbarbutton-1 chromeclass-toolbar-additional");

					// Add it to the toolbox, this allows the user to move with the customize option
					toolbox.palette.appendChild(this.buttonNode);
					this.loaded = true;
			
					let buttonAddress = null;//this.document.getElementById("button-address");
			
					// Move it after the AddressBook button , i.e. insert before the next sibling			
					if(buttonAddress != null && buttonAddress.parentNode != null && buttonAddress.nextSibling != null){
						//TODO Add callback to save user changes
						buttonAddress.parentNode.insertItem(this.buttonNode.id, buttonAddress.nextSibling);
					} else {
						let msg = "ThunderKeepPlus could not insert the button in the toolbar" +
											", please right click on the toolbar select Customize... " +
											" and drag and drop the button"
						this.document.defaultView.setTimeout(function(){
								this.prompt.alert(null, "ThunderKeepPlus Warning", msg); }.bind(this),
								3000);
					}
				}
		} catch(e) {Cu.reportError("ThunderKeepPlus: createOverlay " + e);}
	}
}

