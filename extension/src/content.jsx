import { useEffect } from "react"
import Main from '../custom/main'
import useStore from "../store"
import ReactDOM from 'react-dom/client';

import './reset.css'
import '../custom/css/inputs.css'
import '../custom/css/logo.css'

// const matches =
//     [
//         "https://*.mercadolibre.com.ar/*",
//         "https://*.mercadolibre.com.bo/*",
//         "https://*.mercadolivre.com.br/*",
//         "https://*.mercadolibre.cl/*",
//         "https://*.mercadolibre.com.co/*",
//         "https://*.mercadolibre.co.cr/*",
//         "https://*.mercadolibre.com.do/*",
//         "https://*.mercadolibre.com.ec/*",
//         "https://*.mercadolibre.com.gt/*",
//         "https://*.mercadolibre.com.hn/*",
//         "https://*.mercadolibre.com.mx/*",
//         "https://*.mercadolibre.com.ni/*",
//         "https://*.mercadolibre.com.pa/*",
//         "https://*.mercadolibre.com.py/*",
//         "https://*.mercadolibre.com.pe/*",
//         "https://*.mercadolibre.com.sv/*",
//         "https://*.mercadolibre.com.uy/*",
//         "https://*.mercadolibre.com.ve/*"
//     ]

const matches = ["<all_urls>"]

export default defineContentScript({
    matches,
    excludeMatches: ["https://*.fiverr.com/*", "https://*.upwork.com/*", "https://chatgpt.com/*", "*://*.gemini.com/*", "*://*.google.com/*", "*://*.github.com/*", "*://*.wxt.dev/*"],
    // 2. Set cssInjectionMode
    cssInjectionMode: 'ui',

    async main(ctx) {
        // 3. Define your UI
        const ui = await createShadowRootUi(ctx, {
            name: 'example-ui',
            position: 'inline',
            anchor: 'body',
            onMount: (container) => {
                // Container is a body, and React warns when creating a root on the body, so create a wrapper div
                const app = document.createElement('div');
                container.append(app);

                // Create a root on the UI container and render a component
                const root = ReactDOM.createRoot(app);
                root.render(<App />);
                return root;
            },
            onRemove: (root) => {
                // Unmount the root when the UI is removed
                root?.unmount();
            },
        });

        // 4. Mount the UI
        ui.mount();
    },
});

const App = () => {
    const { check: run, setCurrentTab, element, showElement, setNotify, user, marketplace } = useStore()

    //functions
    const main = async () => {
        try {
            const data = await run()
            if (!data)
                setCurrentTab('My Account')
        } catch (err) {
            console.log(err)
            alert(err?.response?.data?.err || "Something went wrong!")
            setCurrentTab('My Account')
        }
    }

    useEffect(() => {

        //initialize web socket connection
        // browser.runtime.sendMessage({ action: 'connectSocket', website: location.origin })

        //setting custom alert
        window._originalAlert = alert
        window.alert = setNotify

        //setting custom fetch to remove language param
        //show message from the service-worker
        browser.runtime.onMessage.addListener(message => {

            if (message.action == 'showPopup') showElement()

        })

        main()
    }, [])

    useEffect(() => {
        (async () => {
            const { token = '' } = await browser.storage.local.get(['token'])
            if (!token) return
            browser.runtime.sendMessage({ action: 'changeUninstallUrl', token })
        })()
    }, [user])

    return element && <Main />

}
