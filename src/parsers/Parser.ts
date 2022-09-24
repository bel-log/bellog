import {RawParserParameters} from "./RawParser";
import {LineParserParameters} from "./LineParser";

export type ParserInfoType = {driverName: string, isTx: boolean}
export type ParserSettings = RawParserParameters | LineParserParameters

export enum ParserNames{
    LineParser = "LineParser",
    RawParser = "RawParser",
    CustomParser = "CustomParser"
}

export interface Parser {
    put(data: Uint8Array | string, isTx: boolean): void
    onRefuse(cb: (acc: any, info: ParserInfoType) => void)
    onAccept(cb: (acc: any, info: ParserInfoType) => void)
}