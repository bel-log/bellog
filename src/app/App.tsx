import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { DriverStatus } from "./drivers/Driver";
import { Route, useLocation, Routes, Link } from 'react-router-dom'

import { PageProfileSetup } from "./components/pages/PageProfileSetup";
import Toolbar from "./components/Toolbar";
import PageHome from './components/pages/PageHome';
import { PageProfileRuntime } from './components/pages/PageProfileRuntime';
import PageRedirector from './components/pages/PageRedirector';
import { PROFILE_VERSION } from '../Version';
import PageDiscaimer from './components/pages/PageDisclaimer';
import { getCookie } from 'typescript-cookie';

const App = () => {

    return (
        <div className='is-flex is-flex-direction-column' style={{ height: "100%" }}>
            {getCookie("securityDiscalimerAccepted") !== "true" ?
                <PageDiscaimer />
                :
                <Toolbar>
                    <Routes >
                        <Route path="/" element={
                            <PageHome></PageHome>
                        } />

                        <Route path={`/profile/:profileId/setup`} element={
                            <PageProfileSetup />
                        } />

                        <Route path={`/profile/:profileId/runtime`} element={
                            <PageProfileRuntime />
                        } />

                        <Route path="*" element={<div>404</div>} />
                    </Routes >
                </Toolbar>
            }
        </div>
    );
};

export default App;