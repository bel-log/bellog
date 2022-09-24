import { usePropagator, useStateWithCallback } from "../../utility/customHooks";
import * as React from "react";
import { buildDefaultDriverWebSerialSettings } from "../../app/setup/SetupFactories";
import { DriverSerialPortWebSerialParameters } from "../../drivers/DriverSerialportWebserial";
import { DriverNames } from "../../drivers/Driver";
import { useEffect, useState } from "react";

export const DriverWebSerialSetup = (props: { cfg: SerialOptions, onConfigUpdate: any }) => {

    const [p, applyCache] = usePropagator<SerialOptions>(props.cfg, props.onConfigUpdate)

    const [baudRate, setBaudRate] = [p.baudRate.val, p.baudRate.set]
    const [dataBits, setDataBits] = [p.dataBits.val, p.dataBits.set]
    const [parity, setParity] = [p.parity.val, p.parity.set]
    const [bufferSize, setBufferSize] = [p.bufferSize.val, p.bufferSize.set]
    const [flowControl, setFlowControl] = [p.flowControl.val, p.flowControl.set]

    return (
        <React.Fragment>

            <div className="field is-horizontal">
                <div className="field-label is-normal">
                    <label className="label">Baudrate</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        <p className="control is-expanded">
                            <input className="input" type="number" placeholder="Baudrate" value={baudRate}
                                onChange={(evt) => { setBaudRate(parseInt(evt.target.value)) }} />
                        </p>
                    </div>
                </div>
            </div>

            <div className="field is-horizontal">
                <div className="field-label is-normal">
                    <label className="label">Databits</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        <div className="select">
                            <select value={dataBits}
                                onChange={(evt) => { setDataBits(parseInt(evt.target.value)) }}>
                                <option>7</option>
                                <option>8</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="field is-horizontal">
                <div className="field-label is-normal">
                    <label className="label">Parity</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        <div className="select">
                            <select value={parity}
                                onChange={(evt) => { setParity(evt.target.value as ParityType) }}>
                                <option>none</option>
                                <option>even</option>
                                <option>odd</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="field is-horizontal">
                <div className="field-label is-normal">
                    <label className="label">Buffersize</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        <p className="control is-expanded">
                            <input className="input" type="number" placeholder="Buffersize" value={bufferSize}
                                onChange={(evt) => { setBufferSize(parseInt(evt.target.value)) }} />
                        </p>
                    </div>
                </div>
            </div>

            <div className="field is-horizontal">
                <div className="field-label is-normal">
                    <label className="label">Flow control</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        <div className="select">
                            <select value={flowControl}
                                onChange={(evt) => setFlowControl(evt.target.value as FlowControlType)}>
                                <option>none</option>
                                <option>hardware</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>

    )
}
