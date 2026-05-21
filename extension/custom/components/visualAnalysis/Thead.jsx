import { useEffect } from "react";
import { useExtractedData } from "../../../store/extractedData";
import useStore from "../../../store";

const Thead = () => {

    //store variables
    const { detailedData, extractedData, setSortedData, thTdStyle, sortConfig, setSortConfig } = useExtractedData()
    const convertToNumber = useStore(s => s.convertToNumber)

    //useEffect
    useEffect(() => {
        setSortedData(() => {
            return [...extractedData.sort((a, b) => {
                const { ASIN: asinA, title: titleA, price: priceA, ranking: rankingA, reviews: reviewsA } = a
                const { ASIN: asinB, title: titleB, price: priceB, ranking: rankingB, reviews: reviewsB } = b
                let addDataA = detailedData[asinA]
                let addDataB = detailedData[asinB]
                switch (sortConfig.key) {
                    case 'title':
                        return sortConfig.isAccending ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA)
                    case 'price':
                        return sortConfig.isAccending ? convertToNumber(priceA) - convertToNumber(priceB) : convertToNumber(priceB) - convertToNumber(priceA)
                    case 'category':
                        return sortConfig.isAccending ? addDataA?.category?.localeCompare(addDataB?.category) : addDataB?.category?.localeCompare(addDataA?.category)
                    case 'bsr':
                        return sortConfig.isAccending ? convertToNumber(addDataA?.bsr) - convertToNumber(addDataB?.bsr) : convertToNumber(addDataB?.bsr) - convertToNumber(addDataA?.bsr)
                    case 'monthly sales':
                        return sortConfig.isAccending ? convertToNumber(addDataA?.monthly_sales) - convertToNumber(addDataB?.monthly_sales) : convertToNumber(addDataB?.monthly_sales) - convertToNumber(addDataA?.monthly_sales)
                    case 'monthly revenue':
                        return sortConfig.isAccending ? convertToNumber(addDataA?.monthly_revenue) - convertToNumber(addDataB?.monthly_revenue) : convertToNumber(addDataB?.monthly_revenue) - convertToNumber(addDataA?.monthly_revenue)
                    case 'global rating':
                        return sortConfig.isAccending ? convertToNumber(rankingA) - convertToNumber(rankingB) : convertToNumber(rankingB) - convertToNumber(rankingA)
                    case 'reviews':
                        return sortConfig.isAccending ? convertToNumber(reviewsA) - convertToNumber(reviewsB) : convertToNumber(reviewsB) - convertToNumber(reviewsA)
                    case 'creation date':
                        return sortConfig.isAccending ? new Date(addDataA?.creationDate) - new Date(addDataB?.creationDate) : new Date(addDataB?.creationDate) - new Date(addDataA?.creationDate)
                    case 'ASIN':
                        return sortConfig.isAccending ? asinA.localeCompare(asinB) : asinB.localeCompare(asinA)
                    case 'no. of pics':
                        return sortConfig.isAccending ? convertToNumber(addDataA?.noOfPics) - convertToNumber(addDataB?.noOfPics) : convertToNumber(addDataB?.noOfPics) - convertToNumber(addDataA?.noOfPics)
                    case 'video':
                        return sortConfig.isAccending ? addDataA?.vid.localeCompare(addDataB?.vid) : addDataB?.vid.localeCompare(addDataA?.vid)
                    case 'index':
                        return sortConfig.isAccending ? a.index - b.index : b.index - a.index
                    default:    // If no key is provided, return the original array
                        return a.index - b.index
                }
            })];
        })
    }, [sortConfig, detailedData, extractedData])

    //functions
    const handleSort = (key) => {
        setSortConfig(key);
    }

    //constants
    //headers
    const columns = [
        { key: "index", label: "#", width: "2%" },
        { key: "image", label: "Image", width: "5%", sortable: false },
        { key: "title", label: "Title", width: "35%" },
        { key: "price", label: "Price" },
        { key: "monthly sales", label: "Monthly Sales" },
        { key: "monthly revenue", label: "Monthly Revenue" },
        { key: "global rating", label: "Global Rating" },
        { key: "reviews", label: "Reviews" },
        { key: "no. of pics", label: "Nb of Pics" },
        { key: "video", label: "Video" },
    ];

    return (
        <thead>
            <tr>
                {columns.map(({ key, label, width, sortable = true }) => (
                    <th
                        key={key}
                        style={{ ...thTdStyle, width }}
                        onClick={sortable ? () => handleSort(key) : undefined}
                    >
                        {label}
                    </th>
                ))}
            </tr>
        </thead>
    )
}

export default Thead