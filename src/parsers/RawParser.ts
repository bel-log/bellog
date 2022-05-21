import {Parser} from "./Parser";

export interface RawParserParameters {}

export const RawParserDefaults = {}

export class RawParser implements Parser {

    private buffer: string = ""
    private onRefuseCb: (acc: any) => void
    private onAcceptCb: (acc: any) => void

    onRefuse(cb: (acc: any) => void) {
        this.onRefuseCb = cb
    }

    onAccept(cb: (acc: any) => void) {
        this.onAcceptCb = cb
    }

    put(_data: Uint8Array) {
        this.onAcceptCb?.(_data)
    }
}