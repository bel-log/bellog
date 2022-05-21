import {DriverSettings} from "../../drivers/Driver";
import {ParserSettings} from "../../parsers/Parser";

export interface GlobalSetupSettings {
    shareDataBetweenViews: boolean
}

export interface SetupGlobalScriptProperties {
    id: number,
    code: string
}

export interface SetupGlobalStyleProperties {
    id: number,
    code: string
}

export interface SetupCustomParserProperties {
    id: number,
    name: string,
    code: string
}

export enum HtmlComponentParameterType {
    Text = "text",
    Number = "number",
    Color = "color"
}

export interface SetupCustomHtmlProperties {
    id: number,
    name: string,
    code: string,
    parameters: {[name: string]: {type: HtmlComponentParameterType, default: string}}
}

export enum ViewSetupMatchResolverType {
    Regex = "Regex",
    StartsWith = "StartsWith",
    EndsWith = "EndsWith",
    Contains = "Contains",
    ObjectCompare = "ObjectCompare",
    Any = "Any"
}

export enum ViewSetupHtmlBindingType {
    Gui = "Gui",
    Code = "Code"
}

export interface ViewSetupMatchElementProperties {
    id: number,
    name: string,
    resolver: ViewSetupMatchResolverType,
    resolverParam: ViewSetupMatchResolverProperties,
    accepted: boolean,
    consumeMatch: boolean,
    widgetMode: boolean,
    htmlComponent: string,
    htmlComponentBindingType: ViewSetupHtmlBindingType
    htmlComponentBindings: ViewSetupHtmlBindingProperties
}

export interface ViewSetupProperties {
    id: number,
    name: string,
    parser:  {name: string, settings?: ParserSettings},
    matchers: ViewSetupMatchElementProperties[],
    autoWrap: boolean
}

export interface ViewSetupMatchResolverProperties {
    regex?: string,
    code?: string,
    text?: string
}

export interface ViewSetupHtmlBindingProperties {
    // value is for fixed, item is for key binding (combobox keys)
    bindings: {[name:string]: {fixed: boolean, value: string, item: string}}
    code: string
}


export interface SetupProfileObject {
    setupVersion: string,
    profileName: string,
    driver: {name: string, settings?: DriverSettings},
    views: ViewSetupProperties[],
    html: SetupCustomHtmlProperties[],
    scripts: SetupGlobalScriptProperties[],
    styles: SetupGlobalStyleProperties[]
    parsers: SetupCustomParserProperties[]
    globalSettings: GlobalSetupSettings
}