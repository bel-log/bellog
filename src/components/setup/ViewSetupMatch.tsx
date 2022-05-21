import useUpdateEffect, { useStateWithCallback } from "../../utility/customHooks";
import * as React from "react";
import { useEffect } from "react";
import {
    SetupCustomHtmlProperties,
    ViewSetupHtmlBindingType,
    ViewSetupMatchElementProperties,
    ViewSetupMatchResolverType,
} from "../../app/setup/SetupInterfaces";
import { embeddedHtmlComponents } from "../../app/setup/SetupDefaults";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { CollapseCard } from "../CollapseCard";
import { buildDefaultHtmlBindings, buildDefaultResolverParam, buildResolverResultKeys } from "../../app/setup/SetupFactories";
import { setParamOfArrayProp, setParamOfObjectProp } from "../../utility/customSetters";

export const ViewSetupMatch = (props: { cfg: ViewSetupMatchElementProperties, customHtmlComponents: SetupCustomHtmlProperties[], onConfigChange: any, onDelete?: any }) => {

    const [name, setName] = useStateWithCallback(props.cfg.name, (name) => {
        props.onConfigChange({ name: name })
    })

    const [resolver, setResolver] = useStateWithCallback(props.cfg.resolver, (resolver) => {
        props.onConfigChange({ resolver: resolver })
    })

    const [resolverParam, setResolverParam] = useStateWithCallback(props.cfg.resolverParam, (resolverParam) => {
        props.onConfigChange({ resolverParam: resolverParam })
    })

    const [accepted, setAccepted] = useStateWithCallback(props.cfg.accepted, (accepted) => {
        props.onConfigChange({ accepted: accepted })
    })

    const [consumeMatch, setConsumeMatch] = useStateWithCallback(props.cfg.consumeMatch, (consumeMatch) => {
        props.onConfigChange({ consumeMatch: consumeMatch })
    })

    const [widgetMode, setWidgetMode] = useStateWithCallback(props.cfg.widgetMode, (widgetMode) => {
        props.onConfigChange({ widgetMode: widgetMode })
    })

    const [htmlComponent, setHtmlComponent] = useStateWithCallback(props.cfg.htmlComponent, (htmlComponent) => {
        props.onConfigChange({ htmlComponent: htmlComponent })
    })

    const [htmlComponentBindingType, setHtmlComponentBindingType] = useStateWithCallback(props.cfg.htmlComponentBindingType, (htmlComponentBindingType) => {
        props.onConfigChange({ htmlComponentBindingType: htmlComponentBindingType })
    })

    const [htmlComponentBindingsGui, setHtmlComponentBindingsGui] = useStateWithCallback(props.cfg.htmlComponentBindings.bindings, (htmlComponentBindingsGui) => {

        props.onConfigChange({
            htmlComponentBindings: {
                bindings: htmlComponentBindingsGui
            }
        })

    })

    const [htmlComponentBindingsCode, setHtmlComponentBindingsCode] = useStateWithCallback(props.cfg.htmlComponentBindings.code, (htmlComponentBindingsCode) => {
        props.onConfigChange({
            htmlComponentBindings: {
                code: htmlComponentBindingsCode,
            }
        })
    })

    const availableBindingTypes = Object.values(ViewSetupHtmlBindingType)
    const availableResolvers = Object.values(ViewSetupMatchResolverType)
    const availableHtmlComponents = [...props.customHtmlComponents, ...embeddedHtmlComponents]
    const availableResolverResultField = buildResolverResultKeys(resolverParam, resolver)

    useUpdateEffect(() => {
        if (htmlComponentBindingType === ViewSetupHtmlBindingType.Gui)
        {
            const bindignsCopy = {...htmlComponentBindingsGui}
            const newBindings = buildDefaultHtmlBindings(htmlComponent, availableHtmlComponents, resolver, resolverParam).bindings
            Object.keys(newBindings).forEach((key) => {
                if(key in bindignsCopy && key in newBindings) {
                    newBindings[key].fixed = bindignsCopy[key].fixed
                    newBindings[key].value = bindignsCopy[key].value
                    
                    if(availableResolverResultField.includes(bindignsCopy[key].item)) {
                        newBindings[key].item = bindignsCopy[key].item
                    }
                }
            })
            setHtmlComponentBindingsGui(newBindings)
        }
    }, [htmlComponent, resolver, resolverParam, htmlComponentBindingType])

    useUpdateEffect(() => {
        // If resovlerParam updates do not assign new code since may be being modified
        if (htmlComponentBindingType === ViewSetupHtmlBindingType.Code)
            setHtmlComponentBindingsCode(buildDefaultHtmlBindings(htmlComponent, availableHtmlComponents, resolver, resolverParam).code)
    }, [htmlComponent, resolver, htmlComponentBindingType])


    useUpdateEffect(() => {
        setResolverParam(buildDefaultResolverParam(resolver))
    }, [resolver])

    return (
        <div className="columns is-gapless is-align-items-center">
            <div className="column">
                <CollapseCard title={name}>
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
                                        setResolver(evt.target.value as ViewSetupMatchResolverType)
                                    }}>
                                    {
                                        availableResolvers.map((val, index) => {
                                            return <option key={index}>{val}</option>
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
                                                    setResolverParam(newParam)
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
                                                    setResolverParam(newParam)
                                                }} />
                                        </div>
                                    </div>)
                                case ViewSetupMatchResolverType.ObjectCompare:
                                    const code = resolverParam.code
                                    return (
                                        <CodeMirror
                                            className="column is-10 "
                                            value={code}
                                            height="200px"
                                            extensions={[javascript({ jsx: false })]}
                                            onChange={(value) => {
                                                const newParam = { ...(resolverParam), ...{ code: value } }
                                                setResolverParam(newParam)
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
                                    custom parsed callback calls.
                                    (onAccepted, onRefused)
                                </div>
                            </label>
                        </div>
                        <div className="control">
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

                    <div className="field">
                        <label className="label">HTML Component</label>
                        <div className="control">
                            <div className="select">
                                <select value={htmlComponent}
                                    onChange={(evt) => {
                                        setHtmlComponent(evt.target.value)
                                    }}>
                                    {
                                        availableHtmlComponents.map((val) => {
                                            return <option key={val.name}>{val.name}</option>
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">HTML Bindings</label>
                        <div className="control mb-2">
                            <div className="select">
                                <select value={htmlComponentBindingType}
                                    onChange={(evt) => {
                                        setHtmlComponentBindingType(evt.target.value as ViewSetupHtmlBindingType)
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
                                    case ViewSetupHtmlBindingType.Gui:
                                        return (
                                            Object.keys(htmlComponentBindingsGui ?? {}).map((key, bindex) => {
                                                const bindings = htmlComponentBindingsGui
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
                                                                        setParamOfObjectProp(setHtmlComponentBindingsGui, bindings, key, { fixed: evt.target.checked })
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
                                                                                setParamOfObjectProp(setHtmlComponentBindingsGui, bindings, key, { item: evt.target.value })
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
                                                                            availableHtmlComponents
                                                                                .find((comp) => comp.name === htmlComponent)
                                                                                ?.parameters[key]
                                                                                ?.type?.toLowerCase() ?? "text"
                                                                        }
                                                                        placeholder="Text input"
                                                                        value={bindings[key].value}
                                                                        onChange={(evt) => {
                                                                            setParamOfObjectProp(setHtmlComponentBindingsGui, bindings, key, { value: evt.target.value })
                                                                        }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )
                                    case ViewSetupHtmlBindingType.Code:
                                        return (
                                            <CodeMirror
                                                className="column is-10 "
                                                value={htmlComponentBindingsCode}
                                                height="400px"
                                                extensions={[javascript({ jsx: false })]}
                                                onChange={(value) => {
                                                    setHtmlComponentBindingsCode(value)
                                                }} />
                                        )
                                }
                            })()

                        }
                    </div>
                </CollapseCard>

            </div>
            <div className="column is-narrow">
                <div className="button is-success is-danger is-quad-button ml-3" onClick={() => props?.onDelete()}>
                    <span className="icon is-large">
                        <i className="fas fa-trash"></i>
                    </span>
                </div>
            </div>
        </div>

    )
}