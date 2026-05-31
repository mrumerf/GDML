console.log("Offscreen document loaded")

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.target !== 'offscreen') return

    if (msg.action === 'fetch-item-data') {
        const { a, id } = msg
        addIframe(a, id)
    }
})
// Executed when script is loaded

async function removeSW(urls) {
    await urls.forEach(async url => await browser.runtime.sendMessage({ action: 'remove-sw', url }))
}
// If you add an iframe element in DOM:

async function addIframe(url, id) {
    await removeSW([url, 'https://www.mercadolibre.com.ar', 'https://mercadolibre.com.ar']);
    const el = document.createElement('iframe');
    el.src = url;
    el.name = 'data-scrapper-' + id
    document.body.appendChild(el);
}
