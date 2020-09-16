/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/* global ExtensionAPI, Services, XPCOMUtils */

XPCOMUtils.defineLazyModuleGetters(this, {
  Services: "resource://gre/modules/Services.jsm",
});

var { ExtensionCommon } = ChromeUtils.import(
  "resource://gre/modules/ExtensionCommon.jsm"
);

const EventManager = ExtensionCommon.EventManager;

this.pioneer = class extends ExtensionAPI {
  injectJS(win, baseURL) {
    const doc = win.gBrowser.contentDocument;

    Services.scriptloader.loadSubScript(`${baseURL}/svelte.js`, doc);
  }
  onStartup() {
    const baseURL = this.extension.baseURL;

    this.listener = () => {
      const win = Services.wm.getMostRecentBrowserWindow();
      this.injectJS(win, this.extension.baseURL);
    };

    // Listen on all currently-open windows.
    for (const win of Services.wm.getEnumerator("navigator:browser")) {
      win.addEventListener("DOMContentLoaded", this.listener);
    }

    // Listen on any new windows that open.
    this.windowListener = {
      onOpenWindow: (xulWindow) => {
        const domwindow = xulWindow.docShell.domWindow;
        domwindow.addEventListener("DOMContentLoaded", this.listener);
      },
    };

    Services.wm.addListener(this.windowListener);
  }
  onShutdown() {
    // Remove listeners from all windows.
    for (let win of Services.wm.getEnumerator("navigator:browser")) {
      win.removeEventListener("DOMContentLoaded", this.listener);
    }

    Services.wm.removeListener(this.windowListener);
  }
};
