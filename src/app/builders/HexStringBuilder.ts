import {Builder} from "./Builder";

export interface HexStringBuilderParameters {}

export const HexStringBuilderDefaults = {}

export class HexStringBuilder implements Builder {

    str: string

    constructor() {
    }

    prepareArgs(str: string) {
        this.str = str
    }

    build() {
        return Uint8Array.from(Buffer.from(this.str.replace(/\s/g, '').trim(), 'hex'));
    }
}