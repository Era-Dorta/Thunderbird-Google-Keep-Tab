/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab filetype=javascript: */

'use strict';

var EXPORTED_SYMBOLS = ['ui'];

const Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');

/** Log into console (also shown in terminal that runs firefox **/
Cu.import("resource://gre/modules/devtools/Console.jsm");

/** Xul.js used to define set of functions similar to tags of overlay.xul **/
Cu.import('chrome://ThunderKeepPlus/content/lib/xul.js');

defineTags(
    'panel', 'vbox', 'hbox', 'description',
    'html:input', 'label', 'textbox', 'button',
    'toobarbutton'
);

const {
    PANEL, VBOX, HBOX, DESCRIPTION,
    HTMLINPUT, LABEL, TEXTBOX, BUTTON,
    TOOLBARBUTTON
} = Xul;

/**
 * Add and remove addon user interface - replacement over overlay.xul, which
 * can't be ported into restartless extension
 */
function Ui() {
    this.panelNode = null;
    this.buttonNode = null;

    /** Css components initialization **/
    this.sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
        .getService(Components.interfaces.nsIStyleSheetService);
    let ios = Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);
    this.cssUri = ios.newURI("chrome://ThunderKeepPlus/skin/overlay.css", null, null);

    /** Import localization properties **/
    this.stringBundle = Services.strings.createBundle('chrome://ThunderKeepPlus/locale/overlay.properties?' + Math.random()); // Randomize URI to work around bug 719376
    this.document = null;
}

Ui.prototype = {
    attach: function() {
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

    overlayNode: function(doc) {
        let toolbarButtonAttrs = {
            id: 'thunderkeepplus-toolbar-button',
            label: this.stringBundle.GetStringFromName('ThunderKeepPlus.label'),
            tooltiptext: this.stringBundle.GetStringFromName('ThunderKeepPlus.tooltip'),
            class: 'toolbarbutton-1'
        };

        this.buttonNode = TOOLBARBUTTON(toolbarButtonAttrs).build(doc);
    }
}

/** Singleton to avoid multiple initialization for startup and shutdown **/
var ui = new Ui();
