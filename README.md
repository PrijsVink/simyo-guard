# Simyo Guard — v0.1 prototype

A local-only Chrome/Chromium Manifest V3 extension prototype.

## Goals

- Read Simyo usage from:
  `GET https://mijn.simyo.nl/api/get?endpoint=postpaidOverview`
- Notify below a configurable remaining-data threshold.
- Optionally (explicit opt-in) call:
  `PUT https://mijn.simyo.nl/auth/update-token`
  with `{"allowInternet": false}`.
- No backend, user database, password collection, or OTP collection.

## Install

1. Unzip this folder.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this folder.
5. Log into Mijn Simyo normally in the same browser.
6. Open the extension and click **Check now**.

## Important: first API test

The exact `postpaidOverview` JSON schema was not provided while building v0.1.
`simyo.js` therefore contains conservative field detection.

If the popup says `USAGE_FIELDS_UNKNOWN`:
1. Open DevTools on Mijn Simyo.
2. Inspect the response from `postpaidOverview`.
3. Make a redacted copy with personal identifiers/tokens removed.
4. Add the actual remaining/used/total paths to `FIELD_PATHS` in `simyo.js`.

Do not share cookies, passwords, OTPs, phone numbers, access tokens, or account IDs.

## Safety

Auto-stop defaults to OFF.

Before enabling it, manually verify that Simyo's current `update-token` request is
still a PUT with JSON `{"allowInternet": false}` and that it has the intended
carrier-side effect for your account.

This extension does not guarantee a hard cap: alarms can be delayed, the
computer/browser may be asleep or closed, Simyo usage reporting can lag, and
Simyo's private API may change.

## Current known limitation

The main experiment is whether the user's authenticated Simyo cookies are
included/accepted for service-worker requests made by the extension. If
`postpaidOverview` returns 401 despite being logged in, v0.2 should use a
different local-only execution approach rather than adding a hosted backend.
