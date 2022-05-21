import {useStateWithCallback} from "../../utility/customHooks";
import * as React from "react";
import {
    SetupCustomHtmlProperties,
    SetupCustomParserProperties,
    ViewSetupMatchResolverType,
    ViewSetupProperties,
} from "../../app/setup/SetupInterfaces";
import {buildDefaultGlobalScript, buildDefaultViewMatch} from "../../app/setup/SetupFactories";
import {ViewSetupMatch} from "./ViewSetupMatch";
import {ParserNames} from "../../parsers/Parser";

export const ViewSetup = (props: { cfg: ViewSetupProperties, customParsers: SetupCustomParserProperties[], customHtmlComponents: SetupCustomHtmlProperties[], onConfigChange: any, onDelete?: any }) => {

    const [name, setName] = useStateWithCallback(props.cfg.name, (name) => {
        props.onConfigChange({name: name})
    })

    const [parser, setParser] = useStateWithCallback(props.cfg.parser, (parser) => {
        props.onConfigChange({parser: parser})
    })

    const [autoWrap, setAutoWrap] = useStateWithCallback(props.cfg.autoWrap, (autoWrap) => {
        props.onConfigChange({autoWrap: autoWrap})
    })

    const [matchers, setMatchers] = useStateWithCallback(props.cfg.matchers, (matchers) => {
        props.onConfigChange({matchers: matchers})
    })

    const availableParsers = Object.values(ParserNames)
    const availableCustomParsers = props.customParsers

    function addNewMatch() {
        let aa = buildDefaultViewMatch(matchers)
        
        setMatchers([aa].concat(matchers))
    }

    return (
        <React.Fragment>
            <div className="field">
                <label className="label">Name</label>
                <div className="control">
                    <input className="input" type="text" placeholder="Text input" value={name}
                           onChange={(evt) => setName(evt.target.value)}/>
                </div>
            </div>
            <div className="field is-grouped">
                <div className="control">
                    <label className="label">Parser</label>
                    <div className="control">
                        <div className="select">
                            <select value={parser.name}
                                    onChange={(evt) => {
                                        parser.name === ParserNames.CustomParser ?
                                        setParser({...parser, name: evt.target.value, 
                                            settings: {name: availableCustomParsers[0]?.name ?? ""}})
                                        : setParser({...parser, name: evt.target.value})
                                    }}>
                                {
                                    availableParsers.map((val) => {
                                        if(val !== ParserNames.CustomParser || availableCustomParsers.length > 0)
                                            return <option key={val}>{val}</option>
                                    })
                                }
                            </select>
                        </div>
                    </div>
                </div>
                {
                    parser.name === ParserNames.CustomParser ?
                    <div className="control">
                            <label className="label">Custom Parser</label>
                            <div className="control">
                                <div className="select">
                                    <select value={parser.name}
                                            onChange={(evt) => {
                                                setParser({...parser, settings: {name: evt.target.value}})
                                            }}>
                                        {
                                            availableCustomParsers.map((val) => {
                                                return <option key={val.name}>{val.name}</option>
                                            })
                                        }
                                    </select>
                                </div>
                            </div>
                        </div> : ""
                }
            </div>

            <div className="field">
                <div className="control">
                    <label className="checkbox">
                        <input type="checkbox" checked={autoWrap} onChange={(evt) => {
                            setAutoWrap(evt.target.checked)
                        }}/>
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
                {
                    matchers.map((match, index) => {
                        return (
                            <div key={match.id} style={{zIndex: ( index)}}>
                                <ViewSetupMatch cfg={match} customHtmlComponents={props.customHtmlComponents}
                                                onConfigChange={(newHtmlElem) =>
                                                    setMatchers(
                                                        matchers.map((val, n_index) => {
                                                            if(n_index == index)
                                                            {
                                                                const newElem = {...val, ...newHtmlElem}
                                                                return newElem
                                                            }
                                                            else
                                                                return val
                                                        }))}
                                                onDelete={() => setMatchers(matchers.filter((val, n_index) => {
                                                    return n_index != index
                                                }))}/>
                            </div>
                        )
                    })
                }
            </div>

                <button className="button is-danger mt-4" onClick={() => props.onDelete()}>Delete View</button>

                </React.Fragment>

                )
            }