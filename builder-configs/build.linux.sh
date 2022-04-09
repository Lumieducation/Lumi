npx --no-install electron-builder --config ./builder-configs/builder.config.appimage.js --linux "$@"
npx --no-install electron-builder --config ./builder-configs/builder.config.deb.js --linux "$@"
npx --no-install electron-builder --config ./builder-configs/builder.config.pacman.js --linux "$@"
npx --no-install electron-builder --config ./builder-configs/builder.config.snap.js --linux "$@"
