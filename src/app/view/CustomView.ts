import { useResolvedPath } from "react-router-dom";
import { BuilderNames } from "../builders/Builder";
import { BuilderFactory } from "../builders/BuilderFactory";
import { CustomBuilder } from "../builders/CustomBuilder";
import { HexStringBuilder } from "../builders/HexStringBuilder";
import { LineBuilder } from "../builders/LineBuilder";
import { BuildHtmlComponent, buildResolverResultKeys } from "../setup/SetupFactories";
import { SetupCustomHtmlProperties, SetupBindingType, ViewSetupMatchElementProperties, ViewSetupMatchResolverProperties, ViewSetupMatchResolverType, ViewSetupProperties, SetupBindingPropertiesCode, SetupBindingPropertiesGui, WidgetSetupProperties, WidgetGroupSetupProperties, HtmlComponentEventType, ActionProperties, SetupCustomBuilderProperties } from "../setup/SetupInterfaces";
import { ViewSetup } from "../components/setup/ViewSetup";
import { Driver } from "../drivers/Driver";
import { Parser, ParserInfoType } from "../parsers/Parser";
import { compileTemplate, compileTemplateUnsafe } from "../utility/customRenderUtils";
import { Observable } from "../utility/Observable";
import { Buffer } from 'buffer';
import { View } from "./View";

type MatchWithStateType = ({ matcher: ViewSetupMatchElementProperties } & { state: object })

export class CustomView implements View {
    private name: string
    private matchers: MatchWithStateType[]
    private widgets: WidgetSetupProperties[]
    private elementCount:number

    constructor(
        readonly driver: Driver,
        readonly view: ViewSetupProperties,
        readonly widgetGroups: WidgetGroupSetupProperties[],
        readonly actions: ActionProperties[],
        readonly customBuilders: SetupCustomBuilderProperties[],
        readonly customHtmls: SetupCustomHtmlProperties[],
        readonly refDiv: React.MutableRefObject<HTMLDivElement>,
        readonly widgetRefDiv: React.MutableRefObject<HTMLDivElement>,
        readonly maxItemPerPage: number) {

        this.elementCount = 0
        this.name = view.name
        this.view = view
        this.widgets = []
        this.refDiv = refDiv
        this.widgetRefDiv = widgetRefDiv
        this.matchers = this.view.matchers.map((matcher) => {
            return {
                matcher: matcher,
                state: {}
            }
        })
        this.view.widgetGroupIds.forEach((widgetGroupID) => {
            this.widgetGroups.forEach((widgetGroup) => {
                if (widgetGroupID.id === widgetGroup.id) {
                    widgetGroup.widgets.forEach((widget) => {
                        this.widgets.push(widget)
                    })
                }
            })
        })
    }

    public init() {
        if(this.widgetRefDiv && this.widgetRefDiv.current) {
            this.widgetRefDiv.current.innerHTML = ""
            this.widgets.forEach((widget) => {
                this.buildWidget(widget)
            })
        }
    }

    public putParsedObject(data: any, accepted: boolean, info: ParserInfoType) {
        let str
        let consumed = false
        for (let matcherWithState of this.matchers) {
            if (matcherWithState.matcher.disabled)
                continue
            let matcher = matcherWithState.matcher
            let resultKeys = buildResolverResultKeys(matcher.resolverParam, matcher.resolver)
            if (((matcher.accepted && accepted) || matcher.refused && !accepted) && ((matcher.transmitted && info.isTx) || (matcher.received && !info.isTx))) {
                switch (matcher.resolver) {
                    case ViewSetupMatchResolverType.StartsWith:
                    case ViewSetupMatchResolverType.EndsWith:
                    case ViewSetupMatchResolverType.Contains:
                    case ViewSetupMatchResolverType.Regex:
                    case ViewSetupMatchResolverType.Any:
                        if (typeof data === "string") {
                            str = data as string
                        }
                        else if (data instanceof Uint8Array) {
                            str = ""
                            Buffer.from(data).forEach((it) => {
                                str += it.toString(16).padStart(2, '0').toUpperCase()
                                str += " "
                            })
                        }
                        else if (typeof data === "number") {
                            str = data.toString(16)
                        } else {
                            str = JSON.stringify(data)
                        }
                        break;
                }

                switch (matcher.resolver) {
                    case ViewSetupMatchResolverType.StartsWith:
                        if (str.startsWith(matcher.resolverParam.text)) {
                            this.handleResolverResult(matcherWithState, { [resultKeys[0]]: str }, accepted, info)
                            if (matcher.consumeMatch)
                                consumed = true
                        }
                        break;
                    case ViewSetupMatchResolverType.EndsWith:
                        if (str.endsWith(matcher.resolverParam.text)) {
                            this.handleResolverResult(matcherWithState, { [resultKeys[0]]: str }, accepted, info)
                            if (matcher.consumeMatch)
                                consumed = true
                        }
                        break;
                    case ViewSetupMatchResolverType.Contains:
                        if (str.indexOf(matcher.resolverParam.text) > 0) {
                            this.handleResolverResult(matcherWithState, { [resultKeys[0]]: str }, accepted, info)
                            if (matcher.consumeMatch)
                                consumed = true
                        }
                        break;
                    case ViewSetupMatchResolverType.Regex:
                        try {
                            const regex = matcher.resolverParam.regex
                            const regexRes = new RegExp(regex).exec(str)
                            if (regexRes) {
                                let resolverPairs = regexRes.reduce((acc, res, index) => {
                                    acc[resultKeys[index]] = index == 0 ? str : res
                                    return acc
                                }, {})
                                this.handleResolverResult(matcherWithState, resolverPairs, accepted, info)
                                if (matcher.consumeMatch)
                                    consumed = true
                            }
                        } catch (ex) {
                            const msg = "Regex error on parsing matcher " + matcher.name + " | " + str
                            if (accepted) {
                                // Force a refused message
                                this.putParsedObject(msg, false, info)
                                console.error(ex)
                            } else {
                                console.error(msg)
                            }
                        }
                        break;
                    case ViewSetupMatchResolverType.ObjectCompare:
                        try {
                            const objectCompareFunc = new Function("return " + matcher.resolverParam.code)();
                            const objectCompareResult = objectCompareFunc(matcherWithState.state, data, info)
                            if (objectCompareResult && objectCompareResult.result === true) {
                                this.handleResolverResult(matcherWithState, objectCompareResult.data, accepted, info)
                                if (matcher.consumeMatch)
                                    consumed = true
                            }
                        } catch (ex) {
                            const msg = "ObjectCompare error on parsing matcher " + matcher.name
                            if (accepted) {
                                // Force a refused message
                                this.putParsedObject(msg, false, info)
                                console.error(ex)
                            } else {
                                console.error(msg)
                            }
                        }
                        break;
                    case ViewSetupMatchResolverType.Any:
                        this.handleResolverResult(matcherWithState, { [resultKeys[0]]: str }, accepted, info)
                        if (matcher.consumeMatch)
                            consumed = true
                        break;
                }
            }

            if (consumed)
                break
        }

    }

    private handleResolverResult(matcherWithState: MatchWithStateType, availableBindingsResult, accepted: boolean, info: ParserInfoType) {
        const matcher = matcherWithState.matcher
        const state = matcherWithState.state
        const htmlComponent = BuildHtmlComponent(matcher.htmlComponentType, matcher.htmlCustomID, this.customHtmls)
        const htmlParameters = htmlComponent.parameters
        let parameters = {}

        try {

            switch (matcher.htmlComponentBindingType) {
                case SetupBindingType.Code:
                    const bindResultFunc = new Function("return " + (matcher.htmlComponentBindings as SetupBindingPropertiesCode).code)();
                    const bindResult = bindResultFunc(state, availableBindingsResult)
                    Object.keys(htmlParameters).forEach((name) => {
                        parameters["$$" + name] = bindResult[name]
                    })
                    break;
                case SetupBindingType.Gui:
                    Object.keys(htmlParameters).forEach((name) => {
                        parameters["$$" + name] = htmlParameters[name].default;
                        const binding = (matcher.htmlComponentBindings as SetupBindingPropertiesGui).bindings[name]
                        if (binding) {
                            if (binding.fixed)
                                parameters["$$" + name] = binding.value
                            else {
                                if (binding.item in availableBindingsResult) {
                                    parameters["$$" + name] = availableBindingsResult[binding.item]
                                }
                                else {
                                    parameters["$$" + name] = "Internal Error: No resolver result matching binding"
                                }
                            }


                        }
                    })
                    break;
            }
            if (matcher.widgetMode) {
                const widget = this.widgets.find((it) => matcher.widgetID === it.id)
                if (widget) {
                    this.applyWidget(widget, htmlComponent, parameters)
                }
            } else {
                let compiled
                if(matcher.safeHtml) {
                    compiled = compileTemplate(
                        htmlComponent.code,
                        parameters
                    )
                } else {
                    compiled = compileTemplateUnsafe(
                        htmlComponent.code,
                        parameters
                    )
                }

                if(compiled.length > 0) {
                    let newElementsCount = this.elementCount + 1
                    if (newElementsCount > this.maxItemPerPage) {
                        let firstChild = this.refDiv.current.firstElementChild 
                        this.refDiv.current.removeChild(firstChild)
                    } else {
                        this.elementCount = newElementsCount
                    }
                    this.refDiv.current.insertAdjacentHTML('beforeend', compiled)
                }

            }

        } catch (ex) {
            const msg = "Rendering error on parsing matcher " + matcher.name
            if (accepted) {
                // Force a refused message
                this.putParsedObject(msg, false, info)
                console.error(ex)
            } else {
                console.error(msg)
            }
        }

    }

    public getName() {
        return this.name;
    }


    private buildWidget(widget: WidgetSetupProperties) {
        const htmlComponent = BuildHtmlComponent(widget.htmlComponentType, widget.htmlCustomID, this.customHtmls)
        const htmlParameters = htmlComponent.parameters
        let parameters = {}
        Object.keys(htmlParameters).forEach((name) => {
            parameters["$$" + name] = htmlParameters[name].default;
            const binding = widget.bindings[name]
            if (binding) {
                parameters["$$" + name] = binding.value
            }
        })

        this.applyWidget(widget, htmlComponent, parameters)
    }


    private applyWidget(widget: WidgetSetupProperties, htmlComponent: SetupCustomHtmlProperties, parameters) {
        const componentID = widget.name + "_" + widget.id

        
        const compiled = compileTemplate(
            htmlComponent.code,
            parameters
        )

        let component = document.getElementById(componentID)
        let added = false
        if (!component) {
            component = document.createElement('div');
            component.className = "is-flex is-flex-direction-column is-align-items-center"
            component.id = widget.name + "_" + widget.id
            component.innerHTML = compiled
            added = true
        } else {
            component.innerHTML = compiled
        }

        const clickEvents = component.querySelectorAll('[data-' + HtmlComponentEventType.Click + ']');
        clickEvents?.forEach((it) => {
            const state = {}

            it.addEventListener("click", (e) => {
                const actionName = it.getAttribute('data-' + HtmlComponentEventType.Click)
                const actionID = widget.actions[actionName].actionID
                const action = this.actions.find((it) => it.id === actionID)
                const builder = BuilderFactory.build({ name: action.builderType, settings: { id: action?.builderCustomID ?? 0 } }, this.customBuilders)
                let builderParameters = {}
                if (action.builderBindingType === SetupBindingType.Gui) {
                    const bindings = (action.builderBindings as SetupBindingPropertiesGui).bindings
                    Object.keys(bindings).forEach((key) => {
                        builderParameters[key] = bindings[key].value
                    })
                } else {
                    const buildArgFunc = new Function("return " + (action.builderBindings as SetupBindingPropertiesCode).code)();
                    builderParameters = buildArgFunc(state)
                }

                switch (action.builderType) {
                    case BuilderNames.LineBuilder:
                        (builder as LineBuilder).prepareArgs(Object.values(builderParameters)[0] as string);
                        break;
                    case BuilderNames.HexStringBuilder:
                        (builder as HexStringBuilder).prepareArgs(Object.values(builderParameters)[0] as string);
                        break;
                    case BuilderNames.CustomBuilder:
                        (builder as CustomBuilder).prepareArgs(builderParameters);
                        break;
                }

                const dataToSend = builder.build()
                this.driver.send(dataToSend)
            })
        })

        if (added) {
            this.widgetRefDiv.current.insertAdjacentElement('beforeend', component)
        }
    }
}