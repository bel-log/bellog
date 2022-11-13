import * as serialize from "serialize-javascript"
import { Builder, BuilderNames, BuilderSettings } from "./Builder";
import { CustomBuilder, CustomBuilderFuncType, CustomBuilderParameters } from "./CustomBuilder";
import { SetupCustomBuilderProperties } from "../setup/SetupInterfaces";
import { HexStringBuilder } from "./HexStringBuilder";
import { LineBuilder } from "./LineBuilder";


function deserialize(serializedJavascript){
    return eval('(' + serializedJavascript + ')');
}

export class BuilderFactory {

    static build(builder: {name: string, settings?: BuilderSettings}, customBuilders: SetupCustomBuilderProperties[]): Builder {
        switch (builder.name) {
            case BuilderNames.HexStringBuilder:
                return new HexStringBuilder()
            case BuilderNames.LineBuilder:
                return new LineBuilder()
            case BuilderNames.CustomBuilder:
                const builderCustom = customBuilders.find((it) => it.id === (builder.settings as CustomBuilderParameters).id)
                return new CustomBuilder(
                    deserialize(builderCustom.code)
                )
            default:
                return new LineBuilder()
        }
    }

}