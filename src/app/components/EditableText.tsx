import * as React from "react";
import { useRef } from "react";
import {useState} from "react";

export const EditableText = (props : {text: string, onChange?: (text: string) => void}) => {

    const [isEditable, setisEditable] = useState(false)
    const [text, setText] = useState(props.text)


    return (
        <span>
        {
          isEditable ? (
            <input
              className="input" type="text"
              value={text}
              onChange={(evt) => {setText(evt.target.value); props.onChange?.(evt.target.value)}}
              onBlur={() => {setisEditable(false)}}
              autoFocus
            />
          ) : (
            <span
              onDoubleClick={() => {setisEditable(true)}}
              style={{
                userSelect: "none"
              }}
            >
              {props.text}
            </span>
          )
        }
      </span>
    )
}