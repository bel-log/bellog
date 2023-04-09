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
import { CollpaseGroup } from "../CollapseGroup";

export const WidgetGroup = (props: {
    cfg: WidgetGroupSetupProperties,
    customHtmlComponents: SetupCustomHtmlProperties[],
    availableActions: ActionProperties[],
    onConfigChange: any
}) => {

    const [p, applyCache] = usePropagator<WidgetGroupSetupProperties>(props.cfg, props.onConfigChange)

    const [name, setName] = [p.name.val, p.name.set]
    const widgetsRef = React.useRef(p.widgets.val)
    const [widgets, setWidgets] = [p.widgets.val, (newval: WidgetSetupProperties[]) => {
        widgetsRef.current = newval
        p.widgets.set(newval)
    }]


    function addNewWidget() {
        setWidgets([...widgets, buildDefaultWidget(widgets, props.availableActions)])
    }

    function cloneWidget(widget: WidgetSetupProperties) {
        const widgetForNewID = buildDefaultWidget(widgets, props.availableActions)
        const widgetCopy = { ...widget, ...{ id: widgetForNewID.id } }
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
                <CollpaseGroup array={widgets} deleteIcon
                    getTitle={(index) => widgets[index].name}
                    getId={(index) => widgets[index].id}

                    setNewArray={(array) => { setWidgets(array) }}
                >
                    {
                        (widget, index) => (
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
                        )
                    }
                </CollpaseGroup>
            </div>
            <button className="button is-primary mt-4" onClick={() => addNewWidget()}>Add New</button>
        </React.Fragment>

    )
}