macOS builds made without Apple signing secrets (every build of this fork:
no Developer ID, no notarization, and nobody is ever asked for a cert) are
signed ad hoc instead of left unsigned, so the app they ship can update itself
to the next build.

Squirrel.Mac, which installs desktop updates on macOS, only accepts a new app
that satisfies the running app's designated requirement. A default ad-hoc
signature's requirement is its own code hash, which no other build can match,
so every update would be refused. The app bundle's designated requirement is
set to just its bundle id (`designated => identifier "<app id>"`), which every
later ad-hoc build of the same app satisfies. Nested code (helpers, frameworks,
native modules) keeps codesign's defaults, since the outer signature already
seals it, and the result passes `codesign --verify --strict --deep`.

The hardened runtime stays off for these builds: it only matters for
notarization, and with ad-hoc signatures its library validation would stop the
app from loading its own frameworks. Ad-hoc signatures carry no timestamp, so
signing never calls Apple's timestamp server.

Builds that do have the Apple secrets sign and notarize exactly as upstream
does.
