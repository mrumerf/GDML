import axios from "axios"

import { io } from 'socket.io-client'
import parser from 'socket.io-msgpack-parser'

export default defineBackground(() => {
    let socketInstance = null
    let isConnected = false
    let connectionPromise = null
    let lastWebsite = ''

    const marketplaces = {
        'amazon.com': { shortName: 'US', mid: 'ATVPDKIKX0DER', currencyName: 'USD', currencySymbol: '$', plainMid: '1' },
        'amazon.fr': { shortName: 'FR', mid: 'A13V1IB3VIYZZH', currencyName: 'EUR', currencySymbol: '€', plainMid: '5' },
        'amazon.de': { shortName: 'DE', mid: 'A1PA6795UKMFR9', currencyName: 'EUR', currencySymbol: '€', plainMid: '4' },
        'amazon.co.uk': { shortName: 'UK', mid: 'A1F83G8C2ARO7P', currencyName: 'GBP', currencySymbol: '£', plainMid: '3' },
        'amazon.es': { shortName: 'ES', mid: 'A1RKKUPIHCS9HS', currencyName: 'EUR', currencySymbol: '€', plainMid: '44551' },
        'amazon.it': { shortName: 'IT', mid: 'APJ6JRA9NG5V4', currencyName: 'EUR', currencySymbol: '€', plainMid: '35691' },
        'amazon.ca': { shortName: 'CA', mid: 'A2EUQ1WTGCTBG2', currencyName: 'CAD', currencySymbol: '$', plainMid: '7' },
        'amazon.com.mx': { shortName: 'MX', mid: 'A1AM78C64UM0Y8', currencyName: 'MXN', currencySymbol: '$', plainMid: '771770' }
    }

    let requestQueue = [];
    let batchTimeout = null;

    const processBatch = async () => {
        const currentBatch = [...requestQueue];
        requestQueue = []; // Clear queue immediately
        batchTimeout = null;

        try {
            await connectSocket(currentBatch[0].request); // Connect using first item's context

            // Emit all items at once
            socketInstance.emit('getInsightsBatch', currentBatch.map(b => b.request), (responses) => {
                // Match responses back to their specific sendResponse callbacks
                currentBatch.forEach((original) => {

                    const data = responses.results.find(r => r.bsr === original.request.bsr && r.category === original.request.category);
                    if (data && data.ok)
                        original.sendResponse(data.monthly_sales);
                    else
                        console.log('No data for', original.request.bsr, original.request.category)
                    original.sendResponse(0);

                })

            })
        } catch (err) {
            console.log(err)
            currentBatch.forEach(b => b.sendResponse(0));
        }
    };

    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "clearBrowsingData") {
            clearBrowsingDataAndCookies()
            sendResponse({ done: true })
        }

        else if (request.action === 'getInsights') {
            (async () => {

                if (!request.bsr || !request.category) {
                    sendResponse(0)
                    return
                }

                requestQueue.push({ request, sendResponse });

                if (requestQueue.length >= 3) {
                    // If we hit 5 items, process immediately
                    if (batchTimeout) clearTimeout(batchTimeout);
                    processBatch();
                } else if (!batchTimeout) {
                    // Otherwise, wait for more to arrive
                    batchTimeout = setTimeout(processBatch, 400);
                }
            })()

            return true // Important for async
        }

        else if (request.action === 'changeUninstallUrl') {
            // Set uninstall URL
            browser.runtime.setUninstallURL(
                `${import.meta.env.VITE_PUBLIC_API_URL}/uninstall?qwe=${encodeURIComponent(request.token)}&uninstall=true`
            );
        }

        else if (request.type === "axios-proxy") {
            (async () => {

                axios({
                    url: request.url,
                    method: request.config.method,
                    headers: { ...request.config.headers, Authorization: `Bearer ${await browser.storage.local.get(['token']).then(result => result.token)}`, 'X-Requested-With': 'chrome-extension://pnagglcmfogefgnjebgbenekcjkhbope' },
                    data: request.config.data,
                })
                    .then((res) => {
                        sendResponse({
                            data: res.data,
                            status: res.status,
                            statusText: res.statusText,
                            headers: res.headers,
                        })
                    })
                    .catch((err) => {
                        console.log('Error in proxied request:', err)
                        sendResponse({
                            error: true,
                            response: {
                                data: err.response?.data ?? { err: err.message },
                                status: err.response?.status,
                                headers: err.response?.headers,
                            },
                        })
                    })
            })()
            return true // async response
        }
        else if (request.action === 'change-cookies') {
            (() => {
                const { name, value } = request

                browser.cookies.getAll({ domain: (new URL(sender.url)).hostname.replace('www.', ''), name: name || 'lc-acbfr' }, async (cookies) => {

                    const prevValue = cookies[0]?.value

                    const url = new URL(sender.url)
                    const domain = url.hostname.replace('www.', '')

                    browser.cookies.set({
                        url: `https://${domain}/`,
                        name: name || 'lc-acbfr',
                        value: value || 'en_GB',
                        domain: `.${domain}`,   // ✅ wildcard domain (matches all subdomains)
                        path: "/",
                        secure: true,
                        httpOnly: false         // ✅ must be false since extensions can’t set HttpOnly
                    }, (cookie) => {

                        sendResponse(prevValue)
                    })

                })
                return true // async response
            })()
        }
        else if (request.action === 'get-cookie-value') {
            (() => {
                browser.cookies.getAll({ domain: (new URL(sender.url)).hostname.replace('www.', ''), name: request.name || 'lc-acbfr' }, async (cookies) => {
                    sendResponse(cookies[0]?.value)
                })
            })()
            return true // async response
        } else if (request.action === 'connectSocket') connectSocket(request)

    })

    async function connectSocket(request) {
        // If already connected, return
        if ((isConnected && socketInstance?.connected) && lastWebsite === request.website) return socketInstance

        // If a connection is already in progress, wait for it
        if (connectionPromise) return connectionPromise

        // Start connection process
        connectionPromise = new Promise(async (resolve, reject) => {
            try {
                const { token = '' } = await browser.storage.local.get(['token'])
                socketInstance = io(import.meta.env.VITE_PUBLIC_API_URL.replace(/^https/, 'wss'), {
                    auth: { token, website: request.website },
                    transports: ['websocket'],
                    withCredentials: true,
                    parser,
                    upgrade: false
                })

                socketInstance.once('connect', () => {
                    isConnected = true
                    connectionPromise = null
                    lastWebsite = request.website
                    console.log('[Socket] Connected with request:', request)
                    resolve(socketInstance)
                })

                socketInstance.once('connect_error', (err) => {
                    isConnected = false
                    connectionPromise = null
                    console.error('[Socket] Connection error:', err)
                    reject(err)
                })
            } catch (err) {
                connectionPromise = null
                reject(err)
            }
        })

        return connectionPromise
    }


    //The main function for all the implantation
    const showPopup = (tabId) => browser.tabs.sendMessage(tabId, { action: 'showPopup' })

    //adding on click listener
    browser.action.onClicked.addListener(() => {

        //receiving message when starting the extension
        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {

            const activeTabUrl = tabs[0]?.url ?? 'chrome://newtab'
            const newUrl = new URL(activeTabUrl)
            const domain = newUrl.hostname

            if (import.meta.env.DEV || (domain && (/mercadolivre\.|mercadolibre\./.test(domain))))
                showPopup(tabs[0].id) //if the message is coming from amazon or example website then 

            else
                browser.tabs.create({ url: 'https://mercadolibre.com' })

        })

    })

    //adding on installed listener
    browser.runtime.onInstalled.addListener(details => {

        browser.storage.local.set({ 'marketplaces': marketplaces })

        //if in production go to our website
        if (details.reason === "install" && import.meta.env.PROD)
            browser.tabs.create({ url: "https://www.geniusdigger.com" })


    })

    // Log requests to Amazon's completion API
    browser.webRequest.onBeforeRequest.addListener(
        async (details) => {

            const params = new URLSearchParams(details.url)
            const sessionId = params.get('session-id')
            const lop = params.get('lop') //marketplace with language e.g. en_US
            const plainMid = params.get('plain-mid') //unclear right now

            const url = details.initiator.replace('https://', '').replace('http://', '').replace('www.', '').split(/[/?#]/)[0]
            if (url in marketplaces === false) return

            if (sessionId) marketplaces[url].sessionId = sessionId
            if (lop) marketplaces[url].lop = lop
            if (plainMid) marketplaces[url].plainMid = plainMid

            await browser.storage.local.set({ 'marketplaces': marketplaces })
        },
        { urls: Object.keys(marketplaces).map(marketplace => `*://completion.${marketplace.replace('https://', '')}/api/2017/suggestions*`) }
    )

    async function clearBrowsingDataAndCookies() {

        const amazonDomains = Object.keys(await browser.storage.local.get(['marketplaces']).then(result => result.marketplaces))

        browser.browsingData.remove({ "since": 0 }, { "cache": true })

        amazonDomains.forEach(domain => {
            browser.cookies.getAll({ domain }, cookies => {
                cookies.forEach(cookie => {
                    const url = `http${cookie.secure ? "s" : ""}://${cookie.domain.startsWith(".") ? cookie.domain.slice(1) : cookie.domain}${cookie.path}`;
                    browser.cookies.remove({
                        url,
                        name: cookie.name
                    })
                });
            });
        });
    }
})