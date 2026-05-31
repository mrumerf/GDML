import { create } from "zustand";
import useStore from "./index";

const hardCodedData = {
    "Zapatilla Hombre Dc Shoes Manteca 4 S (bw6)":
    {
        "vid": "No",
        "noOfPics": 1,
        "ranking": "0",
        "reviews": "(5)",
        "monthly_sales": "Nuevo  |  +50 vendidos",
        "publicationNumber": "Publicación #3173036342DenunciarSe abrirá en una nueva ventana"
    },
    "Bota Borcego Niñas Nenas Livianas Calidad": {
        "vid": "No",
        "noOfPics": 1,
        "ranking": "0",
        "reviews": "(108)",
        "monthly_sales": "Nuevo  |  +500 vendidos",
        "publicationNumber": "Publicación #2910936708DenunciarSe abrirá en una nueva ventana"
    },
    "Zapatillas Union La (tan) Dc": {
        "vid": "No",
        "noOfPics": 1,
        "ranking": "0",
        "reviews": "(1)",
        "monthly_sales": "Nuevo  |  4 vendidos",
        "publicationNumber": "Publicación #2017538436DenunciarSe abrirá en una nueva ventana"
    },
    "Pantubota Mujer Corderito Cómodas Invierno": {
        "vid": "No",
        "noOfPics": 1,
        "ranking": "0",
        "reviews": "(3)",
        "monthly_sales": "Nuevo  |  +25 vendidos",
        "publicationNumber": "Publicación #3326603428DenunciarSe abrirá en una nueva ventana"
    },
    "Zapatillas Mujer Urbana Moda Plataforma Livianas": {
        "vid": "No",
        "noOfPics": 1,
        "ranking": "0",
        "reviews": "(1045)",
        "monthly_sales": "Nuevo  |  +1000 vendidos",
        "publicationNumber": "Publicación #1461598843DenunciarSe abrirá en una nueva ventana"
    },
    "Bota Borcego Niñas Nenas Livianas Calidad": {
        "vid": "No",
        "noOfPics": 1,
        "ranking": "0",
        "reviews": "(108)",
        "monthly_sales": "Nuevo  |  +500 vendidos",
        "publicationNumber": "Publicación #2910936708DenunciarSe abrirá en una nueva ventana"
    },
    "Cubre Zapatillas Impermeables De Silicona Reutilizables": {
        "vid": "No",
        "noOfPics": 1,
        "ranking": "0",
        "monthly_sales": "Nuevo",
        "publicationNumber": "Publicación #3071649342DenunciarSe abrirá en una nueva ventana"
    },
    "Zueco Moda Con Hebilla Mujer Plataforma":
    {
        "vid": "No",
        "noOfPics": 1,
        "ranking": "0",
        "reviews": "(40)",
        "monthly_sales": "Nuevo  |  +100 vendidos",
        "publicationNumber": "Publicación #2901488470DenunciarSe abrirá en una nueva ventana"
    },
    "Zapatillas Mujer Moda Plataforma Livianas Sneakers Beca":
    {
        "vid": "No",
        "noOfPics": 1,
        "ranking": "0",
        "reviews": "(1300)",
        "monthly_sales": "Nuevo  |  +5 mil vendidos",
        "publicationNumber": "Publicación #2137320958DenunciarSe abrirá en una nueva ventana"
    },
    "Botitas Pantubota Pantu Bota Con Corderito": {
        "vid": "No",
        "noOfPics": 1,
        "ranking": "0",
        "reviews": "(91)",
        "monthly_sales": "Nuevo  |  +100 vendidos",
        "publicationNumber": "Publicación #787998571DenunciarSe abrirá en una nueva ventana"
    }
}

export const useExtractedData = create((set, get) => ({

    //extracted Data
    extractedData: [],
    setExtractedData: (data) => set((state) => ({
        extractedData: [...state.extractedData, ...data.map(item => ({ ...item, selected: true }))]
    })),
    setExtractedDataToDefault: () => set({ extractedData: [] }),

    //sorted Data
    sortedData: [],
    setSortedData: (updateFunction) =>
        set((state) => ({ sortedData: updateFunction(state.sortedData) })),
    sortConfig: { key: 'index', isAccending: true },
    setSortConfig: (key) => set({
        sortConfig: {
            key,
            isAccending: get().sortConfig.key === key ? !get().sortConfig.isAccending : false,
        }
    }),

    //detailedData
    detailedData: [],
    setDetailedData: async (asin, { noOfPics, vid, creationDate, category, bsr, monthly_revenue, monthly_sales }) => {
        try {

            set((state) => {
                return ({
                    detailedData: {
                        ...state.detailedData, [asin]: {
                            noOfPics: noOfPics < 0 ? 1 : noOfPics,
                            vid,
                            creationDate,
                            category,
                            bsr,
                            monthly_sales,
                            monthly_revenue
                        }
                    }
                })
            })
        } catch (error) { { console.log(error) } }
    },
    setMultipleDetailedData: (data) => {
        set((state) => {
            const updatedDetailedData = { ...state.detailedData };
            for (const asin in data) {
                updatedDetailedData[asin] = {
                    noOfPics: data[asin].noOfPics < 0 ? 1 : data[asin].noOfPics,
                    vid: data[asin].vid,
                    monthly_sales: data[asin].monthly_sales,
                    monthly_revenue: data[asin].monthly_revenue,
                    reviews: data[asin].reviews,
                    ranking: data[asin].ranking
                };
            }
            return { detailedData: updatedDetailedData };
        });
    },

    //toggle check
    toggleChecked: (id) =>
        set((state) => ({
            extractedData: state.extractedData.map((item) =>
                item.ASIN === id ? { ...item, selected: !item.selected } : item
            )
        })),

    firstPageData: '',
    setFirstPageData: (data) => set({ firstPageData: data }),

    //styles
    thTdStyle: {
        border: '2px solid white',
        textAlign: 'center',
        wordWrap: 'break-word',  // Prevents text from leaking by forcing line breaks
        width: '4%',  // You can adjust this width to ensure uniformity
        height: '5vh'
    },

    //functions
    findPrice: (item) => {

        let price = item.querySelector('.poly-price__current .andes-money-amount').textContent.trim()

        return useStore.getState().convertToNumber(price)
    },
    findCompetitors: (page = document) => {
        const { hasResults } = useStore.getState()

        const method1 = Array.from(page.querySelectorAll('h1 span')).find(item => item.textContent.includes('results for'))?.textContent.replace('over ', '') ?? "0"
        let result

        if (method1)
            result = method1?.includes('-') ? method1.split(' ')[2] : method1.split(' ')[0] ?? "0" //this is for the normal version of amazon 

        if (!result || result == "0")
            result = Array.from(page.querySelectorAll('h2~span')).find(item => hasResults(item.textContent))?.textContent?.trim().replace('results', '').replace('+', '') ?? "0"

        if (!result || result == "0") {
            result = Array.from(page.querySelectorAll('h2>span')).find(item => hasResults(item?.textContent))?.textContent?.replace(' a ', '-').trim() ?? ''
            result = result.split(' ').slice(1).toLocaleString().replace(/\D/g, '');
        }

        if (!result || result == '0') {
            result = Array.from(page.querySelectorAll('h2>span')).find(item => hasResults(item.textContent))?.textContent?.replace(' a ', '-').trim()?.split(' ')[0] ?? '0'
        }

        return useStore.getInitialState().convertToNumber(result)
    },
    findNextPageUrl: (pageLocation = location) => {
        //code block for setting next page
        const params = new URLSearchParams(pageLocation.search)
        let page = params.get('page')
        params.set("page", page ? ++page : '2')
        return `${pageLocation.origin}${pageLocation.pathname}?${params.toString()}`
    }

}))

const fetchItemData = useStore.getState().fetchItemData

let errorCount = 0

export const functionExtractedData = create((set, get) => ({

    fetchProductData: async (dataGot, concurrency = 20) => {
        if (!dataGot?.length) return console.info("No data to fetch");

        const source = (import.meta.env.DEV) ? dataGot.slice(0, 12) : dataGot

        const queue = [...source];
        let batchResults = {};
        let processedCount = 0;

        console.log('queue is ', queue)
        console.log(dataGot, typeof dataGot, Array.isArray(dataGot))

        // Flush results to state in batches to optimize performance and reduce re-renders
        const flush = () => {
            if (Object.keys(batchResults).length > 0) {
                useExtractedData.getState().setMultipleDetailedData(batchResults);
                batchResults = {};
            }
        };

        // Worker function to process items in the queue
        const worker = async () => {
            while (queue.length > 0) {
                const item = queue.shift();
                if (!item || useExtractedData.getState().detailedData[item.title]) continue;

                try {

                    // const result = await fetchItemData(item.link, item.ASIN, {
                    //     initPrice: item.price,
                    //     isGetInsights: true,
                    //     useInitPrice: true,
                    //     credentials: 'include'
                    // });

                    const result = await new Promise(res => {
                        setTimeout(() => {
                            let finalResult = hardCodedData[item.title] ?? { ok: true }
                            if (finalResult) {
                                finalResult = {
                                    ...finalResult,
                                    reviews: useStore.getState().convertToNumber(finalResult.reviews),
                                    ranking: useStore.getState().convertToNumber(finalResult.ranking),
                                    monthly_sales: useStore.getState().convertToNumber(finalResult.monthly_sales),
                                    publicationNumber: useStore.getState().convertToNumber(finalResult.publicationNumber),
                                    monthly_revenue: useStore.getState().convertToNumber(item.price * useStore.getState().convertToNumber(finalResult.monthly_sales)),
                                    ok: true
                                }
                            }
                            console.log(finalResult)
                            res(finalResult)
                        }, Math.random() * 1000)
                    })

                    if (!result.ok) {
                        errorCount++;
                        console.warn(`Error fetching data for ASIN ${item.ASIN}: ${result.reason}. Total errors: ${errorCount}`);
                    }

                    batchResults[item.title] = {
                        ...result,
                        price: item.price || result.newPrice
                    };
                    processedCount++;

                    // Update IMMEDIATELY for the first 3 items, 
                    // then every 5 items thereafter for performance.
                    if (processedCount <= 3 || processedCount % 5 === 0) {
                        flush();
                    }
                } catch (err) {
                    errorCount++;
                    batchResults[item.title] = { monthly_sales: 0, bsr: "Error", category: "Error", error: true };
                    console.error("Fetch error", err);
                }
            }
        };

        const workers = Array(Math.min(concurrency, queue.length)).fill(null).map(worker);
        await Promise.all(workers); //promise.all instead of promise.race to ensure all workers complete before final flush
        flush(); // Final cleanup
        errorCount = 0; //reset error count after processing
    }

    ,
    fetchDataFromPage: (page = document, increment = 0) => {
        const allProducts = Array.from(page.querySelectorAll('.ui-search-results li.ui-search-layout__item'))

        return allProducts.map((item, index) => {
            const imageSrc = item.querySelector('img').src
            const title = item.querySelector('.poly-component__title-wrapper').textContent.trim() ?? ""
            const link = item.querySelector('.poly-component__title-wrapper a')?.href.replace('&showFromExtension=true', '') ?? ""
            const price = useExtractedData.getInitialState().findPrice(item)
            const isFull = !!item.querySelector('.poly-shipping__promise-icon--full use')
            return { imageSrc, title, link, price, index: index + increment, isFull }
        })
    }
}))