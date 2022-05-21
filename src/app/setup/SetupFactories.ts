import {
    HtmlComponentParameterType,
    SetupCustomHtmlProperties,
    SetupCustomParserProperties,
    SetupGlobalScriptProperties,
    SetupGlobalStyleProperties,
    ViewSetupHtmlBindingProperties,
    ViewSetupHtmlBindingType,
    ViewSetupMatchElementProperties,
    ViewSetupMatchResolverProperties,
    ViewSetupMatchResolverType,
    ViewSetupProperties
} from "./SetupInterfaces";
import * as serialize from "serialize-javascript"
import * as beautify from "js-beautify"
import { embeddedHtmlComponents } from "./SetupDefaults";
import {
    DriverSerialPortWebSerialDefaults,
    DriverSerialPortWebSerialParameters
} from "../../drivers/DriverSerialportWebserial";
import { DriverFactory } from "../../drivers/DriverFactory";
import { DriverNames, DriverSettings } from "../../drivers/Driver";
import Parser from "html-react-parser";
import { ParserNames } from "../../parsers/Parser";
import { RendererList } from "../../renderers/rendererslist";
import { SetupProfileObject } from "./SetupInterfaces";

export function buildDefaultProfile(): SetupProfileObject {
    return {
        profileName: "New Profile",
        setupVersion: "1",
        driver: { name: DriverNames.DriverClipboard },
        html: [],
        parsers: [],
        scripts: [],
        styles: [],
        views: [],
        globalSettings: {
            shareDataBetweenViews: false
        }
    }
}

export function buildDefaultGlobalScript(array: SetupGlobalScriptProperties[]): SetupGlobalScriptProperties {
    const maxId = array.reduce(
        (max, script) => (script.id > max ? script.id : max),
        array.length > 0 ? array[0].id : 0
    ) ?? 0;

    return {
        id: maxId + 1,
        code: beautify(serialize(
            function custom_global_func() {
                console.log("dummy")
            })
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
        code: beautify(serialize(
            function (accumulator, data, onAccept, onRefuse) {
                // This is an example line parser. captures each sequence with terminating \n or \r
                // accumulator: use it to accumulate state of the parser then return it
                // data: Uin8tArray of received data
                // onAccept(string, args): call this callback when accumulator is ready and has a valid sequence
                // onRefuse(string, args): call this to refuse the sequence. Content may be displayed anyway according to view configuration
                let _accumulator = (accumulator === null || accumulator === undefined) ? "" : accumulator;
                const _data = String.fromCharCode.apply(null, data);
                for (let i = 0; i < _data.length; i++) {
                    if (_data[i] == '\r' || _data[i] == '\n') {
                        if (_accumulator.length > 0) {
                            onAccept(this.accumulator)
                            _accumulator = ""
                        }
                    } else {
                        _accumulator += data[i]
                    }
                }

                return _accumulator;
            }
        ))
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
            "  <span>${match1}</span>\n" +
            "</div>",
        parameters: {match1: { type: HtmlComponentParameterType.Text, default: "Default" }}
    }
}

export function buildDefaultView(array: ViewSetupProperties[]): ViewSetupProperties {

    let maxId = Math.max(...array.map(o => o.id))
    maxId = maxId < 0 ? 0 : maxId

    return {
        id: maxId + 1,
        name: "New View" + (maxId + 1),
        parser: { name: ParserNames.LineParser },
        matchers: [
            { ...buildDefaultViewMatch([]), ...{ id: 0, name: "All" } }
        ],
        autoWrap: true
    }
}


export function buildDefaultViewMatch(array: ViewSetupMatchElementProperties[]): ViewSetupMatchElementProperties {
    let maxId = Math.max(...array.map(o => o.id))
    maxId = maxId < 0 ? 0 : maxId

    const resolverParam = buildDefaultResolverParam(ViewSetupMatchResolverType.Any)

    return {
        id: maxId + 1,
        name: "New Match" + (maxId + 1),
        resolver: ViewSetupMatchResolverType.Any,
        resolverParam: resolverParam,
        accepted: true,
        consumeMatch: true,
        widgetMode: false,
        htmlComponent: embeddedHtmlComponents.at(0).name,
        htmlComponentBindingType: ViewSetupHtmlBindingType.Gui,
        htmlComponentBindings: buildDefaultHtmlBindings(embeddedHtmlComponents.at(0).name, embeddedHtmlComponents, ViewSetupMatchResolverType.Any, resolverParam)
    }
}

export function buildDefaultResolverParam(resolver: ViewSetupMatchResolverType): ViewSetupMatchResolverProperties {
    switch (resolver) {
        case ViewSetupMatchResolverType.Regex:
            return { regex: "Error|Fault|Fatal" }
        case ViewSetupMatchResolverType.ObjectCompare:
            return {
                code: beautify(serialize(
                    function customObjectCompare(state, parsedData) {
                        // state: can be set to keep persistent state between compares.
                        // parsedData: string or object according to parser usage
                        // retrun an object with key pair of items to render and result status
                        // keys must always be present when the function returns

                        if (typeof parsedData === "string") {
                            if(parsedData.toLowerCase().indexOf("error") > 0)
                            {
                                return {result: true, data: {field1: "field1", field2: parsedData}}
                            }
                        } else {
                            // field errorFlag may not exist depending on your parser implementation
                            // TODO replace with the fields you are providing from the parser
                            if(parsedData.errorFlag === true)
                                return {result: true, data: {field1: "field1", field2: parsedData.errorString}}
                        }
                        // Dummy result is used by setup for previewing available html bindings
                        return {result: false, data: {field1: "", field2: ""}}
                    })
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
            const objectCompareResult = objectCompareFunc({}, "")
            availableResolverResultField = Object.keys(objectCompareResult.data)
        } catch(e) {
            // Ignore error (may be typing)
            console.error(e)
        }

    }
    return availableResolverResultField
}

export function buildDefaultHtmlBindings(htmlComponentName: string, htmlComponents: SetupCustomHtmlProperties[], 
                                    resolver: ViewSetupMatchResolverType, resolverParam: ViewSetupMatchResolverProperties): ViewSetupHtmlBindingProperties {
    const htmlComponent = htmlComponents.find((it) => it.name == htmlComponentName)

    const injectValue = (value, type: HtmlComponentParameterType) => {
        switch(type) {
            case HtmlComponentParameterType.Number:
                return `${value}`;
            default:
                return `"${value}"`
        }
    }

    const resolverResultKeys = buildResolverResultKeys(resolverParam, resolver)
    const htmlParameters = htmlComponent.parameters

    const bindings = Object.keys(htmlParameters).reduce((acc, name) => {
        const fixed = (htmlParameters[name].type !== HtmlComponentParameterType.Text)
        acc[name] = {
            fixed: fixed,
            value: htmlParameters[name].default,
            item: resolverResultKeys[0]
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
                            // item[0] -> Hello Mark
                            // item[1] -> Mark
                            // available resolvedParsedData keys: ${resolverResultKeys.join(" ")}
                            return {${Object.keys(htmlParameters).map((name) => {
                            return `${name}: ${(htmlParameters[name].type === HtmlComponentParameterType.Text) ? `resolvedParsedData["${resolverResultKeys.at(0)}"]` : injectValue(htmlParameters[name].default, htmlParameters[name].type)}\r\n`
                    })}}}`)
                case ViewSetupMatchResolverType.ObjectCompare:
                    return beautify(`
                        function applyObjectToHtml(state, resolvedParsedData)
                        {
                            // available resolvedParsedData keys: ${resolverResultKeys.join(" ")}
                            return {${Object.keys(htmlParameters).map((name) => {
                            return `${name}: ${(htmlParameters[name].type === HtmlComponentParameterType.Text) ? `resolvedParsedData["${resolverResultKeys.at(0)}"]` : injectValue(htmlParameters[name].default, htmlParameters[name].type)}\r\n`
                    })}}}`)
                default:
                    return beautify(`
                        function applyObjectToHtml(state, resolvedParsedData)
                        {
                            // available resolvedParsedData keys: ${resolverResultKeys.join(" ")}
                            return {${Object.keys(htmlParameters).map((name) => {
                            return `${name}: ${(htmlParameters[name].type === HtmlComponentParameterType.Text) ? `resolvedParsedData["${resolverResultKeys.at(0)}"]` : injectValue(htmlParameters[name].default, htmlParameters[name].type)}\r\n`
                    })}}}`)
            }
        }
        )()
    }

    /*
        if (resolver === ViewSetupMatchResolverType.ObjectCompare) {
            return {
                bindings: {}, code:
                    beautify(`
                    function render_result(state, resolvedParsedData)
                    {
                        return {${htmlComponent.parameters.map((param) => {return `${param.name}: resolvedParsedData.objX, //FIXME add expression or match field here\r\n`
                    }).join("")}}
                    }`)
            }
        }
        else {
    
        }*/
}

export function buildDefaultDriverWebSerialSettings(driverName: string): DriverSettings {
    return DriverFactory.getDefaultParams(driverName)
}