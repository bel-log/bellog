import * as React from "react";
import { DriverNames, DriverSettings } from "../../drivers/Driver";
import { useEffect, useState } from "react";
import { useStateWithCallback } from "../../utility/customHooks";
import { buildDefaultDriverSettings } from "../../setup/SetupFactories";
import { getDriverWarning, isDriverAllowedInWebMode } from "../../utility/env";
import { DriverAdbLogcatSetup } from "../setup/DriverAdbSetup";
import { DriverAdbLogcatParameters } from "../../drivers/DriverAdbLogcat";
import { DriverSerialPortWebSerialParameters } from "../../drivers/DriverSerialportWebserial";
import { DriverWebSockifyParameters } from "../../drivers/DriverWebSockify";
import { DriverWebSerialSetup } from "../setup/DriverWebSerialSetup";
import { DriverWebSockifySetup } from "../setup/DriverWebsockifySetup";


export const SideMainSettings = (props: {
    profileName: string, setProfileName: (string) => void,
    driverType: DriverNames, driverSettings: DriverSettings,
    exportProfile: () => void, loadProfile: (e: React.ChangeEvent<HTMLInputElement>) => void,
    setDriver: ([DriverNames, DriverSettings]) => void
}) => {

    const driverType = props.driverType
    const profileName = props.profileName
    const exportProfile = props.exportProfile
    const loadProfile = props.loadProfile
    const setProfileName = props.setProfileName
    const [tmpDriverSettings, setTmpDriverSettings] = useState(props.driverSettings)
    const [driverModalIsOpen, setDriverModalIsOpen] = useState(false)

    function updateDriverType(newDriverType: DriverNames) {
        props.setDriver([newDriverType, buildDefaultDriverSettings(newDriverType)])
    }

    function updateDriverSettings(newDriverSettings: DriverSettings) {
        props.setDriver([driverType, newDriverSettings])
    }

    useEffect(() => {
        setTmpDriverSettings(props.driverSettings)
    }, [props.driverSettings])

    return (
        <React.Fragment>
                        <div className="content">

            <h1>Setup Profile</h1>

            <div className="field">
            <h4>Profile Name</h4>
                <div className="control">
                    <input className="input" type="text" placeholder="Text input" value={profileName}
                        onChange={(evt) => setProfileName(evt.target.value)} />
                </div>
            </div>


            <div className="is-flex is-flex-direction-row">
                <div>
                <h4>Driver</h4>
                </div>
                <div>
                <span className={`ml-2 has-text-info has-tooltip-right icon is-large}`}
                            data-tooltip="Select how the data stream is retrieved or sent by the profile.">
                            <i className={`fas fa-lg fa-circle-info`}></i>
                        </span>
                        </div>
            </div>

            <div className="field has-addons">
                <div className="select">
                    <select value={driverType} className={`${isDriverAllowedInWebMode(driverType) ? "" : "has-text-danger"}`}
                        onChange={(evt) => updateDriverType(evt.target.value as DriverNames)}>
                        {
                            Object.values(DriverNames).map(
                                (driver, dindex) => {
                                    if (isDriverAllowedInWebMode(driver)) {
                                        return <option className="has-text-black" key={dindex} value={driver}>{driver}</option>
                                    } else {
                                        return <option className="has-text-danger" key={dindex} value={driver}>{driver}</option>
                                    }
                                }
                            )
                        }
                    </select>
                </div>
                <p className="control">
                    <a className="button is-info" onClick={() => {
                        setDriverModalIsOpen(!driverModalIsOpen)
                    }}>
                        Settings
                    </a>
                </p>
                {
                    (() => {
                        if (isDriverAllowedInWebMode(driverType)) {
                            return <div></div>
                        } else return <div className="control is-flex is-align-items-center ml-2 has-text-danger">
                            <p className="is-justify-content-center">{getDriverWarning(driverType)}</p>
                        </div>
                    })()
                }
                {
                    (() => {
                        if (driverModalIsOpen) {
                            return (
                                <div className={`modal ${driverModalIsOpen ? "is-active" : ""}`}>
                                    <div className="modal-background"></div>
                                    <div className="modal-card">
                                        <header className="modal-card-head">
                                            <p className="modal-card-title">{driverType} Settings</p>
                                            <button className="delete" aria-label="close"
                                                onClick={() => setDriverModalIsOpen(false)}></button>
                                        </header>
                                        <section className="modal-card-body">
                                            {
                                                (() => {
                                                    switch (driverType) {
                                                        case DriverNames.DriverSerialPortWebSerial:
                                                            return (
                                                                <DriverWebSerialSetup
                                                                    cfg={tmpDriverSettings as DriverSerialPortWebSerialParameters}
                                                                    onConfigUpdate={(cfg) => {
                                                                        setTmpDriverSettings({ ...tmpDriverSettings, ...cfg })
                                                                    }}
                                                                />
                                                            )
                                                        case DriverNames.DriverAdbLogcat:
                                                            return (
                                                                <DriverAdbLogcatSetup
                                                                    cfg={tmpDriverSettings as DriverAdbLogcatParameters}
                                                                    onConfigUpdate={(cfg) => {
                                                                        setTmpDriverSettings({ ...tmpDriverSettings, ...cfg })
                                                                    }}
                                                                />
                                                            )
                                                        case DriverNames.DriverWebSockify:
                                                            return (
                                                                <DriverWebSockifySetup
                                                                    cfg={tmpDriverSettings as DriverWebSockifyParameters}
                                                                    onConfigUpdate={(cfg) => {
                                                                        setTmpDriverSettings({ ...tmpDriverSettings, ...cfg })
                                                                    }}
                                                                />
                                                            )

                                                    }
                                                })()
                                            }
                                        </section>
                                        <footer className="modal-card-foot">
                                            <button className="button is-success mr-2"
                                                onClick={() => {
                                                    updateDriverSettings(tmpDriverSettings);
                                                    setDriverModalIsOpen(false)
                                                }}>
                                                Save changes
                                            </button>
                                            <button className="button is-danger"
                                                onClick={() => setDriverModalIsOpen(false)}>
                                                Cancel
                                            </button>
                                        </footer>
                                    </div>
                                </div>
                            )
                        } else return (<div />)

                    })()
                }
            </div>

            <div className="field is-grouped mt-4">
                <div className="control">
                    <div className="file is-primary " onClick={() => exportProfile()}>
                        <label className="file-label">

                            <span className="file-cta">
                                <span className="file-icon">
                                    <i className="fas fa-download"></i>
                                </span>
                                <span className="file-label">
                                    Export profile
                                </span>
                            </span>
                        </label>
                    </div>
                </div>
                <div className="control">
                    <div className="file is-primary">
                        <label className="file-label">
                            <input className="file-input" type="file" name="import" accept=".bll" onChange={(e) => loadProfile(e)} />
                            <span className="file-cta">
                                <span className="file-icon">
                                    <i className="fas fa-upload"></i>
                                </span>
                                <span className="file-label has-text-white">
                                    Import profile
                                </span>
                            </span>
                        </label>
                    </div>
                </div>
            </div>
            </div>
        </React.Fragment>
    )
}
