import { DriverError } from "../utility/exception"
import {Driver, DriverOpenClose, DriverStatus} from "./Driver"
import Adb from "webadb"

export interface DriverAdbLogcatParameters {
    clearLogAtConnection: boolean
}

export const DriverAdbLogcatDefaults = {
    clearLogAtConnection: true
}

export class DriverAdbLogcat implements DriverOpenClose {

    private webusb:any
    private adb:any
    private shell:any
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

    open()
    {
        this.readingPromise = async () => {
            try
            {
                this.webusb = await Adb.open("WebUSB");
                this.adb = await this.webusb.connectAdb("host::");

                if(this.webusb && this.adb) {
                    let decoder = new TextDecoder();
                    this._status = DriverStatus.OPEN
                    this.onStatusChangeCb?.(this._status)
                    let acc = ""

                    if(this.params.clearLogAtConnection) {
                        let shellc = await this.adb.shell("logcat -c")
                        await shellc.receive()
                    }
 
                    this.shell = await this.adb.open('shell:logcat');
                    let r = await this.shell.receive();
                    while (r.cmd == "WRTE") {
                      if (r.data != null) {
                        if(this.onReceiveCb) {
                            acc += decoder.decode(r.data);
                            console.log(decoder.decode(r.data))
                            //if(acc.length > 800000)
                            {
                                //console.log(acc)
                                this.onReceiveCb(acc);
                                acc = "";
                            }
                        }
                      }
            
                      this.shell.send("OKAY");
                      r = await this.shell.receive();
                    }
            
                    this.shell.close();
                    this.shell = null;
                }

                await this.webusb.close();
            }
            catch (error)
            {
                console.error(error)
                this.onErrorCb?.(error)
                if(error.message.indexOf("checksum") > 0) {
                    // TODO INVESTIGATE
                    this.onErrorCb?.(new DriverError("Checksum error, please disconnect and reconnect the device"))
                }
            }
            this._status = DriverStatus.CLOSE
            this.onStatusChangeCb?.(this._status)
        }

        this.readingPromise()
    }

    async close()
    {
        if(this.shell)
            this.shell.close();
    }

    destroy() {
        
    }
}