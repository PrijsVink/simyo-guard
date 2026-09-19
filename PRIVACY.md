# Privacy Policy — Simyo Data Guard

Last updated: September 20, 2026

Simyo Data Guard is an independent, open-source Chrome extension that helps
Simyo customers monitor and control their mobile data usage.

This privacy policy explains what information the extension accesses, how that
information is used and stored, and when it is communicated to Mijn Simyo.

## Information accessed and processed

To provide its functionality, Simyo Data Guard accesses mobile data usage
information from Mijn Simyo using the user's existing authenticated browser
session.

The extension may process:

- Remaining mobile data allowance and usage information
- User-configured notification thresholds
- User-configured auto-stop settings
- User-configured data usage check interval
- Last successfully retrieved remaining-data amount
- Last successful check time
- Extension status and error information

This information is used only to provide the extension's data monitoring,
notification, and optional mobile-data auto-stop functionality.

Simyo Data Guard does not use this information for advertising, analytics,
profiling, or marketing.

## Authentication

Simyo Data Guard relies on the user's existing authenticated Mijn Simyo browser
session when communicating with Mijn Simyo.

The extension does not ask for, read, or store the user's Simyo password, MFA
code, or PIN.

Authentication and session management are handled by Mijn Simyo and the user's
browser. Requests made to Mijn Simyo may use the existing authenticated browser
session as necessary to perform the requested functionality.

## Local storage

Simyo Data Guard uses Chrome's local extension storage to store the settings and
state necessary for the extension to function.

Locally stored information may include:

- Whether monitoring and notifications are enabled
- Notification threshold
- Whether auto-stop is enabled
- Auto-stop threshold
- Check interval
- Latest retrieved remaining-data amount
- Last successful check time
- Notification and auto-stop state
- Extension error status

This information remains in the user's Chrome extension storage.

Simyo Data Guard does not operate a developer-controlled backend, database, or
cloud service for storing this information.

## Network communication

Simyo Data Guard communicates directly from the user's browser with Mijn Simyo
at:

https://mijn.simyo.nl/

This communication is necessary to:

1. Retrieve the user's current mobile data usage and allowance.
2. Request that mobile internet be disabled when the user has explicitly
   enabled the auto-stop feature and the configured threshold has been reached.

These requests are made directly between the user's browser and Mijn Simyo.
They are not routed through a server operated by the Simyo Data Guard
developer.

## Data sharing

Information necessary to interact with the user's Simyo account is communicated
with Mijn Simyo only as required to provide the extension's functionality.

The developer does not receive the user's mobile data usage information through
the extension.

Simyo Data Guard does not sell, rent, or share user data with advertisers,
analytics providers, data brokers, or other unrelated third parties.

## Analytics, advertising, and tracking

Simyo Data Guard does not include:

- Advertising
- Analytics
- Telemetry
- User tracking
- Behavioral profiling

The extension does not monitor or collect the user's general browsing history,
web activity, clicks, keystrokes, or activity on unrelated websites.

## Data retention and deletion

Settings and usage state maintained by Simyo Data Guard are stored locally using
Chrome's extension storage.

The developer does not maintain a separate copy of this information.

Users can remove locally stored Simyo Data Guard data by uninstalling the
extension or clearing the extension's stored data through Chrome.

## Permissions

Simyo Data Guard requests only the permissions necessary to provide its core
functionality:

- `storage` — stores extension settings and usage state locally in Chrome.
- `alarms` — schedules periodic mobile data usage checks.
- `notifications` — displays data usage and account-status notifications.
- `https://mijn.simyo.nl/*` — allows direct communication with Mijn Simyo to
  retrieve mobile data usage and, when explicitly enabled by the user, request
  that mobile internet be disabled.

## Open source

Simyo Data Guard is open source. Its source code is publicly available at:

https://github.com/PrijsVink/simyo-guard

## Changes to this privacy policy

This privacy policy may be updated if the extension's functionality or
data-handling practices change.

The latest version of this policy will be published in the Simyo Data Guard
GitHub repository.

## Contact

Questions about this privacy policy can be submitted through the project's
GitHub issue tracker:

https://github.com/PrijsVink/simyo-guard/issues

## Disclaimer

Simyo Data Guard is an independent open-source project and is not affiliated
with, endorsed by, or developed by Simyo.
