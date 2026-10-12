---
summary: The profile package depends on @_linked/xsd ^1.2.4 so installs resolve the same datatype package as the rest of the framework.
---

# Depend on @_linked/xsd 1.2.4

`@linked.cm/profile` declared `@_linked/xsd` as `~1.0`, which resolved to `1.0.10`. The rest of the framework is on the `1.2` line. Two copies of the datatype package can disagree about which integer and date types a shape accepts.

## What changed

`package.json` now depends on `@_linked/xsd` `^1.2.4`. The lockfile resolves `1.2.5`, whose own dependency is `@_linked/core` `^2.22.8` (the `1.0.10` release depended on `^2.0.1`).

No profile source, shapes, or exports changed. Callers keep the same imports.

## Decisions

The range is `^1.2.4`, not a pin to `1.2.5`. Later `1.2` releases stay compatible. It is not `~1.0`, which could not reach `1.2`.

## Tests

No new tests. The change is a dependency range. `npm install` produced the lockfile update already on the branch.

## Docs

This package had no `docs/` tree. This report is the record of the dependency change. No architecture doc described the `1.0` range.

## Follow-up

None. The branch is `chore/depend-on-xsd-1.2.4`.
