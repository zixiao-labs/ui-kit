---
name: merge
description: >-
  Land explicitly approved ui-kit changes through a checked GitHub PR into main.
  Use for a requested merge or Delta Merge action, not for review, release
  preparation, or skill installation. Publish React only with separate explicit
  release authorization.
disable-model-invocation: true
metadata:
  delta-action: land
---

# Merge ui-kit changes

## Establish scope and authorization

1. Read applicable `AGENT.md` / `AGENTS.md` instructions, `docs/publishing.md`,
   `package.json`, and the current CI and publish workflows. These files are the
   source of truth; do not hard-code a remembered version or old check count.
2. Confirm the exact change the user approved for landing. Installing this skill,
   preparing a release, passing review, or passing CI does not authorize merging
   or publishing. If authorization or the destination is unclear, ask.
3. Inspect `git status`, the diff, recent history, and configured remotes. This
   repository publishes to `https://github.com/zixiao-labs/ui-kit`; verify the
   remote rather than assuming its name. Never publish through Delta's `local`
   backlink. Work only in the thread's attached worktree, not its source checkout.
4. Preserve unrelated and concurrent edits. Stage only reviewed paths. Do not
   reset, stash, force-push, rewrite shared history, bypass protections, or delete
   branches or tags as part of this workflow.

## Validate the candidate

Use the repository's pinned pnpm and supported Node versions. The normal local
validation is:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm release:pack
UI_KITS_REACT_TARBALL=test-results/ui-kits-react.tgz pnpm test:package
pnpm exec playwright install chromium webkit
UI_KITS_TEST_WEBKIT=1 pnpm test:e2e
```

Use `docs/publishing.md` for Linux's Xvfb / software-GPU route. Do not weaken GPU
assertions or silently skip browser tests. Record exactly which checks ran,
which failed, and which could not run; local checks do not replace remote CI.
If a command rewrites tracked generated files, inspect those changes before
including them. Stop on failures relevant to the candidate.

## Land through a PR

1. Fetch the verified publication remote and inspect its current `main`. Work on
   a topic branch, never push directly to `main`. If the base advanced or conflicts
   arise, reconcile without overwriting others' work and rerun affected checks.
2. Review the final diff and commit only the approved scope. Prefix Git commands
   that may open an editor with `GIT_EDITOR=true`.
3. Reuse a matching PR or push the topic branch and create a PR targeting `main`.
   Describe the change, compatibility, actual validation, and any release impact.
4. Wait for all CI jobs and required reviews on the exact candidate head. Inspect
   failures; do not bypass checks with administrator privileges. If approval or
   an unavailable check blocks landing, report the PR and stop for that input.
5. Recheck the PR head and base before merging. Use a merge method permitted by
   the repository, matching its existing conventions, and guard the operation
   with `gh pr merge --match-head-commit <reviewed-head-sha>`. Do not merge a changed
   head based on stale results.
6. Verify the PR is merged, fetch `main`, and verify that its merge commit is
   reachable from the remote destination. Check the post-merge CI for that commit.
   Report the verified commit, PR, and checks rather than merely saying the push
   succeeded.

## Release only when explicitly requested

A normal Merge action ends after landing. It does not grant permission to create
release tags, create GitHub Releases, approve deployments, or publish npm packages.

For an explicitly approved release:

1. Inspect published npm versions, dist-tags, Git tags, GitHub Releases, and history
   since the previous published release. Choose an unused SemVer version from
   actual public API changes, not from every repository-only change.
2. Change only `packages/react/package.json` and write release notes under
   `docs/releases/`. Preserve `private: true` and versions for Solid, shared, demos,
   and the root. Never use recursive publication.
3. Land the release candidate through the PR process above. Confirm explicit
   authorization to land that version and trigger publication before proceeding.
4. Require successful CI for the exact release commit on remote `main`, then run
   `pnpm release:check react-v<version>` against that commit. Verify the tag and
   npm version do not already exist. Create a new tag at that exact commit and
   push only that tag to the verified publication remote. Never move or delete an
   existing release tag.
5. Follow `Publish React` through tag validation, full release CI, and the `npm`
   Environment gate. Leave required human approval to its reviewer; do not
   self-approve or bypass it. Publish only the workflow's consumer-tested pnpm
   tarball using OIDC and provenance. Never fall back to a local npm token,
   `npm login`, or publishing the source directory.
6. A failed or interrupted workflow may already have published. Check npm before
   retrying; never overwrite a version. Stable versions use `latest`, named
   prereleases use `next`, as enforced by `scripts/check-release.ts`.
7. Verify the registry version, expected dist-tag, provenance, and tarball
   integrity against the exact workflow artifact after publication succeeds.
   Create the GitHub Release from the checked-in notes using the existing tag
   (`gh release create --verify-tag`), so release creation cannot accidentally
   mint a different tag. Use absolute, tag-pinned links in those notes so they
   also work as a GitHub Release body. If attaching a tarball, use the same
   workflow artifact, not a rebuilt archive.

## Report the outcome

Distinguish preparation, awaiting review/approval, verified merge, and verified
publication. Include links to the PR, relevant CI, and release when known.
Never claim a version is published solely because its tag or GitHub Release exists.

When reporting the final result of a user-requested merge, load the built-in
`report-landed` skill and follow its structured result contract. Do not emit a
success/failure result while merely preparing or waiting for routine approval.
