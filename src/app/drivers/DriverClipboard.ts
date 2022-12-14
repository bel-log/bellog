import {Driver, DriverStatus} from "./Driver";
import {Buffer} from "buffer"

export interface DriverClipboardParameters {}

export const DriverClipboardDefaults = {}

export class DriverClipboard implements Driver {

    private onReceiveCb: (data: Uint8Array | string) => void
    private onTransmitCb: (data: Uint8Array | string) => void
    private onStatusChangeCb: (status: DriverStatus) => void
    private onError: () => void
    readonly name: string;
    private _status: DriverStatus;

    public get status(): DriverStatus {
        return this._status;
    }

    constructor() {
        this.name = "Clipboard"
        this._status = DriverStatus.CLOSE

        document.addEventListener('keydown', this.keydownListener);
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

    send(data: Uint8Array | string) {
        if(typeof data === "string") {
            navigator.clipboard.writeText(data as string)
            this.onTransmitCb?.(data as string)
        } else {
            let dataStr = Buffer.from(data).toString('hex');
            navigator.clipboard.writeText(dataStr)
            this.onTransmitCb?.(data)
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.keydownListener)
    }

    keydownListener = async (evt) => {
        if ((evt.key === 'v'|| evt.key === 'V') && evt.ctrlKey) {
            const text = await navigator.clipboard.readText() + "\r\n";
            this.onReceiveCb?.(text)
        }
    }
}