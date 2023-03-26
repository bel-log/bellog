import { usePropagator, useStateWithCallback } from "../../utility/customHooks";
import * as React from "react";
import {
    ActionProperties,
    SetupCustomHtmlProperties,
    WidgetGroupSetupProperties,
    WidgetSetupProperties,
} from "../../setup/SetupInterfaces";
import { buildDefaultWidget } from "../../setup/SetupFactories";
import { Widget } from "./Widget";
import { CollapseCard } from "../CollapseCard";
import { useLayoutEffect } from "react";

export const WidgetGroup = (props: {
    cfg: WidgetGroupSetupProperties,
    customHtmlComponents: SetupCustomHtmlProperties[],
    availableActions: ActionProperties[],
    onConfigChange: any
}) => {

    const [p, applyCache] = usePropagator<WidgetGroupSetupProperties>(props.cfg, props.onConfigChange)

    const [name, setName] = [p.name.val, p.name.set]
    const widgetsRef = React.useRef(p.widgets.val)
    const [widgets, setWidgets] = [p.widgets.val, (newval: WidgetSetupProperties[]) =>{
        widgetsRef.current = newval
        p.widgets.set(newval)
    }]


    function addNewWidget() {
        setWidgets([...widgets, buildDefaultWidget(widgets, props.availableActions)])
    }

    function cloneWidget(widget: WidgetSetupProperties) {
        const widgetForNewID = buildDefaultWidget(widgets, props.availableActions)
        const widgetCopy = {...widget, ...{id: widgetForNewID.id}}
        setWidgets([...widgets, JSON.parse(JSON.stringify(widgetCopy))])
    }

    return (
        <React.Fragment>
            <div className="field">
                <label className="label">Name</label>
                <div className="control">
                    <input className="input" type="text" placeholder="Text input" value={name}
                        onChange={(evt) => setName(evt.target.value)} />
                </div>
            </div>

            <div className="is-flex is-flex-direction-column">
                {
                    widgets.map((widget, index) => {
                        return (
                            <CollapseCard key={widget.id} title={widget.name}
                                deleteIcon
                                sortArrowIcon
                                duplicateIcon
                                deleteClick={() => setWidgets(widgets.filter((val, n_index) => {
                                    return n_index != index
                                }))}
                                sortDownClick={() => {
                                    if (widgets.length > 0 && index < (widgets.length - 1)) {
                                        setWidgets([...widgets.slice(0, index), widgets[index + 1], widget, ...widgets.slice(index + 2)])
                                    }
                                }}
                                sortUpClick={() => {
                                    if (widgets.length > 0 && index > 0) {
                                        setWidgets([...widgets.slice(0, index - 1), widget, widgets[index - 1], ...widgets.slice(index + 1)])
                                    }
                                }}
                                duplicateClick={() => {
                                    cloneWidget(widget)
                                }}
                            >
                                <div style={{ zIndex: (index) }}>
                                    <Widget cfg={widget}
                                        availableActions={props.availableActions}
                                        customHtmlComponents={props.customHtmlComponents}
                                        onConfigChange={(newHtmlElem: any) =>
                                            setWidgets(
                                                widgetsRef.current.map((val, n_index) => {
                                                    if (n_index == index) {
                                                        const newElem = { ...val, ...newHtmlElem }
                                                        return newElem
                                                    }
                                                    else
                                                        return val
                                                }))}
                                    />
                                </div>
                            </CollapseCard>

                        )
                    })
                }
                
            </div>
            <button className="button is-primary mt-4" onClick={() => addNewWidget()}>Add New</button>
        </React.Fragment>

    )
}