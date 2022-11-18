import {Driver, DriverOpenClose, DriverStatus} from "./Driver"

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
    private readingProcess: Boolean
    private portReader:  ReadableStreamDefaultReader<Uint8Array>
    private onReceiveCb: (data: Uint8Array) => void
    private onTransmitCb: (data: Uint8Array | string) => void
    private onStatusChangeCb: (status: DriverStatus) => void
    private onError: () => void
    readonly name: string;
    _status: DriverStatus;
    private readingPromise: () => Promise<void>;

    public get status(): DriverStatus {
        return this._status;
    }

    constructor(private readonly params: DriverSerialPortWebSerialParameters) {
        this.name = "WebSerial"
        this._status = DriverStatus.CLOSE
        this.usbVendorId = params.usbVendorId ?? 0
        this.usbProductId = params.usbProductId ?? 0
        this.options = params
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
        try {
            let wdata = data
            if(typeof data === "string") {
                wdata = new TextEncoder().encode(data);
            }
            const writer = this.port.writable.getWriter();
            await writer.write(wdata as Uint8Array)
            writer.releaseLock()
            
            this.onTransmitCb(data)
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
                                this.onReceiveCb?.(value)
                            }
                        }
                    } catch (error) {
                        console.error(error)
                    } finally {
                        this.portReader.releaseLock();
                    }
                }

                this.readingProcess = false
                await this.port.close();
            }
            catch (error)
            {
                console.error(error)
                this.onError?.()
            }
            this._status = DriverStatus.CLOSE
            this.onStatusChangeCb?.(this._status)
        }

        this.readingPromise()
    }

    close()
    {
        this.portReader?.cancel()
        this._status = DriverStatus.CLOSE
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