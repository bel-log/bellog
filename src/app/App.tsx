import * as React from 'react';
import {useEffect, useMemo, useRef, useState} from 'react';

import {DriverStatus} from "../drivers/Driver";
import {Route, useLocation, Routes} from 'react-router-dom'

import {PageProfileSetup} from "../components/pages/PageProfileSetup";
import Toolbar from "../components/Toolbar";
import PageHome from '../components/pages/PageHome';
import { PageProfileRuntime } from '../components/pages/PageProfileRuntime';
import PageRedirector from '../components/pages/PageRedirector';
import { PROFILE_VERSION } from '../Version';
/*
class GenericRendererParams implements GenericRendererProperties {
    items = [
        {
            regex: /^(FILE CCAPI SEND: )(.*)$|^(FILE CCAPI RECV: )(.*)$/gm,
            transformExp: function transform(matches) {
                function hexStringToByteArray(hexString) {
                    if (hexString.length % 2 !== 0) {
                        throw "Must have an even number of hex digits to convert to bytes";
                    }
                    const numBytes = hexString.length / 2;
                    const byteArray = new Uint8Array(numBytes);
                    for (let i = 0; i < numBytes; i++) {
                        byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
                    }
                    return byteArray;
                }

                let cborarray = hexStringToByteArray(matches[2])
                return eval("CBOR.decode(new Uint8Array(cborarray).buffer)")
            },
            matchRenderer: JsonDiv.prototype.constructor.name,
            matchRendererProperties: {
                title: function setTitle(jsonObj, matches, state: any) {
                    let title = matches[1]
                    let cache = state.cache ?? []

                    let associatedMSG = cache.find(
                        elem => elem.ruid == jsonObj.ruid
                    )
                    let svcName
                    if(associatedMSG === undefined || associatedMSG === null)
                    {
                        if(jsonObj.svc !== undefined && jsonObj.svc !== null)
                        {
                            svcName = jsonObj.svc

                            cache.push(
                                {
                                    svc: jsonObj.svc,
                                    ruid: jsonObj.ruid
                                }
                            )
                        }
                        else
                        {
                            svcName = "RUID not found"
                        }
                    }
                    else
                    {
                        cache = cache.filter( elem => elem.ruid != jsonObj.ruid)
                        svcName = associatedMSG.svc
                    }

                    state.cache = cache

                    return title + svcName

                }
            },
        },
        {
            regex: /^(?!.*CCAPI_ERR_CODE_NO_ERROR).*ERROR.*$/gmi,
            transformExp: function transform(matches) {
                return matches[0]
            },
            matchRenderer: ColoredText.prototype.constructor.name,
            matchRendererProperties: {
                color: "green"
            }
        }
    ]
}

*/


const App = () => {

    return (
        <div className='is-flex is-flex-direction-column' style={{height: "100%"}}>
            <Toolbar>
                <Routes >
                    <Route path="/" element={
                        <PageHome></PageHome>
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
/*
childRef.current.doSomething(event);
 <Child ref={childRef} />
*/ 
};

export default App;