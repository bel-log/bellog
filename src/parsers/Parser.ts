import {RawParserParameters} from "./RawParser";
import {LineParserParameters} from "./LineParser";
import {CustomParserParameters} from "./CustomParser";

export type ParserSettings = RawParserParameters | LineParserParameters | CustomParserParameters

export enum ParserNames{
    LineParser = "LineParser",
    RawParser = "RawParser",
    CustomParser = "CustomParser"
}

export interface Parser {
    put(data: Uint8Array | string): void
    onRefuse(cb: (acc: any) => void)
    onAccept(cb: (acc: any) => void)
}