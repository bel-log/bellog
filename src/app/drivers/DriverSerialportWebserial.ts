import { DriverError } from "../utility/exception"
import {Driver, DriverNames, DriverOpenClose, DriverStatus} from "./Driver"
import { DriverCache } from "./DriverCache"

export interface DriverSerialPortWebSerialParameters extends SerialOptions {
    usbVendorId?: number
    usbProductId?: number
}

export const DriverSerialPortWebSerialDefaults: DriverSerialPortWebSerialParameters = {
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: "none",
    bufferSize: 255,
    flowControl: "none"
}

export class DriverSerialPortWebSerial implements DriverOpenClose {

    private readonly usbVendorId: number
    private readonly usbProductId: number
    private readonly options: SerialOptions
    private port: SerialPort
    private portReader:  ReadableStreamDefaultReader<Uint8Array>
    private DriverCache: DriverCache
    private onReceiveCb: (data: Uint8Array) => void
    private onTransmitCb: (data: Uint8Array | string) => void
    private onStatusChangeCb: (status: DriverStatus) => void
    private onErrorCb: (ex: Error) => void
    readonly name: string;
    _status: DriverStatus;
    private readingPromise: () => Promise<void>;

    public get status(): DriverStatus {
        return this._status;
    }

    constructor(private readonly params: DriverSerialPortWebSerialParameters) {
        this.name = DriverNames.DriverSerialPortWebSerial
        this._status = DriverStatus.CLOSE
        this.usbVendorId = params.usbVendorId ?? 0
        this.usbProductId = params.usbProductId ?? 0
        this.options = params
        this.DriverCache = new DriverCache()
        this.DriverCache.setTimeout(200, 100)
    }

    attach(view: HTMLElement): void {
        
    }

    onError(cb: (ex: Error) => void): void {
        this.onErrorCb = cb
    }

    onReceive(cb: (data: Uint8Array) => void): void {
        this.onReceiveCb = cb
    }

    onTransmit(cb: (data: Uint8Array) => void): void {
        this.onTransmitCb = cb
    }

    onStatusChange(cb: (status: DriverStatus) => void) {
        this.onStatusChangeCb = cb
    }

    async send(data: Uint8Array | string) {
        try {
            let wdata = data
            if(typeof data === "string") {
                wdata = new TextEncoder().encode(data);
            }
            const writer = this.port.writable.getWriter();
            await writer.write(wdata as Uint8Array)
            writer.releaseLock()
            
            this.onTransmitCb(wdata)
        }
        catch (error)
        {
            console.error(error)
        }
    }

    open()
    {
        this.readingPromise = async () => {
            try
            {
                await this.getPortInstance()
                this._status = DriverStatus.OPEN
                this.onStatusChangeCb?.(this._status)

                this.DriverCache.onFlush((data) => {
                    data.forEach((d) => {
                        this.onReceiveCb?.(d as Uint8Array)
                    })
                })

                while (this.port.readable && this.status == DriverStatus.OPEN) {
                    this.portReader = this.port.readable.getReader();
                    try {
                        while (true) {
                            const {value, done} = await this.portReader.read();
                            if (done) {
                                // |reader| has been canceled.
                                break;
                            }
                            if (value) {
                                this.DriverCache.add(value)
                            }
                        }
                    } catch (error) {
                        console.error(error)
                    } finally {
                        this.portReader.releaseLock();
                    }
                }

                this.DriverCache.flush()
                await this.port.close();
            }
            catch (error)
            {
                console.error(error)
                this.onErrorCb?.(error)
                if (!('usb' in navigator)) {
                    this.onErrorCb?.(new DriverError("WebUSB is not supported by your browser. Switch to either Chrome or Edge."))
                }
            }

            this.DriverCache.clean()
            this._status = DriverStatus.CLOSE
            this.onStatusChangeCb?.(this._status)
        }

        this.readingPromise()
    }

    close()
    {
        this.portReader?.cancel()
    }

    destroy() {
        
    }

    private async getPortInstance() {
        this.port = (await navigator.serial?.getPorts())?.find(
            (val) => {
                let info = val.getInfo()
                return (
                    info.usbProductId === this.usbProductId &&
                    info.usbVendorId === this.usbVendorId
                )
            }
        ) ?? await navigator.serial.requestPort()

        try {
            await this.port.open(this.options)
            this._status = DriverStatus.OPEN
        } catch (error) {
            this._status = DriverStatus.CLOSE
        }

    }
}