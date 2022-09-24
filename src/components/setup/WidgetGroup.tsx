import { usePropagator, useStateWithCallback } from "../../utility/customHooks";
import * as React from "react";
import {
    ActionProperties,
    SetupCustomHtmlProperties,
    WidgetGroupSetupProperties,
} from "../../app/setup/SetupInterfaces";
import { buildDefaultWidget } from "../../app/setup/SetupFactories";
import { Widget } from "./Widget";
import { CollapseCard } from "../CollapseCard";

export const WidgetGroup = (props: {
    cfg: WidgetGroupSetupProperties,
    customHtmlComponents: SetupCustomHtmlProperties[],
    availableActions: ActionProperties[],
    onConfigChange: any
}) => {

    const [p, applyCache] = usePropagator<WidgetGroupSetupProperties>(props.cfg, props.onConfigChange)

    const [name, setName] = [p.name.val, p.name.set]
    const [widgets, setWidgets] = [p.widgets.val, p.widgets.set]


    function addNewWidget() {
        setWidgets([...widgets, buildDefaultWidget(widgets, props.availableActions)])
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
                            >
                                <div style={{ zIndex: (index) }}>
                                    <Widget cfg={widget}
                                        availableActions={props.availableActions}
                                        customHtmlComponents={props.customHtmlComponents}
                                        onConfigChange={(newHtmlElem) =>
                                            setWidgets(
                                                widgets.map((val, n_index) => {
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