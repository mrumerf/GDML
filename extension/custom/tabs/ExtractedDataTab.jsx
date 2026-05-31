import { useEffect, useRef, useState } from "react"
import NotCompatible from "../components/notCompatible.jsx"
import THead from '../components/extractedData/Thead'
import TBody from '../components/extractedData/Tbody'
import { functionExtractedData, useExtractedData } from "../../store/extractedData"
import useStore from "../../store/index.js"

const ExtractedDataTab = () => {

    //store variable
    const { extractedData, setExtractedData, findNextPageUrl } = useExtractedData()
    const { fetchProductData, fetchDataFromPage } = functionExtractedData()
    const compatible = useStore(s => s.compatible)

    //hooks
    const [nextPageUrl, setNextPageUrl] = useState('')

    const table = useRef()

    useEffect(() => {
        if (extractedData.length === 0) return //if nothing is in extractedData don't call the function
        console.log('running fetchProductData from extractedDataTab')
        fetchProductData(extractedData)

    }, [extractedData])

    useEffect(() => {
        setNextPageUrl(findNextPageUrl())
    }, [])

    //styles
    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',  // Prevents table from expanding beyond the container
        marginTop: "-10px"
    }

    const buttonStyle = {
        width: "100%",
        padding: ".75em",
        marginBlock: " 1em",
        borderRadius: " 25px",
        cursor: 'pointer'
    }

    //handlers
    const handleButton = async (e) => {
        e.target.disabled = true
        e.target.style.cursor = 'unset'
        const response = await fetch(nextPageUrl)
        const data = await response.text()
        const parser = new DOMParser()
        const page = parser.parseFromString(data, 'text/html')

        const prevLength = (extractedData.length)
        const allData = fetchDataFromPage(page, prevLength)

        setExtractedData(allData, prevLength)
    }

    return (

        compatible ? (
            <>
                <table style={tableStyle} ref={table}>
                    <THead />
                    <TBody />
                </table >
                <button style={buttonStyle} data-href={nextPageUrl} onClick={handleButton}>Add results from the next page</button>
            </>
        ) : (
            <NotCompatible />
        )

    )
}

export default ExtractedDataTab