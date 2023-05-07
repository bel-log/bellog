import {Driver, DriverStatus} from "./Driver";
import {Buffer} from "buffer"

export interface DriverClipboardParameters {}

export const DriverClipboardDefaults = {}

export class DriverClipboard implements Driver {

    private onReceiveCb: (data: Uint8Array | string) => void
    private onTransmitCb: (data: Uint8Array | string) => void
    private onStatusChangeCb: (status: DriverStatus) => void
    private onErrorCb: (ex: Error) => void

    readonly name: string;
    private _status: DriverStatus;

    public get status(): DriverStatus {
        return this._status;
    }

    constructor() {
        this.name = "Clipboard"
        this._status = DriverStatus.CLOSE
    }
    
    attach(view: HTMLElement): void {
        view.removeEventListener('keydown', this.keydownListener)
        view.addEventListener('keydown', this.keydownListener);
    }

    onError(cb: (ex: Error) => void): void {
        this.onErrorCb = cb
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