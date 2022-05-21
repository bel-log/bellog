import {Parser} from "./Parser";

export type CustomParserFuncType = (acc: any, data: Uint8Array | string, onAcceptCb: ((acc: any) => void), onRefuseCb: ((acc: any) => void)) => any

export interface CustomParserParameters {
    name: string
}

export const CustomParserDefaults = {}

export class CustomParser implements Parser {

    private accumulator: any
    private onRefuseCb: (acc: any) => void
    private onAcceptCb: (acc: any) => void

    constructor(readonly proc: CustomParserFuncType) {
    }

    onRefuse(cb: (acc: any) => void) {
        this.onRefuseCb = cb
    }

    onAccept(cb: (acc: any) => void) {
        this.onAcceptCb = cb
    }

    put(_data: Uint8Array | string) {
        this.accumulator = this.proc(this.accumulator, _data, this.onAcceptCb, this.onRefuseCb)
    }
}