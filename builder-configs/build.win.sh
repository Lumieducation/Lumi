npx --no-install electron-builder --config ./builder-configs/builder.config.clickonce.js --win "$@"
npx --no-install electron-builder --config ./builder-configs/builder.config.nsis-machine.js --win "$@"
npx --no-install electron-builder --config ./builder-configs/builder.config.portable.js --win "$@"
npx --no-install electron-builder --config ./builder-configs/builder.config.appx.js --win "$@"
