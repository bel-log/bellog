import {useEffect, useRef, useState} from "react";

export function useStateWithCallback<T>(initialValue: T, onUpdate: (T) => void):  [T, ((newValue: T, propagateState?: boolean) => void)] {

    const [state, _setState] = useState<T>(initialValue)
    //this logic is up to you
    const setState = (newState, propagateState: boolean = true) => {
        if(propagateState)
            _setState(newState)
        onUpdate(newState)
    }
    return [state, setState]
}

/**
 * A custom useEffect hook that only triggers on updates, not on initial mount
 * @param {Function} effect
 * @param {Array<any>} dependencies
 */
export default function useUpdateEffect(effect, dependencies = []) {
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            return effect();
        }
    }, dependencies);
}