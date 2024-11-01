import {
    ActionProperties,
    HtmlComponentEventType,
    HtmlComponentParameterType,
    HtmlComponentType,
    SetupBindingProperties,
    SetupBindingPropertiesGui,
    SetupBindingType,
    SetupCustomBuilderProperties,
    SetupCustomHtmlProperties,
    SetupCustomParserProperties,
    SetupGlobalScriptProperties,
    SetupGlobalStyleProperties,
    SetupProfileObject,
    ViewSetupMatchElementProperties,
    ViewSetupMatchResolverProperties,
    ViewSetupMatchResolverType,
    ViewSetupProperties,
    WidgetActionProperties,
    WidgetGroupSetupProperties,
    WidgetSetupProperties
} from "./SetupInterfaces";
import * as beautify from "js-beautify"
import {DriverFactory} from "../drivers/DriverFactory";
import {DriverNames, DriverSettings} from "../drivers/Driver";
import {ParserNames} from "../parsers/Parser";
import {BuilderNames} from "../builders/Builder";
import {PROFILE_VERSION} from "../../Version";

const beautifyOptions = { indent_size: 2, space_in_empty_paren: true }

export function buildDefaultProfile(): SetupProfileObject {
    return {
        profileName: "New Profile",
        setupVersion: PROFILE_VERSION,
        driverType: DriverNames.DriverClipboard,
        driverSettings: {},
        html: [],
        actions: [],
        parsers: [],
        builders: [],
        scripts: [],
        styles: [],
        views: [buildDefaultView([])],
        widgetGroups: [],
        globalSettings: {
            shareDataBetweenViews: true,
            maximumItemsPerView: 10000,
        }
    }
}

export function buildDefaultDriverSettings(type: DriverNames): DriverSettings {
    return DriverFactory.getDefaultParams(type)
}

export function buildDefaultGlobalScript(array: SetupGlobalScriptProperties[]): SetupGlobalScriptProperties {
    const maxId = array.reduce(
        (max, script) => (script.id > max ? script.id : max),
        array.length > 0 ? array[0].id : 0
    ) ?? 0;

    return {
        id: maxId + 1,
        name: `Unnamed-${maxId+1}.js`,
        code: beautify(`
            function custom_global_func() {
                console.log("dummy")
            }`, beautifyOptions
        )
    }
}

export function buildDefaultGlobalStyle(array: SetupGlobalStyleProperties[]): SetupGlobalStyleProperties {
    const maxId = array.reduce(
        (max, script) => (script.id > max ? script.id : max),
        array.length > 0 ? array[0].id : 0
    ) ?? 0;

    return {
        id: maxId + 1,
        name: `Unnamed-${maxId+1}.css`,
        code: ".my_div { color: red; }"
    }
}

export function buildDefaultCustomParser(array: SetupCustomParserProperties[]): SetupCustomParserProperties {

    let maxId = Math.max(...array.map(o => o.id))
    maxId = maxId < 0 ? 0 : maxId

    const sameNames = array.filter((val) => {
        return val.name.startsWith("New Parser")
    })

    return {
        id: maxId + 1,
        name: "New Parser #" + (sameNames.length + 1),
        code: beautify(`
            function (accumulator, data, onAccept, onRefuse, info) {
                // This is an example line parser. captures each sequence with terminating \\n or \\r
                // accumulator: use it to accumulate state of the parser then return it
                // data: Uin8tArray of received data (or string for clipboard driver)
                // onAccept(accumulator, info): call this callback when accumulator is ready and has a valid sequence
                // onRefuse(accumulator, info): call this to refuse the sequence. Content may be displayed anyway according to view configuration
                // info: {isTx: boolean, time: string, driverName: string}
                var _accumulator = (accumulator === null || accumulator === undefined) ? "" : accumulator;
                // Convert Uint8 to string if necessary
                const _data = typeof data !== "string" ? String.fromCharCode.apply(null, data) : data;
                for (let i = 0; i < _data.length; i++) {
                    if (_data[i] == '\\r' || _data[i] == '\\n') {
                        if (_accumulator.length > 0) {
                            onAccept(_accumulator, info)
                            _accumulator = ""
                        }
                    } else {
                        _accumulator += _data[i]
                    }
                }

                return _accumulator;
            }`, beautifyOptions
        )
    }
}

export function buildDefaultCustomBuilder(array: SetupCustomBuilderProperties[]): SetupCustomBuilderProperties {

    let maxId = Math.max(...array.map(o => o.id))
    maxId = maxId < 0 ? 0 : maxId

    const sameNames = array.filter((val) => {
        return val.name.startsWith("New Builder")
    })

    return {
        id: maxId + 1,
        name: "New Builder #" + (sameNames.length + 1),
        code: beautify(`
            function () {
                // List all argument required to create a packet to send
                // Bus address, data payload, command code etc
                const builderArgs = {
                    prefix: "",
                    msg: ""
                }
                
                function builderFunc(args) {
                    // Can be either a string or Uint8Array
                    return args.prefix + ": " + args.msg + "\\r\\n"
                }

                return [builderArgs, builderFunc];
            }`, beautifyOptions
        )
    }
}

export function BuildHtmlComponent(htmlType: HtmlComponentType, htmlCustomID: number | null, customHtmlComponents: SetupCustomHtmlProperties[]):SetupCustomHtmlProperties {
    switch(htmlType) {
        case HtmlComponentType.DivWithTimestamp:
            return {
                name: htmlType,
                id: htmlCustomID,
                code: "<div style='color: ${$$color}'>${$$timestamp} ${$$content}</div>",
                parameters: {
                    color: {type: HtmlComponentParameterType.Color,  default: "#000000"},
                    timestamp: {type: HtmlComponentParameterType.Text, default: ""},
                    content: {type: HtmlComponentParameterType.Text, default: ""}
                },
                events: {}
            }
        case HtmlComponentType.Div:
            return {
                name: htmlType,
                id: htmlCustomID,
                code: "<div style='color: ${$$color}'>${$$content}</div>",
                parameters: {
                    color: {type: HtmlComponentParameterType.Color,  default: "#000000"},
                    content: {type: HtmlComponentParameterType.Text, default: ""}
                },
                events: {}
            }
            case HtmlComponentType.Span:
                return {
                    name: htmlType,
                    id: htmlCustomID,
                    code: "<span style='color: ${$$color}'>${$$content}</span>",
                    parameters: {
                        color: {type: HtmlComponentParameterType.Color,  default: "#000000"},
                        content: {type: HtmlComponentParameterType.Text, default: ""}
                    },
                    events: {}
                }
            case HtmlComponentType.Raw:
                return {
                    name: htmlType,
                    id: htmlCustomID,
                    code: "${$$content}",
                    parameters: {
                        content: {type: HtmlComponentParameterType.Text, default: ""}
                    },
                    events: {}
                }
            case HtmlComponentType.Button:
                    return {
                        name: htmlType,
                        id: htmlCustomID,
                        code: "<button data-iwclick='buttonClick' class='button is-primary'>${$$text}</button>",
                        parameters: {
                            text: {type: HtmlComponentParameterType.Text, default: "Button"}
                        },
                        events: {
                            buttonClick: {type: HtmlComponentEventType.Click}
                        }
                    }
            case HtmlComponentType.None:
                return {
                    name: htmlType,
                    id: htmlCustomID,
                    code: "",
                    parameters: {},
                    events: {}
                }
            case HtmlComponentType.Custom:
                    return customHtmlComponents.find((it) => it.id === htmlCustomID)
    }
}


export function buildDefaultCustomHtmlElem(array: SetupCustomHtmlProperties[]): SetupCustomHtmlProperties {

    let maxId = Math.max(...array.map(o => o.id))
    maxId = maxId < 0 ? 0 : maxId

    const sameNames = array.filter((val) => {
        return val.name.startsWith("CustomDiv")
    })

    return {
        id: maxId + 1,
        name: "CustomDiv" + (sameNames.length + 1),
        code: "<div class=\"icon-text\">\n" +
        "  <span class=\"icon has-text-danger\">\n" +
        "    <i class=\"fas fa-ban\"></i>\n" +
        "  </span>\n" +
        "  <span>${$$match1}</span>\n" +
        "</div>",
        parameters: {match1: { type: HtmlComponentParameterType.Text, default: "Default" }},
        events: {}
    }
}

export function buildDefaultView(array: ViewSetupProperties[]): ViewSetupProperties {

    let maxId = Math.max(...array.map(o => o.id))
    maxId = maxId < 0 ? 0 : maxId

    const defaultViewMatch = buildDefaultViewMatch([])
    const defaultBindings = (defaultViewMatch.htmlComponentBindings as SetupBindingPropertiesGui).bindings
    const AllRefBindings = Object.keys(defaultBindings).reduce((acc, key) => {
        if(key === "color") {
            acc[key] = {...defaultBindings[key], ...{value: "#FF0000"}}
        } else {
            acc[key] = defaultBindings[key]
        }
        return acc
    }, {})
    const AllTxBindings = Object.keys(defaultBindings).reduce((acc, key) => {
        if(key === "color") {
            acc[key] =  {...defaultBindings[key], ...{value: "#7ed3ff"}}
        } else {
            acc[key] = defaultBindings[key]
        }
        return acc
    }, {})
    return {
        id: maxId + 1,
        name: "New View" + (maxId + 1),
        parserType: ParserNames.LineParser,
        customParserID: 0,
        parserSettings: {},
        matchers: [
            { ...defaultViewMatch, ...{ id: 1, name: "All Rx", transmitted: false, received: true } },
            { ...defaultViewMatch, ...{ id: 2, name: "All Tx", transmitted: true, received: false, htmlComponentBindings: {...defaultViewMatch.htmlComponentBindings, ...{bindings: AllTxBindings}}}},
            { ...defaultViewMatch, ...{ id: 3, name: "All Refused", transmitted: true, received: true, refused: true, htmlComponentBindings: {...defaultViewMatch.htmlComponentBindings, ...{bindings: AllRefBindings}}}},
        ],
        widgetFrameSize: 30,
        widgetGroupIds: [],
        autoWrap: true
    }
}


export function buildDefaultViewMatch(array: ViewSetupMatchElementProperties[]): ViewSetupMatchElementProperties {
    let maxId = Math.max(...array.map(o => o.id))
    maxId = maxId < 0 ? 0 : maxId

    const resolverParam = buildDefaultResolverParam(ViewSetupMatchResolverType.Any)
    const bindings =  buildDefaultHtmlBindings(BuildHtmlComponent(HtmlComponentType.Div, null, []), ViewSetupMatchResolverType.Any, resolverParam)

    return {
        id: maxId + 1,
        name: "New Match" + (maxId + 1),
        disabled: false,
        resolver: ViewSetupMatchResolverType.Any,
        resolverParam: resolverParam,
        accepted: true,
        refused: false,
        consumeMatch: true,
        transmitted: false,
        received: true,
        widgetMode: false,
        safeHtml: true,
        widgetID: 0,
        htmlComponentType: HtmlComponentType.Div,
        htmlCustomID: 0,
        htmlComponentBindingType: SetupBindingType.Gui,
        htmlComponentBindings: {bindings: (bindings as SetupBindingPropertiesGui).bindings}
    }
}

export function buildDefaultResolverParam(resolver: ViewSetupMatchResolverType): ViewSetupMatchResolverProperties {
    switch (resolver) {
        case ViewSetupMatchResolverType.Regex:
            return { regex: "Error|Fault|Fatal" }
        case ViewSetupMatchResolverType.ObjectCompare:
            return {
                code: beautify(`
                    function customObjectCompare(state, parsedData, info) {
                        // state: can be set to keep persistent state between compares.
                        // parsedData: string or object according to parser usage
                        // info: {isTx: boolean, time: string, driverName: string}
                        // retrun an object with key pair of items to render and result status
                        // keys must always be present when the function returns
                        if(parsedData) {
                            if (typeof parsedData === "string") {
                                return {result: true, data: {field1: parsedData}}
                            } else {
                                // field errorFlag may not exist depending on your parser implementation
                                // TODO replace with the fields you are providing from the parser
                                return {result: true, data: {field1: parsedData.toString()}}
                            }
                        }
                        // Dummy result is used by setup for previewing available html bindings
                        // Any field added in 'data' MUST also be returned by all others returns
                        return {result: false, data: {field1: ""}}
                    }`, beautifyOptions
                )
            }
        default:
            return { text: "" }
    }
}

export function buildResolverResultKeys(resolverParam: ViewSetupMatchResolverProperties, type: ViewSetupMatchResolverType) {
    let availableResolverResultField = ["All"]
    if (type === ViewSetupMatchResolverType.Regex) {
        try {
            var num_groups = (new RegExp(resolverParam.regex + '|')).exec('').length
            availableResolverResultField = [...Array(num_groups).keys()].map(i => "Group " + i.toString())
            availableResolverResultField[0] = "All"
        } catch (e) { }
    }
    else if(type === ViewSetupMatchResolverType.ObjectCompare) {
        try {
            const objectCompareFunc =  new Function("return " + resolverParam.code)()
            const objectCompareResult = objectCompareFunc({}, null)
            availableResolverResultField = Object.keys(objectCompareResult.data)
        } catch(e) {
            // Ignore error (may be typing)
            return []
        }

    }
    return availableResolverResultField
}

export function buildDefaultHtmlBindings(htmlComponent: SetupCustomHtmlProperties, 
                                    resolver: ViewSetupMatchResolverType, resolverParam: ViewSetupMatchResolverProperties): SetupBindingProperties | null {
    
    const injectValue = (value, type: HtmlComponentParameterType) => {
        switch(type) {
            case HtmlComponentParameterType.Number:
                return `${value}`;
            default:
                return `"${value}"`
        }
    }

    const resolverResultKeys = buildResolverResultKeys(resolverParam, resolver)

    if(!resolverResultKeys) {
        return null
    }

    const htmlParameters = htmlComponent.parameters

    const bindings = Object.keys(htmlParameters).reduce((acc, name) => {
        const fixed = (htmlParameters[name].type !== HtmlComponentParameterType.Text)
        if(name !== "timestamp") {
            acc[name] = {
                fixed: fixed,
                value: htmlParameters[name].default,
                item: resolverResultKeys[0]
            }
        }
        return acc
    }, {})

    return {
        bindings: bindings,
        code: (() => {
            switch (resolver) {
                case ViewSetupMatchResolverType.Regex:
                    return beautify(`
                        function applyObjectToHtml(state, resolvedParsedData)
                        {
                            // resolvedParsedData is the array of the regex result. item 0 is the whole line matches.
                            // items 1..n are the capturing group matches.
                            // ex. regex "hello (.*)" on "Hello Mark"
                            // resolvedParsedData['All'] -> Hello Mark
                            // resolvedParsedData['Group 1'] -> Mark
                            // available resolvedParsedData keys: ${resolverResultKeys.join(" ")}
                            return {${Object.keys(htmlParameters).filter((name) => name !== "timestamp").map((name) => {
                            return `${name}: ${(htmlParameters[name].type === HtmlComponentParameterType.Text) ? `resolvedParsedData["${resolverResultKeys.at(0)}"]` : injectValue(htmlParameters[name].default, htmlParameters[name].type)}\r\n`
                    })}}}`, beautifyOptions)
                case ViewSetupMatchResolverType.ObjectCompare:
                    return beautify(`
                        function applyObjectToHtml(state, resolvedParsedData)
                        {
                            // available resolvedParsedData keys: ${resolverResultKeys.join(" ")}
                            return {${Object.keys(htmlParameters).filter((name) => name !== "timestamp").map((name) => {
                            return `${name}: ${(htmlParameters[name].type === HtmlComponentParameterType.Text) ? `resolvedParsedData["${resolverResultKeys.at(0)}"]` : injectValue(htmlParameters[name].default, htmlParameters[name].type)}\r\n`
                    })}}}`, beautifyOptions)
                default:
                    return beautify(`
                        function applyObjectToHtml(state, resolvedParsedData)
                        {
                            // available resolvedParsedData keys: ${resolverResultKeys.join(" ")}
                            return {${Object.keys(htmlParameters).filter((name) => name !== "timestamp").map((name) => {
                            return `${name}: ${(htmlParameters[name].type === HtmlComponentParameterType.Text) ? `resolvedParsedData["${resolverResultKeys.at(0)}"]` : injectValue(htmlParameters[name].default, htmlParameters[name].type)}\r\n`
                    })}}}`, beautifyOptions)
            }
        }
        )()
    }
}


export function buildDefaultWidgetGroup(array: WidgetGroupSetupProperties[]): WidgetGroupSetupProperties {

    let maxId = Math.max(...array.map(o => o.id))
    maxId = maxId < 0 ? 0 : maxId

    return {
        id: maxId + 1,
        name: "New Widget Group" + (maxId + 1),
        widgets: []
    }
}

export function buildDefaultWidget(array: WidgetSetupProperties[], actions: ActionProperties[]): WidgetSetupProperties {

    let maxId = Math.max(...array.map(o => o.id))
    maxId = maxId < 0 ? 0 : maxId

    return {
        id: maxId + 1,
        name: "New Widget" + (maxId + 1),
        disabled: false,
        htmlComponentType: HtmlComponentType.Button,
        htmlCustomID: 0,
        bindings: buildDefaultWidgetBindings(BuildHtmlComponent(HtmlComponentType.Button, null, [])),
        actions: buildDefaultWidgetActions(BuildHtmlComponent(HtmlComponentType.Button, null, []), actions)
    }
}

export function buildDefaultWidgetBindings(htmlComponent: SetupCustomHtmlProperties): {[name:string]: {value: string}} {

    const htmlParameters = htmlComponent.parameters

    const bindings = Object.keys(htmlParameters).reduce((acc, name) => {
        acc[name] = {
            value: htmlParameters[name].default,
        }
        return acc
    }, {})

    return bindings
}

export function buildDefaultWidgetActions(htmlComponent: SetupCustomHtmlProperties, actions: ActionProperties[]): WidgetActionProperties {

    const htmlEvents = htmlComponent.events

    const actionProperties = Object.keys(htmlEvents).reduce((acc, name) => {
        acc[name] = {
            htmlEventKey: name,
            actionID: actions.length > 0 ? actions.at(0).id : 0
        }
        return acc
    }, {})

    return actionProperties
}

export function buildDefaultAction(array: ActionProperties[], avaiableCustomBuilders: SetupCustomBuilderProperties[]): ActionProperties {

    let maxId = Math.max(...array.map(o => o.id))
    maxId = maxId < 0 ? 0 : maxId
    
    const bindings = buildDefaultActionBindings(BuilderNames.LineBuilder, null, avaiableCustomBuilders)
    return {
        id: maxId + 1,
        name: "New Action" + (maxId + 1),
        builderType: BuilderNames.LineBuilder,
        builderCustomID: 0,
        builderBindingType: SetupBindingType.Gui,
        builderBindings: {bindings: (bindings as SetupBindingPropertiesGui).bindings},
    }
}

export function buildDefaultActionBindings(builderType: string, builderCustomID: number | null, avaiableCustomBuilders: SetupCustomBuilderProperties[]): SetupBindingProperties | null {
    let keys = null

    switch(builderType) {
        case BuilderNames.LineBuilder:
            keys = {}
            keys['Text'] = "Text"
            break;
        case BuilderNames.HexStringBuilder:
            keys = {}
            keys['HexString'] = "AABBCCDD"
            break;
        case BuilderNames.CustomBuilder:
            try {
                let customBuilder = avaiableCustomBuilders.find((it) => it.id == builderCustomID)
                const customBuilderFunc =  new Function("return " + customBuilder.code)()
                const [args, _] = customBuilderFunc({}, null)
                keys = args
            } catch(e) {}
            break;
    }

    if(!keys) {
        return null
    }

    const bindings = Object.keys(keys).reduce((acc, key) => {
        acc[key] = { fixed: true, value: keys[key] }
        return acc
    }, {})

    return {
        bindings: bindings,
        code: (() => {
            return beautify(`
            function composeAction(state)
            {
                // available args keys: ${Object.keys(bindings).join(" ")}
                return ${JSON.stringify(keys)}
            }`, beautifyOptions)
        }
        )()
    }
}

export function buildDefaultDriverWebSerialSettings(driverName: string): DriverSettings {
    return DriverFactory.getDefaultParams(driverName)
}