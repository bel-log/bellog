import {DriverClipboardParameters} from "./DriverClipboard";
import {DriverSerialPortWebSerialParameters} from "./DriverSerialportWebserial";
import {DriverAdbLogcatParameters} from "./DriverAdbLogcat";
import { DriverWebSockifyParameters } from "./DriverWebSockify";
import { DriverFileReadParameters } from "./DriverFileRead";

export type DriverSettings = DriverClipboardParameters | 
                    DriverSerialPortWebSerialParameters | 
                    DriverAdbLogcatParameters |
                    DriverWebSockifyParameters |
                    DriverFileReadParameters

export type DriverDataDescription = any

export enum DriverNames{
    DriverClipboard = "Clipboard",
    DriverSerialPortWebSerial = "Serialport WebSerial",
    DriverAdbLogcat = "Adb Logcat",
    DriverFileRead = "File Read",
    DriverWebSockify = "TCP Socket"
}

export enum DriverStatus {
    OPEN,
    CLOSE
}

export interface Driver {
    readonly name:string
    /* Called when the driver is attached to the view */
    attach(view: HTMLElement): void
    /* Send data to the device
     * @param data The data to send
     * @param dataDescription Additional data from complex drivers (CAN bus address, HID report ID, etc.)
    */
    send(data: Uint8Array | string, dataDescription?: DriverDataDescription): void
    /* Provide callback to receive data from the device driver
    * @param cb The callback to call when data is received
    * @param data The data received
    * @param dataDescription Additional data from complex drivers (CAN bus address, HID report ID, etc.)
    */ 
    onReceive(cb: (data: Uint8Array, dataDescription?: DriverDataDescription) => void):void
    /* Provide callback to receive confirmation of data sent to device
    * @param cb The callback to call when data is received
    * @param data The data received
    * @param dataDescription Additional data from complex drivers (CAN bus address, HID report ID, etc.)
    */ 
    onTransmit(cb: (data: Uint8Array, dataDescription?: DriverDataDescription) => void):void
    onError(cb: (ex: Error) => void):void
    destroy()
}

export interface DriverOpenClose extends Driver {
    get status(): DriverStatus
    open()
    close()
    onStatusChange(cb: (this: Driver) => void):void
}

export interface DriverLoggable extends Driver {
    loadImport()
    enableLogging(prefixName: string)
    disableLogging()
}

export function isDriverOpenClose(driver: Driver): boolean {
    return !!(driver as DriverOpenClose)?.open;
}

export function isDriverLoggable(driver: Driver): boolean {
    return !!(driver as DriverLoggable)?.enableLogging;
}
