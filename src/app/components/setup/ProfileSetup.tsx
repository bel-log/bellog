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

const ProfileSetup = (props: { profile: SetupProfileObject, sideBarItem: SetupSideBarItems, onConfigUpdate: any }) => {

    const [p, applyCache] = usePropagator<SetupProfileObject>(props.profile, props.onConfigUpdate)

    const [profileName, setProfileName] = [p.profileName.val, p.profileName.set]
    const [driverType, setDriverType] = [p.driverType.val, p.driverType.set]
    const [driverSettings, setDriverSettings] = [p.driverSettings.val, p.driverSettings.set]
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

    function addNewGlobalScript() {
        setScripts([...scripts, buildDefaultGlobalScript(scripts)])
    }

    function addNewGlobalStyle() {
        setStyles([...styles, buildDefaultGlobalStyle(styles)])
    }

    function addNewCustomParser() {
        setParsers([...parsers, buildDefaultCustomParser(parsers)])
    }

    function addNewCustomBuilder() {
        setBuilders([...builders, buildDefaultCustomBuilder(builders)])
    }

    function addNewCustomAction() {
        setActions([...actions, buildDefaultAction(actions, builders)])
    }

    function addNewCustomHtmlComponent() {
        setHtmlElems([...htmlElems, buildDefaultCustomHtmlElem(htmlElems)])
    }

    function addNewView() {
        setViews([...views, buildDefaultView(views)])
    }

    function addNewInteractiveWidget() {
        setWidgetGroups([...widgetGroups, buildDefaultWidgetGroup(widgetGroups)])
    }



    function cloneAction(action: ActionProperties) {
        const actionForNewID = buildDefaultAction(actions, builders)
        const actionCopy = { ...action, ...{ id: actionForNewID.id } }
        setActions([...actions, JSON.parse(JSON.stringify(actionCopy))])
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
                    profileName={profileName}
                    setProfileName={(newProfileName) => {
                        setProfileName(newProfileName)
                    }}
                    driverType={driverType}
                    driverSettings={driverSettings}
                    setDriver={([newDriverType, newDriverSettings]) => {
                        setDriverType(newDriverType, true)
                        setDriverSettings(newDriverSettings, true)
                        applyCache()
                    }}
                />
            }

            {
                props.sideBarItem === SetupSideBarItems.CustomHtmlComponents &&
                <React.Fragment>
                    <CollapseCard title="Custom Html Components">
                        <CollpaseGroup array={htmlElems} deleteIcon
                            getTitle={(index) => htmlElems[index].name}
                            getId={(index) => htmlElems[index].id}

                            setNewArray={(array) => { setHtmlElems(array) }}
                        >
                            {
                                (htmlelem, index) => (
                                    <CustomHtmlComponentSetup
                                        key={htmlelem.id}
                                        cfg={htmlelem}
                                        onConfigChange={(newHtmlElem) =>
                                            setHtmlElems(
                                                htmlElemsRef.current.map((val, n_index) => {
                                                    if (n_index == index)
                                                        return { ...val, ...newHtmlElem }
                                                    else
                                                        return val
                                                }))}
                                    />
                                )
                            }
                        </CollpaseGroup>
                        <button className="button is-primary mt-4" onClick={() => addNewCustomHtmlComponent()}>Add New</button>
                    </CollapseCard>
                </React.Fragment>
            }

            {
                props.sideBarItem === SetupSideBarItems.CustomCodeAndStyles &&
                <React.Fragment>
                    <CollapseCard title="Global styles">
                        {
                            styles.map(
                                (style, index) => {
                                    return (
                                        <GlobalStyleSetup
                                            key={style.id}
                                            cfg={style}
                                            onConfigChange={(newStyle) =>
                                                setStyles(
                                                    stylesRef.current.map((val, n_index) => {
                                                        if (n_index == index)
                                                            return { ...val, ...newStyle }
                                                        else
                                                            return val
                                                    }))}
                                            onDelete={() => setStyles(styles.filter((val, n_index) => {
                                                return n_index != index
                                            }))}
                                        />
                                    )

                                }
                            )
                        }
                        <button className="button is-primary mt-4" onClick={() => addNewGlobalStyle()}>Add New</button>
                    </CollapseCard>

                    <CollapseCard title="Global scripts">
                        {
                            scripts.map(
                                (gscript, index) => {
                                    return (
                                        <GlobalScriptSetup
                                            key={gscript.id}
                                            cfg={gscript}
                                            onConfigChange={(newScript) =>
                                                setScripts(
                                                    scriptsRef.current.map((n_script, n_index) => {
                                                        if (n_index == index)
                                                            return { ...n_script, ...newScript }
                                                        else
                                                            return n_script
                                                    }))}
                                            onDelete={() => setScripts(scripts.filter((n_script, n_index) => {
                                                return n_index != index
                                            }))}
                                        />
                                    )

                                }
                            )
                        }
                        <button className="button is-primary mt-4" onClick={() => addNewGlobalScript()}>Add New</button>
                    </CollapseCard>
                </React.Fragment>
            }

            {
                props.sideBarItem === SetupSideBarItems.CustomParserAndBuilders &&
                <React.Fragment>
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
                    <div className="mt-4">
                        <CollapseCard title="Settings">


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
                        </CollapseCard>
                    </div>
                </React.Fragment>
            }

        </div>
    );
}

export default ProfileSetup;