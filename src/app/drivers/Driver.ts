import {DriverClipboardParameters} from "./DriverClipboard";
import {DriverSerialPortWebSerialParameters} from "./DriverSerialportWebserial";
import {DriverBackendSerialPortParameters} from "./DriverBackendSerialPort";
import {DriverAdbLogcatParameters} from "./DriverAdbLogcat";

export type DriverSettings = DriverClipboardParameters | 
                    DriverSerialPortWebSerialParameters | 
                    DriverBackendSerialPortParameters |
                    DriverAdbLogcatParameters

export enum DriverNames{
    DriverClipboard = "Clipboard",
    DriverSerialPortWebSerial = "Serialport WebSerial",
    DriverAdbLogcat = "Adb Logcat",
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
    onError(cb: (ex: Error) => void):void
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