# Privacy policy

_Last updated: 4 November 2026_

Aliasfill is a browser extension that fills sign-up forms with a fake identity and a disposable e-mail address. It has no server of its own, no account, no analytics and no telemetry. Its author receives no data from it.

## What stays in your browser

The fake identity (name, address, phone, birth date, password, test card), your settings and the API key of the alias provider you choose are kept in the extension's local storage in your browser profile. They are not synced. The fake identity is deleted automatically after the delay you set (24 hours by default).

## What is sent, and to whom

- **Default "No service" mode:** nothing. Addresses are built in the browser; the extension makes no network request.
- **An alias provider you set up** (SimpleLogin, addy.io, Firefox Relay, Fastmail, Forward Email, DuckDuckGo or a Throwaway Mail server): only when you fill a form, the extension sends that provider your API key and the host name of the site the address is for (as the alias note, label or description), so that it can create the alias. With a Throwaway Mail server, it also sends the fake name as the alias label and asks the server for the verification code received by that alias. That provider's own privacy policy applies to what it stores.

Nothing else leaves your browser. Page content is read only inside the tab, to find form fields and one-time-code fields; it is never sent anywhere.

## Permissions

The extension's permissions and why each is needed are listed in the [README](README.md#permissions).

## Contact

Questions: open an issue at https://github.com/PierreEbele/Aliasfill/issues.
