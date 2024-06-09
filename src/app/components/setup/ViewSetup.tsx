import { useGranularEffect, usePropagator, useStateWithCallback, useUpdateEffect } from "../../utility/customHooks";
import * as React from "react";
import {
    ActionProperties,
    SetupCustomHtmlProperties,
    SetupCustomParserProperties,
    ViewSetupMatchElementProperties,
    ViewSetupMatchResolverType,
    ViewSetupProperties,
    WidgetGroupSetupProperties,
    WidgetSetupProperties,
} from "../../setup/SetupInterfaces";
import { buildDefaultGlobalScript, buildDefaultViewMatch } from "../../setup/SetupFactories";
import { ViewSetupMatch } from "./ViewSetupMatch";
import { ParserNames } from "../../parsers/Parser";
import { useEffect } from "react";
import { CollapseCard } from "../CollapseCard";
import { CollpaseGroup } from "../CollapseGroup";

export const ViewSetup = (props: {
    cfg: ViewSetupProperties,
    customParsers: SetupCustomParserProperties[],
    customHtmlComponents: SetupCustomHtmlProperties[],
    widgetsGroups: WidgetGroupSetupProperties[],
    onConfigChange: any
}) => {

    const [p, applyCache] = usePropagator<ViewSetupProperties>(props.cfg, props.onConfigChange)

    const [name, setName] = [p.name.val, p.name.set]
    const [parserType, setParserType] = [p.parserType.val, p.parserType.set]
    const [customParserID, setCustomParserID] = [p.customParserID.val, p.customParserID.set]
    const [parserSettings, setParserSettings] = [p.parserSettings.val, p.parserSettings.set]
    const [autoWrap, setAutoWrap] = [p.autoWrap.val, p.autoWrap.set]
    const matchersRef = React.useRef(p.matchers.val)
    const [matchers, setMatchers] = [p.matchers.val, (newval) =>{
        matchersRef.current = newval
        p.matchers.set(newval)
    }]
    const [widgetFrameSize, setWidgetFrameSize] = [p.widgetFrameSize.val, p.widgetFrameSize.set]
    const [widgetGroupIds, setWidgetGroupIds] = [p.widgetGroupIds.val, p.widgetGroupIds.set]

    const availableParsers = Object.values(ParserNames)
    const availableCustomParsers = props.customParsers
    const availableWidgetGroups = props.widgetsGroups

    function addNewMatch() {
        let viewMatch = buildDefaultViewMatch(matchers)
        setMatchers([viewMatch].concat(matchers))
    }


    useEffect(() => {
        if(parserType === ParserNames.CustomParser) {
            if (availableCustomParsers.length <= 0)
                setParserType(ParserNames.LineParser, true)
            else {
                const parserObj = availableCustomParsers.find((it) => it.id === customParserID)
                if (!parserObj) {
                    // Parser got deleted
                    setParserType(ParserNames.LineParser, true)
                    setCustomParserID(0, true)
                }
            }
            applyCache()
        }
    }, [availableCustomParsers])


    useEffect(() => {
        if (availableWidgetGroups.length <= 0)
            setWidgetGroupIds([])
        else {
            const widget = availableWidgetGroups.find((it) => it.id === (widgetGroupIds.length > 0 ? widgetGroupIds.at(0).id : 0))
            if (!widget) {
                // Widget got deleted
                setWidgetGroupIds([])
            }
        }
    }, [availableWidgetGroups])

    useEffect(() => {
        if (availableWidgetGroups.length <= 0)
            setWidgetGroupIds([])
        else {
            const widget = availableWidgetGroups.find((it) => it.id === (widgetGroupIds.length > 0 ? widgetGroupIds.at(0).id : 0))
            if (!widget) {
                // Widget got deleted
                setWidgetGroupIds([])
            }
        }
    }, [availableWidgetGroups])

    function updateParserType(parserType: ParserNames) {
        if(parserType === ParserNames.CustomParser && availableCustomParsers.length > 0) {
            setCustomParserID(availableCustomParsers.at(0).id, true)
        }
        setParserType(parserType, true)
        applyCache()
    }

    function cloneMatch(match: ViewSetupMatchElementProperties) {
        const matcherForNewId = buildDefaultViewMatch(matchers)
        const matchCopy = {...match, ...{id: matcherForNewId.id}}
        setMatchers([...matchers, JSON.parse(JSON.stringify(matchCopy))])
    }

    return (
        <React.Fragment>
            <div className="field">
                <label className="label">Name</label>
                <div className="control">
                    <input className="input" type="text" placeholder="Text input" value={name}
                        onChange={(evt) => setName(evt.target.value)} />
                </div>
            </div>
            <div className="field is-grouped">
                <div className="control is-grouped">
                    <label className="label">Parser</label>
                    <div className="control">
                        <div className="select">
                            <select value={parserType}
                                onChange={(evt) => {
                                    updateParserType(evt.target.value as ParserNames)
                                }}>
                                {
                                    availableParsers.map((val) => {
                                        if (val !== ParserNames.CustomParser || availableCustomParsers.length > 0)
                                            return <option key={val}>{val}</option>
                                    })
                                }
                            </select>
                        </div>
                    </div>
                </div>
                {
                    parserType === ParserNames.CustomParser ?
                        <div className="control">
                            <label className="label">Custom Parser</label>
                            <div className="control">
                                <div className="select">
                                    <select value={customParserID}
                                        onChange={(evt) => {
                                            setCustomParserID(parseInt(evt.target.value))
                                        }}>
                                        {
                                            availableCustomParsers.map((val) => {
                                                return <option key={val.name} value={val.id}>{val.name}</option>
                                            })
                                        }
                                    </select>
                                </div>
                            </div>
                        </div> : ""
                }
            </div>

            <div className={`field is-grouped ${availableWidgetGroups.length > 0 ? "" : "is-hidden"}`}>
                <div className="control is-grouped">
                    <label className="label">Widget Group</label>
                    <div className="control">
                        <div className="select">
                            <select value={widgetGroupIds.length > 0 ? widgetGroupIds.at(0).id : 0}
                                onChange={(evt) => {
                                    const nval = parseInt(evt.target.value)
                                    if (nval === 0)
                                        setWidgetGroupIds([])
                                    else
                                        setWidgetGroupIds([{ id: nval }])
                                }}>
                                <option key={0} value={0}>None</option>
                                {
                                    availableWidgetGroups.map((val) => {
                                        return <option key={val.id} value={val.id}>{val.name}</option>
                                    })
                                }
                            </select>
                        </div>
                    </div>
                </div>
                <div className="field">
                    <label className="label">Widget Frame Size (%)</label>
                    <div className="control">
                        <input
                            className="input"
                            type="number"
                            max={100}
                            min={0}
                            value={widgetFrameSize}
                            onChange={(evt) => {
                                setWidgetFrameSize(parseInt(evt.target.value))
                            }}
                        />
                    </div>
                </div>

            </div>
            <div className="field">
                <div className="control">
                    <label className="checkbox">
                        <input type="checkbox" checked={autoWrap} onChange={(evt) => {
                            setAutoWrap(evt.target.checked)
                        }} />
                        &nbsp;Autowrap
                    </label>
                </div>
            </div>
            <div className="field is-grouped">
                <div className="is-flex control is-align-items-center">
                    <label className="label">Match Groups</label>
                </div>
                <div className="control">
                    <div className="button is-success is-quad-button" onClick={() => addNewMatch()}>
                        <span className="icon is-large">
                            <i className="fas fa-plus"></i>
                        </span>
                    </div>
                </div>
            </div>
            <div className="is-flex is-flex-direction-column">
                <CollpaseGroup array={matchers} eyeIcon deleteIcon duplicateIcon
                               getTitle={(index) => matchers[index].name}
                               getId={(index) => matchers[index].id}
                               getEyeStatus={(index) => matchers[index].disabled}
                               duplicateClick={(item) => {cloneMatch(item)}}
                               setNewArray={(array) => {setMatchers(array)}}
                >
                    {
                        (match, index) => (
                            <ViewSetupMatch cfg={match}
                            customHtmlComponents={props.customHtmlComponents}
                            widgets={availableWidgetGroups.find((it) => it.id === (widgetGroupIds.length > 0 ? widgetGroupIds.at(0).id : 0))?.widgets ?? []}
                            onConfigChange={(newHtmlElem) =>
                                setMatchers(
                                    matchersRef.current.map((val, n_index) => {
                                        if (n_index == index) {
                                            const newElem = { ...val, ...newHtmlElem }
                                            return newElem
                                        }
                                        else
                                            return val
                                    }))}
                        />
                        )
                    }
                </CollpaseGroup>
            </div>
        </React.Fragment>

    )
}