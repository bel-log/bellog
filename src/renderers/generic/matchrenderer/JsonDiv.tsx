import * as React from "react";
// @ts-ignore
import FormatHighlight from 'json-format-highlight';
import Parser from 'html-react-parser';

import "./JsonDiv.scss"
import stringify from "json-stringify-pretty-compact";
import {forwardRef, ReactNode, useEffect, useImperativeHandle, useMemo, useState} from "react";
import CodeMirror from '@uiw/react-codemirror';
import {javascript} from "@codemirror/lang-javascript";
import {useStateWithCallback} from "../../../utility/customHooks";

interface JsonDivProperties {
    title: string | ((jsonObj: object, matches: string | string[], state: any) => string),
    matches: string[]
    content: object
}

const state = {}

function buf2hex(buffer) { // buffer is an ArrayBuffer
    return buffer
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
}

function my_replacer(key, value) {
    if (value instanceof Uint8Array) {
        return buf2hex(value);
    }
    return value;
}

function getNiceJson(obj) {
    return stringify(obj, {
        replacer: my_replacer
    })
}

export const JsonDiv = (props : JsonDivProperties) => {

    const jsonObj = props.content

    let headerContent = useMemo<ReactNode>(() => {
        let content
        try {
            if (typeof props.title === "string") {
                content = props.title
            }
            else {
                content = props.title(jsonObj, props.matches, state)
            }
        }
        catch (e)
        {
            content = "headerContent exception " + e.message;
            console.error(e)
        }
        return content
    },  [])

    return (
        <div className="jsondiv_container">
            <div className="jsondiv_containerHeader">
                {headerContent}
            </div>
            <div className="jsondiv_containerJson">
                {Parser(FormatHighlight(getNiceJson(jsonObj)))}
            </div>
        </div>
    );

};

interface JsonDivPropertiesSetup {
    title: string,
    isExpression: boolean
}



export const JsonDivSetup = (props : {cfg: JsonDivPropertiesSetup, onConfigUpdate: any}) => {

    const [title, setTitle] = useStateWithCallback(props.cfg.title, () => {
        props.onConfigUpdate({titleTransform: title})
    })
    const [isExpression, setIsExpression] = useStateWithCallback(props.cfg.isExpression, () => {
        props.onConfigUpdate({isExpression: isExpression})
    })

    return (
        <React.Fragment>
            <div>Title</div>
            <input type="checkbox" id="exp_checkbox"
                   checked={isExpression}
                   onChange={(evt)=> setIsExpression(evt.target.checked)}/>
            <label htmlFor="exp_checkbox">Expression</label>
            {
                isExpression ?
                    <CodeMirror
                        value={title}
                        height="200px"
                        extensions={[javascript({ jsx: false })]}
                        onChange={(value, viewUpdate) => {
                            setTitle(value)
                        }}  /> :
                    <input type="text" id="profilename" value={title}
                           onChange={(evt) => setTitle(evt.target.value)}></input>
            }

        </React.Fragment>
    )
}