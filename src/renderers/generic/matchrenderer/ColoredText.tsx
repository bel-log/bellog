import * as React from "react";
import {Property} from "csstype";
import CodeMirror from "@uiw/react-codemirror/esm";
import {javascript} from "@codemirror/lang-javascript";
import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";

interface ColoredTextProperties {
    color: Property.Color
    children: React.ReactNode
}

interface ColoredTextPropertiesSetup extends ColoredTextProperties {

}

export const ColoredText = (props : ColoredTextProperties) => {
    return (
        <div style={{color: props.color}}>
            {props.children}
        </div>
    );
};

export const ColoredTextSetup = forwardRef((props : ColoredTextPropertiesSetup, ref) => {

    const [color, setColor] = useState<any>(props.color ?? "#AA0011");

    useImperativeHandle(ref, () => ({

        getConfig() {
            return this.props
        }

    }));

    return (
        <div className="row gap1">
            <div>Color</div>
            <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
            />
        </div>
    )
})