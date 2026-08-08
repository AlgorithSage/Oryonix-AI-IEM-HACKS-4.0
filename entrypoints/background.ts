import { handlePageControlMessage } from '../agent/RemotePageController.background';
import { handleTabControlMessage, setupTabEventsPort } from '../agent/TabsController.background';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

  setupTabEventsPort();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse): true | undefined => {
    if (message.type === 'TAB_CONTROL') {
      return handleTabControlMessage(message, sender, sendResponse);
    } else if (message.type === 'PAGE_CONTROL') {
      return handlePageControlMessage(message, sender, sendResponse);
    } else if (message.type === 'SCREENSHOT_CAPTURE') {
      // Capture visible tab screenshot for VLM analysis
      const tabId = message.tabId;
      (async () => {
        try {
          const tab = await chrome.tabs.get(tabId);
          const windowId = tab.windowId;
          // Focus the window & tab before capturing
          await chrome.windows.update(windowId, { focused: true });
          await chrome.tabs.update(tabId, { active: true });
          // Small delay to ensure tab is fully rendered
          await new Promise(resolve => setTimeout(resolve, 300));
          const dataUrl = await chrome.tabs.captureVisibleTab(windowId, {
            format: 'jpeg',
            quality: 70,
          });
          sendResponse({ success: true, screenshot: dataUrl });
        } catch (err: any) {
          console.error('[Background] Screenshot capture failed:', err);
          sendResponse({ success: false, error: err?.message || String(err) });
        }
      })();
      return true; // Keep message channel open for async response
    } else {
      sendResponse({ error: 'Unknown message type' });
      return;
    }
  });
});

