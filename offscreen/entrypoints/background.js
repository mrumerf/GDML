export default defineBackground(() => {

  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'remove-sw') {
      (async () => {
        await browser.browsingData.remove({
          origins: [new URL(msg.url).origin],
        }, {
          serviceWorkers: true,
        });
        sendResponse(true)
      })()
      return true
    }
  })

  async function setupOffscreen() {
    const existing = await browser.offscreen.hasDocument?.()

    if (existing) return

    await browser.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["DOM_PARSER"],
      justification: "Need DOM access"
    })

    // browser.scripting.registerContentScripts([{
    //   allFrames: true, matches: ['https://*.youtube.com/*'], js: ['content.js'], persistAcrossSessions: false, id: 'a-script'
    // }])

  }

  browser.runtime.onInstalled.addListener(async () => {
    await setupOffscreen()
  })


  const iframeHosts = [
    'mercadolibre.com.ar',
    'www.mercadolibre.com.ar',
  ];
  browser.runtime.onInstalled.addListener(() => {
    const RULE = {
      id: 1,
      condition: {
        initiatorDomains: [browser.runtime.id],
        requestDomains: iframeHosts,
        resourceTypes: ['sub_frame'],
      },
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          { header: 'X-Frame-Options', operation: 'remove' },
          { header: 'Frame-Options', operation: 'remove' },
          // Uncomment the following line to suppress `frame-ancestors` error
          { header: 'Content-Security-Policy', operation: 'remove' },
        ],
      },
    };
    browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE.id],
      addRules: [RULE],
    });
  });

});
