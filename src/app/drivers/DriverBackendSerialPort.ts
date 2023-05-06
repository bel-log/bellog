import {Driver, DriverOpenClose, DriverStatus} from "./Driver"
import { DriverBackend } from "./DriverBackend";

type ParityType = 'none' | 'even' | 'odd';

type FlowControlType = 'none' | 'hardware';

export interface DriverBackendSerialPortParameters {
    port: string,
    baudRate: number;
    dataBits?: number | undefined;
    stopBits?: number | undefined;
    parity?: ParityType | undefined;
    bufferSize?: number | undefined;
    flowControl?: FlowControlType | undefined;
}

export const DriverBackendSerialPortDefaults: DriverBackendSerialPortParameters = {
    port: "COM1",
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: "none",
    bufferSize: 255,
    flowControl: "none"
}

export class DriverBackendSerialPort implements DriverOpenClose {
    private driverBackend: DriverBackend
    private onReceiveCb: (data: Uint8Array) => void
    private onTransmitCb: (data: Uint8Array | string) => void
    private onStatusChangeCb: (status: DriverStatus) => void
    private onError: () => void
    readonly name: string;
    _status: DriverStatus;

    constructor(private readonly params: DriverBackendSerialPortParameters) {
        this.name = "BackendSerialPort"
        this._status = DriverStatus.CLOSE

        let p = {}
        Object.keys(params).forEach((it) => {
            p[it] = params[it].toString()
        })

        let url = "ws://localhost:8081/serialport"///?setup=" +  new URLSearchParams(p).toString()
       

        this.driverBackend = new DriverBackend(url)
    }

    public get status(): DriverStatus {
        return this._status;
    }

    attach(view: HTMLElement): void {
        
    }

    onReceive(cb: (data: string | Uint8Array) => void): void {
        this.onReceiveCb = cb
    }

    onTransmit(cb: (data: string | Uint8Array) => void): void {
        this.onTransmitCb = cb
    }

    onStatusChange(cb: (status: DriverStatus) => void) {
        this.onStatusChangeCb = cb
    }

    async send(data: Uint8Array | string) {
        this.driverBackend.send(data)
        this.onTransmitCb(data)
    }

    async open()
    {

        this.driverBackend.onReceive(
            (data: string | Uint8Array) => {
                this.onReceiveCb(data as Uint8Array)
            }
        )

        this.driverBackend.onStatusChange(
            (status: DriverStatus) => {
                this.onStatusChangeCb(status)
            }
        )

        this.driverBackend.open()
    }

    async close()
    {
        this.driverBackend.close()
    }

    destroy() {
        this.driverBackend.destroy()
    }

}