import * as React from "react";
import { Property } from "csstype";
import {
    createContext,
    Dispatch,
    forwardRef,
    SetStateAction, useEffect,
    useImperativeHandle,
    useMemo,
    useReducer,
    useRef,
    useState
} from "react";
import { usePropagator, useStateWithCallback, useUpdateEffect } from "../../utility/customHooks";
import { GlobalScriptSetup } from "./GlobalScriptSetup";
import { CustomParsersSetup } from "./CustomParsersSetup";
import { CollapseCard } from "../CollapseCard";
import {
    buildDefaultAction,
    buildDefaultCustomBuilder,
    buildDefaultCustomHtmlElem,
    buildDefaultCustomParser,
    buildDefaultDriverSettings,
    buildDefaultDriverWebSerialSettings,
    buildDefaultGlobalScript,
    buildDefaultGlobalStyle, buildDefaultView, buildDefaultWidgetGroup
} from "../../setup/SetupFactories";
import { GlobalStyleSetup } from "./GlobalStyleSetup";
import { ActionProperties, SetupCustomParserProperties } from "../../setup/SetupInterfaces";
import { DriverWebSerialSetup } from "./DriverWebSerialSetup";
import { DriverSerialPortWebSerial, DriverSerialPortWebSerialParameters } from "../../drivers/DriverSerialportWebserial";
import { CustomHtmlComponentSetup } from "./CustomHtmlComponentSetup";
import { ViewSetup } from "./ViewSetup";
import * as serialize from "serialize-javascript"
import { Driver, DriverNames } from "../../drivers/Driver";
import { SetupProfileObject } from "../../setup/SetupInterfaces";
import { CustomBuildersSetup } from "./CustomBuildersSetup";
import { Action } from "./Action";
import { WidgetGroup } from "./WidgetGroup";
import { CollpaseGroup } from "../CollapseGroup";
import { SetupSideBarItems } from "../SetupSideBar";
import { SideMainSettings } from "../sidepages/SideMainSettings";
import {SideCustomHtmlComponents} from "../sidepages/SideCustomHtmlComponents";
import {SideCustomCodeAndStyles} from "../sidepages/SideCustomCodeAndStyles";

const ProfileSetup = (props: {
    profile: SetupProfileObject, sideBarItem: SetupSideBarItems,
    exportProfile: () => void, loadProfile: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onConfigUpdate: any
}) => {

    const [p, applyCache] = usePropagator<SetupProfileObject>(props.profile, props.onConfigUpdate)

    const scriptsRef = React.useRef(p.scripts.val);
    const [scripts, setScripts] = [p.scripts.val, (newval) => { scriptsRef.current = newval; p.scripts.set(newval); },];
    const stylesRef = React.useRef(p.styles.val);
    const [styles, setStyles] = [p.styles.val, (newval) => { stylesRef.current = newval; p.styles.set(newval); },];
    const parsersRef = React.useRef(p.parsers.val);
    const [parsers, setParsers] = [p.parsers.val, (newval) => { parsersRef.current = newval; p.parsers.set(newval); },];
    const buildersRef = React.useRef(p.builders.val);
    const [builders, setBuilders] = [p.builders.val, (newval) => { buildersRef.current = newval; p.builders.set(newval); },];
    const actionsRef = React.useRef(p.actions.val);
    const [actions, setActions] = [p.actions.val, (newval) => { actionsRef.current = newval; p.actions.set(newval); },];
    const htmlElemsRef = React.useRef(p.html.val);
    const [htmlElems, setHtmlElems] = [p.html.val, (newval) => { htmlElemsRef.current = newval; p.html.set(newval); },];
    const viewsRef = React.useRef(p.views.val);
    const [views, setViews] = [p.views.val, (newval) => { viewsRef.current = newval; p.views.set(newval); },];
    const widgetGroupsRef = React.useRef(p.widgetGroups.val);
    const [widgetGroups, setWidgetGroups] = [p.widgetGroups.val, (newval) => { widgetGroupsRef.current = newval; p.widgetGroups.set(newval); },];
    const [globalSettings, setGlobalSettings] = [p.globalSettings.val, p.globalSettings.set]

    function addNewCustomParser() {
        setParsers([...parsers, buildDefaultCustomParser(parsers)])
    }

    function addNewCustomBuilder() {
        setBuilders([...builders, buildDefaultCustomBuilder(builders)])
    }

    function addNewCustomAction() {
        setActions([...actions, buildDefaultAction(actions, builders)])
    }



    function addNewView() {
        setViews([...views, buildDefaultView(views)])
    }

    function addNewInteractiveWidget() {
        setWidgetGroups([...widgetGroups, buildDefaultWidgetGroup(widgetGroups)])
    }

    useEffect(() => {

        let script = document.createElement('script');
        let script_code = scripts.map((script) => {
            return "try {" + script.code + "} catch(e) {}"
        }).join("\r\n")
        script.id = "__js"
        script.type = 'text/javascript';
        script.innerHTML = script_code

        let style = document.createElement('style');
        style.id = "__css"
        style.innerHTML = styles.map((style) => {
            return style.code
        }).join("\r\n")

        let header = document.head

        let scriptsa = header.getElementsByTagName("script")
        for (let i = 0; i < scriptsa.length; i++) {
            if (scriptsa[i].id === "__js") {
                header.removeChild(scriptsa[i])
                break
            }
        }

        header.appendChild(script)

        let stylesa = header.getElementsByTagName("style")
        for (let i = 0; i < stylesa.length; i++) {
            if (stylesa[i].id === "__css") {
                header.removeChild(stylesa[i])
                break
            }
        }

        header.appendChild(style)

    }, [scripts, styles])

    return (
        <div>
            {
                props.sideBarItem === SetupSideBarItems.MainSettings &&
                <SideMainSettings
                    exportProfile={props.exportProfile}
                    loadProfile={props.loadProfile}
                />
            }

            {
                props.sideBarItem === SetupSideBarItems.CustomHtmlComponents &&
                <SideCustomHtmlComponents />
            }

            {
                props.sideBarItem === SetupSideBarItems.CustomCodeAndStyles &&
                <SideCustomCodeAndStyles />
            }

            {
                props.sideBarItem === SetupSideBarItems.CustomParserAndBuilders &&
                <React.Fragment>
                    <h1 className="title">Custom Parsers and Builders</h1>
                    <p>A parser contains the code to parse the data received from the driver.<br/>
                    For example CRC calculations, matching command code, base64 deconding and so on.<br/>
                    A builder instead takes data from an Action and sends it. <br/>
                    </p>
                    <br/>
                    <CollapseCard title="Custom parsers">
                        {
                            parsers.map(
                                (parser, index) => {
                                    return (
                                        <CustomParsersSetup
                                            key={parser.id}
                                            cfg={parser}
                                            onConfigChange={(newScript) =>
                                                setParsers(
                                                    parsersRef.current.map((val, n_index) => {
                                                        if (n_index == index)
                                                            return { ...val, ...newScript }
                                                        else
                                                            return val
                                                    }))}
                                            onDelete={() => setParsers(parsers.filter((val, n_index) => {
                                                return n_index != index
                                            }))}
                                        />
                                    )

                                }
                            )
                        }
                        <button className="button is-primary mt-4" onClick={() => addNewCustomParser()}>Add New</button>
                    </CollapseCard>
                    <CollapseCard title="Custom builders">
                        {
                            builders.map(
                                (builder, index) => {
                                    return (
                                        <CustomBuildersSetup
                                            key={builder.id}
                                            cfg={builder}
                                            onConfigChange={(newScript) =>
                                                setBuilders(
                                                    buildersRef.current.map((val, n_index) => {
                                                        if (n_index == index)
                                                            return { ...val, ...newScript }
                                                        else
                                                            return val
                                                    }))}
                                            onDelete={() => setBuilders(builders.filter((val, n_index) => {
                                                return n_index != index
                                            }))}
                                        />
                                    )

                                }
                            )
                        }
                        <button className="button is-primary mt-4" onClick={() => addNewCustomBuilder()}>Add New</button>
                    </CollapseCard>
                </React.Fragment>
            }

            {
                props.sideBarItem === SetupSideBarItems.Actions &&
                <React.Fragment>
                    <h1 className="title">Actions</h1>
                    <p>Action can be triggered from a Widget, for example when a button is pressed. <br/>
                    Actions are bound to an event (like click) and send fixed that to the driver. <br/>
                    </p>
                    <br/>
                    <CollapseCard title="Actions">

                        <CollpaseGroup array={actions} deleteIcon
                            getTitle={(index) => actions[index].name}
                            getId={(index) => actions[index].id}

                            setNewArray={(array) => { setActions(array) }}
                        >
                            {
                                (action, index) => (
                                    <Action
                                        key={action.id}
                                        cfg={action}
                                        customBuilders={builders}
                                        onConfigChange={(newScript) =>
                                            setActions(
                                                actionsRef.current.map((val, n_index) => {
                                                    if (n_index == index)
                                                        return { ...val, ...newScript }
                                                    else
                                                        return val
                                                }))}
                                    />
                                )
                            }
                        </CollpaseGroup>
                        <button className="button is-primary mt-4" onClick={() => addNewCustomAction()}>Add New</button>
                    </CollapseCard>
                </React.Fragment>
            }

            {
                props.sideBarItem === SetupSideBarItems.View &&
                <React.Fragment>
                    <h1 className="title">Views</h1>
                    <p>Views are the main components of the application. They are the pages that will be displayed to the user.<br/>
                    For each view must be associated a parser, data filters and visual object to display accepted data <br/>
                    Each view can have multiple widgets, widgets always stay fixed at the left of a page.
                    </p>
                    <div className="mt-4">
                        <div className="field is-grouped">
                            <div className="is-flex control is-align-items-center">
                                <label className="label">Views</label>
                            </div>
                            <div className="control">
                                <div className="button is-success is-quad-button" onClick={() => addNewView()}>
                                    <span className="icon is-large">
                                        <i className="fas fa-plus"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <CollpaseGroup array={views} deleteIcon
                            getTitle={(index) => views[index].name}
                            getId={(index) => views[index].id}

                            setNewArray={(array) => { setViews(array) }}
                        >
                            {
                                (view, index) => (
                                    <ViewSetup
                                        cfg={view}
                                        customParsers={parsers}
                                        customHtmlComponents={htmlElems}
                                        widgetsGroups={widgetGroups}
                                        onConfigChange={(newView) =>
                                            setViews(
                                                viewsRef.current.map((val, n_index) => {
                                                    if (n_index == index)
                                                        return { ...val, ...newView }
                                                    else
                                                        return val
                                                }))}
                                    />
                                )
                            }
                        </CollpaseGroup>
                    </div>

                    <div className="mt-4">
                        <div className="field is-grouped">
                            <div className="is-flex control is-align-items-center">
                                <label className="label">Interactive Widgets</label>
                            </div>
                            <div className="control">
                                <div className="button is-success is-quad-button" onClick={() => addNewInteractiveWidget()}>
                                    <span className="icon is-large">
                                        <i className="fas fa-plus"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                        {

                            <CollpaseGroup array={widgetGroups} deleteIcon
                                getTitle={(index) => widgetGroups[index].name}
                                getId={(index) => widgetGroups[index].id}

                                setNewArray={(array) => { setWidgetGroups(array) }}
                            >
                                {
                                    (val, index) => (
                                        <WidgetGroup
                                            cfg={val}
                                            customHtmlComponents={htmlElems}
                                            availableActions={actions}
                                            onConfigChange={(newView) =>
                                                setWidgetGroups(
                                                    widgetGroupsRef.current.map((val, n_index) => {
                                                        if (n_index == index)
                                                            return { ...val, ...newView }
                                                        else
                                                            return val
                                                    }))}
                                        />
                                    )
                                }
                            </CollpaseGroup>
                        }
                    </div>
                </React.Fragment>
            }

            {
                props.sideBarItem === SetupSideBarItems.OtherSettings &&
                <React.Fragment>
                    <h1 className="title">Other settings</h1>

                    <div className="field">
                        <div className="control">
                            <label className="checkbox">
                                <input type="checkbox" checked={globalSettings.shareDataBetweenViews} onChange={(evt) => {
                                    setGlobalSettings({ ...globalSettings, ...{ shareDataBetweenViews: evt.target.checked } })
                                }} />
                                &nbsp;Share data between views
                            </label>
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">Maximum items per view</label>
                        <div className="control">
                            <input
                                className="input is-success"
                                type="number"
                                value={globalSettings.maximumItemsPerView}
                                onChange={(evt) => {
                                    setGlobalSettings({ ...globalSettings, ...{ maximumItemsPerView: parseInt(evt.target.value) } })
                                }}
                            />
                        </div>
                    </div>

                </React.Fragment>
            }

        </div>
    );
}

export default ProfileSetup;