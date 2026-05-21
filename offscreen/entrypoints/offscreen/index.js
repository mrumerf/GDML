console.log("Offscreen document loaded")

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "PING") {
        sendResponse({ success: true })
    }
})
// Executed when script is loaded

async function removeSW(url) {
    await browser.runtime.sendMessage({ action: 'remove-sw', url })
}
// If you add an iframe element in DOM:

async function addIframe(url, parent = document.body) {
    await removeSW(url);
    const el = document.createElement('iframe');
    parent.appendChild(el);
    el.src = url;
    return el;
}

addIframe('https://www.mercadolibre.com.ar')
