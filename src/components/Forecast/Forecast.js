import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import styles from './Forecast.styles'
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
    name: Forecast.name
})

async function fetchData(query) {
    const res= await fetch(`/api/v1/indications/pf?${query}`, {
        method: 'GET',
    })
    const payload= await res.json()
    if (res.ok) {
        return payload
    }
    return Promise.reject(payload)
}

export default function Forecast(props) {
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
        const timestampTo= new Date(params.timestampTo)
        timestampTo.setDate(timestampTo.getDate() + 2)
        const query = stringify({
            ...params,
            timestampFrom: params.timestampFrom.toISOString(),
            timestampTo: timestampTo.toISOString(),
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
            <Typography className={classes.title} variant="h6">Адаптированный прогноз</Typography>
            {!!dataPending && (
                <LinearProgress/>
            )}
            {!!data && (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell component="th" colSpan={4}>
                                Завтра
                            </TableCell>
                            <TableCell component="th" colSpan={4}>
                                Послезавтра
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th">
                                Ночь
                            </TableCell>
                            <TableCell component="th">
                                Утро
                            </TableCell>
                            <TableCell component="th">
                                День
                            </TableCell>
                            <TableCell component="th">
                                Вечер
                            </TableCell>
                            <TableCell component="th">
                                Ночь
                            </TableCell>
                            <TableCell component="th">
                                Утро
                            </TableCell>
                            <TableCell component="th">
                                День
                            </TableCell>
                            <TableCell component="th">
                                Вечер
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                {data[0]}
                            </TableCell>
                            <TableCell>
                                {data[1]}
                            </TableCell>
                            <TableCell>
                                {data[2]}
                            </TableCell>
                            <TableCell>
                                {data[3]}
                            </TableCell>
                            <TableCell>
                                {data[4]}
                            </TableCell>
                            <TableCell>
                                {data[5]}
                            </TableCell>
                            <TableCell>
                                {data[6]}
                            </TableCell>
                            <TableCell>
                                {data[7]}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            )}
        </div>
    )
}
