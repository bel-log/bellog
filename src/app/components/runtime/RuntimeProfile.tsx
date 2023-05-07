import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { DriverFactory } from "../../drivers/DriverFactory";
import { SetupProfileObject, ViewSetupProperties } from "../../setup/SetupInterfaces";
import RuntimeProfileView from "./RuntimeProfileView";
import { DriverOpenClose, DriverStatus, isDriverOpenClose } from "../../drivers/Driver";
import { Observable } from "../../utility/Observable";
import { View } from "../../view/View";
import { ParserNames } from "../../parsers/Parser";
import streamSaver from "streamsaver"

export const RuntimeProfile = (props: { profile: SetupProfileObject }) => {

    const profile = props.profile
    const views = props.profile?.views ?? []
    const htmls = [...profile.html]

    const [selectedView, setSelectedView] = useState(0)
    const [tmpKey, setTmpKey] = useState(0)
    const [logEnabled, setLogEnabled] = useState(false)

    const fileWriterRef = React.useRef(null)
    

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

    useMemo(()=>{
        // set scripts
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = "try {" +
            profile.scripts?.map((script) => {
                return script.code
            }).join("\r\n")
            + "} catch(e) {}";

        document.head.appendChild(script);

        // set style
        let style = document.createElement('style');
        style.innerHTML = profile.styles?.map((style) => {
            return style.code
        }).join("\r\n")

        document.head.appendChild(style);
    }, [])

    useEffect(() => {
        driver.onReceive((data) => {
            dataRxObserver.notify(data)
            fileWriterRef.current?.write(data)
        })

        driver.onTransmit((data) => {
            dataTxObserver.notify(data)
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
            fileWriterRef.current?.close()
        }
    }, [])

    useEffect(() => {
        if(logEnabled) {
            const fileStream = streamSaver.createWriteStream(profile.profileName + "_" + new Date().toLocaleString('en-GB',{hour12: false}) + ".txt", {})
            fileWriterRef.current = fileStream.getWriter()
        } else {
            fileWriterRef.current?.close()
            fileWriterRef.current = null
        }
    },[logEnabled])

    function onLogEnabledToggle(enabled: boolean) {
        setLogEnabled(enabled)
    }

    function connectButtonOnClick(driver: DriverOpenClose) {
        if (driver.status === DriverStatus.CLOSE) {
            driver.open()
        } else {
            driver.close()
            setLogEnabled(false)
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
