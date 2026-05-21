import { useState } from "react"

import useStore from '../../../store'

import Activate from "./Activate"

import api from '../../../axios/api.js'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

const Login = () => {

    //store function
    const setCurrentTab = useStore(state => state.setCurrentTab)
    const user = useStore(state => state.user)
    const setUser = useStore(state => state.setUser)
    const check = useStore(state => state.check)

    //hooks
    const [emailValue, setEmailValue] = useState('')
    const [passwordValue, setPwdValue] = useState('')

    //handlers
    const handleForm = async (e) => {
        try {

            e.preventDefault()

            let { license_key = '' } = await browser.storage.local.get(['license_key'])

            if (!license_key) {
                //getting fingerprint
                const fp = await FingerprintJS.load();
                license_key = (await fp.get()).visitorId;
            }

            //posting request to api
            const { data } = await api.post('/user/login', { emailValue, passwordValue, license_key })
            //set the data
            await browser.storage.local.set({ "token": data.token })

            setUser({ activated: data.activated, logged: true })

            await check()

            await browser.storage.local.set({ "license_key": license_key })

            //change the current Tab
            if (data.activated)
                setCurrentTab('Extracted Data')

        } catch (err) {
            alert(err?.response?.data?.err || 'Something went wrong. Please try again later!')
            await browser.storage.local.set({ "token": '' })
            setUser({ activated: false, logged: false })
            console.log(err)
        }
    }


    return (
        (user && user.logged) ?
            <Activate />
            :
            <div className="formMain" style={mainDivStyle}>

                <form onSubmit={handleForm} style={formStyle}>

                    <input style={inputStyle} name="email" type="email" placeholder="Email*" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} required autoComplete="on" />
                    <input style={inputStyle} name="password" type="password" placeholder="Password*" value={passwordValue} onChange={(e) => setPwdValue(e.target.value)} required />

                    <div style={lowerDiv}>
                        <button type="submit" style={buttonStyle} >LOG IN</button>
                        <a href={`${import.meta.env.VITE_PUBLIC_DOMAIN}/login`} target="_blank" style={aLinkStyle}>Forgot Password?</a>
                    </div>

                </form>
                <pre style={aLinkDivStyle}>
                    <a href={`${import.meta.env.VITE_PUBLIC_DOMAIN}/legal/privacy-policy`} target="_blank" style={aLinkStyle}>Private Policy</a> |
                    <a href={`${import.meta.env.VITE_PUBLIC_DOMAIN}/legal/terms-of-website-use`} target="_blank" style={aLinkStyle}> Terms and Conditions</a> |
                    <a href={`${import.meta.env.VITE_PUBLIC_DOMAIN}/#order`} target="_blank" style={aLinkStyle}> Purchase a license</a>
                </pre>
            </div>
    )
}

//styles
const lowerDiv = {
    flexDirection: "column",
    display: "flex",
    alignItems: "center",
    gap: '1em'
}



const aLinkStyle = {
    color: 'blue',
    textDecoration: 'none',
    fontWeight: 'bold'
}

const aLinkDivStyle = {
    ...aLinkStyle,
    cursor: 'unset',
    marginTop: "1em"
}

const formStyle = {
    display: "grid",
    alignItems: "center",
    minHeight: "40vh",
    borderRadius: '30px',
    padding: "2em",
    width: "40%",
    gap: "1.5em",
    justifyItems: 'center',
    border: '2px solid black',
    borderRadius: '10px'
}

const mainDivStyle = {
    placeItems: "center",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
}

const buttonStyle = {
    justifySelf: "center",
    borderRadius: '15px',
    border: 0,
    padding: ".5em 3em",
    fontSize: '1.2rem',
    color: 'white',
    backgroundColor: "blue",
    transition: "all ease-in-out .3s",
    cursor: "pointer",
}

const inputStyle = {
    padding: ".75em",
    borderRadius: "10px",
    border: "2px solid black",
    outlineOffset: '2px',
    outline: 0,
    width: '90%'
}

export default Login