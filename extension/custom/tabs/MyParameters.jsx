import { Fragment } from 'react'
import { useEffect, useState } from 'react'
import { NumericFormat } from 'react-number-format'

const marketplaces = ["US", "CA", "MX", "UK", "DE", "FR", "IT", "ES"]
const currencies = ["USD", "CAD", "MXN", "GBP", "EUR", "EUR", "EUR", "EUR"]
const columns = ['Marketplace', 'Global Rating', 'Nb of Reviews', 'Monthly Sales', 'Monthly Revenue', 'Average Monthly Revenue', 'Monthly Sales First Page', 'Nb of Competitors', 'Nb of FBA Competitors', 'Good Share', '']

const MyParameters = () => {

    const [data, setData] = useState([])

    // Load from browser.storage.local
    useEffect(() => {
        browser.storage.local.get(['colorCriteria'], (result) => {
            if (result.colorCriteria)
                return setData(result.colorCriteria)

            // Initialize with empty data
            const initialData = marketplaces.map((marketplace) => ({
                marketplace,
                values: columns.slice(1, -1).reduce((acc, col) => {
                    acc[col] = { "low": '', "high": '' }
                    return acc
                }, {})
            }))
            setData(initialData)

        })
    }, [])

    //event handlers
    const handleInputChange = (mpIndex, colName, color, value) => {
        setData(prevData => {
            prevData[mpIndex].values[colName][color] = Number(value.replaceAll(',', '')) || ''
            return prevData
        })

    }

    const handleSave = (index) => {
        const row = data[index]
        let isValid = true
        let invalidFields = []

        for (const colName of Object.keys(row.values)) {

            const left = parseFloat(row.values[colName]['low']) || 0
            const right = parseFloat(row.values[colName]['high']) || 0

            if (left > right) {
                isValid = false
                invalidFields.push(colName)
            }
        }

        const orderedInvalidFields = columns.slice(1, -1).filter(col => invalidFields.includes(col))

        if (!isValid)
            return alert(`Can't save the parameters for the ${row.marketplace} line:  the left value must be smaller than (or equal to) the right value for:\n"${orderedInvalidFields.join('", ')}"`, 10000)

        const updated = [...data]
        browser.storage.local.set({ colorCriteria: updated })
        alert(`Saved row for ${row.marketplace}`)
    }

    return (
        <div style={{ position: 'relative', fontSize: "90%" }}>
            <a style={informationButton} href={`${import.meta.env.VITE_PUBLIC_DOMAIN}/instructions`} target='_blank' title='Click on this button to see the instructions and an example of default values. '>Instructions</a>

            <div style={mainHeader}>
                <h2 style={h2Style}>Visual Analysis</h2>
                <h2 style={h2Style}>Header</h2>
            </div>

            <div style={outerContainer}>
                {columns.map((item, index) => (
                    <div
                        key={index}
                        style={columnNamesDiv(item)}
                    >

                        <h3>
                            {item}
                        </h3>
                    </div>
                ))}
                {data.map((row, mpIndex) => {

                    return <Fragment key={mpIndex} >
                        <span style={{ ...currencyStyle, backgroundColor: 'transparent', border: '0', paddingBlock: '4.88px', lineHeight: 'unset' }}>{row.marketplace}</span>

                        {columns.slice(1, -1).map((colName, index) => {
                            const reverse = /^Average Monthly Revenue$|^Good Share$/.test(colName)

                            // Setting the borders
                            let borderRight = '1px solid #001'
                            if (/^Monthly Revenue/i.test(colName)) borderRight = '3px solid blue'
                            else if (index === columns.length - 3) borderRight = 'none'

                            // Setting the colors
                            const firstColor = reverse ? 'var(--red)' : 'var(--green)'
                            const secondColor = reverse ? 'var(--green)' : 'var(--red)'

                            return (
                                <div
                                    key={index}
                                    style={{ ...inputDivStyle, borderRight }}
                                >
                                    <NumericFormat
                                        style={{ ...inputStyle, background: firstColor }}
                                        value={row.values[colName]['low'] || 0}
                                        onChange={(e) =>
                                            handleInputChange(mpIndex, colName, 'low', e.target.value)
                                        }
                                        thousandSeparator=","
                                        allowNegative={false}
                                    />
                                    <NumericFormat
                                        style={{ ...inputStyle, background: secondColor }}
                                        value={row.values[colName]['high'] || 0}
                                        onChange={(e) =>
                                            handleInputChange(mpIndex, colName, 'high', e.target.value)
                                        }
                                        thousandSeparator=","
                                        allowNegative={false}
                                    />
                                    {(/Average mo. revenue|Monthly Revenue/i.test(colName)) && (

                                        <span style={currencyStyle}>{currencies[mpIndex]}</span>
                                    )}
                                </div>
                            )
                        })}
                        <button type="button" style={buttonStyle} onClick={() => handleSave(mpIndex)}>
                            Save
                        </button>
                    </Fragment>
                })}
            </div>
        </div>
    )
}

const columnNamesDiv = (colName) => ({
    borderRight: /^Monthly revenue/i.test(colName) ? '3px solid blue' : '',
    width: '100%',
    paddingTop: '.5em',
    height: '100%'
})

const informationButton = {
    position: 'absolute',
    top: '0em',
    right: '0.4em',
    background: '#007bff',
    color: 'white',
    padding: '.5em 1em',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    textTransform: 'uppercase',
    fontSize: '100%'
}

const currencyStyle = {
    background: 'white',
    border: '1px solid #001',
    padding: 0,
    lineHeight: '21px',
    width: '7em',
    height: '23px',
    fontSize: '100%'
}

const h2Style = {
    fontWeight: 900,
    color: 'blue',
    fontSize: '100%'
}

const mainHeader = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    textAlign: 'center',
    borderBottom: '2px solid blue',
    padding: '1em',
    fontSize: '100%'
}

const outerContainer = {
    display: 'grid',
    gridTemplateRows: `auto`,
    gridTemplateColumns: `.5fr .7fr 1fr 1fr 1.5fr 1.5fr 1fr 1fr 1fr .6fr .5fr`,
    justifyItems: 'center',
    columnGap: '.25em',
    textAlign: 'center',
    alignItems: 'center',
    paddingTop: '1em',
    maxWidth: '100%',
}

const inputDivStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '.25em',
    paddingBlock: '1em',
    borderRight: '1px solid #001',
    paddingRight: '.25em',
    height: '100%',
    fontSize: '100%',
}

const inputStyle = {
    width: '100%',
    height: '23px',
    color: 'black',
    padding: '.25em',
    textAlign: 'right',
    fontSize: '100%',
    borderWidth: '1px',
    lineHeight: '21px'
}

const buttonStyle = {
    width: 'unset',
    padding: '0.5em 1em',
    height: 'fit-content',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '100%'
}

export default MyParameters
