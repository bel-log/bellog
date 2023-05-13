import { usePropagator, useStateWithCallback } from "../../utility/customHooks";
import * as React from "react";
import { buildDefaultDriverWebSerialSettings } from "../../setup/SetupFactories";
import { DriverSerialPortWebSerialParameters } from "../../drivers/DriverSerialportWebserial";
import { DriverNames } from "../../drivers/Driver";
import { useEffect, useState } from "react";
import { DriverWebSockifyParameters } from "../../drivers/DriverWebSockify";

export const DriverWebSockifySetup = (props: { cfg: DriverWebSockifyParameters, onConfigUpdate: any }) => {

    const [p, applyCache] = usePropagator<DriverWebSockifyParameters>(props.cfg, props.onConfigUpdate)

    const [ip, setIp] = [p.ip.val, p.ip.set]
    const [port, setPort] = [p.port.val, p.port.set]
    const [externalWebSockify, setExternalWebSockify] = [p.externalWebSockify.val, p.externalWebSockify.set]
    const [externalWebSockifyPort, setExternalWebSockifyPort] = [p.externalWebSockifyPort.val, p.externalWebSockifyPort.set]

    return (
        <React.Fragment>

            <div className={`field is-horizontal ${externalWebSockify ? "is-hidden" : ""}`}>
                <div className="field-label is-normal">
                    <label className="label">Ip Address</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        <p className="control is-expanded">
                            <input className="input" placeholder="Baudrate" value={ip}
                                onChange={(evt) => { setIp(evt.target.value) }} />
                        </p>
                    </div>
                </div>
            </div>

            <div className={`field is-horizontal ${externalWebSockify ? "is-hidden" : ""}`}>
                <div className="field-label is-normal">
                    <label className="label">Port</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        <p className="control is-expanded">
                            <input className="input" type="number" placeholder="Baudrate" value={port}
                                onChange={(evt) => { setPort(parseInt(evt.target.value)) }} />
                        </p>
                    </div>
                </div>
            </div>

            <div className="field">
                <div className="control">
                    <label className="checkbox has-tooltip-bottom" data-tooltip="See documentation">
                        <input type="checkbox" 
                            checked={externalWebSockify} onChange={(evt) => { setExternalWebSockify(evt.target.checked) }}></input>
                        &nbsp;Separate websockify process
                    </label>
                </div>
            </div>


            <div className={`field is-horizontal ${externalWebSockify ? "" : "is-hidden"}`}>
                <div className="field-label is-normal">
                    <label className="label">Port</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        <p className="control is-expanded">
                            <input className="input" type="number" placeholder="Baudrate" value={externalWebSockifyPort}
                                onChange={(evt) => { setExternalWebSockifyPort(parseInt(evt.target.value)) }} />
                        </p>
                    </div>
                </div>
            </div>

        </React.Fragment>

    )
}
