import {Builder} from "./Builder";

export type CustomBuilderFuncType = (args: any) => Uint8Array | string

export interface CustomBuilderParameters {
    id: number
}

export const CustomBuilderDefaults = {}

export class CustomBuilder implements Builder {

    args: any

    constructor(readonly proc: CustomBuilderFuncType) {}

    prepareArgs(args: any) {
        this.args = args
    }

    build() {
        return this.proc(this.args)
    }
}