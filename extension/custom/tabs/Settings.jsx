import { useEffect, useState } from 'react';
import useStore from '../../store';

const Settings = () => {

    const [isProxy, setIsProxy] = useState(false)
    const [proxyUrl, setProxyUrl] = useState('')

    const goBack = useStore(state => state.goBack)

    useEffect(() => {
        browser.storage.local.get(["isProxy", "proxyUrl"]).then(result => { setIsProxy(result?.isProxy); setProxyUrl(result?.proxyUrl ?? '') })
    }, [])

    useEffect(() => {
        browser.storage.local.set({ 'isProxy': isProxy })
    }, [isProxy])

    //event handlers
    const handleClean = () => {
        // Clear cookies and cache logic here
        browser.runtime.sendMessage({ action: "clearBrowsingData" })
        alert("Cache and cookies cleared for all Amazon websites and for this Extension.");
    };

    const handleForm = (e) => {
        e.preventDefault()
        browser.storage.local.set({ 'proxyUrl': proxyUrl })
        alert('Proxy url saved')
    }

    return (
        <>
            <div style={mainContainer}>

                <div style={container}>
                    <h2 style={heading}>Cleansing</h2>

                    <div style={card}>
                        <p style={description}>
                            This button will remove the cache and cookies from all Amazon websites and from this extension.
                        </p>
                        <button style={primaryButton} onClick={handleClean}>🧹 Clean cache and cookies</button>
                    </div>

                </div>

                {/* <div style={container}>
                    <h2 style={heading}>Use A Proxy</h2>

                    <div style={card}>
                        <p style={description}>
                            Click the check-box if you want to use a proxy.
                        </p>
                        <label style={inputCheckbox}>
                            <input type="checkbox" name="proxy" checked={isProxy} onChange={() => setIsProxy(prev => !prev)} />
                            <span >I want to use my proxy</span>
                        </label>
                        {isProxy && (
                            <form onSubmit={handleForm}>
                                <p style={instructions}>Enter the full URL of your proxy service here. This is usually provided by services like ScraperAPI, ZenRows, or similar. The URL should include your API key and look something like this:
                                    <br />
                                    <strong>
                                        https://api.scraperapi.com/?api_key=YOUR_KEY&url=[URL]
                                    </strong><br />
                                    Make sure it contains [URL] — this is where the website link (like Amazon.com) will be inserted automatically. If you're unsure, copy the link exactly as your proxy provider gave you.</p>
                                <input style={inputStyle} type="text" required name='proxy-url' value={proxyUrl} onChange={(e) => setProxyUrl(e.target.value)} pattern='^http|https?:\/\/.*(\{URL\}|\[URL\])' placeholder='https://example.com/?api_key=YOUR_KEY&url=[URL]' />
                                <button style={primaryButton} type='submit' >Save</button>
                            </form>
                        )}
                    </div>

                </div> */}

            </div>

            <div style={buttonDiv}>
                <button style={primaryButton} onClick={goBack}>⬅ Come back to main screen</button>
            </div>
        </>

    )
}

// Styling

const mainContainer = {
    display: 'flex',
    justifyContent: 'center',
    padding: '3em 8vw',
}

const instructions = {
    fontSize: '.8rem'
}

const container = {
    borderRadius: '10px',
    border: '2px solid #5A83F1',
    padding: "2em",
    fontFamily: "Segoe UI, sans-serif",
    color: "#222",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.5em",
    width: 'fit-content'
};

const inputStyle = {
    padding: '.5em',
    borderRadius: '8px',
    marginBlock: '1em',
    width: '100%'
}

const buttonDiv = {
    display: 'flex',
    justifyContent: 'center'
}

const inputCheckbox = {
    color: ' #5A83F1',
    display: 'block'
}

const heading = {
    fontSize: "1.5em",
    color: "#5A83F1",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: 600,
};

const card = {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "1.5em",
    background: "#fdfdfd",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "450px",
};

const description = {
    fontSize: "1em",
    marginBottom: "1em",
    color: "#333",
};

const primaryButton = {
    padding: "0.7em 1.5em",
    background: "#5A83F1",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "1em",
    cursor: "pointer",
    transition: "background 0.3s ease",
};

export default Settings