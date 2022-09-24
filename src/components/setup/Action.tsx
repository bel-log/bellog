import { useGranularEffect, usePropagator, useStateWithCallback, useUpdateEffect } from "../../utility/customHooks";
import * as React from "react";
import { useEffect, useReducer } from "react";
import {
    SetupCustomHtmlProperties,
    SetupBindingType,
    ViewSetupMatchElementProperties,
    ViewSetupMatchResolverType,
    ActionProperties,
    SetupCustomBuilderProperties,
    HtmlComponentEventType,
    SetupBindingPropertiesGui,
    SetupBindingPropertiesCode,
} from "../../app/setup/SetupInterfaces";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { CollapseCard } from "../CollapseCard";
import { buildDefaultActionBindings, buildDefaultHtmlBindings, buildDefaultResolverParam, buildResolverResultKeys } from "../../app/setup/SetupFactories";
import { setItemOfObjectProp, setParamOfArrayProp, setParamOfObjectProp } from "../../utility/customSetters";
import { BuilderNames } from "../../app/builders/Builder";
import * as obj from "../../lib/cbor";

export const Action = (props: {
    cfg: ActionProperties,
    customBuilders: SetupCustomBuilderProperties[],
    onConfigChange: any,
    onDelete?: any,
    onSortUp: () => void,
    onSortDown: () => void,
}) => {

    const [p, applyCache] = usePropagator<ActionProperties>(props.cfg, props.onConfigChange)

    const [name, setName] = [p.name.val, p.name.set]
    const [builderType, setBuilderType] = [p.builderType.val, p.builderType.set]
    const [builderCustomID, setBuilderCustomID] = [p.builderCustomID.val, p.builderCustomID.set]
    const [builderBindingType, setBuilderBindingType] = [p.builderBindingType.val, p.builderBindingType.set]
    const [builderBindings, setBuilderBindings] = [p.builderBindings.val, p.builderBindings.set]

    const availableBindingTypes = Object.values(SetupBindingType)
    const availableBuilders = Object.values(BuilderNames)
    const availableCustomBuilders = props.customBuilders

    function updateBindings(builderType: BuilderNames, builderCustomID: number, builderBindingType: SetupBindingType) {
        if (builderBindingType === SetupBindingType.Gui) {
            const bindingsGui = (builderBindings as SetupBindingPropertiesGui)
            const bindignsCopy = { ...bindingsGui.bindings }
            const newBindings = (buildDefaultActionBindings(builderType, builderCustomID, availableCustomBuilders) as SetupBindingPropertiesGui)?.bindings
            if (newBindings) {
                // Valid code
                Object.keys(newBindings).forEach((key) => {
                    if (key in bindignsCopy && key in newBindings) {
                        newBindings[key].fixed = bindignsCopy[key].fixed
                        newBindings[key].value = bindignsCopy[key].value
                    }
                })
                setBuilderBindings({bindings: newBindings}, true)
            } else {
                setBuilderCustomID(0, true)
                setBuilderType(BuilderNames.LineBuilder, true)
            }
        } else if (builderBindingType === SetupBindingType.Code) {
            const bindings = buildDefaultActionBindings(builderType, builderCustomID, availableCustomBuilders)
            if(bindings) {
                setBuilderBindings({code: (bindings as SetupBindingPropertiesCode).code}, true)
            } else {
                setBuilderCustomID(0, true)
                setBuilderType(BuilderNames.LineBuilder, true)
            }
        }
    }

    function updateBuilderType(builderType: BuilderNames) {
        let builderCustomID = 0
        if(builderType === BuilderNames.CustomBuilder && availableCustomBuilders.length > 0) {
            builderCustomID = availableCustomBuilders.at(0).id
            setBuilderCustomID(builderCustomID, true)
        }
        updateBindings(builderType, builderCustomID, builderBindingType)
        setBuilderType(builderType, true)
        applyCache()
    }

    function updateBuilderCustomID(builderCustomID: number) {
        updateBindings(builderType, builderCustomID, builderBindingType)
        setBuilderCustomID(builderCustomID, true)
        applyCache()
    }

    function updateBuilderBindingType(builderBindingType: SetupBindingType) {
        updateBindings(builderType, builderCustomID, builderBindingType)
        setBuilderBindingType(builderBindingType, true)
        applyCache()
    }

    return (
        <React.Fragment>
            <CollapseCard title={name}
                deleteIcon deleteClick={() => {props?.onDelete()}}
                sortArrowIcon sortUpClick={props.onSortUp} sortDownClick={props.onSortDown}>
                    
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
                <div className="field is-grouped">
                    <div className="control">
                        <label className="label">Builder</label>
                        <div className="control">
                            <div className="select">
                                <select value={builderType}
                                    onChange={(evt) => {
                                        updateBuilderType(evt.target.value as BuilderNames)
                                    }}>
                                    {
                                        availableBuilders.map((val) => {
                                            if (val !== BuilderNames.CustomBuilder || availableCustomBuilders.length > 0)
                                                return <option key={val}>{val}</option>
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="control">
                        {
                            builderType === BuilderNames.CustomBuilder ?
                                <div className="control">
                                    <label className="label">Custom Builder</label>
                                    <div className="control">
                                        <div className="select">
                                            <select value={builderCustomID}
                                                onChange={(evt) => {
                                                    updateBuilderCustomID(parseInt(evt.target.value))
                                                }}>
                                                {
                                                    availableCustomBuilders.map((val) => {
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
                <div className="field">
                    <label className="label">Binding Type</label>
                    <div className="control">
                        <div className="select">
                            <select value={builderBindingType}
                                onChange={(evt) => {
                                    updateBuilderBindingType(evt.target.value as SetupBindingType)
                                }}>
                                {
                                    availableBindingTypes.map((val) => {
                                        return <option key={val}>{val}</option>
                                    })
                                }
                            </select>
                        </div>
                    </div>
                </div>
                <div className="field">
                    {

                        (() => {
                            switch (builderBindingType) {
                                case SetupBindingType.Gui:
                                    const bindings = (builderBindings as SetupBindingPropertiesGui).bindings
                                    return (
                                        Object.keys(bindings).map((key, bindex) => {
                                            return (
                                                <div key={bindex}
                                                    className="field is-grouped is-align-items-center">
                                                    <div className="control">
                                                        <div className="field">
                                                            <label className="label is-small">Variable</label>
                                                            <div className="control">
                                                                <input className="input" type="text"
                                                                    placeholder="Text input"
                                                                    value={key} disabled />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="control">
                                                        <div className="field">
                                                            <label className="label is-small">Value</label>
                                                            <div className="control">
                                                                <input className="input"
                                                                    style={{ minWidth: "80px" }}
                                                                    type="text"
                                                                    placeholder="Text input"
                                                                    value={bindings[key].value}
                                                                    onChange={(evt) => {
                                                                        const newItem = setItemOfObjectProp(bindings, key, {value: evt.target.value})
                                                                        setBuilderBindings({bindings: newItem})
                                                                    }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )
                                case SetupBindingType.Code:
                                    const code = (builderBindings as SetupBindingPropertiesCode).code
                                    return (
                                        <CodeMirror
                                            className="column is-10"
                                            value={code}
                                            minHeight="100px"
                                            maxHeight="800px"
                                            extensions={[javascript({ jsx: false })]}
                                            onChange={(value) => {
                                                setBuilderBindings({code: value})
                                            }} />
                                    )
                            }
                        })()
                    }
                </div>
            </CollapseCard>
        </React.Fragment>
    )
}