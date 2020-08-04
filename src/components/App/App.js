import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import styles from './App.styles'
//import clsx from 'clsx'

import DateFnsUtils from '@date-io/date-fns'
import ruLocale from 'date-fns/locale/ru'
import { DatePicker, LocalizationProvider } from '@material-ui/pickers'
import { Chart } from 'react-google-charts'
import TextField from '@material-ui/core/TextField/TextField'
import Box from '@material-ui/core/Box'
import { stringify } from 'query-string'
import MenuItem from '@material-ui/core/MenuItem'
import Snackbar from '@material-ui/core/Snackbar'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Button from '@material-ui/core/Button'
import Analyze from '../Analyze/Analyze'
import Forecast from '../Forecast/Forecast'

const useStyles= makeStyles(styles, {
    name: App.name
})

const now= new Date()
const timestampTo= new Date(now)
const timestampFrom= ((date) => { date.setMonth(date.getMonth() - 1); return date })(new Date(now))

async function fetchData(query) {
    const res= await fetch(`/api/v1/indications?${query}`, {
        method: 'GET',
    })
    const payload= await res.json()
    if (res.ok) {
        return payload
    }
    return Promise.reject(payload)
}

export default function App() {
    const classes= useStyles()

    const [ params, setParams ]= React.useState({
        key: 'temperature',
        timestampFrom,
        timestampTo,
    })

    const [ keys, setKeys ]= React.useState([])
    const [ disabledKeys, setDisabledKeys ]= React.useState({})

    const [ data, setData ]= React.useState(null)
    const [ dataError, setDataError ]= React.useState(false)
    const [ dataPending, setDataPending ]= React.useState(false)

    React.useEffect(() => {
        if (!params.key || !params.timestampFrom || !params.timestampTo) {
            return
        }
        setDataPending(true)
        const query= stringify({
            ...params,
            timestampFrom: params.timestampFrom.toISOString(),
            timestampTo: params.timestampTo.toISOString(),
        })
        fetchData(query)
            .then((data) => {
                setData(data)
                setDataError(null)
                setDataPending(false)
                if (data) {
                    const keys= []
                    for (const { key, labels } of data) {
                        const valueSourceLabel= labels.filter(label => label.name === 'valueSource').pop()
                        keys.push({
                            key,
                            label: valueSourceLabel.value,
                        })
                    }
                    setKeys(keys)
                }
            })
            .catch((error) => {
                console.error(error)
                setData(null)
                setDataError(error)
                setDataPending(false)
            })
        ;
    }, [
        params
    ])

    const [ chartData, setChartData ]= React.useState(null)

    React.useEffect(() => {
        if (data) {
            // обработка данных

            const dataMap= {}
            for (const { key:k, data:d } of data) {
                dataMap[k]= dataMap[k] || {}
                for (const sample of d) {
                    dataMap[k][sample.timestamp]= sample.value
                }
            }

            const timestamps= []
            for (const { timestamp } of data[0].data) {
                timestamps.push(timestamp)
            }

            const header= [
                'timestamp'
            ]

            for (const { key, labels } of data) {
                if (!disabledKeys[key]) {
                    const valueSourceLabel= labels.filter(label => label.name === 'valueSource').pop()
                    header.push(valueSourceLabel.value)
                }
            }

            const items= [
                header
            ]
            for (const timestamp of timestamps) {
                const item= [
                    new Date(timestamp)
                ]
                for (const { key } of data) {
                    if (!disabledKeys[key]) {
                        const value = dataMap[key][timestamp]
                        item.push(value)
                    }
                }
                items.push(item)
            }
            setChartData(items)
        }
    }, [
        data,
        disabledKeys
    ])

    const [ analyzeShow, setAnalyzeShown ]= React.useState(false)
    const [ forecastShow, setForecastShown ]= React.useState(false)

    React.useEffect(() => {
        setAnalyzeShown(false)
        setForecastShown(false)
    }, [
        params,
        setAnalyzeShown,
        setForecastShown,
    ])

    return (
        <LocalizationProvider dateAdapter={DateFnsUtils} locale={ruLocale}>
            <div>
                <Box display="flex" alignItems="center" justifyContent="center">
                    <TextField
                        label="Показания"
                        variant="outlined"
                        margin="dense"
                        value={params.key}
                        onChange={({ target:{ value:key } }) => {
                            setParams({ ...params, key })
                        }}
                        select
                    >
                        <MenuItem value="temperature">Температура</MenuItem>
                        <MenuItem value="pressure">Давление</MenuItem>
                        <MenuItem value="humidity">Влажность</MenuItem>
                    </TextField>
                    &nbsp;
                    <DatePicker
                        value={params.timestampFrom || null}
                        onChange={(timestampFrom) => {
                            setParams({ ...params, timestampFrom })
                        }}
                        autoOk
                        mask="__.__.____"
                        renderInput={props => (
                            <TextField
                                {...props}
                                label="Дата от"
                                variant="outlined"
                                margin="dense"
                                //fullWidth
                                placeholder="ДД.ММ.ГГГГ"
                                helperText={null}
                            />
                        )}
                    />
                    &nbsp;
                    <DatePicker
                        value={params.timestampTo || null}
                        onChange={(timestampTo) => {
                            setParams({ ...params, timestampTo })
                        }}
                        autoOk
                        mask="__.__.____"
                        renderInput={props => (
                            <TextField
                                {...props}
                                label="Дата до"
                                variant="outlined"
                                margin="dense"
                                //fullWidth
                                placeholder="ДД.ММ.ГГГГ"
                                helperText={null}
                            />
                        )}
                    />
                </Box>
                <Box display="flex" flexWrap="wrap" justifyContent="center">
                    {keys.map(({ key, label }) => (
                        <Box>
                            <FormControlLabel
                                key={key}
                                control={(
                                    <Checkbox
                                        checked={!disabledKeys[key]}
                                        onChange={() => {
                                            setDisabledKeys({ ...disabledKeys, [key]:!disabledKeys[key] })
                                        }}
                                    />
                                )}
                                label={label}
                            />
                        </Box>
                    ))}
                </Box>
                {!!chartData && (
                    <Chart
                        chartType="LineChart"
                        data={chartData}
                        width="100%"
                        height="600px"
                        legendToggle
                        options={{
                            //isStacked: true,
                            hAxis: {
                                gridlines: {
                                    count: -1,
                                    units: {
                                        days:{ format:['dd.MM'] },
                                        hours:{ format:['hh:mm', 'ha'] },
                                    }
                                },
                            }
                        }}
                    />
                )}
                {!!chartData && (
                    <div className={classes.analyze}>
                        {!analyzeShow && (
                            <div className={classes.analyzeToolbar}>
                                <Button
                                    className={classes.button}
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={() => setAnalyzeShown(true)}
                                >
                                    Анализ точности и согласованности
                                </Button>
                            </div>
                        )}
                        {analyzeShow && (
                            <Analyze
                                params={params}
                            />
                        )}
                    </div>
                )}
                {!!chartData && (
                    <div className={classes.forecast}>
                        {!forecastShow && (
                            <div className={classes.forecastToolbar}>
                                <Button
                                    className={classes.button}
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={() => setForecastShown(true)}
                                >
                                    Адаптированный прогноз
                                </Button>
                            </div>
                        )}
                        {forecastShow && (
                            <Forecast
                                params={params}
                            />
                        )}
                    </div>
                )}
                {/*!!dataError && (
                    <Snackbar
                        open
                    >
                        {dataError.message}
                    </Snackbar>
                )*/}
            </div>
        </LocalizationProvider>
    )
}
