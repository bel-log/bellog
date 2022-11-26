import * as React from 'react';
import {useEffect, useMemo, useRef, useState} from 'react';

import {DriverStatus} from "./drivers/Driver";
import {Route, useLocation, Routes} from 'react-router-dom'

import {PageProfileSetup} from "./components/pages/PageProfileSetup";
import Toolbar from "./components/Toolbar";
import PageHome from './components/pages/PageHome';
import { PageProfileRuntime } from './components/pages/PageProfileRuntime';
import PageRedirector from './components/pages/PageRedirector';
import { PROFILE_VERSION } from '../Version';

const App = () => {

    return (
        <div className='is-flex is-flex-direction-column' style={{height: "100%"}}>
            <Toolbar>
                <Routes >
                    <Route path="/" element={
                        <PageHome></PageHome>
                    }/>

                    <Route path="/documentation" element={
                        "TODO"
                    }/>

                    <Route path={`/profile/:profileId/setup`} element={
                        <PageProfileSetup/>
                    }/>

                    <Route path={`/profile/:profileId/runtime`} element={
                        <PageProfileRuntime/>
                    }/>

                    <Route path="*" element={<div>404</div>}/>
                </Routes >
            </Toolbar>
        </div>
    );
};

export default App;