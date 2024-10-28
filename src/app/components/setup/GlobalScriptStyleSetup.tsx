import * as React from "react";
import {SetupGlobalScriptStyleProperties} from "../../setup/SetupInterfaces";
import { EditableText } from "../EditableText";
import { useState } from "react";
import CodeEditor from "../CodeEditor";
import {useSnapshot} from "valtio/index";

export const GlobalScriptStyleSetup = (props: {cfg: SetupGlobalScriptStyleProperties, onDelete?: () => void}) => {

    const style = useSnapshot(props.cfg)

    const [name, setName] = [style.name, (newVal: string) => {props.cfg.name = newVal}]
    const [code, setCode] = [style.code, (newVal: string) => {props.cfg.code = newVal}]

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

            {
                visible ? <CodeEditor
                    value={code}
                    isCss={true}
                    onChange={(value) => {
                        setCode(value)
                    }} /> : ""
            }


        </div>
    )
}