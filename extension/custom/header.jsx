import useStore from '../store'
import Inputs from './components/header/Inputs.jsx'
import LogoContainer from './components/header/logo.jsx'
import Tabs from './components/header/tabs.jsx'
const header = () => {

    //store variables
    const currentTab = useStore(s => s.currentTab)

    const myStyle = {
        width: '95%',
        padding: '1em',
        borderRadius: "20px",
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
        backgroundColor: 'var(--main-background-color)',
        color: 'black',
        paddingTop: '0',
    }
    return (
        <header style={myStyle}>
            <LogoContainer />
            <Tabs />
            {(/^Extracted Data$|^Visual Analysis$/.test(currentTab)) &&
                <Inputs />
            }
        </header>
    )
}

export default header