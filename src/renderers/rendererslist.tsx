import {GenericRendererSetup} from "./generic/Generic";
import {ReactNode} from "react";
import {JsonDivSetup} from "./generic/matchrenderer/JsonDiv";
import * as React from "react";

interface RendererListEntry {
    name: string,
    setup: any
}

export const RendererList: RendererListEntry[] = [
    {
        name: "Generic",
        setup: (props) => {
            return (
                <GenericRendererSetup {...props} />)
        }
    }
]