import React from 'react'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import FileField from './FileField/FileField'

async function getUpload() {
    const res= await fetch(`/api/v1/upload`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    })
    const payload= await res.json()
    if (res.ok) {
        return payload
    } else {
        return Promise.reject(payload)
    }
}

async function resetUpload() {
    const res= await fetch(`/api/v1/upload`, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
        },
    })
    const payload= await res.json()
    if (res.ok) {
        return payload
    } else {
        return Promise.reject(payload)
    }
}

async function startUpload(body) {
    const res= await fetch(`/api/v1/upload`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
        },
        body
    })
    const payload= await res.json()
    if (res.ok) {
        return payload
    } else {
        return Promise.reject(payload)
    }
}

export default function Upload() {

    const [ upload, setUpload ]= React.useState(null)
    const [ uploadResolved, setUploadResolved ]= React.useState(false)

    const [ submitPending, setSubmitPending ]= React.useState(false)
    const [ resetPending, setResetPending ]= React.useState(false)

    React.useEffect(() => {
        (async () => {
            const { upload }= await getUpload()
            setUpload(upload)
            setUploadResolved(true)
        })()
    }, [])

    React.useEffect(() => {
        if (upload !== null && !upload.finished && !upload.error) {
            setTimeout(async () => {
                const { upload }= await getUpload()
                setUpload(upload)
            }, 1000)
        }
    }, [
        upload
    ])

    if (!uploadResolved) {
        return null
    }

    if (upload === null) {
        return (
            <form
                onSubmit={async (evt) => {
                    evt.preventDefault()
                    setSubmitPending(true)
                    const formData= new FormData(evt.target)
                    const upload= await startUpload(formData)
                    setUpload(upload)
                    setSubmitPending(false)
                }}
            >
                <Box p={3}>
                    <Typography variant="h5">
                        Загрузка данных
                    </Typography>
                    <Box pt={2}>
                        <FileField
                            name="file"
                            disabled={submitPending}
                        />
                    </Box>
                    <Box pt={2}>
                        <Button
                            variant="outlined"
                            color="primary"
                            type="submit"
                            disabled={submitPending}
                        >
                            Загрузить
                        </Button>
                    </Box>
                </Box>
            </form>
        )
    } else {
        return (
            <Box p={3}>
                {!upload.finished && !upload.error ? (
                    <Typography variant="h5">
                        Данные загружаются...
                    </Typography>
                ) : (
                    upload.finished ? (
                        <Typography variant="h5" color="primary">
                            Данные загружены.
                        </Typography>
                    ) : (
                        <Typography variant="h5" color="secondary">
                            Ошибка при загрузке данных: {upload.error.message}
                        </Typography>
                    )
                )}
                <Box pt={2}>
                    <LinearProgress
                        variant="determinate"
                        color={upload.error ? 'secondary' : 'primary'}
                        value={upload.progressTotal > 0 ? (upload.progressCurrent / upload.progressTotal) * 100 : 0 }
                    />
                </Box>
                <Box pt={4} display="flex" justifyContent="center">
                    {(upload.finished || upload.error) && (
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={async () => {
                                setResetPending(true)
                                const upload= await resetUpload()
                                setUpload(upload)
                                setResetPending(false)
                            }}
                            disabled={resetPending}
                        >
                            Загрузить еще
                        </Button>
                    )}
                </Box>
            </Box>
        )
    }
}
