import {useStateWithCallback} from "../../utility/customHooks";
import * as React from "react";
import CodeMirror from '@uiw/react-codemirror';
import {javascript} from "@codemirror/lang-javascript";
import {HtmlComponentParameterType, SetupCustomHtmlProperties} from "../../app/setup/SetupInterfaces";
import {useEffect, useRef, useState} from "react";
import {setParamOfArrayProp, setParamOfObjectProp} from "../../utility/customSetters";
import {compileTemplate} from "../../utility/customRenderUtils";

enum TabType {
    CodeTab,
    PreviewTab
}

export const CustomHtmlComponentSetup = (props: { cfg: SetupCustomHtmlProperties, onConfigChange: any, onDelete?: any }) => {

    const [name, setName] = useStateWithCallback(props.cfg.name, (name) => {
        props.onConfigChange({name: name})
    })

    const [code, setCode] = useStateWithCallback(props.cfg.code, (code: string) => {
        props.onConfigChange({code: code})
    })

    const [parameters, setParameters] = useStateWithCallback(props.cfg.parameters, (parameters) => {
        props.onConfigChange({parameters: parameters})
    })

    const [selectedTab, setSelectedTab] = useState(TabType.CodeTab)

    const previewRef = useRef<HTMLHeadingElement>()

    useEffect(() => {
        let paramsNames = [...code.matchAll(/\$\{.*(\$\$[a-zA-Z0-9]*).*}/gm)]

        let currentParameters = paramsNames.reduce((acc, m) => {
            let name = m.slice(-1)[0].replace("$$", "")
            acc[name] = {type: HtmlComponentParameterType.Text, default: name}
            return acc
        }, {})
        
        setParameters(currentParameters)
    }, [code])

    useEffect(() => {
        let args = Object.keys(parameters).reduce((acc, name) => {
            acc["$$" + name] = parameters[name].default;
            return acc
        }, {})
        try {
            compileTemplate(code, args)
            previewRef.current.innerHTML = compileTemplate(code, args)
        } catch (ex)
        {
            previewRef.current.innerHTML = ex
        }

    }, [parameters])

    return (
        <React.Fragment>
            <fieldset className="fieldset mb-2">
                <legend className="ml-2">{name}</legend>
            <div className="field is-grouped">
                <div className="control is-expanded">
                    <input className="input" type="text" placeholder="Text input" value={name}
                           onChange={(evt) => setName(evt.target.value)}/>
                </div>
                <div className="control">
                    {
                        props.onDelete ?
                            <span className="icon is-clickable is-mediumis-vcentered" style={{height: "100%"}}
                                  onClick={() => props.onDelete()}>
                        <i className="fas fa-lg fa-trash has-text-danger"></i>
                    </span> : <div/>
                    }
                </div>
            </div>
            <div className="tabs is-left is-boxed">
                <ul className="">
                    <li className={"is-clickable " + (selectedTab == TabType.CodeTab ? "is-active" : "")}
                    onClick={() => setSelectedTab(TabType.CodeTab)}>
                        <a>
                                <span className="icon is-small"><i className="fas fa-code"
                                                                   aria-hidden="true"></i></span>
                            <span>Code</span>
                        </a>
                    </li>
                    <li className={"is-clickable " + (selectedTab == TabType.PreviewTab ? "is-active" : "")}
                        onClick={() => setSelectedTab(TabType.PreviewTab)}>
                        <a>
                                <span className="icon is-small"><i className="fas fa-video"
                                                                   aria-hidden="true"></i></span>
                            <span>Preview</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div
                className={`box ${selectedTab == TabType.PreviewTab ? "" : "is-hidden"}`}
                style={{height: "300px"}}
                ref={previewRef}>

            </div>

            <CodeMirror
                className={`${selectedTab == TabType.CodeTab ? "" : "is-hidden"}`}
                value={code}
                height="300px"
                extensions={[javascript({jsx: true})]}
                onChange={(value, viewUpdate) => {
                    setCode(value)
                }}/>
            {
                Object.keys(parameters).map((name, index) => {
                    return (
                        <fieldset className="fieldset" key={index}>
                            <legend className="ml-2">{name}</legend>
                        <div className="field is-grouped">
                            <div className="control">
                                <div className="field">
                                    <label className="label">Type</label>
                                    <div className="select">
                                        <select value={parameters[name].type}
                                                onChange={(evt) => {setParamOfObjectProp(setParameters, parameters, name, {type: evt.target.value as HtmlComponentParameterType})}}>
                                            {
                                                Object.keys(HtmlComponentParameterType).map(
                                                    (val, index) => {
                                                        return (
                                                            <option key={index}>{val}</option>
                                                        )
                                                    }
                                                )
                                            }
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="control">
                                <div className="field">
                                    <label className="label">Default</label>
                                    <div className="control">
                                        <input className="input" type={parameters[name].type.toLowerCase()} placeholder="Text input" value={parameters[name].default}
                                               onChange={(evt) => setParamOfObjectProp(setParameters, parameters, name, {default: evt.target.value})}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </fieldset>
                    )
                })
            }
            </fieldset>
        </React.Fragment>

    )
}