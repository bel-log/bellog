import { CustomBuilderParameters } from "./CustomBuilder"
import { HexStringBuilderParameters } from "./HexStringBuilder"
import { LineBuilderParameters } from "./LineBuilder"

export type BuilderSettings = LineBuilderParameters | HexStringBuilderParameters | CustomBuilderParameters

export enum BuilderNames{
    LineBuilder = "LineBuilder",
    HexStringBuilder = "HexStringBuilder",
    CustomBuilder = "CustomBuilder"
}

export interface Builder {
    build(): Uint8Array | string
}