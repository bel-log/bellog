
export class DriverCache {

    private queue: (Uint8Array)[] = []
    private timeout: number = 0
    private timerID: number = -1
    private maxElemCount: number = 0
    private onFlushCb: (data: (Uint8Array)[]) => void

    constructor() {}

    public onFlush( cb: (data: (Uint8Array)[]) => void) {
        this.onFlushCb = cb
    }

    public setTimeout(timeout: number, maxElemCount: number) {
        this.timeout = timeout
        this.maxElemCount = maxElemCount
    }

    public add(data: Uint8Array) {
        this.queue.push(data)
        if(this.timerID !== -1 && this.queue.length >= this.maxElemCount)
            this.flush()
        else {
            this.timerID = window.setTimeout( () => {
                this.onFlushCb(this.queue)
                this.queue = []
                this.timerID = -1
            }, this.timeout)
        }
    }

    public flush() {
        if(this.timerID !== -1)
            window.clearTimeout(this.timerID)
        this.onFlushCb(this.queue)
        this.queue = []
        this.timerID = -1
    }

    public clean() {
        this.queue = []
        if(this.timerID !== -1)
            window.clearTimeout(this.timerID)
        this.timerID = -1
    }

}