import {DriverChunkInfo, DriverNames} from "../drivers/Driver";
import {Parser, ParserInfoType} from "./Parser";

export type CustomParserFuncType = (acc: any, data: Uint8Array | string, onAcceptCb: ((acc: any, info: ParserInfoType) => void), onRefuseCb: ((acc: any, info: ParserInfoType) => void), info: ParserInfoType) => any

export const CustomParserDefaults = {}

export class CustomParser implements Parser {

    private accumulatorTx: any
    private accumulatorRx: any
    private onRefuseCb: (acc: any, info: ParserInfoType) => void
    private onAcceptCb: (acc: any, info: ParserInfoType) => void

    constructor(readonly driverName: string, readonly proc: CustomParserFuncType) {
    }

    onRefuse(cb: (acc: any, info: ParserInfoType) => void) {
        this.onRefuseCb = cb
    }

    onAccept(cb: (acc: any, info: ParserInfoType) => void) {
        this.onAcceptCb = cb
    }

    put(_data: Uint8Array, chunkInfo: DriverChunkInfo) {
        this.accumulatorTx = this.proc(this.accumulatorTx, _data, this.onAcceptCb, this.onRefuseCb,
            {driverName: this.driverName, time: chunkInfo.time, isTx: chunkInfo.isTx})
    }
}