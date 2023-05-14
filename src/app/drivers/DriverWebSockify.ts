import { DriverError } from "../utility/exception"
import { DriverNames, DriverOpenClose, DriverStatus } from "./Driver"
import { DriverCache } from "./DriverCache"
import { isWebMode } from "../utility/env";


export interface DriverWebSockifyParameters {
    ip: string
    port: number,
    externalWebSockify: boolean,
    externalWebSockifyPort: number
}

export const DriverWebSockifyDefaults = {
    ip: "192.168.1.10",
    port: 5555,
    externalWebSockify: isWebMode(),
    externalWebSockifyPort: 5556
}

export class DriverWebSockify implements DriverOpenClose {

    private cache: DriverCache
    private websocket: WebSocket
    private keepalive: number
    private onReceiveCb: (data: Uint8Array) => void
    private onTransmitCb: (data: Uint8Array | string) => void
    private onStatusChangeCb: (status: DriverStatus) => void
    private onErrorCb: (ex: Error) => void
    private idlePromise: Promise<void>;

    readonly name: string;
    _status: DriverStatus;

    public get status(): DriverStatus {
        return this._status;
    }

    constructor(readonly params: DriverWebSockifyParameters) {
        this.name = DriverNames.DriverAdbLogcat
        this._status = DriverStatus.CLOSE
        this.cache = new DriverCache()
        this.cache.setTimeout(200, 100)
        this.idlePromise = null
        this.keepalive = -1
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

    async loadImport(file: File) {
        await this.close()
        if (this.idlePromise) {
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
        let wdata = data
        if (typeof data === "string") {
            wdata = new TextEncoder().encode(data)
        }
        this.websocket?.send(wdata)
        this.onTransmitCb?.(wdata)
    }

    async open() {

        this.idlePromise = new Promise(async (resolve) => {
            try {


                if(this.params.externalWebSockify) {
                    this.websocket = new WebSocket(`ws://localhost:${this.params.externalWebSockifyPort}/`);
                } else {
                    const response = await (await fetch(`/websockify?ip=${this.params.ip}&port=${this.params.port}`)).json()
                    this.websocket = new WebSocket(`ws://localhost:${response.port}/`);
                }

                this.websocket.onopen = (event) => {
                    this._status = DriverStatus.OPEN
                    this.onStatusChangeCb?.(this._status)

                    if(!this.params.externalWebSockify) {
                        this.keepalive = window.setInterval(async () => {
                            const response = await fetch(`/websockify?ip=${this.params.ip}&port=${this.params.port}&keepalive=true`)
     
                             if(response.ok && response.status === 200) {
                                 const json = (await response.json())
                                 if(json.err) {
                                    this.onErrorCb(new DriverError("Keepalive failed"))
                                    this.websocket.close()
                                 }
                             } else {
                                this.onErrorCb(new DriverError("Keepalive failed"))
                                this.websocket.close()
                             }
     
                         }, 30 * 1000)
                    }
                };


                this.cache.clean()
                this.websocket.onmessage = async (event) =>  {
                    const data = event.data as Blob
                    this.cache.add(new Uint8Array(await data.arrayBuffer()))
                };

                this.websocket.onclose = (event) => {
                    this.cache.flush()
                    resolve()
                };

                this.websocket.onerror = (event) => {
                    resolve()
                };

                this.cache.onFlush((data) => {
                    data.forEach((d) => {
                        this.onReceiveCb?.(d)
                    })
                })

            }
            catch (error) {
                console.error(error)
                this.onErrorCb?.(error)
            }
        })

        await this.idlePromise

        if(this.keepalive !== -1) {
            window.clearInterval(this.keepalive)
            this.keepalive = -1
        }
            
        this.cache.clean()
        this.websocket = null
        this._status = DriverStatus.CLOSE
        this.onStatusChangeCb?.(this._status)

    }

    async close() {
        this.websocket?.close()
    }

    destroy() {

    }
}