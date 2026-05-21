import useStore from "../../../store"

import api from '../../../axios/api.js'

const ActivationPrompt = () => {

    //store vars and funcs
    const setCurrentTab = useStore(state => state.setCurrentTab)
    const check = useStore(state => state.check)

    const handleActivate = async () => {
        try {

            const { data } = await api.get(`/semiProtected/activate`)

            if (!data === 'Activated') return alert('Something went wrong, please try again later')

            await check()

            setCurrentTab('Extracted Data')

        } catch (err) {
            console.error(err)
            alert(err?.response?.data?.err || 'Something went wrong, please try again later')
        }
    }

    return (
        <div style={styles.container}>
            <pre style={styles.text}>{"Please click on the button\nto activate your license on this device."}</pre>
            <button style={styles.button} onClick={handleActivate}>
                Activate
            </button>
        </div>
    )
}

const styles = {
    container: {
        padding: "2em",
        borderRadius: "1rem",
        background: "#f8f9fa",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        width: "fit-content",
        margin: "2rem auto"
    },
    heading: {
        fontSize: "1.5rem",
        marginBottom: "1rem"
    },
    text: {
        marginBottom: "1rem",
        color: "#555",
        fontSize: "1.3rem"
    },
    button: {
        padding: "0.6rem 1.2rem",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "0.5rem",
        cursor: "pointer",
        fontSize: "1rem"
    },
    success: {
        color: "green"
    }
}

export default ActivationPrompt
