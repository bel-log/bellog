import * as React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useUpdateEffect } from "../utility/customHooks";
import { useState } from "react";
import { css } from "@codemirror/lang-css";

export const CodeEditor = (props: {value: string, onChange: (value: string) => void, isHtml?: boolean, isCss?: boolean}) => {

    const [htmlCode, setHtmlCode] = useState("")
    
    useUpdateEffect(() => {
        // This trick is required because sometimes CodeMirror calls onChange with old rendered instance
        props.onChange(htmlCode)
    }, [htmlCode])

    return (
        <CodeMirror
            value={props.value}
            minHeight="100px"
            maxHeight="800px"
            extensions={[
                props.isHtml ? javascript({ jsx: true }) : 
                props.isCss ? css() : javascript({ jsx: false })
            ]}
            onChange={(value) => {
                setHtmlCode(value)
        }} />
    );
}

export default CodeEditor;