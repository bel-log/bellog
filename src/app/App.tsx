import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { DriverStatus } from "./drivers/Driver";
import { Route, useLocation, Routes, Link } from 'react-router-dom'

import { PageProfileSetup } from "./components/pages/PageProfileSetup";
import Toolbar from "./components/Toolbar";
import PageHome from './components/pages/PageHome';
import { PageProfileRuntime } from './components/pages/PageProfileRuntime';
import PageRedirector from './components/pages/PageRedirector';
import {checkVersionForRedirection, PROFILE_VERSION} from '../Version';
import PageDiscaimer from './components/pages/PageDisclaimer';
import { getCookie } from 'typescript-cookie';
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "./db/db";
import {normalizeProfile} from "./setup/SetupNormalizer";
import {SetupProfileObject} from "./setup/SetupInterfaces";

const App = () => {

    const disclaimerKey = "disclaimerAccepted"
    const [disclaimerAccepted, setDiscaimer] = React.useState<boolean>(false)

    useEffect(() => {
        try {
            db.flags.add({
                name: disclaimerKey,
                value: false
            }, disclaimerKey)
        } catch (ex) {}
    }, []);

    useLiveQuery(async () => {
        const disclaimerAccepted = await db.flags.get(disclaimerKey)
        setDiscaimer(disclaimerAccepted.value)
    });

    function updateDiscaimer(value: boolean)
    {
        db.flags.update(disclaimerKey, {
          value: value
        })
        setDiscaimer(value)
    }

    return (
        <div className='is-flex is-flex-direction-column' style={{ height: "100%" }}>
            {!disclaimerAccepted ?
                <PageDiscaimer onDisclaimer={updateDiscaimer} />
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