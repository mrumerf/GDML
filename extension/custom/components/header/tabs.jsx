import { useRef } from "react"
import useStore from "../../../store"

const Tabs = () => {
    //store variables
    const { currentTab, setCurrentTab } = useStore()

    //hooks
    const tabsElement = useRef()

    //handlers
    const handleButton = (e) => {
        const value = e.target.innerText
        setCurrentTab(value)
    }

    return (
        <div style={main}>
            <div style={myStyle} ref={tabsElement}>
                <button style={currentTab === 'Extracted Data' ? activeButton : button} onClick={handleButton}>Extracted Data</button>
                {/* <button style={currentTab === 'Visual Analysis' ? activeButton : button} onClick={handleButton}>Visual Analysis</button> */}
                {/* <button style={currentTab === 'Niche Hunter' ? activeButton : button} onClick={handleButton}>Niche Hunter</button> */}
                {/* <button style={currentTab === 'My Saved Researches' ? activeButton : button} onClick={handleButton}>My Saved Researches</button> maybe going to use in the future version */}
                {/* <button style={currentTab === 'My Tracked Products' ? activeButton : button} onClick={handleButton}>My Tracked Products</button> */}
                {/* <button style={currentTab === 'My Parameters' ? activeButton : button} onClick={handleButton}>My Parameters</button> */}
                {/* <button style={currentTab === 'My Account' ? activeButton : button} onClick={handleButton}>My Account</button> */}
            </div>
            <div style={lastDiv}></div>
        </div>
    )
}

//styles
const myStyle = {
    width: "100%",
    display: 'flex',
    justifyContent: 'start',
}
const lastDiv = {
    paddingBlock: '.25em',
    backgroundColor: 'white',
}
const main = {
    marginLeft: '2em',
    paddingBottom: '1em'
}
const button = {
    cursor: "pointer",
}

const activeButton = {
    ...button,
    borderBottom: 0 // no border for the active button
}

export default Tabs
