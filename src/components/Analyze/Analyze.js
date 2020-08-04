import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import styles from './Analyze.styles'
//import clsx from 'clsx'

import { stringify } from 'query-string'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'

const useStyles= makeStyles(styles, {
    name: Analyze.name
})

async function fetchData(query) {
    const res= await fetch(`/api/v1/indications/analyze?${query}`, {
        method: 'GET',
    })
    const payload= await res.json()
    if (res.ok) {
        return payload
    }
    return Promise.reject(payload)
}

export default function Analyze(props) {
    const classes = useStyles(props)

    const { params }= props

    const [ data, setData ]= React.useState(null)
    const [ dataError, setDataError ]= React.useState(false)
    const [ dataPending, setDataPending ]= React.useState(false)

    React.useEffect(() => {
        if (!params.key || !params.timestampFrom || !params.timestampTo) {
            return
        }
        setDataPending(true)
        const query = stringify({
            ...params,
            timestampFrom: params.timestampFrom.toISOString(),
            timestampTo: params.timestampTo.toISOString(),
        })
        fetchData(query)
            .then((data) => {
                setData(data)
                setDataError(null)
                setDataPending(false)
            })
            .catch((error) => {
                console.error(error)
                setData(null)
                setDataError(error)
                setDataPending(false)
            })
        ;
    }, [
        //params
    ])

    return (
        <div className={classes.root}>
            <Typography className={classes.title} variant="h6">Анализ точности и согласованности</Typography>
            {!!dataPending && (
                <LinearProgress/>
            )}
            {!!data && (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell component="th" style={{ width:'73%' }}>
                                Источник данных
                            </TableCell>
                            <TableCell component="th">
                                Среднее отклонение
                            </TableCell>
                            <TableCell component="th">
                                Среднеквадратическое отклонение
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((item, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    {item.valueSource}
                                </TableCell>
                                <TableCell>
                                    {item.err.toFixed(5)}
                                </TableCell>
                                <TableCell>
                                    {item.rms.toFixed(5)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}
