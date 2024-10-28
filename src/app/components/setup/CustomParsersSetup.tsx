import * as React from "react";
import CodeMirror from '@uiw/react-codemirror';
import {javascript} from "@codemirror/lang-javascript";
import {SetupCustomParserProperties} from "../../setup/SetupInterfaces";
import { useState } from "react";
import { EditableText } from "../EditableText";
import {useSnapshot} from "valtio/index";

export const CustomParsersSetup = (props : {cfg: SetupCustomParserProperties, onDelete?: any}) => {

    const script = useSnapshot(props.cfg)

    const [name, setName] = [script.name, (newVal: string) => {props.cfg.name = newVal}]
    const [code, setCode] = [script.code, (newVal: string) => {props.cfg.code = newVal}]

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

            {visible ? <CodeMirror
                className={`column is-10 ${visible ? "" : "is-hidden"}`}
                value={code}
                minHeight="100px"
                maxHeight="800px"
                extensions={[javascript({ jsx: false })]}
                onChange={(value: string) => {
                    setCode(value)
                }} /> : ""}

        </div>

    )
}