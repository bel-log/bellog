import {
    Driver,
    DriverChunkInfo,
    DriverLoggable,
    DriverNames,
    DriverOpenClose,
    DriverStatus,
    isDriverOpenClose
} from "./Driver"
import { DriverCache } from "./DriverCache"
import {Buffer} from "buffer";

interface DriverChunk {
    info: DriverChunkInfo,
    data: string
}

/* This class is a decorator for the Driver class. It adds logging capabilities to the driver. */
export class DirverLoggerDecorator implements DriverLoggable, DriverOpenClose {
    private fileWriter: FileSystemWritableFileStream
    private loggerCache: DriverCache<any>

    private onReceiveCb: (data: Uint8Array, chunkInfo: DriverChunkInfo) => void
    private onTransmitCb: (data: Uint8Array, chunkInfo: DriverChunkInfo) => void

    constructor(private baseDriver: DriverOpenClose) {
        this.loggerCache = new DriverCache()
        this.loggerCache.setTimeout(200, 30)
    }

    get status(): DriverStatus {
        return this.baseDriver.status
    }

    open() {
        this.baseDriver.open()
    }
    close() {
        this.baseDriver.close()
    }

    onStatusChange(cb: (this: Driver) => void): void {
        this.baseDriver.onStatusChange(cb)
    }

    public get name(): string {
        return this.baseDriver.name
    }

    attach(view: HTMLElement): void {
        this.baseDriver.attach(view)
    }

    send(data: string | Uint8Array): void {
        this.baseDriver.send(data)
    }

    onError(cb: (ex: Error) => void): void {
        this.baseDriver.onError(cb)
    }
    
    destroy() {
        this.baseDriver.destroy()
    }

    async loadImport() {
        if(isDriverOpenClose(this.baseDriver)) {
            await (this.baseDriver as DriverOpenClose).close()
        }

        const openFile = await window.showOpenFilePicker()
        const file = await openFile[0].getFile()
        const stream = file.stream().getReader()
        this.loggerCache.clean()
        this.loggerCache.onFlush((data: []) => {
            data.forEach((obj:DriverChunk) => {
                const data = Uint8Array.from(Buffer.from(obj.data, 'hex'))
                if(obj.info.isTx) {
                    this.onTransmitCb?.(data, obj.info)
                } else {
                    this.onReceiveCb?.(data, obj.info)
                }
            })
        })

        let byteCount = 0

        while (true) {
            const {value, done} = await stream.read()
            if (done) {
                // |reader| has been canceled.
                break;
            }
            if (value && value.length > 0) {
                for(let i=0; i < value.length; i++)
                {
                    if(value[i] === 0x0D)  {
                        if(byteCount > 0) {
                            let acc = value.subarray(i-byteCount, (i-byteCount) + byteCount)
                            const text = new TextDecoder().decode(acc);
                            const obj = JSON.parse(text)
                            this.loggerCache.add(obj)
                        }
                        byteCount = 0
                    }
                    else {
                        byteCount++
                    }
                }
            }
        }

        this.loggerCache.flush()

    }

    async enableLogging(prefixName: string) {
        const saveFile = await window.showSaveFilePicker({ suggestedName: prefixName + "_" + new Date().toLocaleString('en-GB', { hour12: false }) + ".txt" });
        this.fileWriter = await saveFile.createWritable()
    }

    async disableLogging() {
        await this.fileWriter?.close()
        this.fileWriter = null
    }

    onReceive(cb: (data: Uint8Array, chunkInfo: DriverChunkInfo) => void): void {
        this.onReceiveCb = cb
        this.baseDriver.onReceive((data: Uint8Array, chunkInfo: DriverChunkInfo) => {
            const d:DriverChunk =
                {
                    info: chunkInfo,
                    data: Array.prototype.map.call(data, x => ('00' + x.toString(16)).slice(-2)).join('')
                }
            this.fileWriter?.write(JSON.stringify(d) + "\r\n")
            cb(data, chunkInfo)
        })
    }

    onTransmit(cb: (data: Uint8Array, chunkInfo: DriverChunkInfo) => void): void {
        this.onTransmitCb = cb
        this.baseDriver.onTransmit((data: Uint8Array, chunkInfo: DriverChunkInfo) => {
            const d:DriverChunk =
                {
                    info: chunkInfo,
                    data: Array.prototype.map.call(data, x => ('00' + x.toString(16)).slice(-2)).join('')
                }
            this.fileWriter?.write(JSON.stringify(d) + "\r\n")
            cb(data, chunkInfo)
        })
    }
}