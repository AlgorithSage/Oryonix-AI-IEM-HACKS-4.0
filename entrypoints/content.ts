import { initPageController } from '../agent/RemotePageController.content';
import './content-overlay.css';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',

  main() {
    console.debug('[Content] Loaded on', window.location.href);
    initPageController();
  },
});

