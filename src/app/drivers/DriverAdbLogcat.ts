import { DriverError } from "../utility/exception"
import { Driver, DriverOpenClose, DriverStatus } from "./Driver"
import Adb from "webadb"
import { DriverCache } from "./DriverCache"

export interface DriverAdbLogcatParameters {
    clearLogAtConnection: boolean
}

export const DriverAdbLogcatDefaults = {
    clearLogAtConnection: true
}

export class DriverAdbLogcat implements DriverOpenClose {

    private webusb: any
    private adb: any
    private shell: any
    private DriverCache: DriverCache
    private onReceiveCb: (data: string) => void
    private onTransmitCb: (data: Uint8Array | string) => void
    private onStatusChangeCb: (status: DriverStatus) => void
    private onErrorCb: (ex: Error) => void
    readonly name: string;
    _status: DriverStatus;
    private readingPromise: () => Promise<void>;

    public get status(): DriverStatus {
        return this._status;
    }

    constructor(readonly params: DriverAdbLogcatParameters) {
        this.name = "WebSerial"
        this._status = DriverStatus.CLOSE
        this.DriverCache = new DriverCache()
        this.DriverCache.setTimeout(200, 100)
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

    onError(cb: (ex: Error) => void) {
        this.onErrorCb = cb
    }

    async send(data: Uint8Array | string) {
        // No send supported via adb
    }

    open() {
        this.readingPromise = async () => {
            try {
                this.webusb = await Adb.open("WebUSB");
                this.adb = await this.webusb.connectAdb("host::");

                if (this.webusb && this.adb) {
                    let decoder = new TextDecoder();
                    this._status = DriverStatus.OPEN
                    this.onStatusChangeCb?.(this._status)
                    let acc = ""

                    if (this.params.clearLogAtConnection) {
                        let shellc = await this.adb.shell("logcat -c")
                        await shellc.receive()
                    }

                    this.DriverCache.onFlush((data) => {
                        data.forEach((d) => {
                            this.onReceiveCb?.(d as string)
                        })
                    })

                    this.shell = await this.adb.open('shell:logcat');
                    let r = await this.shell.receive();
                    while (r.cmd == "WRTE") {
                        if (r.data != null) {
                            if (this.onReceiveCb) {
                                let data = decoder.decode(r.data)
                                this.DriverCache.add(data)
                            }
                        }

                        this.shell.send("OKAY");
                        r = await this.shell.receive();
                    }

                    this.shell.close();
                    this.shell = null;
                }

                this.DriverCache.clean()
                await this.webusb.close();
            }
            catch (error) {
                console.error(error)
                this.onErrorCb?.(error)
                if (error.message.toLowerCase().indexOf("checksum") > 0) {
                    // TODO INVESTIGATE
                    this.onErrorCb?.(new DriverError("Checksum error, please disconnect and reconnect the device"))
                }
                if (!('usb' in navigator)) {
                    this.onErrorCb?.(new DriverError("WebUSB is not supported by your browser. Switch to either Chrome or Edge."))
                }
            }
            this._status = DriverStatus.CLOSE
            this.onStatusChangeCb?.(this._status)
        }

        this.readingPromise()
    }

    async close() {
        if (this.shell)
            this.shell.close();
    }

    destroy() {

    }
}