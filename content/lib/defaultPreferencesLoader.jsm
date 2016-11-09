
const { utils: Cu, classes: Cc, interfaces: Ci } = Components;

Cu.import('resource://gre/modules/Services.jsm');

var EXPORTED_SYMBOLS = ['DefaultPreferencesLoader'];

/**
 * Read defaults/preferences/* and set Services.pref default branch
 */
function DefaultPreferencesLoader(installPath) {
    let readFrom = installPath.clone(); // don't modify the original object

    ['defaults', 'preferences'].forEach(function(dir) {
        readFrom.append(dir);
    });

    this.baseURI = Services.io.newFileURI(readFrom);

    if (readFrom.exists() !== true) {
        throw new DefaultsDirectoryMissingError(readFrom);
    }

    this.readFrom = readFrom;

    this.defaultBranch = Services.prefs.getDefaultBranch("");
} 

DefaultPreferencesLoader.prototype = {
    /**
     * Iterate over files in the default/preferences/*
     *
     * @param {function} prefFunc the function that should be used instead of
     * pref
     */
    parseDirectory: function(prefFunc) {
        prefFunc = prefFunc || this.pref.bind(this);

	let entries = this.readFrom.directoryEntries;

	while (entries.hasMoreElements()) {
	    let fileURI = Services.io.newFileURI(entries.getNext());

	    Services.scriptloader.loadSubScript(fileURI.spec, { pref: prefFunc });
	}
    },

    /**
     * Emulates firefox pref function to load default preferences
     */
    pref: function(key, value) {
        switch (typeof value) {
            case 'boolean':
                this.defaultBranch.setBoolPref(key, value);
                break;

            case 'number':
                this.defaultBranch.setIntPref(key, value);
                break;

            case 'string':
                /**
                 * Using setComplexValue instead of setCharPref because of
                 * unicode support
                 */
                let str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
                str.value = value;
                this.defaultBranch.setComplexValue(key, Ci.nsISupportsString, str);
                break;

            default:
                throw new NotSupportedValueTypeError(key);
                break;
        }
    },

    /**
     * Clears default preferences according to AMO reviewers reccommendation
     * This should be invoked on bootstrap::shutdown
     * @see https://github.com/firebug/firebug/blob/master/extension/modules/prefLoader.js
     */
    clearDefaultPrefs: function() {
        this.parseDirectory(this.prefUnload.bind(this));
    },

    prefUnload: function(key) {
        let branch = this.defaultBranch;
        if (branch.prefHasUserValue(key) !== true) {
            branch.deleteBranch(key);
        }
    }

};

/**
 * Exception type on missing defaults/preferences folder
 */
function DefaultsDirectoryMissingError(installPath) {
    this.name = 'DefaultsDirectoryMissingError';
    this.message = '\'' + installPath.path + '\' does no exist';
}

/** Inherit from Error for error stack and pretty output in terminal **/
DefaultsDirectoryMissingError.prototype = new Error();

/**
 * Not supported value type to store by pref
 */
function NotSupportedValueTypeError(key) {
    this.name = 'NotSupportedValueType';
    this.message = 'Value type for key \'' + key + '\' is not supported';
}

NotSupportedValueTypeError.prototype = new Error();
