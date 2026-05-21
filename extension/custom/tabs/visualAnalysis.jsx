import { useRef } from "react"

import THead from '../components/visualAnalysis/Thead'
import TBody from '../components/visualAnalysis/Tbody'
import NotCompatible from '../components/notCompatible'
import useStore from "../../store"

const ExtractedDataTab = () => {

    //hooks
    const table = useRef()
    const compatible = useStore(s => s.compatible)

    //styles
    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',  // Prevents table from expanding beyond the container
        marginTop: "-10px"
    }

    return (
        compatible ? (
            <>
                <table style={tableStyle} ref={table}>
                    <THead />
                    <TBody />
                </table >
            </>
        )
            : (
                <NotCompatible />
            )
    )
}

export default ExtractedDataTab