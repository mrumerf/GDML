import { useEffect, useState } from 'react'
import { useHeaders } from '../../../store/headers';
import { useExtractedData } from '../../../store/extractedData';
import useStore from '../../../store';

const Inputs = () => {
    //store variables
    const getColor = useStore(state => state.getColor)
    const convertToNumber = useStore(s => s.convertToNumber)
    const convertToLocaleString = useStore(s => s.convertToLocaleString)
    const formatPrice = useStore(s => s.formatPrice)
    const marketplace = useStore(s => s.marketplace)
    const getFreeShippingInfo = useStore(s => s.getFreeShippingInfo)
    const hasResults = useStore(s => s.hasResults)

    const { setResultsAndFbaResults, fbaResults } = useHeaders() //these values are here for a good reason
    const { extractedData, findCompetitors, detailedData, firstPageData } = useExtractedData()

    //use state hook
    const [results, setResults] = useState(0)
    const [resultsShown, setResultsShown] = useState(0)
    const [avPrice, setAvPrice] = useState(0)
    const [avReviews, setAvReviews] = useState(0)
    const [avRating, setAvRating] = useState(0)
    const [researchName, setResearchName] = useState('')
    const [full, setFull] = useState(false)
    const [avMonthlyRevenue, setAvMonthlyRevenue] = useState(0)
    const [firstPage, setFirstPage] = useState(0)
    const [tMonthlyRevenue, setTMonthlyRevenue] = useState(0)
    const [goodSellingListings, setGoodSellingListings] = useState(0)
    const [pageNumber, setPageNumber] = useState(0)
    const [globalScore, setGlobalScore] = useState(0)

    //useEffect
    useEffect(() => {

        //setting page number and results shown
        const method1 = Array.from(document.querySelectorAll('h1 span')).find(item => item.textContent.includes('results for'))?.textContent.replace('over ', '') ?? ""
        let result

        if (method1) {
            result = method1?.includes('-') ? method1.split(' ')[0] : convertToNumber(method1) ?? "0" //this is for the normal version of amazon 

            setResultsShown(result)
        }
        else {
            result = Array.from(document.querySelectorAll('h2>span')).find(item => hasResults(item.textContent))?.textContent?.replace(' a ', '-').trim()?.split(' ')[0] ?? '0';

            if (result && result != "0") setResultsShown(result)
        }
        const searchParams = new URLSearchParams(location.search)
        const page = searchParams.get('page') ?? 1
        setPageNumber(page)

    }, [])

    useEffect(() => {

        //starting code block for finding average price, reviews and rating
        const length = extractedData.length
        let allPrice = 0
        let allReview = 0
        let allRating = 0

        //finding average for header inputs
        extractedData.forEach(item => {
            let { price, ranking, reviews } = item;

            // Getting the average price
            allPrice += convertToNumber(price);

            // Getting the average reviews
            allReview += convertToNumber(reviews);

            // Getting the average rating
            allRating += convertToNumber(ranking);
        });


        //setting header input values
        setAvPrice(Number((allPrice / length).toFixed(2)) || 0)
        setAvReviews(Number((allReview / length).toFixed(0)) || 0)
        setAvRating(Number((allRating / length).toFixed(1)) || 0)

        //setting search name
        const competitorsData = findCompetitors(document)
        setResearchName(document.querySelector('.nav-search input').value)

        //setting Full marked or not
        setFull(document.querySelector('#shipping_highlighted_fulfillment')?.checked)

        // setting results
        setResults(convertToNumber(document.querySelector('.ui-search-search-result__quantity-results')?.textContent))

    }, [extractedData])

    useEffect(() => {
        if (!firstPageData.length) return;

        // Extract ASINs from extractedData
        const asinSet = new Set(firstPageData.map(item => item.ASIN));

        // Filter detailedData by ASIN keys
        const filteredDetails = Object.keys(detailedData)
            .filter(asin => asinSet.has(asin))
            .map(asin => detailedData[asin]);

        // Extract monthly sales values
        const monthlySalesValues = filteredDetails.map(({ monthly_sales }) => monthly_sales).filter(Boolean);
        setFirstPage(monthlySalesValues.length ? Math.min(...monthlySalesValues) : '-');

        //setting good selling listings
        const goodSellingListings = filteredDetails.filter(({ monthly_sales }) => monthly_sales >= 100).length;
        setGoodSellingListings(goodSellingListings);

    }, [firstPageData, detailedData])

    useEffect(() => {
        if (!extractedData.length) return;

        // Extract ASINs from extractedData
        const asinSet = new Set(extractedData.map(item => item.ASIN));

        // Filter detailedData by ASIN keys
        const filteredDetails = Object.keys(detailedData)
            .filter(asin => asinSet.has(asin))
            .map(asin => detailedData[asin]);

        // Extract monthly revenue values
        const monthlyRevenueValues = filteredDetails.map(({ monthly_revenue }) => monthly_revenue);
        const totalRevenue = monthlyRevenueValues.reduce((sum, num) => sum + num, 0);
        setTMonthlyRevenue(totalRevenue);

        setAvMonthlyRevenue(monthlyRevenueValues.length ? Math.round(totalRevenue / monthlyRevenueValues.length) : 0);

    }, [detailedData, extractedData]); // Depend on detailedData and extractedData

    useEffect(() => {
        const firstPageScore = getScore(getColor('fp', firstPage))
        const fbaResultsScore = getScore(getColor('fr', fbaResults))
        const avMonthlyRevenueScore = getScore(getColor('amr', avMonthlyRevenue))
        const goodSellingListingsScore = getScore(getColor('ms', goodSellingListings))

        let totalScore = 0;

        if (!(firstPageScore && fbaResultsScore && avMonthlyRevenueScore && goodSellingListingsScore))
            totalScore = firstPageScore + fbaResultsScore + avMonthlyRevenueScore + goodSellingListingsScore
        else
            totalScore = firstPageScore + (fbaResultsScore * 1.5) + (goodSellingListingsScore * 1.5) + avMonthlyRevenueScore

        setGlobalScore(Math.round(totalScore))
    }, [fbaResults, firstPage, avMonthlyRevenue, goodSellingListings])

    //functions
    const getScore = (color) => {
        switch (color) {
            case 'var(--green)':
                return 2;
            case 'var(--orange)':
                return 1;
            case 'var(--red)':
                return 0;
            default:
                return 0;
        }
    }

    return (
        <div id='header-stats'>

            <div className={`inner-container first ${!resultsShown && "page-number"}`}>
                <div className="outer-wrapper a"><span className="span-title">{resultsShown ? "Shown Results" : "Page Number"}</span><div className="input-span"> {convertToLocaleString(resultsShown) || convertToLocaleString(pageNumber)}</div></div>
                <div className="outer-wrapper b"><span className="span-title">Total Revenue</span><div className="input-span">{convertToLocaleString(tMonthlyRevenue)}</div></div>
                <div className="outer-wrapper c">
                    <span className="span-title">Research</span>
                    <div className="input-span" title={researchName}>

                        <span>
                            {researchName}&#8203;
                        </span>

                        <div className='absolute-container'>
                            <input type="checkbox" readOnly checked={!!full} />
                            <span >FBA</span>
                            <span className='short-name'>{marketplace.shortName}</span>
                        </div>

                    </div>
                </div>
                <div className="outer-wrapper d"><span className="span-title">Avg Price</span><div className="input-span">{formatPrice(avPrice).replace(/[^\d.,\s]+/g, "")}</div></div>
                <div className="outer-wrapper e"><span className="span-title">Avg Rating (/5)</span><div className="input-span">{convertToLocaleString(avRating, { minimumFractionDigits: 1 })}</div></div>
                <div className="outer-wrapper f"><span className="span-title">Avg Reviews</span><div className="input-span">{convertToLocaleString(avReviews)}</div></div>
            </div>

            <div className='inner-container second'>
                <div title='Total number of listings' className={`outer-wrapper a`} >
                    <span className="span-title" style={{ color: getColor('n-nbc', results, '#000') }} >Results</span>
                    <div className="input-span" style={{ backgroundColor: getColor('n-nbc', results, '#fff') }}>{convertToLocaleString(results)}</div></div>
                <div title='Number of listings delivered thru FBA' className={`outer-wrapper b`}>
                    <span className="span-title" style={{ color: getColor('fr', fbaResults, '#000') }} >FBA Results</span>
                    <div className="input-span" style={{ backgroundColor: getColor('fr', fbaResults, '#fff') }}>{convertToLocaleString(fbaResults)}</div></div>
                <div title='Minimum “Monthly sales” to appear on the “first page of results”' className={`outer-wrapper c`}>
                    <span className="span-title" style={{ color: getColor('fp', firstPage, '#000') }} >First Page</span>
                    <div className="input-span" style={{ backgroundColor: getColor('fp', firstPage, '#fff') }}>{convertToLocaleString(firstPage)}</div></div>
                <div title='Average Monthly Revenue of the listings displayed on this page' className={`outer-wrapper d`}>
                    <span className="span-title" style={{ color: getColor('amr', avMonthlyRevenue, '#000') }} >Avg Monthly Revenue</span>
                    <div className="input-span" style={{ backgroundColor: getColor('amr', avMonthlyRevenue, '#fff') }}>{avMonthlyRevenue === NaN ? 0 : convertToLocaleString(avMonthlyRevenue)}</div></div>
                <div title='Number of listings on the “first page of results” that sell more than 100 units/month' className={`outer-wrapper e`}>
                    <span className="span-title" style={{ color: getColor('ms', goodSellingListings, '#000') }} >Good Share</span>
                    <div className="input-span" style={{ backgroundColor: getColor('ms', goodSellingListings, '#fff') }}>{convertToLocaleString(goodSellingListings)}</div></div>
                <div className="outer-wrapper f color-box">
                    <div className='color-label a' style={{ backgroundColor: getColor('fr', fbaResults, '#000') }}></div>
                    <div className='color-label b' style={{ backgroundColor: getColor('fp', firstPage, '#000') }}></div>
                    <div className='color-label c' style={{ backgroundColor: getColor('amr', avMonthlyRevenue, '#000') }}></div>
                    <div className='color-label d' style={{ backgroundColor: getColor('ms', goodSellingListings, '#000') }}></div>
                    <div id="score" style={{ left: globalScore >= 10 ? "47%" : 'revert-layer' }}>{globalScore}</div>
                </div>
            </div>

        </div>
    )
}

// styling

export default Inputs