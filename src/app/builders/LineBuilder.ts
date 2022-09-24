import {Builder} from "./Builder";

export interface LineBuilderParameters {}

export const LineBuilderDefaults = {}

export class LineBuilder implements Builder {

    str: string

    constructor() {
    }

    prepareArgs(str: string) {
        this.str = str
    }

    build() {
        return this.str + "\r\n"
    }
}