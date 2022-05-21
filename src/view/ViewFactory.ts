import * as React from "react";
import { SetupCustomHtmlProperties, ViewSetupProperties } from "../app/setup/SetupInterfaces";
import { Parser } from "../parsers/Parser";
import { CustomView } from "./CustomView";


export class ViewFactory {
    static build(parser: Parser, setup: ViewSetupProperties, htmls: SetupCustomHtmlProperties[], refDiv: React.MutableRefObject<HTMLDivElement>) {
        return new CustomView(parser, setup, htmls, refDiv)
    }
}