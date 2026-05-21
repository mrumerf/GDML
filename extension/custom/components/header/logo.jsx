import useStore from '../../../store'
import { useExtractedData } from '../../../store/extractedData.js'

const logo = () => {

    //store variables
    const { hideElement, logout, currentTab, setCurrentTab, setLastTab, user } = useStore()
    const { extractedData, detailedData } = useExtractedData()

    //handlers
    const downloadCSV = async () => {
        try {
            const shadowHost = document.querySelector('plasmo-csui');
            if (!shadowHost) return alert("Something went wrong");

            let asins

            if (currentTab == 'Extracted Data')
                asins = extractedData.filter(item => item.selected).map(item => item.ASIN)
            else
                asins = Array.from(shadowHost.shadowRoot.querySelectorAll('input[type="checkbox"]:checked.genius-digger-export-checkbox'))
                    .map(item => item.dataset.asin);

            if (asins.length === 0)
                return alert("No items selected");

            const headers = [
                "#", "Title", "Price", "Category", "BSR", "Monthly Sales", "Monthly Revenue",
                "Global Rating", "Reviews", "Creation Date", "ASIN", "No. of Pics", "Video",
                "Product Link"
            ];

            let { savedData: data } = await browser.storage.local.get('savedData') || { savedData: [] }

            if (currentTab == 'Extracted Data' && asins.length > Object.keys(detailedData).length) {
                alert("Some data is not loaded yet. Try again when all the data is loaded. ")
                return
            }

            const rows = asins.map((asin, index) => {

                let item, itemDetail

                if (currentTab == 'Extracted Data') {
                    item = extractedData.find(item => item.ASIN === asin);
                    itemDetail = detailedData[asin]
                } else {
                    item = data.find(item => item.ASIN === asin);
                    itemDetail = item
                }
                if (!item.title) return alert("Something went wrong please try again later");

                return [
                    index + 1,
                    item.title || "",
                    item.price || "",
                    itemDetail?.category || "",
                    itemDetail?.bsr || "",
                    itemDetail?.monthly_sales || "",
                    itemDetail?.monthly_revenue || "",
                    item.ranking || "",
                    item.reviews || "",
                    formatDate(itemDetail?.creationDate) || "",
                    asin || "",
                    itemDetail?.noOfPics || "",
                    itemDetail?.vid || "",
                    item.link || ""
                ].map(item => formatCSVValue(item)).join(",");
            }).filter(Boolean);

            if (rows.length === 0) {
                return alert("No valid data to export");
            }

            const csvContent = [headers.join(","), ...rows].join("\n");

            const fileName = getFormattedTimestamp()

            const blob = new Blob([csvContent], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.log(e)
            alert("Something went wrong. Please try again later!")
        }
    }

    //functions
    function getFormattedTimestamp() {
        const now = new Date(); // This gets the system's local time

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        return `export${year}${month}${day}${hours}${minutes}${seconds}.csv`;
    }

    const formatDate = (dateValue) => {

        if (!dateValue) return "None"

        const date = new Date(dateValue)
        return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    }

    const formatCSVValue = (value) => {
        if (typeof value === "string") {
            return `"${value.replace(/"/g, '""')}"`; // Escape double quotes by doubling them
        }
        return value ?? ""; // Return value or empty string if undefined/null
    };

    const handleSettings = () => {
        if (currentTab !== 'Settings')
            setLastTab(currentTab)
        setCurrentTab('Settings')
    }

    const handleInbox = () => {
        open(import.meta.env.VITE_PUBLIC_DOMAIN + '/contact-us/', '_blank')
    }

    return (
        <>
            <div id='header-extension' >

                <div className='logo-container'>
                    {/* <img src={logoImage} alt="Logo" /> */}
                    <h1 id='main-title'>GDML</h1>
                    <span id='version-number'>
                        {/* v{browser.runtime.getManifest().version} */}
                    </span>

                </div>

                <div className='right-stack-wrapper'>

                    <div className='top-icon-row'>

                        {/* Logout Icon */
                            user && user.logged &&
                            <svg xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" fill="#000" version="1.1" id="Layer_1" viewBox="0 0 512 512" space="preserve" className='svg logout-svg' onClick={logout}>
                                <title>Logout</title>
                                <g>
                                    <g>
                                        <path d="M256.004,0c-10.876,0-19.694,8.818-19.694,19.694v137.858c0,10.876,8.816,19.694,19.694,19.694    c10.876,0,19.694-8.818,19.694-19.694V19.694C275.698,8.818,266.88,0,256.004,0z" />
                                    </g>
                                </g>
                                <g>
                                    <g>
                                        <path d="M445.806,153.344c-25.441-37.223-60.761-65.947-102.141-83.071c-6.076-2.514-13.027-1.829-18.495,1.825    c-5.467,3.655-8.77,9.797-8.77,16.374v41.319c0,7.309,4.069,14.018,10.536,17.424c50.603,26.654,82.049,78.514,82.049,135.341    c0,84.132-68.522,152.578-152.753,152.578c-84.386,0-153.037-68.446-153.037-152.578c0-55.718,30.488-107.092,79.597-134.074    c6.298-3.46,10.192-10.075,10.192-17.26V89.579c0-6.624-3.31-12.804-8.841-16.447c-5.531-3.643-12.516-4.263-18.6-1.645    C80.912,107.869,26.234,190.718,26.234,282.555C26.234,409.071,129.248,512,255.866,512c126.766,0,229.9-102.929,229.9-229.445    C485.766,236.274,471.949,191.594,445.806,153.344z" />
                                    </g>
                                </g>
                            </svg>
                        }

                        {/* Envelop/Inbox */
                            <svg className='svg' xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" fill="#000000" height="800px" width="800px" version="1.1" id="Capa_1" viewBox="0 0 382.117 382.117" space="preserve" onClick={handleInbox}>
                                <title>Report a bug/Contact us</title>
                                <path d="M336.764,45.945H45.354C20.346,45.945,0,65.484,0,89.5v203.117c0,24.016,20.346,43.555,45.354,43.555h291.41  c25.008,0,45.353-19.539,45.353-43.555V89.5C382.117,65.484,361.772,45.945,336.764,45.945z M336.764,297.72H45.354  c-3.676,0-6.9-2.384-6.9-5.103V116.359l131.797,111.27c2.702,2.282,6.138,3.538,9.676,3.538l22.259,0.001  c3.536,0,6.974-1.257,9.677-3.539l131.803-111.274v176.264C343.664,295.336,340.439,297.72,336.764,297.72z M191.059,192.987  L62.87,84.397h256.378L191.059,192.987z" />
                            </svg>
                        }

                        {/* settings icon */
                            user && user.logged && user.activated &&
                            <svg xmlns="http://www.w3.org/2000/svg" fill='#000' x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50" className='svg' onClick={handleSettings}>
                                <title>Settings</title>
                                <path d="M47.16,21.221l-5.91-0.966c-0.346-1.186-0.819-2.326-1.411-3.405l3.45-4.917c0.279-0.397,0.231-0.938-0.112-1.282 l-3.889-3.887c-0.347-0.346-0.893-0.391-1.291-0.104l-4.843,3.481c-1.089-0.602-2.239-1.08-3.432-1.427l-1.031-5.886 C28.607,2.35,28.192,2,27.706,2h-5.5c-0.49,0-0.908,0.355-0.987,0.839l-0.956,5.854c-1.2,0.345-2.352,0.818-3.437,1.412l-4.83-3.45 c-0.399-0.285-0.942-0.239-1.289,0.106L6.82,10.648c-0.343,0.343-0.391,0.883-0.112,1.28l3.399,4.863 c-0.605,1.095-1.087,2.254-1.438,3.46l-5.831,0.971c-0.482,0.08-0.836,0.498-0.836,0.986v5.5c0,0.485,0.348,0.9,0.825,0.985 l5.831,1.034c0.349,1.203,0.831,2.362,1.438,3.46l-3.441,4.813c-0.284,0.397-0.239,0.942,0.106,1.289l3.888,3.891 c0.343,0.343,0.884,0.391,1.281,0.112l4.87-3.411c1.093,0.601,2.248,1.078,3.445,1.424l0.976,5.861C21.3,47.647,21.717,48,22.206,48 h5.5c0.485,0,0.9-0.348,0.984-0.825l1.045-5.89c1.199-0.353,2.348-0.833,3.43-1.435l4.905,3.441 c0.398,0.281,0.938,0.232,1.282-0.111l3.888-3.891c0.346-0.347,0.391-0.894,0.104-1.292l-3.498-4.857 c0.593-1.08,1.064-2.222,1.407-3.408l5.918-1.039c0.479-0.084,0.827-0.5,0.827-0.985v-5.5C47.999,21.718,47.644,21.3,47.16,21.221z M25,32c-3.866,0-7-3.134-7-7c0-3.866,3.134-7,7-7s7,3.134,7,7C32,28.866,28.866,32,25,32z"></path>
                            </svg>
                        }

                        {/* {Download button */
                            (currentTab == 'Extracted Data' || currentTab == 'My Tracked Products') &&
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="#000"
                                viewBox="0 0 24 24"
                                className='svg'
                                onClick={downloadCSV}
                            >
                                <title>Download the results</title>
                                <path d="M12 2c.83 0 1.5.67 1.5 1.5v9.19l2.15-2.15a1.5 1.5 0 1 1 2.12 2.12l-4.94 4.94a1.5 1.5 0 0 1-2.12 0l-4.94-4.94a1.5 1.5 0 1 1 2.12-2.12L10.5 12.69V3.5C10.5 2.67 11.17 2 12 2ZM4 17.5c0-.83.67-1.5 1.5-1.5h13c.83 0 1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5h-13c-.83 0-1.5-.67-1.5-1.5v-3Z" />
                            </svg>

                        }

                        <h2 className='close-button' onClick={hideElement} title='Close the Extension'>CLOSE</h2>
                    </div>

                </div>
            </div>
        </>
    )
}


export default logo