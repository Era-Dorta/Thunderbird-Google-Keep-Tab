/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab filetype=javascript: */

"use strict";

var EXPORTED_SYMBOLS = ["ui"];

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

    /** Css components initialization **/
    this.sss = Cc["@mozilla.org/content/style-sheet-service;1"]
        .getService(Ci.nsIStyleSheetService);
    let ios = Cc["@mozilla.org/network/io-service;1"]
        .getService(Ci.nsIIOService);
    this.cssUri = ios.newURI("chrome://ThunderKeepPlus/skin/overlay.css", null, null);

    /** Import localization properties **/
    this.stringBundle = Services.strings.createBundle("chrome://ThunderKeepPlus/locale/overlay.properties?" + Math.random()); // Randomize URI to work around bug 719376
    this.document = null;
}

Ui.prototype = {
    attach: function(document) {
        this.document = document;
        this.sss.loadAndRegisterSheet(this.cssUri, this.sss.AUTHOR_SHEET);

        this.createOverlay();
    },

    destroy: function() {
        this.panelNode.removeChild(this.buttonNode);
        if(this.sss.sheetRegistered(this.cssUri, this.sss.AUTHOR_SHEET)){
            this.sss.unregisterSheet(this.cssUri, this.sss.AUTHOR_SHEET);
        }
    },

    createOverlay: function() {
        this.panelNode = this.document.getElementById("mail-bar3");
        this.overlayNode(this.panelNode);
    },

    overlayNode: function(parent) {   
      
      // Create the Google Keep button
      this.buttonNode = this.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
        "toolbarbutton");
      this.buttonNode.setAttribute("id","thunderkeepplus-toolbar-button");
      this.buttonNode.setAttribute("label", this.stringBundle.GetStringFromName("ThunderKeepPlus.label"));
      this.buttonNode.setAttribute("class","toolbarbutton-1");

      // Insert after AddressBook button , i.e. insert before the next sibling
      parent.insertBefore(this.buttonNode, this.document.getElementById("button-address").nextSibling);
    }
}

/** Singleton to avoid multiple initialization for startup and shutdown **/
var ui = new Ui();
