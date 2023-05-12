import { DriverError } from "../utility/exception"
import { DriverLoggable, DriverNames, DriverOpenClose, DriverStatus } from "./Driver"
import { DriverCache } from "./DriverCache"
import { AdbWebUsbBackendManager } from "@yume-chan/adb-backend-webusb"
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

    private CredentialStore: AdbWebCredentialStore
    private cache: DriverCache
    iverCache
    private logcatReader: ReadableStreamDefaultReader<Uint8Array>
    private onReceiveCb: (data: Uint8Array) => void
    private onStatusChangeCb: (status: DriverStatus) => void
    private onErrorCb: (ex: Error) => void
    private idlePromise: Promise<void>;

    readonly name: string;
    _status: DriverStatus;

    public get status(): DriverStatus {
        return this._status;
    }

    constructor(readonly params: DriverAdbLogcatParameters) {
        this.name = DriverNames.DriverAdbLogcat
        this._status = DriverStatus.CLOSE
        this.cache = new DriverCache()
        this.cache.setTimeout(200, 100)
        this.CredentialStore = new AdbWebCredentialStore();
        this.idlePromise = null
    }


    attach(view: HTMLElement): void {

    }

    onReceive(cb: (data: Uint8Array) => void): void {
        this.onReceiveCb = cb
    }

    onTransmit(cb: (data: Uint8Array) => void): void {
    }

    onStatusChange(cb: (status: DriverStatus) => void) {
        this.onStatusChangeCb = cb
    }

    onError(cb: (ex: Error) => void) {
        this.onErrorCb = cb
    }

    async loadImport(file: File) {
        await this.close()
        if(this.idlePromise) {
            await this.idlePromise
        }

        const stream = file.stream().getReader()
        const value = (await stream.read()).value

        if (value) {
            this.cache.add(value)
        }

        this.cache.clean()
    }

    async send(data: Uint8Array | string) {
        // No send supported via adb
    }

    async open() {

        let device: Adb

        this.idlePromise = new Promise(async (resolve) => {


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

                this.cache.onFlush((data) => {
                    data.forEach((d) => {
                        this.onReceiveCb?.(d)
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
                        this.cache.add(value)
                    }
                }

                this.cache.flush()
            }
            catch (error) {
                console.error(error)
                this.onErrorCb?.(error)
                if (!('usb' in navigator)) {
                    this.onErrorCb?.(new DriverError("WebUSB is not supported by your browser. Switch to either Chrome or Edge."))
                }
            }

            device?.close()
            this.cache.clean()
            this._status = DriverStatus.CLOSE
            this.onStatusChangeCb?.(this._status)

            resolve()
            this.idlePromise = null
        })

    }

    async close() {
        this?.logcatReader.cancel()
    }

    destroy() {

    }
}