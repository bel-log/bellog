import {Parser, ParserNames, ParserSettings} from "./Parser";
import {LineParser} from "./LineParser";
import {RawParser} from "./RawParser";
import {SetupCustomParserProperties} from "../setup/SetupInterfaces";
import {DriverNames, DriverSettings} from "../drivers/Driver";
import {CustomParser, CustomParserFuncType} from "./CustomParser";
import * as serialize from "serialize-javascript"


function deserialize(serializedJavascript){
    return eval('(' + serializedJavascript + ')');
}

export class ParserFactory {

    static build(driverName: string, parserType: ParserNames, customParserID: number, customParsers: SetupCustomParserProperties[]): Parser {
        switch (parserType) {
            case ParserNames.LineParser:
                return new LineParser(driverName)
            case ParserNames.RawParser:
                return new RawParser(driverName)
            case ParserNames.CustomParser:
                return new CustomParser(driverName,
                    deserialize(customParsers.find((it) => it.id === customParserID).code) as CustomParserFuncType
                    )
            default:
                return new RawParser(driverName)
        }
    }

}