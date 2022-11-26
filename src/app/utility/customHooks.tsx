import { DependencyList, Dispatch, EffectCallback, SetStateAction, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";

export function useStateWithCallback<T>(initialValue: T, onUpdate: (T) => void): [T, ((newValue: T, propagateState?: boolean) => void)] {

  const [state, _setState] = useState<T>(initialValue)
  //this logic is up to you
  const setState = (newState, propagateState: boolean = true) => {
    if (propagateState)
      _setState(newState)
    onUpdate(newState)
  }
  return [state, setState]
}

type PropagatorResult<T> = {[P in keyof T]: {val: T[P], set: (newVal: T[P], cache?: boolean) => void}}
export function usePropagator<T>(obj: T, onConfigChange: (objChanges: Partial<T>) => void): [PropagatorResult<T>, () => void]{
  
  let statePropagation = {}

  const result = Object.keys(obj).reduce((acc, key) => {
    const [valp, setter] = [obj[key], (newVal, cache: boolean = false) => {
      if(cache) {
        statePropagation = { ...statePropagation, ...{ [key]: newVal } }
      } else {
        onConfigChange({ [key]: newVal } as Partial<T>)
      }
    }]
    
    acc[key] = {val: valp, set: setter}
    return acc
  }, {})

  const applyCache = () => {
    if (Object.keys(statePropagation).length > 0) {
      onConfigChange(statePropagation)
      statePropagation = {}
    }
  }

  return [result as PropagatorResult<T>, applyCache]
}

/**
 * A custom useEffect hook that only triggers on updates, not on initial mount
 * @param {Function} effect
 * @param {Array<any>} dependencies
 */
export function useUpdateEffect(effect, dependencies: DependencyList) {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      return effect();
    }
  }, dependencies);
}

export function useUpdateLayoutEffect(effect, dependencies: DependencyList) {
  const isInitialMount = useRef(true);

  useLayoutEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      return effect();
    }
  }, dependencies);
}

export const useGranularEffect = (
  effect: EffectCallback,
  primaryDeps: DependencyList,
  secondaryDeps: DependencyList
) => {
  const ref = useRef<DependencyList>();

  if (!ref.current || !primaryDeps.every((w, i) => Object.is(w, ref.current[i]))) {
    ref.current = [...primaryDeps, ...secondaryDeps];
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useEffect(effect, ref.current);
};

export const useUpdateGranularEffect = (
  effect: EffectCallback,
  primaryDeps: DependencyList,
  secondaryDeps: DependencyList
) => {
  const ref = useRef<DependencyList>();

  if (!ref.current || !primaryDeps.every((w, i) => Object.is(w, ref.current[i]))) {
    ref.current = [...primaryDeps, ...secondaryDeps];
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useUpdateEffect(effect, ref.current);
};