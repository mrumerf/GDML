export default defineContentScript({
  matches: ['https://*.mercadolibre.com.ar/*'],
  excludeMatches: ['https://*.fiverr.com/*'],
  allFrames: true,
  main() {
    setTimeout(() => {

      console.log(document.querySelectorAll('img'))
    }, 2000)
  },
});
