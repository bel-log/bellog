
import {JsonDiv, JsonDivSetup} from "./JsonDiv";
import {ColoredText, ColoredTextSetup} from "./ColoredText";
import {GenericRendererProperties} from "../Generic";
import * as React from "react";

interface MatchRenderersListEntry {
    name: string,
    matchrenderer: any
    setup: any
}

export const MatchRenderersList: MatchRenderersListEntry[] = [
    {
        name: "Json Div",
        matchrenderer: JsonDiv,
        setup: (props) => {
            return (
                <JsonDivSetup {...props}/>
            )
        }
    },
    {
        name: "Colored Text",
        matchrenderer: ColoredText,
        setup: (props) => {
            return (
                <ColoredTextSetup {...props}/>
            )
        }
    }
]