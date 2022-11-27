import * as React from "react";
import {
    createContext, CSSProperties, Dispatch, SetStateAction, useReducer,
    useState
} from "react";
import * as serialize from "serialize-javascript"
import { IconContext } from "react-icons";
import { FaBars } from "react-icons/fa";
import { DriverStatus } from "../drivers/Driver";
import { ImBin2, ImFloppyDisk, ImPlay3, ImStop2 } from "react-icons/im";
import { RiSettings5Fill } from "react-icons/ri";
import { ToolbarInterface } from "../model/ToolbarInterface";

export const ToolbarContext = React.createContext<[ToolbarInterface, Dispatch<SetStateAction<ToolbarInterface>>]>(null)

export const buildToolbarState = (props: Pick<ToolbarInterface, keyof ToolbarInterface> | {}) => {

    const defProps = {
        ...{
            title: "NoTitle",
            connectButton: { isVisible: true, active: false, onClick: null },
            autoScrollDownButton: { isVisible: false, active: false, onClick: null },
            clearButton: { isVisible: true, active: false, onClick: null },
            settingsButton: { isVisible: true, active: false, onClick: null },
            more: []
        }
    }
    const newProps = { ...props }
    for (const key of Object.keys(newProps)) {
        if (typeof newProps[key] === 'object')
            newProps[key] = { ...defProps[key], ...newProps[key] }
    }
    return { ...defProps, ...newProps }
}

export const Toolbar = (props: { children: React.ReactNode }) => {

    const [toolbarState, setToolbarState] = useState<ToolbarInterface>(buildToolbarState({}))

    const [burgetActive, setBurgetActive] = useState(false)

    return (
        <ToolbarContext.Provider value={[toolbarState, setToolbarState]}>
            <nav className="navbar is-primary is-unselectable" role="navigation" aria-label="main navigation" style={{height: "3.25rem"}}>
                <div className="navbar-brand">
                    <a className="navbar-item" href="index.html">
                        <img src="logo.png" />
                    </a>

                    <span className="navbar-item">
                        {toolbarState.title}
                    </span>

                    <a role="button" className={`navbar-burger ${burgetActive ? "is-active" : ""}`}
                        aria-label="menu" aria-expanded="false" onClick={() => { setBurgetActive(!burgetActive) }}>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>



                <div className={`navbar-menu ${burgetActive ? "is-active" : ""}`}>

                    <div className={`centered_toolar_icons ${burgetActive ? "is-hidden" : ""}`}>
                        {
                            toolbarState.connectButton.isVisible ?
                                <span className={` icon is-large is-clickable`}
                                    onClick={() => toolbarState.connectButton?.onClick()}>
                                    {
                                        toolbarState.connectButton.active ?
                                            <i className="fas fa-lg fa-stop"></i> :
                                            <i className="fas fa-lg fa-play"></i>
                                    }
                                </span>
                                : ""
                        }
                        <span className={` icon is-large is-clickable ${toolbarState.autoScrollDownButton.isVisible ? "" : "is-hidden"}`}
                            onClick={() => toolbarState.autoScrollDownButton?.onClick()}>
                            <i className={`fas fa-lg fa-angle-double-down ${toolbarState.autoScrollDownButton.active ? "has-text-success" : ""}`}></i>
                        </span>
                        <span className={` icon is-large is-clickable ${toolbarState.clearButton.isVisible ? "" : "is-hidden"}`}
                            onClick={() => toolbarState.clearButton?.onClick()}>
                            <i className="fas fa-lg fa-trash"></i>
                        </span>
                    </div>

                    <div className="navbar-end">

                        <div className="navbar-item">
                            <div className="field is-grouped">
                                <p className="control">
                                    <a className="button is-primary">
                                        <span className="icon">
                                            <i className="fas fa-book" aria-hidden="true"></i>
                                        </span>
                                        <span>Documentation</span>
                                    </a>
                                </p>
                                <p className={`control   ${toolbarState.settingsButton.isVisible ? "" : "is-hidden"} `}>
                                    <a className="button is-primary" onClick={() => toolbarState.settingsButton?.onClick()}>
                                        <span className="icon">
                                            <i className="fas fa-lg fa-gear" aria-hidden="true"></i>
                                        </span>
                                        <span>Settings</span>
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="is-flex is-flex-direction-column is-flex-grow-1" style={{ overflow: "hidden" }}>
                {props.children}
            </div>
        </ToolbarContext.Provider >
    );
}

export default Toolbar;