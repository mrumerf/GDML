import useStore from "../../../store"
import { useExtractedData } from "../../../store/extractedData"
import { memo } from "react"

const titleStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
}

const picStyle = {
    height: "inherit",  // Maintain aspect ratio
    objectFit: "cover"
}

const saveButtonStyle = { cursor: 'pointer' }

const Tbody = () => {
    //zustand store variables
    const { detailedData, thTdStyle, sortedData, toggleChecked } = useExtractedData()
    const fetchItemData = useStore(s => s.fetchItemData)
    const convertToLocaleString = useStore(s => s.convertToLocaleString)
    const formatPrice = useStore(s => s.formatPrice)
    const marketplace = useStore(s => s.marketplace)

    //event listeners
    const handleSave = async (item, price) => {
        try {
            const { ASIN, link: a } = item

            //checking if the previous value of this data exists
            const resultOne = (await browser.storage.local.get('savedData')) ?? { savedData: [] };
            const previousData = resultOne.savedData ?? []
            const checkDataVar = previousData.some(item => item.ASIN == ASIN && item.market == marketplace.shortName)
            if (checkDataVar) return

            //if not then continue
            const savedData = await fetchItemData(a, ASIN, { initPrice: price, mine: false, isGetInsights: true, isFirstPage: undefined, credentials: 'include' }) // include because we want to send cookies as these requests aren't in bulk.

            if (!savedData) throw new Error("Error in fetchItemData function")

            savedData.market = marketplace.shortName


            //saving data
            const result = await browser.storage.local.get('savedData')

            //again checking the data because there is going to be a difference in time because of the fetch request
            const previousVal = result.savedData ?? []
            const checkDataVarAgain = previousVal.some(item => item.ASIN == ASIN && item.market == marketplace.shortName)
            if (checkDataVarAgain) return

            previousVal.push(savedData)
            await browser.storage.local.set({ 'savedData': previousVal })
        } catch (err) {
            console.log(err)
            alert("Something went wrong")
        }
    }


    return (
        <tbody>
            {sortedData.length > 0 ? (
                sortedData.map((item, index) => (
                    <ProductRow
                        key={index} // Use ASIN for more stable keying
                        item={item}
                        details={detailedData[item.title]} // Pass only this row's data
                        thTdStyle={thTdStyle}
                        formatPrice={formatPrice}
                        convertToLocaleString={convertToLocaleString}
                        handleSave={handleSave}
                        toggleChecked={toggleChecked}
                    />
                ))
            ) : (
                <tr>
                    <td colSpan="14" style={{ ...thTdStyle, textAlign: "center" }}>No data available</td>
                </tr>
            )}
        </tbody>
    );
}

const ProductRow = memo(({
    item,
    details,
    thTdStyle,
    formatPrice,
    convertToLocaleString,
    toggleChecked
}) => {
    const { ASIN, imageSrc, title, link, price, index, selected, full } = item;

    // Fallback if details aren't loaded yet
    const {
        monthly_revenue, monthly_sales, secondPrice, publicationNumber: publication = 0, ranking = 0, reviews = 0
    } = details ?? {
        monthly_revenue: 0, monthly_sales: 0, publication: 0, ranking: 0, reviews: 0
    };
    console.log(details)
    return (
        <tr data-index={index}>
            <td style={thTdStyle}><span>{index + 1}</span></td>
            <td style={thTdStyle}>
                <input type="checkbox" checked={selected} onChange={() => toggleChecked(ASIN)} className="genius-digger-export-checkbox" />
            </td>
            <td style={thTdStyle}><img style={picStyle} src={imageSrc} alt="Product" /></td>
            <td style={thTdStyle} title={title}><h2 style={{ ...titleStyle, paddingLeft: "0.5em" }}>{title}</h2></td>
            <td style={thTdStyle}><h3>{formatPrice(price || secondPrice || 0)}</h3></td>
            <td style={thTdStyle}><h3>{convertToLocaleString(monthly_sales)}</h3></td>
            <td style={thTdStyle}><h3>{formatPrice(monthly_revenue, undefined, undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3></td>
            <td style={thTdStyle}><h3>{convertToLocaleString(ranking)}</h3></td>
            <td style={thTdStyle}><h3>{convertToLocaleString(reviews)}</h3></td>
            <td style={thTdStyle}><h3>{full ? 'Yes' : 'No'}</h3></td>
            <td style={{ ...thTdStyle, fontSize: '.75rem' }}>
                <a target="_blank" href={link}><h3 style={{ ...titleStyle, overflow: "unset" }}>{publication || "Link"}</h3></a>
            </td>
        </tr>
    );
}, (prev, next) => {
    // ONLY re-render if the specific data for THIS row changed
    return (
        prev.details === next.details &&
        prev.item.selected === next.item.selected &&
        prev.item.index === next.item.index
    );
});

export default Tbody