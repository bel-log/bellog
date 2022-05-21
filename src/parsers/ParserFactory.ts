import {Parser, ParserNames, ParserSettings} from "./Parser";
import {LineParser} from "./LineParser";
import {RawParser} from "./RawParser";
import {SetupCustomParserProperties} from "../app/setup/SetupInterfaces";
import {DriverSettings} from "../drivers/Driver";
import {CustomParser, CustomParserParameters, CustomParserFuncType} from "./CustomParser";
import * as serialize from "serialize-javascript"


function deserialize(serializedJavascript){
    return eval('(' + serializedJavascript + ')');
}

export class ParserFactory {

    static build(parser: {name: string, settings?: ParserSettings}, customParsers: SetupCustomParserProperties[]): Parser {
        switch (parser.name) {
            case ParserNames.LineParser:
                return new LineParser()
            case ParserNames.RawParser:
                return new RawParser()
            case ParserNames.CustomParser:
                return new CustomParser(
                    deserialize(customParsers.find((it) => it.name === (parser.settings as CustomParserParameters).name).code) as CustomParserFuncType
                    )
            default:
                return new RawParser()
        }
    }

}