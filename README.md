
![Pioneer patch](https://raw.githubusercontent.com/rhelmer/pioneer-v2-example/master/images/pioneer10-patch-96.png "Pioneer 10 Patch")

An example web extension for Pioneer v2 core data add-on.

This requires [Firefox](https://www.mozilla.org/en-US/firefox/) 80.0 or newer, which supports the [new `browser.telemetry.submitEncryptedPing` WebExtension API](https://bugzilla.mozilla.org/show_bug.cgi?id=1634557).

NOTE - Only unbranded Firefox builds such as [Nightly](https://nightly.mozilla.org) will be able to load privileged APIs without a special signing key.

```console
web-ext run --pref=extensions.experiments.enabled=true \
            --pref=toolkit.telemetry.pioneerId="${PIONEER_ID}" \
            --browser-console \
            --firefox-binary "${FIREFOX_BINARY}"
 ```

To see extra details on what Firefox Telemetry is doing, enable Trace log level with `--pref=toolkit.telemetry.log.level=Trace`.

After the browser window appears, a toolbar button for Pioneer should be present which when pressed will log this to the Browser Console: `Telemetry submitted, check about:telemetry`. To see the submitted ping, open `about:telemetry` then in the upper-left press on "current data", then select "Archived ping data", which will allow selection of ping type
and should include the "pioneer-study" type. The "Raw JSON" link at the bottom of the page will show the entire ping as sent to the Mozilla Telemetry servers.

The schema for encrypted payloads sent via `browser.telemetry.submitEncryptedPing` is defined in [the Mozilla pipeline schema repository](https://github.com/mozilla-services/mozilla-pipeline-schemas/tree/master/schemas/pioneer-debug/debug). In this case `pioneer-debug` is the schema namespace and `debug` is the schema name. These are defined in [manifest.json](manifest.json).

The schema for the new `manifest.json` entries for the `telemetry` key is [defined here](https://searchfox.org/mozilla-central/source/toolkit/components/extensions/schemas/telemetry.json).
