#!/bin/sh
# Installing Xray and geo databases in the image directory.
#
# Environment variables (they come from ARG in the Dockerfile):
# TARGETARCH, TARGETVARIANT - the buildx target platform
# XRAY_VERSION              - release tag (v26.11.9) or "latest"
# DESTDIR                   - where to put the result, by default /out
#
# Result: $DESTDIR/bin/xray and $DESTDIR/share/*.dat

set -eu

XRAY_VERSION="${XRAY_VERSION:-latest}"
DESTDIR="${DESTDIR:-/out}"
XRAY_REPO="https://github.com/XTLS/Xray-core/releases"

die() {
    echo "install-xray: $*" >&2
    exit 1
}

release_suffix() {
    case "${TARGETARCH:-amd64}" in
        amd64)         echo "64" ;;
        386)           echo "32" ;;
        arm64)         echo "arm64-v8a" ;;
        arm)
            case "${TARGETVARIANT:-v7}" in
                v5) echo "arm32-v5" ;;
                v6) echo "arm32-v6" ;;
                *)  echo "arm32-v7a" ;;
            esac
            ;;
        riscv64)       echo "riscv64" ;;
        s390x)         echo "s390x" ;;
        *) die "The architecture is not supported: ${TARGETARCH}" ;;
    esac
}

archive_url() {
    name="Xray-linux-$(release_suffix).zip"
    if [ "$XRAY_VERSION" = "latest" ]; then
        echo "${XRAY_REPO}/latest/download/${name}"
    else
        echo "${XRAY_REPO}/download/${XRAY_VERSION}/${name}"
    fi
}

fetch() {
    curl --fail --silent --show-error --location --retry 3 --output "$2" "$1" \
        || die "не удалось скачать $1"
}

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

mkdir -p "$DESTDIR/bin" "$DESTDIR/share"

fetch "$(archive_url)" "$workdir/xray.zip"
unzip -q "$workdir/xray.zip" xray -d "$workdir"
install -m 0755 "$workdir/xray" "$DESTDIR/bin/xray"

LOYAL="https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download"
RU_IP="https://github.com/hydraponique/roscomvpn-geoip/releases/latest/download"
RU_SITE="https://github.com/hydraponique/roscomvpn-geosite/releases/latest/download"
IR="https://github.com/chocolate4u/Iran-v2ray-rules/releases/latest/download"

while read -r target source; do
    [ -n "$target" ] || continue
    fetch "$source" "$DESTDIR/share/$target"
done <<EOF
geoip.dat       $LOYAL/geoip.dat
geosite.dat     $LOYAL/geosite.dat
geoip_RU.dat    $RU_IP/geoip.dat
geosite_RU.dat  $RU_SITE/geosite.dat
geoip_IR.dat    $IR/geoip.dat
geosite_IR.dat  $IR/geosite.dat
EOF

"$DESTDIR/bin/xray" version | head -n 1