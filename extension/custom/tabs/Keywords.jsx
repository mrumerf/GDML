import useStore from "../../store"
import keywords from "../../store/keywords"
import { useExtractedData } from "../../store/extractedData"

import axios from "axios"

import { useEffect, useState } from "react"

const Keywords = () => {

    //storage from zustand
    const getColor = useStore(s => s.getColor)
    const website = useStore(s => s.website)
    const marketplace = useStore(s => s.marketplace)
    const getFreeShippingInfo = useStore(s => s.getFreeShippingInfo)

    const { keywordPages, setKeywordPages, setKeywordPagesToDefault, query, aps, setAps, setQuery } = keywords()
    const { findCompetitors } = useExtractedData()

    //hooks
    const [element, setElement] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setElement(Array.from(document.querySelectorAll('#searchDropdownBox option')))
    }, [])

    //functions
    const extractData = async (item, index, length) => {
        try {

            const url = `https://www.${website}/s?k=${encodeURIComponent(item.value)}&i=${aps}`
            const dataWeb = await fetch(url).then(res => res.text())

            //Parsing to find the desired info
            const parser = new DOMParser()
            const page = parser.parseFromString(dataWeb, 'text/html')
            const productsLength = findCompetitors(page)

            //getting data for FBA
            const FbaURL = getFreeShippingInfo(page)?.element?.href

            let productsLengthFBA
            if (!FbaURL)
                productsLengthFBA = productsLength //if no FBA competitors found, set it to the same as productsLength

            else {
                const dataWebFBA = await fetch(FbaURL).then(res => res.text())

                //parsing Data for FBA page
                const parserFBA = new DOMParser()
                const pageFBA = parserFBA.parseFromString(dataWebFBA, 'text/html')

                //extracting competitors
                productsLengthFBA = findCompetitors(pageFBA)
            }

            //setting the data
            setKeywordPages({ keyWord: item.value, productsLength, productsLengthFBA, url, page })

            if (index == (length - 1))
                setLoading(false)
        } catch (err) {
            console.log(err)
        }

    }

    //handlers
    const handleZoom = (url, page) => {
        // document.write(page.documentElement.outerHTML)
        open(url, '_blank') // Opens the URL in a new tab
    }

    const handleForm = async (e) => {
        try {
            e.preventDefault()

            if (loading) return //if it's already loading, do nothing

            setLoading(true)
            setKeywordPagesToDefault([])

            const { data } = await axios.get(`https://completion.${website}/api/2017/suggestions?limit=11&prefix=${encodeURIComponent(query)}&suggestion-type=KEYWORD&page-type=Search&alias=${aps}&site-variant=desktop&version=3&event=onfocuswithsearchterm&wc=&lop=${marketplace.lop || `en_${marketplace.shortName}`}&avg-ks-time=0&fb=1&session-id=${marketplace.sessionId}&mid=${marketplace.mid}&plain-mid=${marketplace.plainMid ?? '1'}&client-info=search-ui&ni=1`)

            if (data.suggestions.length === 0) {
                //getting the data with fetch request for FBA as well
                extractData({ value: query }, 0, 1)
                return
            }

            data.suggestions?.forEach(async (item, index) => {

                //getting the data with fetch request for FBA as well
                extractData(item, index, data.suggestions.length)
            })
        } catch (err) {
            console.log(err)
            setLoading(false)
            alert("Something went wrong")
        }
    }

    //styles
    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed'  // Prevents table from expanding beyond the container
    }

    const thTdStyle = {
        border: '2px solid white',
        textAlign: 'center',
        wordWrap: 'break-word',  // Prevents text from leaking by forcing line breaks
        width: '4%',  // You can adjust this width to ensure uniformity
        height: '5vh'
    }
    const formStyle = { display: 'grid', alignItems: 'start', gap: '10px', marginBottom: '1em' }
    const selectOptionStyle = { padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '40%' }
    const inputDivStyle = { position: 'relative', display: 'inline-block', width: '94%' }
    const inputStyle = { padding: '8px 40px 8px 12px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', }
    const searchButtonStyle = { position: 'absolute', right: '.3%', top: '52%', transform: 'translateY(-50%)' }
    const buttonStyle = { padding: '5px 10px', border: 'none', backgroundColor: 'gold', color: 'black', borderRadius: '5px', cursor: 'pointer' }
    const lengthDivStyle = { width: '1px', padding: '0.75em', }
    const inlineDiv = { display: 'grid', gridTemplateColumns: '1fr 1fr', justifyContent: 'center', gap: '2em' }
    return (
        <>
            <form onSubmit={handleForm} style={formStyle}>
                <div style={{ gap: '3em', maxWidth: '600px', display: "flex" }}>
                    <select onChange={(e) => setAps(e.target.value)} value={aps} style={selectOptionStyle}>
                        <option value="">Select a Category</option>
                        {element.length > 0 ? element.map((item, index) => {
                            return <option key={index} value={item.value.replace('search-alias=', '')}>{item.innerText}</option>
                        }) :
                            <option value="aps">All Department</option>
                        }
                    </select>
                    {!aps && <h3 style={{ flex: 1, color: 'blue' }}>First, select a Category.<br></br>
                        Then you will be able to click on the “Search” button.</h3>}
                </div>
                <div style={inputDivStyle}>
                    <input type="text" name="keyword" value={query} style={inputStyle} onChange={(e) => setQuery(e.target.value)} />
                    <button type="submit" style={{ ...searchButtonStyle, ...buttonStyle, backgroundColor: !aps || !query ? '#0004' : 'gold' }} disabled={!aps || !query}>Search</button>
                </div>
            </form >
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={{ ...thTdStyle, width: '1%' }}>No.</th>
                        <th style={thTdStyle}>Niche Suggestions</th>
                        <th style={thTdStyle}>Nb of Competitors</th>
                        <th style={thTdStyle}>FBA Competitors</th>
                        <th style={thTdStyle}>See Extracted Data</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        loading &&
                        <tr ><td style={thTdStyle} colSpan={5}>Data Loading...</td></tr>
                    }
                    {
                        keywordPages.length > 0 ? keywordPages.sort((a, b) => {
                            const { productsLength: aLength, productsLengthFBA: aLengthFBA } = a
                            const { productsLength: bLength, productsLengthFBA: bLengthFBA } = b

                            if (aLength === bLength) {
                                return bLengthFBA - aLengthFBA; // Descending order for FBA if lengths are equal
                            }
                            return bLength - aLength; // Descending order for productsLength
                        })
                            .map((item, index) => {
                                const { keyWord, productsLength: length, productsLengthFBA: lengthFBA, url, page } = item

                                const backgroundColor = getColor('n-nbc', length)
                                const backgroundColorFba = getColor('n-nbfc', lengthFBA)
                                return (
                                    <tr key={index}>
                                        <td style={{ ...thTdStyle, width: '1%' }}>{index + 1}</td>
                                        <td style={thTdStyle}>{keyWord}</td>
                                        <td style={thTdStyle}>
                                            <div style={inlineDiv}>
                                                <span style={{ textAlign: 'right' }}>{length.toLocaleString()}</span>
                                                <div data-value={length.toLocaleString()} style={{ ...lengthDivStyle, backgroundColor }}></div>
                                            </div>
                                        </td>
                                        <td style={thTdStyle}>
                                            <div style={inlineDiv}>
                                                <span style={{ textAlign: 'right' }}>{lengthFBA.toLocaleString()}</span>
                                                <div data-value={lengthFBA.toLocaleString()} style={{ ...lengthDivStyle, backgroundColor: backgroundColorFba }}></div>
                                            </div>
                                        </td>
                                        <td style={thTdStyle}><button style={buttonStyle} onClick={() => handleZoom(url, page)}>Zoom</button></td>
                                    </tr>
                                )
                            })
                            :
                            <tr ><td style={thTdStyle} colSpan={5}>Results will be displayed here</td></tr>
                    }
                </tbody>
            </table>
        </>
    )
}

export default Keywords