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
	this.panelNode = null;
	this.buttonNode = null;
	this.document = null;
	this.loaded = false;

	/** Css components initialization **/
	this.sss = Cc["@mozilla.org/content/style-sheet-service;1"]
		.getService(Ci.nsIStyleSheetService);
	let ios = Cc["@mozilla.org/network/io-service;1"]
		.getService(Ci.nsIIOService);
	this.cssUri = ios.newURI("chrome://ThunderKeepPlus/skin/overlay.css", null, null);

	/** Import localization properties **/
	this.stringBundle = Services.strings.createBundle("chrome://ThunderKeepPlus/locale/overlay.properties?" + Math.random()); // Randomize URI to work around bug 719376
}

Ui.prototype = {
	attach: function(document) {
		if(this.loaded){
			return;
		}
		this.document = document;
		if(!this.sss.sheetRegistered(this.cssUri, this.sss.AUTHOR_SHEET)){
			this.sss.loadAndRegisterSheet(this.cssUri, this.sss.AUTHOR_SHEET);
		}

		this.createOverlay();
	},

	destroy: function() {
		if(this.sss.sheetRegistered(this.cssUri, this.sss.AUTHOR_SHEET)){
			this.sss.unregisterSheet(this.cssUri, this.sss.AUTHOR_SHEET);
		}
		if(!this.loaded){
			return;
		}
		this.loaded = false;
		if(this.panelNode != null && this.buttonNode != null){
			this.panelNode.removeChild(this.buttonNode);
			this.buttonNode = null;
			this.panelNode = null;
			this.document = null;
		}
	},

	createOverlay: function() {
		this.panelNode = this.document.getElementById("mail-bar3");
		if(this.panelNode != null){
			this.overlayNode(this.panelNode);
		}
	},

	overlayNode: function(parent) {
	
		let buttonAddress = this.document.getElementById("button-address");
		if(buttonAddress != null && buttonAddress.nextSibling != null){
			// Create the Google Keep button
			this.buttonNode = this.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
				"toolbarbutton");
			this.buttonNode.setAttribute("id","thunderkeepplus-toolbar-button");
			this.buttonNode.setAttribute("label", this.stringBundle.GetStringFromName("ThunderKeepPlus.label"));
			this.buttonNode.setAttribute("class","toolbarbutton-1");
			
			// Insert after AddressBook button , i.e. insert before the next sibling
			parent.insertBefore(this.buttonNode, buttonAddress.nextSibling);
			this.loaded = true;
		}
	}
}

