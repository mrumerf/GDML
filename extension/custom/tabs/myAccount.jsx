// import MyAccount from '../components/myAccount/myAccount'
import Login from '../components/myAccount/login'
import useStore from '../../store'

const App = () => {

    const user = useStore(s => s.user)
    const setCurrentTab = useStore(s => s.setCurrentTab)

    const Navigate = () => {
        setCurrentTab('Extracted Data')
        return null
    }

    return (
        <>
            {(user && user.logged && user.activated) ? <Navigate /> : <Login />}
        </>
    )

}

export default App