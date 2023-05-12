import { Driver, DriverLoggable, DriverNames, DriverOpenClose, DriverStatus, isDriverOpenClose } from "./Driver"
import { DriverCache } from "./DriverCache"

/* This class is a decorator for the Driver class. It adds logging capabilities to the driver. 
 * Currently only received data is written in the logs.
 * TODO: Create a propietary log format to store logs origin and custom chunk information from DriverDataDescription object
*/
export class DirverLoggerDecorator implements DriverLoggable {
    private fileWriter: FileSystemWritableFileStream
    private loggerCache: DriverCache

    private onReceiveCb: (data: Uint8Array) => void
    private onTransmitCb: (data: Uint8Array) => void

    constructor(private baseDriver: Driver) {
        this.loggerCache = new DriverCache()
        this.loggerCache.setTimeout(200, 100)
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
        this.loggerCache.onFlush((data: (Uint8Array)[]) => {
            data.forEach((d) => {
                this.onReceiveCb?.(d)
            })
        })

        while (true) {
            const {value, done} = await stream.read()
            if (done) {
                // |reader| has been canceled.
                break;
            }
            if (value) {
                this.loggerCache.add(value)
            }
        }

        this.loggerCache.flush()

    }

    async enableLogging(prefixName: string) {
        const saveFile = await window.showSaveFilePicker({ suggestedName: prefixName + "_" + new Date().toLocaleString('en-GB', { hour12: false }) + ".txt" });
        this.fileWriter = await saveFile.createWritable()
    }

    async disableLogging() {
        this.fileWriter?.close()
        this.fileWriter = null
    }

    onReceive(cb: (data: Uint8Array) => void): void {
        this.onReceiveCb = cb
        this.baseDriver.onReceive((data: Uint8Array) => {
            this.fileWriter?.write(data)
            cb(data)
        })
    }

    onTransmit(cb: (data: Uint8Array) => void): void {
        this.onTransmitCb = cb
        this.baseDriver.onTransmit((data: Uint8Array) => {
            //this.fileWriter?.write(data)
            cb(data)
        })
    }
}