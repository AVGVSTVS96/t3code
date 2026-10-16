This fork publishes its own GitHub Releases of T3 Code, named after the
upstream tag it's built from, with the same server runtime archives and
`SHA256SUMS` upstream ships. A server built from this fork should install its
runtimes from those releases, not from pingdotgg/t3code's: when a client asks
it for version X, it gets this fork's X, patches included.

So wherever T3 Code decides which GitHub repo its runtime releases come from
(downloads, checksums, and the release index `t3 update` reads), it uses
AVGVSTVS96/t3code. `T3CODE_RELEASE_BASE_URL` still overrides the download
location the way upstream made it. Tests that spell out the default URL follow
along.

The release workflow itself lives in `.github/workflows/release.yml`, which
autofork treats as the fork's own file; this patch only covers the app's
source.
