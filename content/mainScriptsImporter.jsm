/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab filetype=javascript: */

'use strict';

var EXPORTED_SYMBOLS = ['mainScriptsImporter'];

const { utils: Cu, interfaces: Ci } = Components;

Cu.import('resource://gre/modules/Services.jsm');

/** CustomizableUI used to create toolbar button **/
Cu.import('resource:///modules/CustomizableUI.jsm');

Cu.import('chrome://FireX-Pixel/content/ui.jsm');

/** Log into terminal that runs firefox **/
Cu.import("resource://gre/modules/devtools/Console.jsm");

function mainScriptsImporter() {

    var self = this;

    this.uiListener = {
        onWidgetAfterDOMChange: function(aNode) {
            if (aNode.id === ui.buttonId) {
                var xulWindow = aNode.ownerDocument.defaultView;

                /** Loading sciprts **/
                Services.scriptloader.loadSubScript('chrome://ThunderKeepPlus/content/overlay.js', xulWindow);

                /**
                 * Implementing try catch for every method to log error
                 * stack into console
                 */
                xulWindow.PixelPerfect.prototype = self.wrapAllMethods(xulWindow.PixelPerfect.prototype);
                xulWindow.PixelManage.prototype = self.wrapAllMethods(xulWindow.PixelManage.prototype);
            }
        }
    };

    /** Don't log the same exceptions twice **/
    this.loggedErrors = [];
}

mainScriptsImporter.prototype = {
    addOnUiRegistered: function() {
        CustomizableUI.addListener(this.uiListener);
    },

    remove: function() {
        CustomizableUI.removeListener(this.uiListener);

        this.foreachWindow(function(xulWindow) {
            this.removeAppliedLayers(xulWindow);

            xulWindow.PixelPerfect = undefined;
            xulWindow.PixelManage = undefined;
        });
    },

    wrapAllMethods: function(obj) {
        for (let name in obj) {
            let method = obj[name];

            if (typeof method === 'function') {
                obj[name] = this.wrapFunc(method);
            }
        }

        return obj;
    },

    /**
     * Wrap for console logging
     * https://bugsnag.com/blog/js-stacktraces/
     */
    wrapFunc: function(func) {
        var self = this;

        // Ensure we only wrap the function once.
        if (!func._wrapped) {
            func._wrapped = function() {
                try{
                    return func.apply(this, arguments);
                } catch(e) {
                    if (self.loggedErrors.indexOf(e) === -1) {
                        /** Haven't yet logged this exception **/
                        self.loggedErrors.push(e);
                        console.error(e);
                    }

                    throw e;
                }
            }
        }
        return func._wrapped;
    },

    /**
     * Force remove of applied layer to content DOM
     */
    removeAppliedLayers: function(xulWindow) {
        /** Iterate over all tabls **/
        xulWindow.gBrowser.browsers.forEach(function(browser) {
            xulWindow.PixelManage.prototype.removeFromDOM(browser.contentWindow);
        });
    },

    /**
     * Iterate over all windows and run some func
     */
    foreachWindow: function(func) {
        let windows = Services.wm.getEnumerator("navigator:browser");
        while (windows.hasMoreElements()) {
            let xulWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);

            func.call(this, xulWindow);
        }
    }

}

var mainScriptsImporter = new mainScriptsImporter();
