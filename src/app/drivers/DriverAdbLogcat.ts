import { DriverError } from "../utility/exception"
import { Driver, DriverOpenClose, DriverStatus } from "./Driver"
import { DriverCache } from "./DriverCache"
import { AdbWebUsbBackend, AdbWebUsbBackendManager } from "@yume-chan/adb-backend-webusb"
import {
    Consumable,
    InspectStream,
    ReadableStream,
    WritableStream,
    pipeFrom,
} from "@yume-chan/stream-extra";
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";
import { Adb, AdbPacketData, AdbPacketInit } from "@yume-chan/adb"

export interface DriverAdbLogcatParameters {
    clearLogAtConnection: boolean
}

export const DriverAdbLogcatDefaults = {
    clearLogAtConnection: true
}

export class DriverAdbLogcat implements DriverOpenClose {

    private CredentialStore: any
    private DriverCache: DriverCache
    private logcatReader: ReadableStreamDefaultReader<Uint8Array>
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
        this.CredentialStore = new AdbWebCredentialStore();
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

            let device

            try {
                //this.webusb = await Adb.open("WebUSB");
                let readable: ReadableStream<AdbPacketData>;
                let writable: WritableStream<Consumable<AdbPacketInit>>;
                const backend = await AdbWebUsbBackendManager.BROWSER!.requestDevice();
                const streams = await backend.connect()

                // Use `InspectStream`s to intercept and log packets
                readable = streams.readable.pipeThrough(
                    new InspectStream((packet) => {
                        //GLOBAL_STATE.appendLog("in", packet);
                        //console.log(packet)
                    })
                );

                writable = pipeFrom(
                    streams.writable,
                    new InspectStream((packet: Consumable<AdbPacketInit>) => {
                        //GLOBAL_STATE.appendLog("out", packet.value);
                        //console.log(packet)
                    })
                );

                device = await Adb.authenticate(
                    { readable, writable },
                    this.CredentialStore,
                    undefined
                );

                async function dispose() {
                    // Adb won't close the streams,
                    // so manually close them.
                    try {
                        readable.cancel();
                    } catch { }
                    try {
                        await writable.close();
                    } catch { }
                }

                device.disconnected.then(
                    async () => {
                        await dispose();
                    },
                    async (e) => {
                        await dispose();
                    }
                );


                this._status = DriverStatus.OPEN
                this.onStatusChangeCb?.(this._status)
                let acc = ""

                if (this.params.clearLogAtConnection) {
                    await device.subprocess.shell("logcat -c")
                }

                this.DriverCache.onFlush((data) => {
                    data.forEach((d) => {
                        this.onReceiveCb?.(d as string)
                    })
                })

                let shell = await device.subprocess.shell("logcat")
                this.logcatReader = await shell.stdout.getReader()

                while (true) {
                    const { value, done } = await this.logcatReader.read();
                    if (done) {
                        // |reader| has been canceled.
                        break;
                    }
                    if (value) {
                        this.DriverCache.add(value)
                    }
                }
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

            device?.close()
            this.DriverCache.clean()
            this._status = DriverStatus.CLOSE
            this.onStatusChangeCb?.(this._status)
        }

        this.readingPromise()
    }

    async close() {
        this?.logcatReader.cancel()
    }

    destroy() {

    }
}