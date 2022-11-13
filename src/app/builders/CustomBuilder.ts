import {Builder} from "./Builder";

export type CustomBuilderFuncType = () => [object, (args:any) => string | Uint8Array]

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
        const [_, func] = this.proc()
        return func(this.args)
    }
}