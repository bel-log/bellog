import {Driver, DriverOpenClose, DriverStatus} from "./Driver"


export class DriverBackend implements DriverOpenClose {
    private socket: WebSocket
    private socketPromise: () => Promise<void>;
    private onReceiveCb: (data: Uint8Array) => void
    private onTransmitCb: (data: Uint8Array | string) => void
    private onStatusChangeCb: (status: DriverStatus) => void
    private onErrorCb: (ex: Error) => void

    readonly name: string;
    _status: DriverStatus;

    public get status(): DriverStatus {
        return this._status;
    }

    constructor(private readonly url: string) {
        this.name = "BackendSerialPort"
        this._status = DriverStatus.CLOSE
        this.socket = null
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

    onError(cb: (ex: Error) => void): void {
        this.onErrorCb = cb
    }

    async send(data: Uint8Array | string) {
        let socket = this.socket
        if(socket)
        {
            socket.send(data)
            this.onTransmitCb(data)
        }
    }

    async open()
    {
        let socket = this.socket

        if(socket)
        {
            socket.close()
            await this.socketPromise
            socket = null
        }

        this.socketPromise = () => new Promise<void>( (resolve) => {
            
            this.socket = new WebSocket(this.url);

            let socket = this.socket

            socket.onopen = function(e) {
                console.log("Connection opened")
                this. _status = DriverStatus.OPEN
                this.onStatusChangeCb?.(this._status)
             }.bind(this)
             
             socket.onmessage = function(event) {
               this.onReceiveCb?.(event.data)
             }.bind(this)
             
             socket.onclose = function(event) {
               if (event.wasClean) {
                console.error(`Connection closed code=${event.code} reason=${event.reason}`)
               } else {
                 console.error("Connection aborted")
               }
     
               this. _status = DriverStatus.CLOSE
               this.onStatusChangeCb?.(this._status)
               resolve()
             }.bind(this);
             
             socket.onerror = function(error) {
                 console.error(error.message)
                 this. _status = DriverStatus.CLOSE
                 this.onStatusChangeCb?.(this._status)
                 resolve()
             }.bind(this);

        })

        this.socketPromise()
    }

    async close()
    {
        let socket = this.socket

        if(socket != null)
        {
            socket.close()
            await this.socketPromise
            socket = null
        }
    }

    destroy() {
        
    }

}