import {Parser, ParserInfoType} from "./Parser";
import {DriverChunkInfo} from "../drivers/Driver";

export interface LineParserParameters {}

export const LineParserDefaults = {}

export class LineParser implements Parser {

    private buffer: string = ""
    private onRefuseCb: (acc: any, info: ParserInfoType) => void
    private onAcceptCb: (acc: any, info: ParserInfoType) => void

    constructor(readonly driverName: string) {}

    onRefuse(cb: (acc: any, info: ParserInfoType) => void) {
        this.onRefuseCb = cb
    }

    onAccept(cb: (acc: any, info: ParserInfoType) => void) {
        this.onAcceptCb = cb
    }

    put(_data: Uint8Array | string, chunkInfo: DriverChunkInfo) {
        let data = _data
        if(typeof data !== "string")
            data = String.fromCharCode.apply(null, _data);
        for (let i = 0; i < data.length; i++) {
            if (data[i] == '\r' || data[i] == '\n') {
                if (this.buffer.length > 0) {
                    this.onAcceptCb?.(this.buffer, {driverName: this.driverName, time: chunkInfo.time, isTx: chunkInfo.isTx})
                    this.buffer = ""
                }
            } else {
                this.buffer += data[i]
            }
        }
    }
}