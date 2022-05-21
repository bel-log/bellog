import {createContext} from "react";

interface MatchRendererContextWithSetter<T> {
    renderer: T;
    setRenderer: (value: T) => void;
}

export const MatchRendererContext = createContext<MatchRendererContextWithSetter<any>>(undefined);