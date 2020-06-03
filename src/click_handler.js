window.addEventListener("click", notifyExtension, false);

function notifyExtension(event) {
  if (event.target.tagName != "A") {
    return;
  }
  
  // The click is handled here, so no need to continue propagating the event
  event.preventDefault();
  event.stopPropagation();
  
  // Tell the background script which link the user clicked
  browser.runtime.sendMessage({"url": event.target.href, "tab_id": tab_id});
}
