import {useStateWithCallback} from "../../utility/customHooks";
import * as React from "react";
import CodeMirror from '@uiw/react-codemirror';
import {javascript} from "@codemirror/lang-javascript";
import {SetupCustomParserProperties} from "../../app/setup/SetupInterfaces";

export const CustomParsersSetup = (props : {cfg: SetupCustomParserProperties, onConfigChange: any, onDelete?: any}) => {

    const [name, setName] = useStateWithCallback(props.cfg.name, (name) => {
        props.onConfigChange({name: name})
    })

    const [code, setCode] = useStateWithCallback(props.cfg.code, (code) => {
        props.onConfigChange({code: code})
    })

    return (
        <React.Fragment>
            <div className="field">
                <label className="label">Name</label>
                <div className="control">
                    <input className="input" type="text" placeholder="Text input" value={name} onChange={(evt) => setName(evt.target.value)}/>
                </div>
            </div>
            <div className="columns is-mobile">
            <CodeMirror
                className="column is-10 "
                value={code}
                height="400px"
                extensions={[javascript({ jsx: false })]}
                onChange={(value, viewUpdate) => {
                    setCode(value)
                }}  />
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
        </React.Fragment>

    )
}