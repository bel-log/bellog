import {Driver, DriverNames, DriverSettings} from "../../drivers/Driver";
import {ParserNames, ParserSettings} from "../../parsers/Parser";
import { BuilderNames, BuilderSettings } from "../builders/Builder";

export interface GlobalSetupSettings {
    shareDataBetweenViews: boolean
    maximumItemsPerView: number
}

export interface SetupGlobalScriptProperties {
    id: number,
    name: string,
    code: string
}

export interface SetupGlobalStyleProperties {
    id: number,
    name: string,
    code: string
}

export interface SetupCustomParserProperties {
    id: number,
    name: string,
    code: string
}

export interface SetupCustomBuilderProperties {
    id: number,
    name: string,
    code: string
}

export enum HtmlComponentParameterType {
    Text = "text",
    Number = "number",
    Color = "color"
}

export enum HtmlComponentEventType {
    Click = "iwclick"
}

export interface SetupCustomHtmlProperties {
    id: number,
    name: string,
    code: string,
    parameters: {[name: string]: {type: HtmlComponentParameterType, default?: string}}
    events: {[name: string]: {type: HtmlComponentEventType}}
}

export enum ViewSetupMatchResolverType {
    Regex = "Regex",
    StartsWith = "StartsWith",
    EndsWith = "EndsWith",
    Contains = "Contains",
    ObjectCompare = "ObjectCompare",
    Any = "Any"
}

export enum HtmlComponentType {
    Div = "Div",
    Span = "Span",
    Raw = "Raw",
    Button = "Button",
    None = "None",
    Custom = "Custom"
}

export enum SetupBindingType {
    Gui = "Gui",
    Code = "Code"
}

export interface ViewSetupMatchElementProperties {
    id: number,
    name: string,
    disabled: boolean,
    resolver: ViewSetupMatchResolverType,
    resolverParam: ViewSetupMatchResolverProperties,
    accepted: boolean,
    refused: boolean,
    consumeMatch: boolean,
    transmitted: boolean,
    received: boolean,
    widgetMode: boolean,
    safeHtml: boolean,
    widgetID: number,
    htmlComponentType: HtmlComponentType,
    htmlCustomID: number,
    htmlComponentBindingType: SetupBindingType
    htmlComponentBindings: SetupBindingProperties
}

export interface ViewSetupProperties {
    id: number,
    name: string,
    parserType:  ParserNames,
    customParserID: number,
    parserSettings: ParserSettings
    matchers: ViewSetupMatchElementProperties[],
    autoWrap: boolean,
    widgetFrameSize: number,
    widgetGroupIds: {id: number}[]
}

export interface WidgetSetupProperties {
    id: number,
    name: string,
    disabled: boolean,
    htmlComponentType: HtmlComponentType,
    htmlCustomID: number,
    bindings: {[name:string]: {value: string}}
    actions: WidgetActionProperties
}


export interface WidgetGroupSetupProperties {
    id: number,
    name: string,
    widgets: WidgetSetupProperties[]
}

export type WidgetActionProperties =  {[htmlEventKey:string]: {actionID: number}}

export interface ActionProperties {
    id: number,
    name: string,
    builderType: BuilderNames,
    builderCustomID: number,
    builderBindingType: SetupBindingType
    builderBindings: SetupBindingProperties
}

export interface ViewSetupMatchResolverProperties {
    regex?: string,
    code?: string,
    text?: string
}


export type SetupBindingPropertiesGui =  {bindings:{[name:string]: {fixed: boolean, value: string, item: string}}}
export type SetupBindingPropertiesCode =  {code: string}

export type SetupBindingProperties = SetupBindingPropertiesGui | SetupBindingPropertiesCode


export interface SetupProfileObject {
    setupVersion: string
    profileName: string
    driverType: DriverNames,
    driverSettings: DriverSettings,
    views: ViewSetupProperties[]
    widgetGroups: WidgetGroupSetupProperties[]
    html: SetupCustomHtmlProperties[],
    actions: ActionProperties[],
    scripts: SetupGlobalScriptProperties[]
    styles: SetupGlobalStyleProperties[]
    parsers: SetupCustomParserProperties[]
    builders: SetupCustomBuilderProperties[]
    globalSettings: GlobalSetupSettings
}