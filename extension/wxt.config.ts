import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ['@wxt-dev/auto-icons', '@wxt-dev/module-react'],
    outDir: 'build',
    entrypointsDir: 'src',

    "manifest": {
        "name": "GDML",
        "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzpxZP1yvzugUW1+Ig+ClXeReAwwp+XN88ATFmk3oh/rH+feVM5nwI8qCsvHLvC/dMfQL6t3g4fT5FVXkS+yY0436NWSn+iQp5ig16F+ee7SZpP/8NiHdZjEc5Gg4Z/FqC7WgIpJcA8ah6Bi+e2dMgeOLrn1uyGDPOIC1Mp9cTXTegk7J9e9IqfvNlJXu7b6dkkAhnGcMlbtT8ytTMWIChDB5j+jSAGpyfeFpoRWG3yOTgm0cQ/YQ3wjeZ6QmU9kLdlJ8RPnDJiNa2Ko8IhBkaxfjDx/OIygk81L3TTQuMKcyWijibxU4Lo2QsAgi/0WgFRVSJltjVxkXU48GC6OKjQIDAQAB",
        "permissions": [
            "webRequest",
            "storage",
            "unlimitedStorage",
            "downloads",
            "browsingData",
            "cookies",
            'offscreen',
            'declarativeNetRequestWithHostAccess',
            'scripting',
            'browsingData'
        ],
        action: {}
    }
});

