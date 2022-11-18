import {Parser, ParserInfoType} from "./Parser";

export interface RawParserParameters {}

export const RawParserDefaults = {}

export class RawParser implements Parser {

    private onRefuseCb: (acc: any, info: ParserInfoType) => void
    private onAcceptCb: (acc: any, info: ParserInfoType) => void

    constructor(readonly driverName: string) {}

    onRefuse(cb: (acc: any, info: ParserInfoType) => void) {
        this.onRefuseCb = cb
    }

    onAccept(cb: (acc: any, info: ParserInfoType) => void) {
        this.onAcceptCb = cb
    }

    put(_data: Uint8Array, isTx: boolean) {
        this.onAcceptCb?.(_data, {driverName: this.driverName, isTx: isTx})
    }
}