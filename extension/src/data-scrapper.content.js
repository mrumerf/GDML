const matches =
    [
        "https://*.mercadolibre.com.ar/*/up/ML*",
        "https://*.mercadolibre.com.bo/*/up/ML*",
        "https://*.mercadolivre.com.br/*/up/ML*",
        "https://*.mercadolibre.cl/*/up/ML*",
        "https://*.mercadolibre.com.co/*/up/ML*",
        "https://*.mercadolibre.co.cr/*/up/ML*",
        "https://*.mercadolibre.com.do/*/up/ML*",
        "https://*.mercadolibre.com.ec/*/up/ML*",
        "https://*.mercadolibre.com.gt/*/up/ML*",
        "https://*.mercadolibre.com.hn/*/up/ML*",
        "https://*.mercadolibre.com.mx/*/up/ML*",
        "https://*.mercadolibre.com.ni/*/up/ML*",
        "https://*.mercadolibre.com.pa/*/up/ML*",
        "https://*.mercadolibre.com.py/*/up/ML*",
        "https://*.mercadolibre.com.pe/*/up/ML*",
        "https://*.mercadolibre.com.sv/*/up/ML*",
        "https://*.mercadolibre.com.uy/*/up/ML*",
        "https://*.mercadolibre.com.ve/*/up/ML*"
    ]

export default defineContentScript({
    matches,
    all_frames: true,
    async main() {
        browser.runtime.sendMessage({ action: 'please-console-this', data: `[DS] content script loaded with name ${window.name}` })
        if (!window.name.includes('data-scrapper')) return

        const findRanking = (page = document) => {
            let ranking = page.querySelector('#ppd span.a-icon-alt')?.textContent.slice(0, 3) ?? "0"

            return ranking ? useStore.getState().convertToNumber(ranking) : 0
        }

        const id = window.name.replace('data-scrapper-', '')


        //data scrapping
        const vid = Array.from(document.querySelectorAll('#altImages li')).filter(item => item.classList.contains('videoBlockIngress')).length > 0 ? "Yes" : "No"
        const noOfPics = document.querySelectorAll('.ui-pdp-gallery input')?.length || 0

        //extracting title
        const ranking = findRanking(document)
        const reviews = document.querySelector('.ui-pdp-review__amount')?.textContent

        const monthly_sales = document.querySelector('.ui-pdp-subtitle')?.textContent

        const publicationNumber = document.querySelector('#denounce')?.textContent || '0'

        browser.runtime.sendMessage({ action: 'data-scrapping-completed', id, data: { vid, noOfPics, ranking, reviews, monthly_sales } })

        console.log('scrapper running with name', window.name)
    }
})