import { useEffect, useRef, useState } from "react"
import useStore from "../../store"

const savedRes = () => {

    //hooks 
    const [savedData, setSaveData] = useState([])
    const table = useRef()

    //zustand variables
    const fetchItemData = useStore(s => s.fetchItemData)
    const website = useStore(s => s.website)
    const formatDate = useStore(s => s.formatDate)
    const formatPrice = useStore(s => s.formatPrice)
    const convertToLocaleString = useStore(s => s.convertToLocaleString)
    const marketplace = useStore(s => s.marketplace)
    const marketplaces = useStore(s => s.marketplaces)

    //functions
    const getStorageData = async () => {

        const { savedData: data } = await browser.storage.local.get('savedData')

        setSaveData(data?.map(item => ({ ...item, selected: true })) || [])

        browser.storage.onChanged.addListener((result) => {
            if (!result.savedData) return
            let { newValue } = result?.savedData ?? { newValue: [] }

            if (!newValue[newValue.length - 1]) return setSaveData([])

            newValue[newValue.length - 1].selected = true
            setSaveData(newValue || [])
        })

    }

    useEffect(() => { getStorageData() }, [])

    //handlers
    const handleRefresh = async (a, asin, i, price, mine) => {
        try {
            const newData = await fetchItemData(a, asin, { initPrice: price, mine, isGetInsights: true, credentials: 'include' }) // this is include because we want to send cookies as these requests aren't in bulk. 

            if (!newData) throw new Error("Error in fetchItemData function")

            newData.market = marketplace.shortName

            //adding and saving data
            const previousData = [...savedData]
            previousData[i] = newData
            await browser.storage.local.set({ 'savedData': previousData })

        } catch (error) {
            console.log(error)
            alert("Something went wrong")
        }
    }

    const handleDelete = async (index) => {
        const prevData = [...savedData]
        prevData.splice(index, 1)
        await browser.storage.local.set({ 'savedData': prevData })
    }

    const handleUpDown = async (item, index, newIndex) => {
        if (!index && index > newIndex) return
        const { savedData: data } = await browser.storage.local.get('savedData') || { savedData: [] }
        data.splice(index, 1)
        data.splice(newIndex, 0, item)
        await browser.storage.local.set({ savedData: data })
    }

    const handleMineChange = (e) => {
        const i = e.target.dataset.index
        const prevData = [...savedData]
        prevData[i].mine = !prevData[i].mine
        browser.storage.local.set({ savedData: prevData })
    }

    const checkSameOrigin = (link, website) => {
        try {
            const url = new URL(link)
            return url.hostname.includes(website)
        }
        catch {
            return false
        }
    }

    return (
        <table style={tableStyle} ref={table}>
            <thead>
                <tr>
                    <th style={{ ...thTdStyle, width: '2%' }}>#</th>
                    <th style={thTdStyle}>Market</th>
                    <th style={thTdStyle}>Select</th>
                    <th style={thTdStyle}>Mine</th>
                    <th style={{ ...thTdStyle, width: '5%' }}>Image</th>
                    <th style={{ ...thTdStyle, width: '17%' }}>Title</th>
                    <th style={thTdStyle}>Price</th>
                    <th style={{ ...thTdStyle, width: '7%' }}>Category</th>
                    <th style={thTdStyle}>BSR</th>
                    <th style={thTdStyle}>Monthly Sales</th>
                    <th style={{ ...thTdStyle, width: '5%' }}>Monthly Revenue</th>
                    <th style={thTdStyle}>Global Rating</th>
                    <th style={thTdStyle}>Reviews</th>
                    <th style={{ ...thTdStyle, width: '6%' }}>Creation Date</th>
                    <th style={{ ...thTdStyle, width: '6%' }}>ASIN</th>
                    <th style={thTdStyle}>Nb of Pics</th>
                    <th style={{ ...thTdStyle, width: '3%' }}>Video</th>
                    <th style={thTdStyle}>Refresh</th>
                    <th style={thTdStyle}>Delete</th>
                    <th style={thTdStyle}>Up</th>
                    <th style={thTdStyle}>Down</th>
                </tr>
            </thead>
            <tbody>
                {savedData.length > 0 ? savedData.map((item, index) => {
                    const { market, link, ASIN, vid, noOfPics, creationDate, category, bsr, title, imageSrc, price, ranking, reviews, mine, monthly_revenue, monthly_sales } = item
                    const marketplace = Object.values(marketplaces).find((item) => item.shortName === market)
                    return (
                        <tr key={index} data-index={index} style={{ backgroundColor: getColor(mine, 'random', '0') }}>
                            <td style={thTdStyle}><span>{index + 1}</span></td>
                            <td style={thTdStyle}><span>{market || '-'}</span></td>
                            <td style={thTdStyle}><input type="checkbox" defaultChecked className="genius-digger-export-checkbox" data-asin={ASIN} data-index={index} /></td>
                            <td style={thTdStyle}>
                                <input type="checkbox" data-index={index} onChange={handleMineChange} checked={mine} />
                            </td>
                            <td style={{ ...thTdStyle, width: '5%' }}>
                                <img style={picStyle} src={imageSrc} alt="Product Image" />
                            </td>
                            <td style={{ ...thTdStyle, width: '17%' }} title={title}>
                                <h2 style={{ ...titleStyle, paddingLeft: "0.5em" }}>{title}</h2>
                            </td>
                            <td style={thTdStyle}>
                                <h3>{formatPrice(price, marketplace.region, marketplace.currencyName)}</h3>
                            </td>
                            <td style={thTdStyle}>
                                <h3 style={{ ...titleStyle, whiteSpace: 'break-spaces' }} title={category}>{category ?? "Loading..."}</h3>
                            </td>
                            <td style={{ ...thTdStyle, backgroundColor: getColor(mine, 'bsr', bsr) }}>
                                <h3>{convertToLocaleString(bsr)}</h3>
                            </td>
                            <td style={thTdStyle}>
                                <h3>{convertToLocaleString(monthly_sales)}</h3>
                            </td>
                            <td style={{ ...thTdStyle, backgroundColor: getColor(mine, 'revenue', monthly_revenue) }}>
                                <h3>{formatPrice(monthly_revenue, marketplace.origin, marketplace.currencyName, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
                            </td>
                            <td style={{ ...thTdStyle, backgroundColor: getColor(mine, 'gb', Number(ranking)) }}>
                                <h3>{convertToLocaleString(ranking)}</h3>
                            </td>
                            <td style={{ ...thTdStyle, backgroundColor: getColor(mine, 'rv', reviews) }}>
                                <h3>{convertToLocaleString(reviews)}</h3>
                            </td>
                            <td style={thTdStyle}>
                                <h3>{formatDate(creationDate)}</h3>
                            </td>
                            <td style={{ ...thTdStyle }}>
                                <a target="_blank" href={link}><h3 style={{ ...titleStyle, fontSize: "0.7rem", overflow: "unset" }}>{ASIN}</h3></a>
                            </td>
                            <td style={{ ...thTdStyle, backgroundColor: getColor(mine, 'pics', Number(noOfPics)) }}>
                                <h3>{noOfPics}</h3>
                            </td>
                            <td style={{ ...thTdStyle, width: '3%', backgroundColor: getColor(mine, 'vid', vid) }}>
                                <h3>{vid}</h3>
                            </td>
                            <td style={thTdStyle}>{checkSameOrigin(link, website) && <button style={actionBtnStyle} onClick={() => handleRefresh(link, ASIN, index, price, mine)}>Refresh</button>}</td>
                            <td style={thTdStyle}><button style={actionBtnStyle} onClick={() => handleDelete(index)}>Delete</button></td>
                            <td style={thTdStyle}><button style={actionBtnStyle} onClick={() => handleUpDown(item, index, index - 1)}>Up</button></td>
                            <td style={thTdStyle}><button style={actionBtnStyle} onClick={() => handleUpDown(item, index, index + 1)}>Down</button></td>
                        </tr>
                    )
                }) : (
                    <tr>
                        <td colSpan="21" style={{ ...thTdStyle, textAlign: "center" }}>No data available</td>
                    </tr>
                )}
            </tbody>
        </table >
    )
}

//styles
const getColor = (mine, type, stringValue) => {
    if (mine) return ' var(--blue)'
    return 'unset'

    let value = stringValue
    if (typeof stringValue === 'string') {
        value = Number(stringValue.replace(',', '').replaceAll('$', '').replaceAll('K', '').replaceAll('M', '').replaceAll('B', ''))

        if (stringValue.includes('K')) value *= 1000
        if (stringValue.includes('M')) value *= 1000000
        if (stringValue.includes('B')) value *= 1000000000
    }

    switch (type) {

        case 'gb':
            if (value < 4) return ' #4bff00'
            if (value < 4.3) return ' #ffee08'
            return ' #fe0000'

        case 'rv':
            if (value < 50) return ' #4bff00'
            if (value < 150) return ' #ffee08'
            return ' #fe0000'

        case 'bsr':
            if (value > 50000) return ' #4bff00'
            if (value > 20000) return ' #ffee08'
            return ' #fe0000'

        case 'pics':
            if (!value) return 'unset'
            if (value < 5) return ' #4bff00'
            if (value < 7) return ' #ffee08'
            return ' #fe0000'

        case 'vid':
            if (/^no$/i.test(stringValue)) return ' #4bff00'
            return ' #fe0000'

        case 'revenue':
            if (!value) return 'unset'
            if (value > 2000) return ' #4bff00'
            if (value > 500) return ' #ffee08'
            return ' #fe0000'

        default: return 'unset'
    }
}

const actionBtnStyle = {
    maxWidth: '100%',
    fontSize: '.7rem',
    paddingInline: '.1em',
    cursor: 'pointer'
}

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed'  // Prevents table from expanding beyond the container
}

const thTdStyle = {
    border: '2px solid white',
    textAlign: 'center',
    width: '4%',  // You can adjust this width to ensure uniformity
    height: '5vh'
}

const titleStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
}

const picStyle = {
    height: "inherit",  // Maintain aspect ratio
    objectFit: "cover"
}


export default savedRes