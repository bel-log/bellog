import * as React from "react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { DriverFactory } from "../../drivers/DriverFactory";
import { SetupProfileObject, ViewSetupProperties } from "../../setup/SetupInterfaces";
import RuntimeProfileView from "./RuntimeProfileView";
import { DriverLoggable, DriverOpenClose, DriverStatus, isDriverLoggable, isDriverOpenClose } from "../../drivers/Driver";
import { Observable } from "../../utility/Observable";
import { View } from "../../view/View";
import { ParserNames } from "../../parsers/Parser";
import {BuilderFactory} from "../../builders/BuilderFactory";
import {BuilderNames} from "../../builders/Builder";
import {HexStringBuilder} from "../../builders/HexStringBuilder";
import {LineBuilder} from "../../builders/LineBuilder";
import {CustomBuilder, CustomBuilderParameters} from "../../builders/CustomBuilder";

export const RuntimeProfile = (props: { profile: SetupProfileObject }) => {

    const profile = props.profile
    const views = props.profile?.views ?? []
    const htmls = [...profile.html]

    const [selectedView, setSelectedView] = useState(0)
    const [tmpKey, setTmpKey] = useState(0)
    const [logEnabled, setLogEnabled] = useState(false)

    const dataRxObserver = useMemo(() => {
        return new Observable()
    }, [])

    const dataTxObserver = useMemo(() => {
        return new Observable()
    }, [])

    const driverErrorObserver = useMemo(() => {
        return new Observable()
    }, [])

    const driver = useMemo(() => {
        return DriverFactory.build(profile.driverType, profile.driverSettings)
    }, [])

    /* Script must be loaded before any other useEffect */
    useLayoutEffect(()=>{

        // Remove existing
        let scriptsa = document.head.getElementsByTagName("script")
        for (let i = 0; i < scriptsa.length; i++) {
            if (scriptsa[i].id === "__js" || scriptsa[i].id === "__bellog_pubjs") {
                document.head.removeChild(scriptsa[i])
                break
            }
        }
        let stylesa = document.head.getElementsByTagName("style")
        for (let i = 0; i < stylesa.length; i++) {
            if (stylesa[i].id === "__css") {
                document.head.removeChild(stylesa[i])
                break
            }
        }

        // set scripts
        let script = document.createElement('script');
        script.id = "__js"
        script.type = 'text/javascript';
        script.innerHTML =
            profile.scripts?.map((script) => {
                return script.code
            }).join("\r\n")

        document.head.appendChild(script);

        let publicFuncs = document.createElement('script');
        publicFuncs.id = "__bellog_pubjs"
        publicFuncs.type = 'text/javascript';
        publicFuncs.innerHTML = `
         const bellog = {
             rawSend: (data) => {
                  const event = new CustomEvent('bellog:rawSend', {
                        detail: {
                            data: data
                        }
                    });
                    document.dispatchEvent(event);
                },
             buildAndSend: (builderName, builderParams) => {
                  const event = new CustomEvent('bellog:buildAndSend', {
                        detail: {
                            builderName: builderName,
                            builderParams: builderParams
                        }
                    });
                    document.dispatchEvent(event);
                }
         }
        `;

        document.head.appendChild(publicFuncs);

        function rawSend(e: Event) {
            //@ts-ignore
            driver.send(e.detail.data)
        }
        function buildAndSend(e: Event) {
            try
            {
                //@ts-ignore
                let builderName = e.detail.builderName
                //@ts-ignore
                let builderParams = e.detail.builderParams
                let builder

                switch (builderName) {
                    case BuilderNames.LineBuilder:
                        builder = BuilderFactory.build({ name: builderName, settings: { id: 0 } }, profile.builders);
                        (builder as LineBuilder).prepareArgs(Object.values(builderParams)[0] as string);
                        break;
                    case BuilderNames.HexStringBuilder:
                        builder = BuilderFactory.build({ name: builderName, settings: { id: 0 } }, profile.builders);
                        (builder as HexStringBuilder).prepareArgs(Object.values(builderParams)[0] as string);
                        break;
                    default:
                        const builderMatch = profile.builders.find((it) => it.name === builderName)
                        if(builderMatch)
                        {
                            builder = BuilderFactory.build({ name: BuilderNames.CustomBuilder, settings: builderMatch.id }, profile.builders);
                            (builder as CustomBuilder).prepareArgs(builderParams);
                        }
                        else
                        {
                            console.error(`Builder ${builderName} not found`)
                            return
                        }
                        break;
                }

                const dataToSend = builder.build()
                driver.send(dataToSend)
            } catch (ex)
            {
                console.error("Error in calling buildAndSend. Check the parameters.")
                console.error(ex)
            }

        }
        //window.removeEventListener()
        document.addEventListener('bellog:rawSend', rawSend);
        document.addEventListener('bellog:buildAndSend', buildAndSend);

        // set style
        let style = document.createElement('style');
        style.id = "__css"
        style.innerHTML = profile.styles?.map((style) => {
            return style.code
        }).join("\r\n")

        document.head.appendChild(style);

        return () => {
            document.removeEventListener('bellog:rawSend', rawSend);
            document.removeEventListener('bellog:buildAndSend', buildAndSend);
        };

    }, [])

    useEffect(() => {
        driver.onReceive((data, chunkInfo) => {
            dataRxObserver.notify({data: data, chunkInfo: chunkInfo})
        })

        driver.onTransmit((data, chunkInfo) => {
            dataTxObserver.notify({data: data, chunkInfo: chunkInfo})
        })

        driver.onError((error) => {
            driverErrorObserver.notify(error)
        })

        return () => {
            if (isDriverOpenClose(driver)) {
                const driverOpenClose = driver as DriverOpenClose
                if (driverOpenClose.status !== DriverStatus.CLOSE) {
                    // Remove all callbacks. They may trigger renderings with old driver object
                    driverOpenClose.onReceive(null)
                    driverOpenClose.onTransmit(null)
                    driverOpenClose.onStatusChange(null)
                    driverOpenClose.close()
                }
            }
            driver.destroy()
        }
    }, [])

    async function onLogEnabledToggle(enabled: boolean) {
        if(isDriverLoggable(driver)) {
            const driverLoggable = (driver as DriverLoggable)
            if(enabled) {
                driverLoggable.enableLogging(profile.profileName)
            } else {
                driverLoggable.disableLogging()
            }
        }
        setLogEnabled(enabled)
    }

    async function onLogImport() {
        if(isDriverLoggable(driver)) {
            setTmpKey(tmpKey + 1)
            const driverLoggable = (driver as DriverLoggable)
            driverLoggable.loadImport()
        }
    }

    function connectButtonOnClick(driver: DriverOpenClose) {
        if (driver.status === DriverStatus.CLOSE) {
            driver.open()
        } else {
            onLogEnabledToggle(false)
            driver.close()
        }
    }

    function clearButtononClick() {
        if (profile.globalSettings?.shareDataBetweenViews) {
            // Delete all other views
            setTmpKey(tmpKey + 1)
        }
    }

    return (
        <React.Fragment key={tmpKey}>
                    <div>
                        <div className="tabs is-boxed pt-1 pl-1">
                            <ul>
                                {
                                    views.map((val, index) => {
                                        return <li key={index} className={`${selectedView === index ? "is-active" : ""}`}
                                            onClick={() => { setSelectedView(index) }}><a>{val.name}</a></li>
                                    })
                                }
                            </ul>

                        </div>
                    </div>
                    { views.length <= 0 ? 
                                    <div>Create a view by editing the profile on the HomePage</div>
                                : ""}
                    {
                        views.map((val, index) => {
                            return <React.Fragment key={index}>
                                <RuntimeProfileView
                                    visible={selectedView === index}
                                    logEnabled={logEnabled}
                                    onLogEnabledToggle={onLogEnabledToggle}
                                    onLogImport={onLogImport}
                                    driver={driver} view={views[index]} profile={profile} selected={selectedView == index}
                                    dataTxObserver={dataTxObserver}
                                    dataRxObserver={dataRxObserver}
                                    driverErrorObserver={driverErrorObserver}
                                    onConnectClick={() => { connectButtonOnClick(driver as DriverOpenClose) }}
                                    onClearClick={() => { clearButtononClick() }} />
                            </React.Fragment>
                        })
                    }
        </React.Fragment>

    );
}

export default RuntimeProfile;
