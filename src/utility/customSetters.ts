import {Dispatch, SetStateAction} from "react";
import {HtmlComponentParameterType} from "../app/setup/SetupInterfaces";

const identity = <T>(value: T): T => value;

type Partial<T> = {
    [P in keyof T]?: T[P];
};

export const setParamOfArrayProp = <T>(func: Dispatch<SetStateAction<T[]>>, currArray: T[], index: number, newFields: Partial<T>) => {
    func(currArray.map((_val, _index) => {
        if (index == _index)
            return {..._val, ...newFields}
        else
            return _val
    }))
}

export const setParamOfObjectProp = <T, key extends keyof T>(func: Dispatch<SetStateAction<T>>, curObj: T, key: string, newFields:Partial<T[key]>) => {
    const newVal = {...curObj}
    Object.keys(newFields).forEach((field) => {
        newVal[key][field] = newFields[field]
    })
    func(newVal)
}

export const setItemOfObjectProp = <T, key extends keyof T>(curObj: T, key: string, newFields:Partial<T[key]>) => {
    const newVal = {...curObj}
    Object.keys(newFields).forEach((field) => {
        newVal[key][field] = newFields[field]
    })
    return newVal
}