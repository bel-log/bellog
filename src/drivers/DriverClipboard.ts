import {Driver, DriverStatus} from "./Driver";

export interface DriverClipboardParameters {}

export const DriverClipboardDefaults = {}

export class DriverClipboard implements Driver {

    private onReceiveCb: (data: Uint8Array | string) => void
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

    onReceive(cb: (data: Uint8Array) => void) {
        this.onReceiveCb = cb
    }

    onStatusChange(cb: (status: DriverStatus) => void) {
        this.onStatusChangeCb = cb
    }

    send(data: Uint8Array) {

    }

    destroy() {
        document.removeEventListener('keydown', this.keydownListener)
    }

    keydownListener = async (evt) => {
        if (evt.key === 'v' && evt.ctrlKey) {
            const text = await navigator.clipboard.readText();
            this.onReceiveCb?.(text)
        }
    }
}