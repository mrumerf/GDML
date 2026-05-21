import { useEffect } from "react"

import ExtractedDataTab from "./tabs/ExtractedDataTab"
import MyAccount from './tabs/myAccount'
import Keywords from './tabs/Keywords'
import MyParameters from './tabs/MyParameters'
import TrackedProducts from "./tabs/trackedProducts"
import VisualAnalysis from "./tabs/visualAnalysis"
import Settings from "./tabs/Settings"

import Notification from "./components/Notification"

import Header from './header'

import useStore from "../store"
import { useExtractedData, functionExtractedData } from "../store/extractedData"

export default function App() {

    //store variables
    const user = useStore(state => state.user)
    const currentTab = useStore(state => state.currentTab)
    const setCompatible = useStore(state => state.setCompatible)
    const { setExtractedData, setExtractedDataToDefault, setFirstPageData } = useExtractedData()

    //store functions
    const { fetchProductData, fetchDataFromPage: fetchData } = functionExtractedData()

    // Styling
    const mainStyle = {
        position: "fixed",
        top: "0px",
        left: "0px",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Shadow around the overlay
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000, // Ensure it stays on top
        flexDirection: 'column',
    }

    const extensionCrawlerStyle = {
        width: '95%',
        padding: '1em',
        backgroundColor: "whitesmoke",
        height: '80vh',  // Reduce height to create space for scrolling
        borderRadius: "20px",
        overflowY: "auto",  // Enable vertical scrolling
        overflowX: "auto",  // Enable horizontal scrolling to prevent overflow from left side
    }


    //functions
    const getFirstPageData = async () => {
        const params = new URLSearchParams(location.search)
        let pageNo = params.get('page') - 1
        if (pageNo === -1) { // pageNo = -1 means that we are on the first page as undefined -1 = -1
            setFirstPageData(fetchData())
            return
        }

        //getting the url
        const urlObject = new URL(location.href)
        urlObject.searchParams.delete('page')
        const url = urlObject.toString()

        //fetching the page
        const response = await fetch(url)
        const text = await response.text()
        const parser = new DOMParser()
        const page = parser.parseFromString(text, 'text/html')

        //fetching Data
        const allData = fetchData(page)
        fetchProductData(allData)

        setFirstPageData(allData)
    }

    useEffect(() => {

        setCompatible() //refresh the compatible hook in our zustand store

        //fetching data for the first time
        setExtractedDataToDefault()
        setExtractedData(fetchData())

        // Wait until the target element exists
        const target = document.querySelector('[data-component-type="s-search-results"]')
        if (!target) return

        const observer = new MutationObserver(() => {
            //refetch data on DOM change
            setExtractedDataToDefault()
            setExtractedData(fetchData())
        })

        observer.observe(target, {
            childList: true,      // Detect added/removed nodes
            subtree: true,        // Include all descendants
            attributes: false,     // Detect attribute changes
            characterData: false,  // Detect text content changes
        })

        //setting data for first page
        getFirstPageData()

        //remove observer on component unmount for efficiency
        return () => observer.disconnect()

    }
        , [])

    // Component
    return (
        <>
            <div className="app" style={mainStyle}>
                <Notification />
                <Header />
                <div style={{ ...extensionCrawlerStyle, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                    {currentTab == "Extracted Data" && user.activated && <ExtractedDataTab />}
                    {currentTab == "Visual Analysis" && user.activated && <VisualAnalysis />}
                    {currentTab == "Niche Hunter" && user.activated && <Keywords />}
                    {currentTab == "My Parameters" && user.activated && <MyParameters />}
                    {currentTab == "My Tracked Products" && user.activated && <TrackedProducts />}
                    {currentTab == "My Account" && <MyAccount />}
                    {currentTab == "Settings" && <Settings />}

                </div>
            </div>
        </>
    )
}
