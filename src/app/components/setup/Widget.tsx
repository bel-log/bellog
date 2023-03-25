import { usePropagator, useStateWithCallback, useUpdateEffect } from "../../utility/customHooks";
import * as React from "react";
import {
    SetupCustomHtmlProperties,
    WidgetSetupProperties,
    ActionProperties,
    HtmlComponentType,
} from "../../setup/SetupInterfaces";
import { buildDefaultWidgetActions, buildDefaultWidgetBindings, BuildHtmlComponent } from "../../setup/SetupFactories";
import { setParamOfObjectProp } from "../../utility/customSetters";
import { useEffect, useReducer, useRef } from "react";

export const Widget = (props: {
    cfg: WidgetSetupProperties,
    customHtmlComponents: SetupCustomHtmlProperties[],
    availableActions: ActionProperties[],
    onConfigChange: any,
}) => {

    const [p, applyCache] = usePropagator<WidgetSetupProperties>(props.cfg, props.onConfigChange)

    const [name, setName] = [p.name.val, p.name.set]
    const [htmlComponentType, setHtmlComponentType] =  [p.htmlComponentType.val, p.htmlComponentType.set]
    const [htmlCustomID, setHtmlCustomID] =  [p.htmlCustomID.val, p.htmlCustomID.set]
    const [htmlBindings, setHtmlBindings] =  [p.bindings.val, p.bindings.set]
    const [actions, setActions] =  [p.actions.val, p.actions.set]

    const availableActions = props.availableActions
    const availableCustomHtmlComponents = props.customHtmlComponents

    useUpdateEffect(() => {

        if(htmlComponentType == HtmlComponentType.Custom) {
            if(htmlCustomID == 0 && availableCustomHtmlComponents.length > 0) {
                setHtmlCustomID(availableCustomHtmlComponents.at(0).id)
                return;
            }
        }

        const bindignsCopy = { ...htmlBindings }
        const htmlComponent = BuildHtmlComponent(htmlComponentType, htmlCustomID, availableCustomHtmlComponents)
        if (htmlComponent) {
            const newBindings = buildDefaultWidgetBindings(htmlComponent)
            if (newBindings) {
                // Valid code
                Object.keys(newBindings).forEach((key) => {
                    if (key in bindignsCopy && key in newBindings) {
                        newBindings[key].value = bindignsCopy[key].value
                    }
                })
                setHtmlBindings(newBindings, true)
            }

            const widgetActionsCopy = { ...actions }
            const newWidgetActions = buildDefaultWidgetActions(htmlComponent, availableActions)
            if (newWidgetActions) {
                // Valid code
                Object.keys(newWidgetActions).forEach((key) => {
                    if (key in widgetActionsCopy && key in newWidgetActions) {
                        let oldActionId = widgetActionsCopy[key].actionID
                        // Check if oldActionId still exist
                        if(widgetActionsCopy[key].actionID > 0 && availableActions.filter(it => it.id === oldActionId).length > 0)
                            newWidgetActions[key].actionID = widgetActionsCopy[key].actionID
                    }
                })
                setActions(newWidgetActions, true)
            }
        }
        else {
            // html component deleted?
            setHtmlComponentType(HtmlComponentType.Div, true)
        }
        applyCache()
    }, [htmlComponentType, htmlCustomID, availableActions, availableCustomHtmlComponents])

    return (
        <React.Fragment>
            <div className="field">
                <label className="label">Name</label>
                <div className="control">
                    <input className="input" type="text" placeholder="Text input" value={name}
                        onChange={(evt) => setName(evt.target.value)} />
                </div>
            </div>

            <div className="field is-grouped">
                <div className="control">
                    <label className="label">HTML Component</label>
                    <div className="control">
                        <div className="select">
                            <select value={htmlComponentType}
                                onChange={(evt) => {
                                    setHtmlComponentType(evt.target.value as HtmlComponentType)
                                }}>
                                {
                                    Object.values(HtmlComponentType).map((val) => {
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
                                    <select value={htmlCustomID}
                                        onChange={(evt) => {
                                            setHtmlCustomID(parseInt(evt.target.value))
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

            {
                Object.keys(htmlBindings ?? {}).map((key, bindex) => {
                    const bindings = htmlBindings
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
                                                setParamOfObjectProp(setHtmlBindings, bindings, key, { value: evt.target.value })
                                            }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })

            }


            <label className="label">Event</label>
            {
                Object.keys(actions ?? {}).map((key, bindex) => {
                    const action = htmlBindings
                    return (
                        <div key={bindex}>
                            <label className="label is-small">{key}</label>
                            <div className="field">
                                <div className="control">
                                    <div className="select">
                                        <select value={actions[key].actionID}
                                            onChange={(evt) => {
                                                setParamOfObjectProp(setActions, actions, key, { actionID: parseInt(evt.target.value) })
                                            }}>
                                            {
                                                availableActions.map((val, index) => {
                                                    return <option key={index} value={val.id}>{val.name}</option>
                                                })
                                            }
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })
            }

        </React.Fragment>

    )
}