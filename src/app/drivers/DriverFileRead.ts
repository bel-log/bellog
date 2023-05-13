import { DriverError } from "../utility/exception"
import { Driver, DriverNames, DriverOpenClose, DriverStatus } from "./Driver"
import { DriverCache } from "./DriverCache"

export interface DriverFileReadParameters {}

export const DriverFileReadDefaults = {}

export class DriverFileRead implements DriverOpenClose {

    private cache: DriverCache
    private fileReader: ReadableStreamDefaultReader<Uint8Array>
    private onReceiveCb: (data: Uint8Array) => void
    private onTransmitCb: (data: Uint8Array) => void
    private onStatusChangeCb: (status: DriverStatus) => void
    private onErrorCb: (ex: Error) => void
    private readingPromise: () => Promise<void>;
    readonly name: string;
    _status: DriverStatus;

    public get status(): DriverStatus {
        return this._status;
    }

    constructor() {
        this.name = DriverNames.DriverFileRead
        this._status = DriverStatus.CLOSE
        this.cache = new DriverCache()
        this.cache.setTimeout(200, 100)
    }

    attach(view: HTMLElement): void {

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

    onError(cb: (ex: Error) => void) {
        this.onErrorCb = cb
    }

    async send(data: Uint8Array | string) {
        // No send supported via adb
    }

    async open() {
            try {
                this._status = DriverStatus.OPEN
                this.onStatusChangeCb?.(this._status)

                const openFile = await window.showOpenFilePicker()
                const file = await openFile[0].getFile()
                const stream = file.stream().getReader()

                this.cache.onFlush( (data: (Uint8Array)[]) => {
                    data.forEach((d) => {
                        this.onReceiveCb?.(d)
                    })
                })

                while (true) {
                    const { value, done } = await stream.read();
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
            }
            this.cache.clean()
            this._status = DriverStatus.CLOSE
            this.onStatusChangeCb?.(this._status)
    }

    close() {
        this.fileReader.cancel()
    }


    destroy() {

    }
}