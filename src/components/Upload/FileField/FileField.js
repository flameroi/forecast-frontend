import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import styles from './FileField.styles'
//import clsx from 'clsx'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'

const useStyles= makeStyles(styles, {
    name: FileField.name
})

export default function FileField(props) {
    const classes= useStyles(props)
    const { name, disabled, error, helperText }= props

    const [ file, setFile ]= React.useState()

    return (
        <Box className={classes.root} display="flex" alignItems="center">
            <TextField
                variant="outlined"
                fullWidth
                type="file"
                name={name}
                label="Выберите файл"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                    classes: {
                        input: classes.input,
                    },
                    startAdornment: !!file ? <InputAdornment position="start" disableTypography><Typography variant="body1">{file.name}</Typography></InputAdornment> : null
                }}
                onChange={({ target:{ files }}) => {
                    setFile(files[0])
                }}
                disabled={disabled}
                error={error}
                helperText={helperText}
            />
        </Box>
    )
}
