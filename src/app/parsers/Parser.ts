import {RawParserParameters} from "./RawParser";
import {LineParserParameters} from "./LineParser";
import {DriverChunkInfo} from "../drivers/Driver";

export type ParserInfoType = {driverName: string, time:string, isTx: boolean}
export type ParserSettings = RawParserParameters | LineParserParameters

export enum ParserNames{
    LineParser = "LineParser",
    RawParser = "RawParser",
    CustomParser = "CustomParser"
}

export interface Parser {
    put(data: Uint8Array | string, chunkInfo: DriverChunkInfo): void
    onRefuse(cb: (acc: any, info: ParserInfoType) => void)
    onAccept(cb: (acc: any, info: ParserInfoType) => void)
}