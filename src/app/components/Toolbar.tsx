import * as React from "react";
import {
    Dispatch, SetStateAction,
    useState
} from "react";
import { ToolbarInterface } from "../model/ToolbarInterface";

export const ToolbarContext = React.createContext<[ToolbarInterface, Dispatch<SetStateAction<ToolbarInterface>>]>(null)

export const buildToolbarState = (props: Pick<ToolbarInterface, keyof ToolbarInterface> | {}) => {

    const defProps = {
        ...{
            title: "NoTitle",
            connectButton: { isVisible: true, active: false, onClick: null },
            autoScrollDownButton: { isVisible: false, active: false, onClick: null },
            clearButton: { isVisible: true, active: false, onClick: null },
            logButton: { isVisible: false, active: false, onClick: null },
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
                </div>

                <div className="is-flex is-flex-grow-1">

                    <div className={`centered_toolar_icons`}>
                        {
                            toolbarState.connectButton.isVisible ?
                                <span className={`has-tooltip-bottom icon is-large is-clickable`}
                                    data-tooltip={`${toolbarState.connectButton.active ? "Disconnect" : "Connect"}`}
                                    onClick={() => toolbarState.connectButton?.onClick()}>
                                    {
                                        toolbarState.connectButton.active ?
                                            <i className="fas fa-lg fa-stop"></i> :
                                            <i className="fas fa-lg fa-play"></i>
                                    }
                                </span>
                                : ""
                        }
                        <span className={`has-tooltip-bottom icon is-large is-clickable ${toolbarState.autoScrollDownButton.isVisible ? "" : "is-hidden"}`}
                            data-tooltip="Lock scroll to bottom"
                            onClick={() => toolbarState.autoScrollDownButton?.onClick()}>
                            <i className={`fas fa-lg fa-angle-double-down ${toolbarState.autoScrollDownButton.active ? "has-text-success" : ""}`}></i>
                        </span>
                        <span className={`has-tooltip-bottom icon is-large is-clickable ${toolbarState.clearButton.isVisible ? "" : "is-hidden"}`}  
                            data-tooltip="Clear logs"
                            onClick={() => toolbarState.clearButton?.onClick()}>
                            <i className="fas fa-lg fa-trash " ></i>
                        </span>
                        <span className={`has-tooltip-bottom icon is-large is-clickable ${toolbarState.logButton.isVisible ? "" : "is-hidden"} ${toolbarState.logButton.active ? "has-text-success" : ""}`}
                            data-tooltip="Log to file"
                            onClick={() => toolbarState.logButton?.onClick()}>
                            <i className="fas fa-lg fa-file-arrow-down"></i>
                        </span>
                        <span className={`has-tooltip-bottom icon is-large is-clickable ${toolbarState.logButton.isVisible ? "" : "is-hidden"}`}
                            data-tooltip="Import log file"
                            onClick={() => toolbarState.logButton?.onImportClick()}>
                            <i className="fas fa-lg fa-upload"></i>
                        </span>
                    </div>

                    <div className="navbar-end">

                        <div className="navbar-item">
                            <div className="field is-grouped">
                                <p className="control">
                                    <a className="button is-primary" href="https://github.com/bel-log/bellog/tree/master/documentation">
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