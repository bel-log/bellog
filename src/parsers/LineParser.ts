import {Parser} from "./Parser";

export interface LineParserParameters {}

export const LineParserDefaults = {}

export class LineParser implements Parser {

    private buffer: string = ""
    private onRefuseCb: (acc: any) => void
    private onAcceptCb: (acc: any) => void

    onRefuse(cb: (acc: any) => void) {
        this.onRefuseCb = cb
    }

    onAccept(cb: (acc: any) => void) {
        this.onAcceptCb = cb
    }

    put(_data: Uint8Array | string) {
        let data = _data
        if(typeof data !== "string")
            data = String.fromCharCode.apply(null, _data);
        for (let i = 0; i < data.length; i++) {
            if (data[i] == '\r' || data[i] == '\n') {
                if (this.buffer.length > 0) {
                    this.onAcceptCb?.(this.buffer)
                    this.buffer = ""
                }
            } else {
                this.buffer += data[i]
            }
        }
    }
}