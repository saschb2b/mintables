#!/usr/bin/env bash
# Re-vendor react-ui-os from the sibling checkout.
#
# The desktop shell (window manager, dock, menu bar, Spotlight, ...) comes
# from https://github.com/saschb2b/react-ui-os. Its packages are not on npm
# yet, so tubecraft carries built copies under vendor/react-ui-os/ and
# depends on them via file: paths. Run this after pulling or changing the
# library to refresh the vendored copies, then commit the vendor/ diff.
#
# Usage: scripts/sync-react-ui-os.sh [path-to-react-ui-os]
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
lib_root="${1:-"$repo_root/../react-ui-os"}"
packages=(core desktop theme-macos)

if [[ ! -d "$lib_root/packages/desktop" ]]; then
  echo "error: react-ui-os checkout not found at $lib_root" >&2
  exit 1
fi

echo "Building react-ui-os packages..."
for p in "${packages[@]}"; do
  (cd "$lib_root/packages/$p" && pnpm build)
done

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "Packing + extracting into vendor/react-ui-os/..."
for p in "${packages[@]}"; do
  (cd "$lib_root/packages/$p" && pnpm pack --out "$tmp/$p.tgz")
  rm -rf "$repo_root/vendor/react-ui-os/$p"
  mkdir -p "$repo_root/vendor/react-ui-os/$p"
  tar -xzf "$tmp/$p.tgz" -C "$repo_root/vendor/react-ui-os/$p" --strip-components=1
done

echo "Reinstalling..."
(cd "$repo_root" && pnpm install)

echo "Done. Review and commit the vendor/react-ui-os/ diff."
