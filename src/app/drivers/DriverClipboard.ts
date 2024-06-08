import {Driver, DriverChunkInfo, DriverNames, DriverStatus} from "./Driver";
import {Buffer} from "buffer"
import {GetDateForChunkInfo} from "../utility/DataTimeUtils";

export interface DriverClipboardParameters {}

export const DriverClipboardDefaults = {}

export class DriverClipboard implements Driver {

    private onReceiveCb: (data: Uint8Array | string, chunkInfo: DriverChunkInfo) => void
    private onTransmitCb: (data: Uint8Array | string, chunkInfo: DriverChunkInfo) => void
    private onStatusChangeCb: (status: DriverStatus) => void
    private onErrorCb: (ex: Error) => void

    readonly name: string;
    private _status: DriverStatus;

    public get status(): DriverStatus {
        return this._status;
    }

    constructor() {
        this.name = DriverNames.DriverClipboard
        this._status = DriverStatus.CLOSE
    }
    
    attach(view: HTMLElement): void {
        view.removeEventListener('keydown', this.keydownListener)
        view.addEventListener('keydown', this.keydownListener);
    }

    onError(cb: (ex: Error) => void): void {
        this.onErrorCb = cb
    }
    
    onReceive(cb: (data: Uint8Array, chunkInfo: DriverChunkInfo) => void): void {
        this.onReceiveCb = cb
    }

    onTransmit(cb: (data: Uint8Array, chunkInfo: DriverChunkInfo) => void): void {
        this.onTransmitCb = cb
    }

    onStatusChange(cb: (status: DriverStatus) => void) {
        this.onStatusChangeCb = cb
    }

    /* If data is a string, it is assumed to be a hex string */
    send(data: Uint8Array | string) {
        const date = new Date()
        const chunkInfo = {
            time: GetDateForChunkInfo(),
            isTx: true
        }
        if(typeof data === "string") {
            navigator.clipboard.writeText(data as string)
            this.onTransmitCb?.(data as string, chunkInfo)
        } else {
            let dataStr = Buffer.from(data).toString('hex');
            navigator.clipboard.writeText(dataStr)
            this.onTransmitCb?.(data, chunkInfo)
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.keydownListener)
    }

    keydownListener = async (evt) => {
        if ((evt.key === 'v'|| evt.key === 'V') && evt.ctrlKey) {
            const date = new Date()
            const chunkInfo = {
                time: GetDateForChunkInfo(),
                isTx: false
            }
            const text = await navigator.clipboard.readText() + "\r\n";
            this.onReceiveCb?.(text, chunkInfo)
        }
    }
}