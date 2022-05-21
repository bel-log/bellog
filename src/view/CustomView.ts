import { useResolvedPath } from "react-router-dom";
import { resolve } from "../../webpack.config";
import { buildResolverResultKeys } from "../app/setup/SetupFactories";
import { SetupCustomHtmlProperties, ViewSetupHtmlBindingType, ViewSetupMatchElementProperties, ViewSetupMatchResolverProperties, ViewSetupMatchResolverType, ViewSetupProperties } from "../app/setup/SetupInterfaces";
import { ViewSetup } from "../components/setup/ViewSetup";
import { Parser } from "../parsers/Parser";
import { compileTemplate } from "../utility/customRenderUtils";
import { View } from "./View";

type HtmlElementsMap = {[k:string]:SetupCustomHtmlProperties}

export class CustomView implements View {
    private name: string
    private parser: Parser
    private setup: ViewSetupProperties
    private htmls: HtmlElementsMap
    private refDiv: React.MutableRefObject<HTMLDivElement>
    private matchers: ({matcher: ViewSetupMatchElementProperties} & {state: object})[]

    constructor(parser: Parser, setup: ViewSetupProperties, htmls: SetupCustomHtmlProperties[], refDiv: React.MutableRefObject<HTMLDivElement>) {
        this.name = setup.name
        this.parser = parser
        this.setup = setup
        this.htmls = htmls.reduce((acc, val) => {
            acc[val.name] = val
            return acc
        }, {})
        this.refDiv = refDiv
        this.matchers = this.setup.matchers.map((matcher) => {
            return {
                matcher: matcher,
                state: {}
            }
        })
    }

    public putParsedObject(data: any, accepted: boolean) {
        let str
        let consumed = false
        for (let matcherWithState of this.matchers) {
            let matcher = matcherWithState.matcher
            let resultKeys = buildResolverResultKeys(matcher.resolverParam, matcher.resolver)
            if (matcher.accepted === accepted) {
                switch (matcher.resolver) {
                    case ViewSetupMatchResolverType.StartsWith:
                        if (typeof data === "string") {
                            str = data as string
                        } else {
                            str = JSON.stringify(data)
                        }
                        if (str.startsWith(matcher.resolverParam.text)) {
                            this.handleResolverResult(matcherWithState, { [resultKeys[0]]: str })
                            if (matcher.consumeMatch)
                                consumed = true
                        }
                        break;
                    case ViewSetupMatchResolverType.EndsWith:
                        if (typeof data === "string") {
                            str = data as string
                        } else {
                            str = JSON.stringify(data)
                        }
                        if (str.endsWith(matcher.resolverParam.text)) {
                            this.handleResolverResult(matcherWithState, { [resultKeys[0]]: str })
                            if (matcher.consumeMatch)
                                consumed = true
                        }
                        break;
                    case ViewSetupMatchResolverType.Contains:
                        if (typeof data === "string") {
                            str = data as string
                        } else {
                            str = JSON.stringify(data)
                        }
                        if (str.indexOf(matcher.resolverParam.text) > 0) {
                            this.handleResolverResult(matcherWithState, { [resultKeys[0]]: str })
                            if (matcher.consumeMatch)
                                consumed = true
                        }
                        break;
                    case ViewSetupMatchResolverType.Regex:
                        if (typeof data === "string") {
                            str = data as string
                        } else {
                            str = JSON.stringify(data)
                        }
                        const regex = matcher.resolverParam.regex
                        const regexRes = new RegExp(regex).exec(str)
                        if (regexRes) {
                            let resolverPairs = regexRes.reduce((acc, res, index) => {
                                acc[resultKeys[index]] = res
                                return acc
                            }, {})
                            this.handleResolverResult(matcherWithState, resolverPairs)
                            if (matcher.consumeMatch)
                                consumed = true
                        }
                        break;
                    case ViewSetupMatchResolverType.ObjectCompare:
                        const objectCompareFunc = new Function("return " + matcher.resolverParam.code)();
                        const objectCompareResult = objectCompareFunc(matcherWithState.state, data)
                        if (objectCompareResult && objectCompareResult.result === true) {
                            this.handleResolverResult(matcherWithState, objectCompareResult.data)
                            if (matcher.consumeMatch)
                                consumed = true
                        }
                        break;
                    case ViewSetupMatchResolverType.Any:
                        if (typeof data === "string") {
                            str = data as string
                        } else {
                            str = JSON.stringify(data)
                        }
                        this.handleResolverResult(matcherWithState, { [resultKeys[0]]: str })
                        if (matcher.consumeMatch)
                            consumed = true
                        break;
                }
            }

            if (consumed)
                break
        }
        
    }

    private handleResolverResult(matcherWithState, availableBindingsResult) {
        const matcher = matcherWithState.matcher
        const state = matcherWithState.state
        const key = matcher.htmlComponent
        const htmlParameters = this.htmls[key].parameters
        let parameters = {}
        switch(matcher.htmlComponentBindingType) {
            case ViewSetupHtmlBindingType.Code:
                const bindResultFunc =  new Function("return " + matcher.htmlComponentBindings.code)();
                const bindResult = bindResultFunc(state, availableBindingsResult)
                Object.keys(htmlParameters).forEach((name) => {
                    parameters["$$" + name] = bindResult[name]
                })
                break;
            case ViewSetupHtmlBindingType.Gui:
                Object.keys(htmlParameters).forEach((name) => {
                    parameters["$$" + name] = htmlParameters[name].default;
                    const binding = matcher.htmlComponentBindings.bindings[name]
                    if(binding) {
                        if(binding.fixed)
                            parameters["$$" + name] = binding.value
                        else {
                            if(binding.item in availableBindingsResult) {
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

            const compiled = compileTemplate(
                this.htmls[key].code,
                parameters
            )    
            this.refDiv.current.insertAdjacentHTML('beforeend', compiled)
    }

    public getName() {
        return this.name;
    }
}