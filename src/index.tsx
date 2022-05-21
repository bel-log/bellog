
import * as React from 'react';
import * as ReactDOM from 'react-dom/client'
import App from "./app/App";
import {Buffer} from "buffer"
import * as CBOR from "./lib/cbor"

import {HashRouter} from "react-router-dom";
import './mystyles.scss'
import './lib/font-awesome.all.min.css'

const root = ReactDOM.createRoot(document.getElementById("root"));

// @ts-ignore
window.CBOR = CBOR
// @ts-ignore
window.Buffer = Buffer

root.render(
    <HashRouter>
        <App />
    </HashRouter>
);