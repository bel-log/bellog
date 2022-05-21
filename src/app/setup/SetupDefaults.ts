import {HtmlComponentParameterType, SetupCustomHtmlProperties, SetupCustomParserProperties} from "./SetupInterfaces";
import * as serialize from "serialize-javascript"
import * as beautify from "js-beautify"

export const embeddedHtmlComponents:SetupCustomHtmlProperties[] = [
    {
        id: Infinity,
        name: "Div",
        code: "<div style='color: ${$$color}'>${$$content}</div>",
        parameters: {
            color: {type: HtmlComponentParameterType.Color,  default: "#000000"},
            content: {type: HtmlComponentParameterType.Text, default: ""}
        }
    },
    {
        id: Infinity,
        name: "Span",
        code: "<span style='color: ${$$color}'>${$$content} </span>",
        parameters: {
            color: {type: HtmlComponentParameterType.Color,  default: "#000000"},
            content: {type: HtmlComponentParameterType.Text, default: ""}
        }
    },
    {
        id: Infinity,
        name: "Raw",
        code: "${$$content}",
        parameters: {
            content: {type: HtmlComponentParameterType.Text, default: ""}
        }
    }
]