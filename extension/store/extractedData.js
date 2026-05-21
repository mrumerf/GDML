import { create } from "zustand";
import useStore from "./index";

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
                    creationDate: data[asin].creationDate,
                    category: data[asin].category,
                    bsr: data[asin].bsr,
                    monthly_sales: data[asin].monthly_sales,
                    monthly_revenue: data[asin].monthly_revenue
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

export const functionExtractedData = create(() => ({

    fetchProductData: async (dataGot, concurrency = 20) => {
        if (!dataGot?.length) return console.info("No data to fetch");

        const source = (import.meta.env.DEV) ? dataGot.slice(0, 1) : dataGot

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
                if (!item || useExtractedData.getState().detailedData[item.ASIN]) continue;

                try {

                    const result = await fetchItemData(item.link, item.ASIN, {
                        initPrice: item.price,
                        isGetInsights: true,
                        useInitPrice: true,
                        credentials: 'include'
                    });

                    if (!result.ok) {
                        errorCount++;
                        console.warn(`Error fetching data for ASIN ${item.ASIN}: ${result.reason}. Total errors: ${errorCount}`);
                    }

                    batchResults[item.ASIN] = {
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
                    batchResults[item.ASIN] = { monthly_sales: 0, bsr: "Error", category: "Error", error: true };
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
            const ranking = item.querySelector('.poly-component__review-compacted')?.textContent ?? "0"
            const reviews = 0
            const isFull = !!item.querySelector('.poly-shipping__promise-icon--full use')
            return { imageSrc, title, link, price, ranking, reviews, index: index + increment, isFull }
        })
    }
}))