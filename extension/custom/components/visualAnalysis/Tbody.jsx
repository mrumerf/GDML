import { useExtractedData } from "../../../store/extractedData"
import useStore from "../../../store"

const Tbody = () => {

    //zustand store variables
    const { detailedData, thTdStyle, sortedData } = useExtractedData()
    const convertToLocaleString = useStore(s => s.convertToLocaleString)
    const formatPrice = useStore(s => s.formatPrice)
    const getColor = useStore((state) => state.getColor)

    return (
        <tbody>
            {sortedData.length > 0 ? sortedData.map((item) => {
                const { ASIN, imageSrc, title, price, ranking, reviews, index } = item
                const { monthly_revenue, monthly_sales, noOfPics, vid } = detailedData[ASIN] ?? { monthly_revenue: 0, monthly_sales: 0, bsr: "Loading...", category: "Loading...", creationDate: "Loading...", noOfPics: "Loading...", vid: "Loading..." }

                return (
                    <tr key={index} data-index={index}>
                        <td style={thTdStyle}><span>{index + 1}</span></td>
                        <td style={thTdStyle}>
                            <img style={picStyle} src={imageSrc} alt="Product Image" />
                        </td>
                        <td style={thTdStyle} title={title}>
                            <h2 style={{ ...titleStyle, paddingLeft: "0.5em" }}>{title}</h2>
                        </td>
                        <td style={thTdStyle}>
                            <h3>{formatPrice(price)}</h3>
                        </td>
                        <td style={{ ...thTdStyle, backgroundColor: getColor('ems', monthly_sales) }}>
                            <h3>{convertToLocaleString(monthly_sales)}</h3>
                        </td>
                        <td style={{ ...thTdStyle, backgroundColor: getColor('emr', monthly_revenue) }}>
                            <h3>{formatPrice(monthly_revenue, undefined, undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
                        </td>
                        <td style={{ ...thTdStyle, backgroundColor: getColor('gr', ranking) }}>
                            <h3>{ranking}</h3>
                        </td>
                        <td style={{ ...thTdStyle, backgroundColor: getColor('rv', reviews) }}>
                            <h3>{reviews}</h3>
                        </td>
                        <td style={{ ...thTdStyle, backgroundColor: getColor('p', noOfPics) }}>
                            <h3>{noOfPics}</h3>
                        </td>
                        <td style={{ ...thTdStyle, backgroundColor: getColor('v', vid) }}>
                            <h3>{vid}</h3>
                        </td>
                    </tr>
                )
            }) : (
                <tr>
                    <td colSpan="10" style={{ ...thTdStyle, textAlign: "center" }}>No data available</td>
                </tr>
            )}
        </tbody>
    )
}

//styles

const titleStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
}

const picStyle = {
    height: "inherit",  // Maintain aspect ratio
    objectFit: "cover"
}

export default Tbody
