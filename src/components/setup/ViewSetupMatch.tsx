import { useGranularEffect, usePropagator, useStateWithCallback, useUpdateEffect, useUpdateLayoutEffect } from "../../utility/customHooks";
import * as React from "react";
import { useEffect } from "react";
import {
    SetupCustomHtmlProperties,
    SetupBindingType,
    ViewSetupMatchElementProperties,
    ViewSetupMatchResolverType,
    HtmlComponentType,
    WidgetGroupSetupProperties,
    WidgetSetupProperties,
    SetupBindingPropertiesGui,
    SetupBindingPropertiesCode,
    ViewSetupMatchResolverProperties,
} from "../../app/setup/SetupInterfaces";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { CollapseCard } from "../CollapseCard";
import { buildDefaultHtmlBindings, buildDefaultResolverParam, BuildHtmlComponent, buildResolverResultKeys } from "../../app/setup/SetupFactories";
import { setItemOfObjectProp, setParamOfArrayProp, setParamOfObjectProp } from "../../utility/customSetters";
import { Resolver } from "webpack";

export const ViewSetupMatch = (props: {
    cfg: ViewSetupMatchElementProperties,
    customHtmlComponents: SetupCustomHtmlProperties[],
    widgets: WidgetSetupProperties[],
    onConfigChange: any,
}) => {

    const [p, applyCache] = usePropagator<ViewSetupMatchElementProperties>(props.cfg, props.onConfigChange)

    const [name, setName] = [p.name.val, p.name.set]
    const [resolver, setResolver] = [p.resolver.val, p.resolver.set]
    const [resolverParam, setResolverParam] = [p.resolverParam.val, p.resolverParam.set]
    const [consumeMatch, setConsumeMatch] = [p.consumeMatch.val, p.consumeMatch.set]
    const [accepted, setAccepted] = [p.accepted.val, p.accepted.set]
    const [refused, setRefused] = [p.refused.val, p.refused.set]
    const [transmitted, setTransmitted] = [p.transmitted.val, p.transmitted.set]
    const [received, setReceived] = [p.received.val, p.received.set]
    const [safeHtml, setSafeHtml] = [p.safeHtml.val, p.safeHtml.set]
    const [widgetMode, setWidgetMode] = [p.widgetMode.val, p.widgetMode.set]
    const [widgetID, setWidgetID] = [p.widgetID.val, p.widgetID.set]
    const [htmlComponentType, setHtmlComponentType] = [p.htmlComponentType.val, p.htmlComponentType.set]
    const [htmlCustomID, setHtmlCustomID] = [p.htmlCustomID.val, p.htmlCustomID.set]
    const [htmlComponentBindingType, setHtmlComponentBindingType] = [p.htmlComponentBindingType.val, p.htmlComponentBindingType.set]
    const [htmlComponentBindings, setHtmlComponentBindings] = [p.htmlComponentBindings.val, p.htmlComponentBindings.set]

    const availableBindingTypes = Object.values(SetupBindingType)
    const availableResolvers = Object.values(ViewSetupMatchResolverType)
    const availableCustomHtmlComponents = props.customHtmlComponents
    const availableResolverResultField = buildResolverResultKeys(resolverParam, resolver)
    const availableWidgets = props.widgets

    useUpdateEffect(() => {
        updateBindings(htmlComponentBindingType, htmlComponentType, htmlCustomID, resolver, resolverParam)
        applyCache()
    }, [availableCustomHtmlComponents])

    useUpdateEffect(() => {
        if (widgetMode) {
            setWidgetID(availableWidgets.length > 0 ? availableWidgets.at(0).id : 0)
        }
    }, [widgetMode])

    useUpdateEffect(() => {
        if (widgetMode) {
            const widget = availableWidgets.find((it) => it.id === widgetID)
            if (widget) {
                setHtmlComponentType(widget.htmlComponentType, true)
                setHtmlCustomID(widget.htmlCustomID, true)
                updateBindings(htmlComponentBindingType, widget.htmlComponentType, widget.htmlCustomID, resolver, resolverParam)
            } else {
                // Got deleted
                setWidgetMode(false, true)
            }
        }
        applyCache()
    }, [availableWidgets, widgetID])

    function updateBindings(htmlComponentBindingType: SetupBindingType, htmlComponentType: HtmlComponentType, 
                            htmlCustomID: number, resolver: ViewSetupMatchResolverType, 
                            resolverParam: ViewSetupMatchResolverProperties) {
        if (htmlComponentType == HtmlComponentType.Custom) {
            if (htmlCustomID == 0) {
                if(availableCustomHtmlComponents.length > 0) {
                    htmlCustomID = availableCustomHtmlComponents.at(0).id
                    setHtmlCustomID(htmlCustomID, true)
                } else {
                    return
                }
            }
        }

        if (htmlComponentBindingType === SetupBindingType.Gui) {
            const bindingsGui = (htmlComponentBindings as SetupBindingPropertiesGui)
            const bindignsCopy = { ...bindingsGui.bindings }
            const htmlComponent = BuildHtmlComponent(htmlComponentType, htmlCustomID, availableCustomHtmlComponents)
            if (htmlComponent) {
                const newBindings = (buildDefaultHtmlBindings(htmlComponent, resolver, resolverParam) as SetupBindingPropertiesGui).bindings
                if (newBindings) {
                    // Valid code
                    Object.keys(newBindings).forEach((key) => {
                        if (key in bindignsCopy && key in newBindings) {
                            newBindings[key].fixed = bindignsCopy[key].fixed
                            newBindings[key].value = bindignsCopy[key].value

                            if (availableResolverResultField.includes(bindignsCopy[key].item)) {
                                newBindings[key].item = bindignsCopy[key].item
                            }
                        }
                    })
                    setHtmlComponentBindings({bindings: newBindings}, true)
                }
            } else {
                // html component deleted?
                setHtmlComponentType(HtmlComponentType.Div, true)
            }
        }
        else if (htmlComponentBindingType === SetupBindingType.Code) {
            const htmlComponent = BuildHtmlComponent(htmlComponentType, htmlCustomID, availableCustomHtmlComponents)
            
            if (htmlComponent) {
                const bindings = buildDefaultHtmlBindings(htmlComponent, resolver, resolverParam)
                setHtmlComponentBindings({code: (bindings as SetupBindingPropertiesCode).code}, true)
            } else {
                // html component deleted?
                setHtmlComponentType(HtmlComponentType.Div, true)
            }
                
        }
    }

    function updateHtmlComponentBindingType(htmlComponentBindingType: SetupBindingType) {
        setHtmlComponentBindingType(htmlComponentBindingType, true)
        updateBindings(htmlComponentBindingType, htmlComponentType, htmlCustomID, resolver, resolverParam)
        applyCache()
    }

    function updateHtmlComponentType(htmlComponentType: HtmlComponentType) {
        updateBindings(htmlComponentBindingType, htmlComponentType, htmlCustomID, resolver, resolverParam)
        setHtmlComponentType(htmlComponentType, true)
        applyCache()
    }

    function updateHtmlCustomID(htmlCustomID: number) {
        updateBindings(htmlComponentBindingType, htmlComponentType, htmlCustomID, resolver, resolverParam)
        setHtmlCustomID(htmlCustomID, true)
        applyCache()
    }

    function updateResolverParam(resolverParam: ViewSetupMatchResolverProperties) {
         // If resovlerParam updates do not assign new code since may be being modified
         if (htmlComponentBindingType !== SetupBindingType.Code)
            updateBindings(htmlComponentBindingType, htmlComponentType, htmlCustomID, resolver, resolverParam)
        setResolverParam(resolverParam, true)
        applyCache()
    }

    function updateResolver(newResolver: ViewSetupMatchResolverType) {
        const newResolverParam = buildDefaultResolverParam(newResolver)
        if (htmlComponentBindingType === SetupBindingType.Code) {
            const htmlComponent = BuildHtmlComponent(htmlComponentType, htmlCustomID, availableCustomHtmlComponents)
            const bindings = buildDefaultHtmlBindings(htmlComponent, newResolver, resolverParam)
            if (htmlComponent)
                setHtmlComponentBindings({code: (bindings as SetupBindingPropertiesCode).code}, true)
        }

        setResolver(newResolver, true)
        setResolverParam(newResolverParam, true)
        updateBindings(htmlComponentBindingType, htmlComponentType, htmlCustomID, newResolver, newResolverParam)
        applyCache()
    }

    return (
        <React.Fragment>
            <div className="field">
                <label className="label">Name</label>
                <div className="control">
                    <input className="input" type="text" placeholder="Text input"
                        value={name}
                        onChange={(evt) => {
                            setName(evt.target.value)
                        }} />
                </div>
            </div>
            <div className="field">
                <label className="label">Resolver</label>
                <div className="control">
                    <div className="select">
                        <select value={resolver}
                            onChange={(evt) => {
                                updateResolver(evt.target.value as ViewSetupMatchResolverType)
                            }}>
                            {
                                availableResolvers.map((val, index) => {
                                    return <option key={index} value={val}>{val}</option>
                                })
                            }
                        </select>
                    </div>
                </div>
            </div>
            {
                (() => {
                    switch (resolver) {
                        case ViewSetupMatchResolverType.Regex:
                            const regex = resolverParam.regex
                            return (<div className="field">
                                <label className="label">Regex</label>
                                <div className="control">
                                    <input className="input" type="text"
                                        placeholder="Text input" value={regex}
                                        onChange={(evt) => {
                                            const newParam = { ...(resolverParam), ...{ regex: evt.target.value } }
                                            updateResolverParam(newParam)
                                        }} />
                                </div>
                            </div>)
                        case ViewSetupMatchResolverType.StartsWith:
                        case ViewSetupMatchResolverType.EndsWith:
                        case ViewSetupMatchResolverType.Contains:
                            const text = resolverParam.text
                            return (<div className="field">
                                <label className="label">Text</label>
                                <div className="control">
                                    <input className="input" type="text"
                                        placeholder="Text input" value={text}
                                        onChange={(evt) => {
                                            const newParam = { ...(resolverParam), ...{ text: evt.target.value } }
                                            updateResolverParam(newParam)
                                        }} />
                                </div>
                            </div>)
                        case ViewSetupMatchResolverType.ObjectCompare:
                            const code = resolverParam.code
                            return (
                                <CodeMirror
                                    className="column is-10 "
                                    value={code}
                                    minHeight="100px"
                                    maxHeight="800px"
                                    extensions={[javascript({ jsx: false })]}
                                    onChange={(value) => {
                                        const newParam = { ...(resolverParam), ...{ code: value } }
                                        updateResolverParam(newParam)
                                    }} />
                            )
                        case ViewSetupMatchResolverType.Any:
                            return <div></div>
                        default:
                            return <div>Invalid resolver</div>
                    }
                })()
            }

            <div className="field is-grouped is-grouped-multiline">
                <div className="control">
                    <label className="checkbox tooltip">
                        <input type="checkbox" checked={consumeMatch} onChange={(evt) => {
                            setConsumeMatch(evt.target.checked)
                        }} />
                        &nbsp;Consume Match
                        <div className="tooltip-text">
                            If a match is found, consume it. No other match will be calculated.
                            Matches are calculated following the displayed order of match
                            groups.
                        </div>
                    </label>
                </div>
                <div className="control">
                    <label className="checkbox tooltip">
                        <input type="checkbox" checked={accepted} onChange={(evt) => {
                            setAccepted(evt.target.checked)
                        }} />
                        &nbsp;Accepted
                        <div className="tooltip-text">
                            Capture accepted parse result or refused parse result according to
                            custom parsed callback calls. (onAccepted).
                            Non-custom parsers automatically call onAccepted.
                        </div>
                    </label>
                </div>
                <div className="control">
                    <label className="checkbox tooltip">
                        <input type="checkbox" checked={refused} onChange={(evt) => {
                            setRefused(evt.target.checked)
                        }} />
                        &nbsp;Refused
                        <div className="tooltip-text">
                            Capture refused parse result according to
                            custom parsed callback calls. (onRefused)
                            A refuse may also be triggered by an internal exception.
                        </div>
                    </label>
                </div>
                <div className="control">
                    <label className="checkbox tooltip">
                        <input type="checkbox" checked={received} onChange={(evt) => {
                            setReceived(evt.target.checked)
                        }} />
                        &nbsp;Received
                        <div className="tooltip-text">
                            Capture received data from parser
                        </div>
                    </label>
                </div>
                <div className="control">
                    <label className="checkbox tooltip">
                        <input type="checkbox" checked={transmitted} onChange={(evt) => {
                            setTransmitted(evt.target.checked)
                        }} />
                        &nbsp;Transmitted
                        <div className="tooltip-text">
                            Capture data trasmitted by some builder (ex. Triggered by a button widget)
                        </div>
                    </label>
                </div>
                <div className="control">
                    <label className="checkbox tooltip">
                        <input type="checkbox" checked={safeHtml} onChange={(evt) => {
                            setSafeHtml(evt.target.checked)
                        }} />
                        &nbsp;Safe Html
                        <div className="tooltip-text">
                            Escape strings before rendering. Prevents XSS security vulnerability but may be useful for some application.
                        </div>
                    </label>
                </div>
                <div className={`control ${availableWidgets.length > 0 ? "" : "is-hidden"}`}>
                    <label className="checkbox tooltip">
                        <input type="checkbox" checked={widgetMode} onChange={(evt) => {
                            setWidgetMode(evt.target.checked)
                        }} />
                        &nbsp;Widget Mode
                        <div className="tooltip-text">
                            This element is rendered in a fixed position as widget. Useful to
                            store live variables or counters.
                            For example displaying boot count or free memory.
                        </div>
                    </label>
                </div>
            </div>
            <div className="field is-grouped">

                <div className={`control ${widgetMode ? "" : "is-hidden"}`}>
                    <div className="field is-grouped">
                        <div className="control">
                            <label className="label">Widget</label>
                            <div className="control">
                                <div className="select">
                                    <select value={widgetID}
                                        onChange={(evt) => {
                                            setWidgetID(parseInt(evt.target.value))
                                        }}>
                                        {
                                            availableWidgets.map((val) => {
                                                return <option key={val.id} value={val.id}>{val.name}</option>
                                            })
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="control">
                    <div className="field is-grouped">
                        <div className="control">
                            <label className="label">HTML Component</label>
                            <div className="control">
                                <div className="select">
                                    <select value={htmlComponentType} disabled={widgetMode}
                                        onChange={(evt) => {
                                            updateHtmlComponentType(evt.target.value as HtmlComponentType)
                                        }}>
                                        {
                                            Object.values(HtmlComponentType).map((val) => {
                                                if (val !== HtmlComponentType.Custom || availableCustomHtmlComponents.length > 0)
                                                    return <option key={val}>{val}</option>
                                            })
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                        {
                            htmlComponentType === HtmlComponentType.Custom ?
                                <div className="control">
                                    <label className="label">Component</label>
                                    <div className="control">
                                        <div className="select">
                                            <select value={htmlCustomID} disabled={widgetMode}
                                                onChange={(evt) => {
                                                    updateHtmlCustomID(parseInt(evt.target.value))
                                                }}>
                                                {
                                                    availableCustomHtmlComponents.map((val) => {
                                                        return <option key={val.id} value={val.id}>{val.name}</option>
                                                    })
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div> : ""
                        }
                    </div>
                </div>


            </div>

            <div className="field">
                <label className="label">HTML Bindings</label>
                <div className="control mb-2">
                    <div className="select">
                        <select value={htmlComponentBindingType}
                            onChange={(evt) => {
                                updateHtmlComponentBindingType(evt.target.value as SetupBindingType)
                            }}>
                            {
                                availableBindingTypes.map((val) => {
                                    return <option key={val}>{val}</option>
                                })
                            }
                        </select>
                    </div>
                </div>
                {
                    (() => {
                        switch (htmlComponentBindingType) {
                            case SetupBindingType.Gui:
                                const bindings = (htmlComponentBindings as SetupBindingPropertiesGui).bindings
                                return (
                                    Object.keys(bindings).map((key, bindex) => {
                                        return (
                                            <div key={bindex}
                                                className="field is-grouped is-align-items-center">
                                                <div className="control">
                                                    <div className="field">
                                                        <label className="label is-small">Html variable</label>
                                                        <div className="control">
                                                            <input className="input" type="text"
                                                                placeholder="Text input"
                                                                value={key} disabled />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="control">
                                                    <label className="checkbox tooltip is-unselectable">
                                                        <input type="checkbox" checked={bindings[key].fixed}
                                                            onChange={(evt) => {
                                                                const newItem = setItemOfObjectProp(bindings, key, {fixed: evt.target.checked})
                                                                setHtmlComponentBindings({bindings: newItem})
                                                            }} />
                                                        &nbsp;Fixed
                                                    </label>
                                                </div>
                                                <div
                                                    className={`control ${bindings[key].fixed == true ? "is-hidden" : ""}`}>
                                                    <div className="field">
                                                        <label className="label is-small">Match value</label>
                                                        <div className="control">
                                                            <div className="select">
                                                                <select value={bindings[key].item}
                                                                    onChange={(evt) => {
                                                                        const newItem = setItemOfObjectProp(bindings, key, {item: evt.target.value})
                                                                        setHtmlComponentBindings({bindings: newItem})
                                                                    }}>
                                                                    {
                                                                        availableResolverResultField.map((item) => {
                                                                            return <option key={item} >{item}</option>
                                                                        })
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    className={`control ${bindings[key].fixed == true ? "" : "is-hidden"}`}>
                                                    <div className="field">
                                                        <label className="label is-small">Value</label>
                                                        <div className="control">
                                                            <input className="input"
                                                                style={{ minWidth: "80px" }}
                                                                type={
                                                                    BuildHtmlComponent(htmlComponentType, htmlCustomID, availableCustomHtmlComponents)
                                                                        ?.parameters[key]
                                                                        ?.type?.toLowerCase() ?? "text"
                                                                }
                                                                placeholder="Text input"
                                                                value={bindings[key].value}
                                                                onChange={(evt) => {
                                                                    const newItem = setItemOfObjectProp(bindings, key, {value: evt.target.value})
                                                                    setHtmlComponentBindings({bindings: newItem})
                                                                }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )
                            case SetupBindingType.Code:
                                const code = (htmlComponentBindings as SetupBindingPropertiesCode).code
                                return (
                                    <CodeMirror
                                        className="column is-10 "
                                        value={code}
                                        minHeight="100px"
                                        maxHeight="800px"
                                        extensions={[javascript({ jsx: false })]}
                                        onChange={(value) => {
                                            setHtmlComponentBindings({code: value})
                                        }} />
                                )
                        }
                    })()

                }
            </div>
        </React.Fragment>

    )
}