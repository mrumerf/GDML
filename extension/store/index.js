import { create } from 'zustand'
import api from '../axios/api.js'
import net from '../axios/net.js'

import { useExtractedData } from './extractedData'

const marketplaces = {
    'amazon.com': { shortName: 'US', mid: 'ATVPDKIKX0DER', currencyName: 'USD', currencySymbol: '$', plainMid: '1', nativeLanguage: 'en_US', region: 'en-US', name: 'English' },
    'amazon.fr': { shortName: 'FR', mid: 'A13V1IB3VIYZZH', currencyName: 'EUR', currencySymbol: '€', plainMid: '5', nativeLanguage: 'fr_FR', region: 'fr-FR', name: 'Français' },
    'amazon.de': { shortName: 'DE', mid: 'A1PA6795UKMFR9', currencyName: 'EUR', currencySymbol: '€', plainMid: '4', nativeLanguage: 'de_DE', region: 'de-DE', name: 'Deutsch' },
    'amazon.co.uk': { shortName: 'UK', mid: 'A1F83G8C2ARO7P', currencyName: 'GBP', currencySymbol: '£', plainMid: '3', nativeLanguage: 'en_GB', region: 'en-US', name: 'English' },
    'amazon.es': { shortName: 'ES', mid: 'A1RKKUPIHCS9HS', currencyName: 'EUR', currencySymbol: '€', plainMid: '44551', nativeLanguage: 'es_ES', region: 'es-ES', name: 'Castellano' },
    'amazon.it': { shortName: 'IT', mid: 'APJ6JRA9NG5V4', currencyName: 'EUR', currencySymbol: '€', plainMid: '35691', nativeLanguage: 'it_IT', region: 'it-IT', name: 'Italiano' },
    'amazon.ca': { shortName: 'CA', mid: 'A2EUQ1WTGCTBG2', currencyName: 'CAD', currencySymbol: '$', plainMid: '7', nativeLanguage: 'en_GB', region: 'en-US', name: 'English' },
    'amazon.com.mx': { shortName: 'MX', mid: 'A1AM78C64UM0Y8', currencyName: 'MXN', currencySymbol: '$', plainMid: '771770', nativeLanguage: 'es_MX', region: 'es-MX', name: 'México' },
}
const marketplace = marketplaces['amazon.com'] || {}
marketplace.language = 'English'
marketplace.isNativeLang = true
marketplace.currentRegion = 'en-US'
marketplace.currentNativeLanguage = 'en_GB'

function parseDateToTimestamp(dateString) {
    // A map of month names in different languages to English month names.
    const monthMap = {
        // French months
        'janvier': 'January', 'février': 'February', 'mars': 'March', 'avril': 'April',
        'mai': 'May', 'juin': 'June', 'juillet': 'July', 'août': 'August',
        'septembre': 'September', 'octobre': 'October', 'novembre': 'November', 'décembre': 'December',

        // Spanish months (also covers "Mexican" and "espaniol")
        'enero': 'January', 'febrero': 'February', 'marzo': 'March', 'abril': 'April',
        'mayo': 'May', 'junio': 'June', 'julio': 'July', 'agosto': 'August',
        'septiembre': 'September', 'octubre': 'October', 'noviembre': 'November', 'diciembre': 'December',

        // German months
        'januar': 'January', 'februar': 'February', 'märz': 'March', 'april': 'April',
        'mai': 'May', 'juni': 'June', 'juli': 'July', 'august': 'August',
        'september': 'September', 'oktober': 'October', 'november': 'November', 'dezember': 'December',

        // Italian months
        'gennaio': 'January', 'febbraio': 'February', 'marzo': 'March', 'aprile': 'April',
        'maggio': 'May', 'giugno': 'June', 'luglio': 'July', 'agosto': 'August',
        'settembre': 'September', 'ottobre': 'October', 'novembre': 'November', 'dicembre': 'December',
    };

    let normalizedDateString = dateString?.toLowerCase() ?? '';

    // Replace foreign month names with English ones
    for (const month in monthMap) {
        if (normalizedDateString.includes(month)) {
            normalizedDateString = normalizedDateString.replace(month, monthMap[month]);
            break; // Exit the loop once a match is found to prevent incorrect replacements
        }
    }

    // Use the Date object's constructor for parsing the normalized string.
    const dateObject = new Date(normalizedDateString);

    // Check if the date object is valid. Invalid dates result in a NaN timestamp.
    if (isNaN(dateObject.getTime())) {
        return 0;
    }

    // Return the Unix timestamp in milliseconds.
    return dateObject.getTime();
}

const useStore = create((set, get) => ({
    //element
    element: import.meta.env.DEV,
    // element: false,
    showElement: () => set({ element: true }),
    hideElement: () => set({ element: false }),

    //current tab
    currentTab: import.meta.env.PROD
        ? 'Extracted Data'
        : 'Extracted Data', //development
    setCurrentTab: (currentTab) => set({ currentTab }),

    //last current tab
    lastTab: 'Extracted Data',
    setLastTab: (lastTab) => set({ lastTab }),

    compatible: true,
    setCompatible: () => set({ compatible: true }),

    website: location.hostname.replace('www.', '').replace('https://', '').replace('http://', ''),
    marketplaces,
    marketplace,
    loadMarketplacesToStorage: async () => {
        await browser.storage.local.set({ 'marketplaces': marketplaces })
    },
    isFree: (text) => ['free shipping', 'free delivery', 'livraison gratuite', 'gratis', 'gratuito', 'kostenlos', 'gratuit', 'frete'].some(a => text?.toLowerCase()?.includes(a) ?? false),
    hasResults: text => / results| résultats| Ergebnissen| resultado| risultati| resultados/i.test(text),

    colorCriteria: {},
    fetchColorCriteria: async () => {
        const { marketplaces, colorCriteria: result } = await browser.storage.local.get(['marketplaces,colorCriteria'])
        if (!marketplaces) return
        const values = result.colorCriteria?.find(item => item.marketplace === marketplaces[get().website].shortName)?.values || {};
        set({ colorCriteria: values });
    },
    initColorCriteriaListener: () => {
        browser.storage.onChanged.addListener(async (changes, area) => {
            if (area === 'local' && changes.colorCriteria) {
                const { marketplaces } = await browser.storage.local.get(['marketplaces'])
                if (!marketplaces) return
                const values = changes.colorCriteria.newValue?.find(item => item.marketplace === marketplaces[get().website].shortName)?.values || {};
                set({ colorCriteria: values });
            }
        });
    },
    getColor: (type, stringValue, defaultColor = 'unset') => {
        let n = get().convertToNumber(stringValue)


        const { 'Global Rating': globalRating, 'Nb of Reviews': nbReviews, 'Monthly Sales': monthly_sales, 'Monthly Revenue': monthly_revenue, 'Average Monthly Revenue': avMonthlyRevenue, 'Monthly Sales First Page': firstPage, 'Nb of FBA Competitors': fbaResults, 'Good Share': goodSellingListings, 'Nb of Competitors': nbCompetitors } = get().colorCriteria

        switch (type) {

            //headers - inputs
            case 'amr':
                if (!avMonthlyRevenue?.high) return defaultColor
                if (n >= avMonthlyRevenue?.high) return 'var(--green)'
                if (n <= avMonthlyRevenue?.low) return 'var(--red)'
                return 'var(--orange)'

            case 'fp':
                if (!firstPage?.high) return defaultColor
                if (n <= firstPage?.low) return 'var(--green)'
                if (n >= firstPage?.high) return 'var(--red)'
                return 'var(--orange)'

            case 'fr':
                if (!fbaResults?.high) return defaultColor
                if (n <= fbaResults?.low) return 'var(--green)'
                if (n >= fbaResults?.high) return 'var(--red)'
                return 'var(--orange)'

            case 'ms':
                if (!goodSellingListings?.high) return defaultColor
                if (n >= goodSellingListings?.high) return 'var(--green)'
                if (n <= goodSellingListings?.low) return 'var(--red)'
                return 'var(--orange)'
            case 'com':
                if (!n) return 'white'
                if (n < 1000) return "var(--green)"
                if (n <= 2000) return 'var(--orange)'
                return 'var(--red)'

            // visual analysis
            case 'ems':
                if (!monthly_sales?.high) return 'unset'
                if (n <= monthly_sales?.low) return 'var(--green)'
                if (n >= monthly_sales?.high) return 'var(--red)'
                return 'var(--orange)'

            case 'emr':
                if (!monthly_revenue?.high) return 'unset'
                if (n <= monthly_revenue?.low) return 'var(--green)'
                if (n >= monthly_revenue?.high) return 'var(--red)'
                return 'var(--orange)'

            case 'gr':
                if (!globalRating?.high) return 'unset'
                if (n <= globalRating?.low) return 'var(--green)'
                if (n >= globalRating?.high) return 'var(--red)'
                return 'var(--orange)'

            case 'rv':
                if (!nbReviews?.high) return 'unset'
                if (n <= nbReviews?.low) return 'var(--green)'
                if (n >= nbReviews?.high) return 'var(--red)'
                return 'var(--orange)'

            case 'p':
                if (n == 0 || !n) return 'unset'
                if (n < 5) return 'var(--green)'
                if (n < 7) return 'var(--orange)'
                return 'var(--red)'

            case 'v':
                if (stringValue === "Yes") return 'var(--red)'
                if (stringValue === "No") return 'var(--green)'
                return 'unset'

            // tracked products

            case 'gb':
                if (n < 4) return ' var(--green)'
                if (n < 4.3) return ' (var--orange)'
                return ' var(--red)'

            case 'rv':
                if (n < 50) return ' var(--green)'
                if (n < 150) return ' (var--orange)'
                return ' var(--red)'

            case 'bsr':
                if (n > 50000) return ' var(--green)'
                if (n > 20000) return ' (var--orange)'
                return ' var(--red)'

            case 'pics':
                if (!n) return 'unset'
                if (n < 5) return ' var(--green)'
                if (n < 7) return ' (var--orange)'
                return ' var(--red)'

            case 'vid':
                if (/^no$/i.test(stringValue)) return ' var(--green)'
                return ' var(--red)'

            case 'revenue':
                if (!n) return 'unset'
                if (n > 2000) return ' var(--green)'
                if (n > 500) return ' (var--orange)'
                return ' var(--red)'

            //niche hunter
            case 'n-nbc':
                if (!nbCompetitors?.high && defaultColor !== 'unset') return defaultColor // the defaultColor !== 'unset' is because so that the color orange shows in niche hunter while headers>inputs.jsx shows defaultColor. 
                if (!nbCompetitors?.high && defaultColor === 'unset') return 'var(--orange)'
                if (!n) return defaultColor
                if (n <= nbCompetitors?.low) return 'var(--green)'
                if (n >= nbCompetitors?.high) return 'var(--red)'
                return 'var(--orange)'

            case 'n-nbfc':
                if (!n) return 'unset'
                if (!fbaResults?.high && defaultColor === 'unset') return 'var(--orange)'
                if (n <= fbaResults?.low) return 'var(--green)'
                if (n >= fbaResults?.high) return 'var(--red)'
                return 'var(--orange)'

            default:
                return defaultColor
        }
    }
    ,

    //formatting
    convertToNumber: (str = 0, postfix = true) => {
        if (typeof str === 'number') return str;
        if (str === 'N/A --force') return 'N/A'
        // Normalize to string and spaces (Amazon often uses NBSP)
        let result = String(str).replace(/\u00A0/g, ' ').trim();

        // Locale handling (French decimals, etc.)
        switch (get().marketplace.currentRegion) {
            case 'fr-FR':
            case 'de-DE':
            case 'es-ES':
            case 'it-IT':
                // Remove thousands '.' and use '.' as decimal
                result = result.replace(/\./g, '').replace(/,/g, '.');
                break;
            default:
                // leave as-is
                break;
        }
        if (!result) return 0;

        if (postfix) {

            const match = result.match(/([\d.,]+)\s*([kmb])?(?!\p{L})/iu);

            if (match) {
                let num = parseFloat(match[1].replace(/,/g, ''));
                if (!isNaN(num)) {
                    const postfix = (match[2] || '').toLowerCase();
                    if (postfix === 'k') num *= 1e3;
                    else if (postfix === 'm') num *= 1e6;
                    else if (postfix === 'b') num *= 1e9;

                    return num;
                }
            }
        }
        // Fallback: strip non-numeric and parse
        return Number(result?.replace(/[^\d.]/g, '') || '0');
    }
    ,
    convertToLocaleString: (num, options = {}) => num !== 'N/A --force' ? num?.toLocaleString(marketplace.currentRegion, { useGrouping: 'always', ...options }) || '0' : 'N/A',
    formatPrice: (price = 0, region = marketplace.currentRegion, currency = marketplace.currencyName, customRules = {}) => price.toLocaleString(region, {
        style: 'currency',
        currency,
        useGrouping: 'always',
        currencyDisplay: 'narrowSymbol',
        currency: 'BRL',
        ...customRules
    }),
    formatDate: (date) => {
        if (!date) return 'None'
        const dateObj = new Date(date)
        const formattedDate = `${String(dateObj.getMonth() + 1).padStart(2, "0")}/${String(dateObj.getDate()).padStart(2, "0")}/${dateObj.getFullYear()}`

        if (formattedDate === "NaN/NaN/NaN") return "None"

        return formattedDate
    }
    ,


    //go back
    goBack: () => {
        const lastTab = get().lastTab
        set({ currentTab: lastTab })
    },

    //authorization
    user: { logged: true, activated: true },
    setUser: (user) => set({ user }),
    check: async () => {
        return true
        try {
            const { data } = await api.get('/userProtected')

            if (data !== 'Authorized') {
                set({ user: { logged: false, activated: false } })
                return false
            }

            set({ user: { logged: true, activated: true } })
            return true
        }
        catch (err) {
            console.log(err)

            if (/^user is not activated$/i.test(err?.response?.data?.err)) set({ user: { logged: true, activated: false } })

            else set({ user: { logged: false, activated: false } })

            return false
        }
    },
    logout: async (passwordChanged = false) => {
        try {
            const { token } = await browser.storage.local.get(['token'])

            if (!token) return

            if (!passwordChanged) {// we will come back to this because as the password is changed we can't do a network request
                await api.get('/semiProtected/logout')
            }

            await storage.remove('token')
            set({ user: { logged: false, activated: false }, currentTab: 'My Account' })
        } catch (err) {
            console.log(err)
            alert(err?.response?.data?.err || "Error logging out.")
        }
    }
    ,

    getFreeShippingInfo: (page = document) => {
        let element = Array.from(page.querySelectorAll('div:has(input)~span')).find(item => get().isFree(item?.textContent))?.parentElement
        let checked

        if (element) {
            checked = get().isFree(page.querySelector('div:has(input[checked])~span')?.textContent)
        } else {
            element = page.querySelector('#primeRefinements a')
            if (!element) return {}
            checked = element.textContent?.includes('Clear')
        }

        return { element, checked }

    },

    //notification
    notify: '',
    setNotify: (notify, notifyTimer = 8000) => set({ notify, notifyTimer }),
    //my saved research + extracted tab function
    fetchItemData: async (a, ASIN, options = {}) => {
        const { initPrice = 0, mine = false, isGetInsights = false, isFirstPage = false, credentials = 'omit', useInitPrice = false } = options
        console.log('running fetchItemData with a', a)
        try {

            if (!a || a.startsWith("javascript:"))
                throw new Error('Link isn\'t provided or malformed link provided for ' + ASIN)

            const { vid, noOfPics, ranking, reviews, monthly_sales, publicationNumber } = await browser.runtime.sendMessage({ action: 'fetch-item-data', a, id: crypto.randomUUID() })

            // if (true) {
            //     const blob = new Blob([data], { type: 'text/html' });
            //     const url = URL.createObjectURL(blob);

            //     window.open(url)
            // } //client said it could be use in the future for validating

            //wait for continue button to resolve
            // await waitForContinueButton(page)
            // console.log('continue button resolved')

            const monthly_revenue = get().convertToNumber(monthly_sales) * initPrice

            console.log({ vid, noOfPics, ranking, reviews, monthly_sales, monthly_revenue, publicationNumber })
            return ({ mine, link: a, ASIN, vid, noOfPics: Number(noOfPics) < 0 ? 1 : noOfPics, ranking, reviews, monthly_revenue, monthly_sales, ok: true, publicationNumber })

        } catch (error) {
            if (error.name === 'AbortError')
                console.log('Amazon took too long - Killing request to save RAM');

            console.log("Error in fetchItemData:", error)
            return ({ mine: false, link: a, ASIN, vid: "No", creationDate: "Error", category: "Error", bsr: "Error", price: initPrice, monthly_revenue: 0, monthly_sales: 0, ok: false, reason: error.name === 'AbortError' ? 'timeout' : 'fetch error' })
        }
    },

    defaultImage: 'data:image/png;base64,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'

}))

export default useStore

//functions
export const findBSR = (page = document) => {
    let result
    //there are two types of pages, one which have the bsr in a table and one doesn't
    const method1 = Array.from(page.querySelectorAll('li>span')).find(item => /Best Sellers Rank|Classement des meilleures|Bestseller-Rang|Clasificación en los más vendidos|Posizione nella classifica Bestseller/i.test(item.textContent))
    if (method1) {

        if (method1.childNodes[2])
            result = method1.childNodes[2].textContent?.trim().split(' ').slice(0, 3).join(' ') ?? ''

        else
            result = method1.textContent.replace(/Voir les 100 premiers en|Best Sellers Rank|Bestseller-Rang|Posizione nella classifica Bestseller/g, '')

    }
    const method2 = Array.from(page.querySelectorAll('tr td')).find(item => /See Top|Voir les|Siehe Top|Ver el Top|Visualizza i/.test(item.textContent))

    if (method2) result = method2.textContent.trim().split(' ').slice(0, 3).join(' ')

    const method3 = Array.from(page.querySelectorAll('tr')).find(tr => /Best Sellers Rank|Classement des meilleures|Bestseller-Rang|Clasificación en los más vendidos|Posizione nella classifica Bestseller/i.test(tr.querySelector('th')?.textContent))?.querySelector('td a')?.parentElement?.firstChild?.textContent?.replace(/in|en/, '').trim()

    if (method3) result = method3

    return useStore.getState().convertToNumber(result, false) ?? 0
}

export const findCat = (page = document) => {

    let result

    const method1 = Array.from(page.querySelectorAll('li>span')).find(item => /Best Sellers Rank|Classement des meilleures ventes d'Amazon|Bestseller-Rang|Clasificación en los más vendidos|Posizione nella classifica Bestseller/i.test(item?.textContent))
    if (method1) {

        if (method1.childNodes[3]) result = method1.childNodes[3]?.textContent ?? "None"

        else
            result = method1.textContent.split('#')[1]?.split(' ')[0] ?? "None"
    }

    const method2 = Array.from(page.querySelectorAll('tr td')).find(item => /See Top|Siehe Top|Ver el Top|Visualizza i/i.test(item?.textContent))

    if (method2) result = method2.childNodes[1]?.textContent?.trim().split('(')[1].split(')')[0] ?? "None"

    const method3 = Array.from(page.querySelectorAll('tr')).find(tr => /Best Sellers Rank|Classement des meilleures ventes d'Amazon|Bestseller-Rang|Clasificación en los más vendidos|Posizione nella classifica Bestseller/i.test(tr?.querySelector('th')?.textContent))?.querySelector('td a')?.textContent
    if (method3) result = method3

    return result?.replace(/See Top 100 in|Voir les 100 premiers en|Siehe Top 100 in|Ver el Top 100 en|Visualizza i Top 100 nella categoria/g, '').trim() ?? "None"
}

export const findCreationDate = (page = document) => {

    let result

    const method1 = Array.from(page.querySelectorAll('li>span')).find(item => (/Public/i.test(item?.textContent) && item?.className == 'a-list-item') || /Data d'uscita|Date/i.test(item?.textContent))?.lastElementChild?.textContent ?? page.querySelector('#detailsReleaseDate td')?.textContent
    if (method1) result = method1

    const method2 = Array.from(page.querySelectorAll('#detailBullets_feature_div ul>li')).find(item => /Date|desde|Fecha de lanzamiento|Data d'uscita/i.test(item?.textContent))?.textContent?.split(':')[1]?.trim()
    if (method2) result = method2

    const method3 = Array.from(page.querySelectorAll('tr')).find(tr => /Date First Available|Date de|Im Angebot von|desde|Data d'uscita|Disponibile su/i.test(tr.querySelector('th')?.textContent))?.querySelector('td')?.textContent.trim()
    if (method3) result = method3

    const timeStamp = parseDateToTimestamp(result)

    return timeStamp
}

export const findPrice = (page = document, initPrice = 0) => {
    const element = page.querySelector('form#addToCart')

    if (!element) return '-'

    const formData = new FormData(element)
    const currencyCode = formData.get("items[0.base][customerVisiblePrice][currencyCode]")

    if (currencyCode && currencyCode !== useStore.getState().marketplace.currencyName) return initPrice //in case of different currency we return the init price

    const result = formData.get('items[0.base][customerVisiblePrice][displayString]')

    return result ? useStore.getState().convertToNumber(result) : initPrice
}

export const findRanking = (page = document) => {
    let ranking = page.querySelector('#ppd span.a-icon-alt')?.textContent.slice(0, 3) ?? "0"

    return ranking ? useStore.getState().convertToNumber(ranking) : 0
}

export function waitForContinueButton(page = document) {
    return new Promise((resolve) => {
        console.log('waiting for continue button....')
        const el = page.querySelector('#continue-button');
        if (el) {
            console.log('continue button found immediately')
            resolve(el);
            return;
        }

        const observer = new MutationObserver(() => {
            const el = page.querySelector('#continue-button');
            console.log('mutation observed, checking for continue button...')
            if (el) {
                console.log('continue button found by observer')
                observer.disconnect();
                resolve(el);
            }
        });

        observer.observe(page.body, {
            childList: true,
            subtree: true
        });
    })
}

export const sleep = ms => new Promise(res => setTimeout(res, ms))

useStore.getState().fetchColorCriteria()
useStore.getState().initColorCriteriaListener()
useStore.getState().loadMarketplacesToStorage()
