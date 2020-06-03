var is_release = false;

function debug_msg(message){
  if(is_release){
    return;
  }
  console.debug("ThunderKeepPlus: " + message);
}

debug_msg("Loading");

function onExecuted(result) {
  debug_msg(`Click handler embedding was successful`);
  browser.runtime.onMessage.addListener(updateTabUrl);
}

function onError(error) {
  debug_msg(`Click handler embedding error: ${error}`);
}

function updateTabUrl(message) {
  debug_msg(`updateTabUrl for tab ${message.tab_id} with url: ${message.url}`);
  
  browser.tabs.get(message.tab_id).then( (tabInfo) => {
    // Close and open the tab with the new address
    debug_msg("Closing old tab");
    browser.tabs.remove(message.tab_id);
    
    debug_msg("Opening new tab");
    openNewTab(message.url, tabInfo.index);
  });
  
}

function openNewTab(tab_url, tab_index){
  debug_msg(`Opening tab at position ${tab_index} with url: ${tab_url}`);
  var tab_config = { url: tab_url }
  if(tab_index != -1){
    tab_config["index"] = tab_index;
  }
  const newTabPromise = browser.tabs.create(tab_config);
  
  newTabPromise.then((tabInfo) => {
    debug_msg(`Opened tab with id: ${tabInfo.id}, injecting click handler`);
    
    browser.tabs.executeScript({
        code: `const tab_id = ${tabInfo.id};`
    }, function() {
        const scriptPromise = browser.tabs.executeScript(tabInfo.id, {file: "/src/click_handler.js"});
        scriptPromise.then(onExecuted, onError);
    });
    
  });
}

if ("browserAction" in browser) {
  debug_msg("Has permision for browserAction");

  browser.browserAction.onClicked.addListener(async () => {
    openNewTab("https://keep.google.com", -1);
  });
} else {
  openNewTab("https://keep.google.com", -1);
}

debug_msg("Loaded");
