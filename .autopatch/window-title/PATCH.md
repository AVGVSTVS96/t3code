---
summary: The window title shows the active thread
baseline: 9afde1c6dbe00d2b87829732c88789c10f3429c0
---

## Intent

The window (and browser tab) title shows the thread you're looking at, as
`<thread title> · <project name>`, or just the thread title when there's no
project. With several T3 Code windows open, the dock, window switcher and tab
bar can tell them apart instead of all reading "T3 Code".

Leaving a thread puts the app's own title back, so views without a thread
(settings, the new thread screen) look the way upstream made them.

## Invariants

- Upstream's app title logic (`DocumentTitleSync`) stays as it is.
- Renaming a thread updates the title right away.
