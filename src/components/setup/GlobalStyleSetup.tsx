import {useStateWithCallback} from "../../utility/customHooks";
import * as React from "react";
import CodeMirror from '@uiw/react-codemirror';
import {css} from "@codemirror/lang-css";
import {SetupGlobalStyleProperties} from "../../app/setup/SetupInterfaces";

export const GlobalStyleSetup = (props : {cfg: SetupGlobalStyleProperties, onConfigChange: any, onDelete?: any}) => {

    const [code, setCode] = useStateWithCallback(props.cfg.code, (newCode) => {
        props.onConfigChange({code: newCode})
    })

    return (
        <div className="columns is-mobile">
            <CodeMirror
                className="column is-10 "
                value={code}
                height="200px"
                extensions={[css()]}
                onChange={(value, viewUpdate) => {
                    setCode(value)
                }}  />
            <br/>
            {
                props.onDelete ?
                    <div className="column">
                    <span className="icon is-large is-clickable" onClick={() => props.onDelete()}>
                      <span className="fa-stack fa-lg">
                        <i className="fas fa-trash has-text-danger"></i>
                      </span>
                    </span>
                    </div> : <div/>
            }
        </div>

    )
}