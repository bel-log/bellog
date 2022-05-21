import {DriverClipboardParameters} from "./DriverClipboard";
import {DriverSerialPortWebSerialParameters} from "./DriverSerialportWebserial";

export type DriverSettings = DriverClipboardParameters | DriverSerialPortWebSerialParameters

export enum DriverNames{
    DriverClipboard = "Clipboard",
    DriverSerialPortWebSerial = "Serialport WebSerial"
}

export enum DriverStatus {
    OPEN,
    CLOSE
}

export interface Driver {
    readonly name:string
    send(data: Uint8Array): void
    onReceive(cb: (this: Driver, data: Uint8Array | string) => void):void
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