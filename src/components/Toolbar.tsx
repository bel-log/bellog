import * as React from "react";
import {
    createContext, CSSProperties, Dispatch, SetStateAction, useReducer,
    useState
} from "react";
import * as serialize from "serialize-javascript"
import {IconContext} from "react-icons";
import {FaBars} from "react-icons/fa";
import {DriverStatus} from "../drivers/Driver";
import {ImBin2, ImFloppyDisk, ImPlay3, ImStop2} from "react-icons/im";
import {RiSettings5Fill} from "react-icons/ri";
import '../../src/toolbar.scss'
import {ToolbarInterface} from "../app/model/ToolbarInterface";

export const ToolbarContext = React.createContext<[ToolbarInterface, Dispatch<SetStateAction<ToolbarInterface>>]>(null)

export const buildToolbarState = (props: Pick<ToolbarInterface, keyof ToolbarInterface> | {}) => {

    const defProps = {...{
            title: "NoTitle",
            connectButton: {isVisible: true, active: false, onClick: null},
            autoScrollDownButton: {isVisible: false, active: false, onClick: null},
            clearButton: {isVisible: true, active: false, onClick: null},
            settingsButton: {isVisible: true, active: false, onClick: null},
            more: []
    }}
    const newProps = {...props}
    for(const key of Object.keys(newProps)) {
        if(typeof newProps[key] === 'object')
            newProps[key] = {...defProps[key], ...newProps[key]}
    }
    return {...defProps, ...newProps}
}

export const Toolbar = (props: {children: React.ReactNode}) => {

    const [toolbarState, setToolbarState] = useState<ToolbarInterface>(buildToolbarState({}))

    return (
        <ToolbarContext.Provider value={[toolbarState, setToolbarState]}>
                <div id="bellog_navbar" className={"is-unselectable"}>
                    <div className="left">
                        <span className={`icon is-large is-clickable` }>
                            <i className="fas fa-lg fa-bars"></i>
                        </span>
                        <div>{toolbarState.title}</div>
                    </div>
                    <div className="center">
                        {
                            toolbarState.connectButton.isVisible ?
                                <span className={`icon is-large is-clickable`}
                                      onClick={() => toolbarState.connectButton?.onClick()}>
                                    {
                                        toolbarState.connectButton.active ?
                                            <i className="fas fa-lg fa-stop"></i> :
                                            <i className="fas fa-lg fa-play"></i>
                                    }
                                </span>
                                : ""
                        }
                        <span className={`icon is-large is-clickable ${toolbarState.autoScrollDownButton.isVisible ? "" : "is-hidden"}` }
                            onClick={() => toolbarState.autoScrollDownButton?.onClick()}>
                            <i className={`fas fa-lg fa-angle-double-down ${toolbarState.autoScrollDownButton.active ? "has-text-success" : ""}`}></i>
                        </span>
                        <span className={`icon is-large is-clickable ${toolbarState.clearButton.isVisible ? "" : "is-hidden"}` }
                            onClick={() => toolbarState.clearButton?.onClick()}>
                            <i className="fas fa-lg fa-trash"></i>
                        </span>
                    </div>
                    <div className="right">
                        <span className={`icon is-large is-clickable ${toolbarState.settingsButton.isVisible ? "" : "is-hidden"}` }
                              onClick={() => toolbarState.settingsButton?.onClick()}>
                            <i className="fas fa-lg fa-gear"></i>
                        </span>
                    </div>
                </div>
                <div id="bellog_below_navbar">
                    {props.children}
                </div>
        </ToolbarContext.Provider>
    );
}

export default Toolbar;