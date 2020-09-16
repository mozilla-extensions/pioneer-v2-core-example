/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/* global ExtensionAPI, ExtensionCommon, Services, XPCOMUtils */

XPCOMUtils.defineLazyModuleGetters(this, {
  Services: "resource://gre/modules/Services.jsm",
});

var { ExtensionCommon } = ChromeUtils.import(
  "resource://gre/modules/ExtensionCommon.jsm"
);

const EventManager = ExtensionCommon.EventManager;

const PREF_SURVEY_COMPLETE = "extensions.pioneer.surveyComplete";

this.pioneer = class extends ExtensionAPI {
  onStartup() {
    console.debug("pioneer API startup");
    // FIXME loop over all windows, and add window open listener.
    const win = Services.wm.getMostRecentWindow("navigator:browser");

    this.listener = () => {
      console.debug("about:pioneer listener fired");
      const surveyComplete = Services.prefs.getBoolPref(
        PREF_SURVEY_COMPLETE,
        false
      );
      if (surveyComplete) {
        console.debug("survey is complete, returning early.");
        return;
      }

      if (win.gBrowser.contentWindow.location.pathname == "pioneer") {
        const doc = win.gBrowser.contentDocument;
        const dialog = doc.createElement("dialog");
        const form = doc.createElement("form");
        const survey = { lines: ["1", "2", "3"] };
        for (const line of survey.lines) {
          const p = doc.createElement("p");
          const span = doc.createElement("span");
          span.textContent = line;
          p.appendChild(span);
          const input = doc.createElement("input");
          p.appendChild(input);
          form.append(p);
        }
        const button = doc.createElement("button");
        button.type = "submit";

        form.onsubmit = (event) => {
          this.filledForm = event.target;
          dialog.close();
        };
        form.appendChild(button);
        dialog.appendChild(form);
        doc.body.prepend(dialog);

        // This modal will not be dismissed until the user completes the survey.
        dialog.showModal();
      }
    };
    const surveyComplete = Services.prefs.getBoolPref(
      PREF_SURVEY_COMPLETE,
      false
    );
    if (!surveyComplete) {
      win.addEventListener("DOMContentLoaded", this.listener);
    }
    console.debug("startup completed");
  }
  onShutdown() {
    // FIXME loop over all windows, and add window open listener.
    console.debug("pioneer API shutdown");
    const win = Services.wm.getMostRecentWindow("navigator:browser");
    win.removeEventListener("DOMContentLoaded", this.listener);
  }
  getAPI(context) {
    return {
      pioneer: {
        survey: new EventManager({
          context,
          name: "pioneer.survey",
          register: (fire) => {
            const callback = () => {
              fire
                .async(this.filledForm)
                .then(() =>
                  // Only set the survey as seen when the core add-on has received the message.
                  Services.prefs.setBoolPref(PREF_SURVEY_COMPLETE, true)
                )
                .catch(() => {}); // ignore Message Manager disconnects
            };
            Services.prefs.addObserver(PREF_SURVEY_COMPLETE, callback);
            return () => {
              console.debug("pioneer API removing observers and listeners");
              Services.prefs.removeObserver(PREF_SURVEY_COMPLETE, callback);
              const win = Services.wm.getMostRecentWindow("navigator:browser");
              win.removeEventListener("DOMContentLoaded", this.listener);
            };
          },
        }).api(),
      },
    };
  }
};
