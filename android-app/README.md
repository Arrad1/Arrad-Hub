# Arrad Hub Android test app

This is a small, first-stage Android shell for the hosted Arrad Hub. It keeps the
working web application as the single product while providing a tablet launcher
built against the current Android security level.

The test package:

- targets Android API 36;
- accepts only HTTPS content;
- keeps Arrad Hub navigation inside the app;
- sends links to other websites to the device browser; and
- enables JavaScript and DOM storage so the current local-first workflow works.

GitHub Actions builds `app-debug.apk` as the `arrad-hub-android-test` artifact.
This is an internal testing package, not a Google Play production release.
