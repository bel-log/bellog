import {DriverClipboardParameters} from "./DriverClipboard";
import {DriverSerialPortWebSerialParameters} from "./DriverSerialportWebserial";
import {DriverBackendSerialPortParameters} from "./DriverBackendSerialPort";

export type DriverSettings = DriverClipboardParameters | 
                    DriverSerialPortWebSerialParameters | 
                    DriverBackendSerialPortParameters

export enum DriverNames{
    DriverClipboard = "Clipboard",
    DriverSerialPortWebSerial = "Serialport WebSerial",
    DriverBackendSerialPort = "Serialport Backend"
}

export enum DriverStatus {
    OPEN,
    CLOSE
}

export interface Driver {
    readonly name:string
    attach(view: HTMLElement): void
    send(data: Uint8Array | string): void
    onReceive(cb: (data: Uint8Array | string) => void):void
    onTransmit(cb: (data: Uint8Array | string) => void):void
    destroy()
}

export interface DriverOpenClose extends Driver {
    get status(): DriverStatus
    open()
    close()
    onStatusChange(cb: (this: Driver) => void):void
}

export function isDriverOpenClose(driver: Driver): boolean {
    return !!(driver as DriverOpenClose)?.open;

}