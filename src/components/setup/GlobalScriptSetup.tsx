import { usePropagator, useStateWithCallback } from "../../utility/customHooks";
import * as React from "react";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from "@codemirror/lang-javascript";
import { SetupGlobalScriptProperties } from "../../app/setup/SetupInterfaces";
import { useState } from "react";
import { EditableText } from "../EditableText";

export const GlobalScriptSetup = (props: { cfg: SetupGlobalScriptProperties, onConfigChange: any, onDelete?: any }) => {

    const [p, applyCache] = usePropagator<SetupGlobalScriptProperties>(props.cfg, props.onConfigChange)

    const [name, setName] = [p.name.val, p.name.set]
    const [code, setCode] = [p.code.val, p.code.set]
    
    const [visible, setVisible] = useState(false)

    return (
        <div>
            <a>
                <span className="icon-text mb-1">
                    <div className="is-flex control is-align-items-center">
                        <span className="icon">
                            <i className="fas fa-scroll"></i>
                        </span>

                        <strong>
                            <EditableText
                                text={name ?? "Undefined"}
                                onChange={(text) => { setName(text) }} /></strong>


                        <button className="button is-info ml-5 is-small" onClick={() => setVisible(!visible)}>View Code</button>
                        <button className="button is-danger ml-5 is-small" onClick={() => props.onDelete()}>Delete</button>

                    </div>

                </span>
            </a>

            <CodeMirror
                className={`column is-10 ${visible ? "" : "is-hidden"}`}
                value={code}
                minHeight="100px"
                maxHeight="800px"
                extensions={[javascript({ jsx: false })]}
                onChange={(value, viewUpdate) => {
                    setCode(value)
                }} />

        </div>
    )
}