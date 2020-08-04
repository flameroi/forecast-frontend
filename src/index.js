import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'

import CssBaseline from '@material-ui/core/CssBaseline'
import { HashRouter as Router, Route } from 'react-router-dom'
import App from './components/App/App'
import Upload from './components/Upload/Upload'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(
    <React.Fragment>
        <CssBaseline/>
        <Router>
            <Route exact path="/">
                <App/>
            </Route>
            <Route exact path="/upload">
                <Upload/>
            </Route>
        </Router>
    </React.Fragment>,
    document.getElementById('root')
)

serviceWorker.unregister()
