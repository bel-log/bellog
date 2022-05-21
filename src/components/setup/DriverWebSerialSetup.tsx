import { useStateWithCallback } from "../../utility/customHooks";
import * as React from "react";
import { buildDefaultDriverWebSerialSettings } from "../../app/setup/SetupFactories";
import { DriverSerialPortWebSerialParameters } from "../../drivers/DriverSerialportWebserial";
import { DriverNames } from "../../drivers/Driver";
import { useEffect, useState } from "react";

export const DriverWebSerialSetup = (props: { cfg: DriverSerialPortWebSerialParameters, onConfigUpdate: any }) => {

    const defaultSettings = (buildDefaultDriverWebSerialSettings(DriverNames.DriverSerialPortWebSerial) as DriverSerialPortWebSerialParameters)

    const [baudRate, setBaudRate] = useState(props.cfg.options.baudRate ?? defaultSettings.options.baudRate)

    const [dataBits, setDataBits] = useState(props.cfg.options.dataBits ?? defaultSettings.options.dataBits)

    const [parity, setParity] = useState(props.cfg.options.parity ?? defaultSettings.options.parity)

    const [bufferSize, setBufferSize] = useState(props.cfg.options.bufferSize ?? defaultSettings.options.bufferSize)

    const [flowControl, setFlowControl] = useState(props.cfg.options.flowControl ?? defaultSettings.options.flowControl)

    useEffect(() => {
        props.onConfigUpdate({
            options:
            {
                baudRate: baudRate,
                dataBits: dataBits,
                parity: parity,
                bufferSize: bufferSize,
                flowControl: flowControl
            }
        }
        )
    }, [baudRate, dataBits, parity, bufferSize, flowControl])


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
