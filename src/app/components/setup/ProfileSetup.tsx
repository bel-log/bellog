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
import isDriverAllowedInWebMode from "./../../utility/env";
import { DriverAdbLogcat, DriverAdbLogcatParameters } from "../../drivers/DriverAdbLogcat";
import { DriverAdbLogcatSetup } from "./DriverAdbSetup";

const ProfileSetup = (props: { profile: SetupProfileObject, onConfigUpdate: any }) => {

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

    function updateDriverType(newDriverType: DriverNames) {
        setDriverType(newDriverType, true)
        setDriverSettings(buildDefaultDriverSettings(newDriverType), true)
        applyCache()
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
        let style_code = styles.map((style) => {
            return style.code
        }).join("\r\n")
        style.id = "__css"
        style.innerHTML = styles.map((style) => {
            return style.code
        }).join("\r\n")

        let header = document.head

        let found = false
        let scriptsa = header.getElementsByTagName("script")
        for (let i = 0; i < scriptsa.length; i++) {
            if (scriptsa[i].id === "__js") {
                scriptsa[i].innerHTML = script_code
                found = true
                break
            }
        }

        if (!found)
            header.appendChild(script)

        found = false
        let stylesa = header.getElementsByTagName("style")
        for (let i = 0; i < stylesa.length; i++) {
            if (stylesa[i].id === "__css") {
                stylesa[i].innerHTML = style_code
                found = true
                break
            }
        }

        if (!found)
            header.appendChild(style)

    }, [scripts, styles])

    return (
        <div>
            <h1 className="title">Setup Profile</h1>

            <div className="field">
                <label className="label">Profile name</label>
                <div className="control">
                    <input className="input" type="text" placeholder="Text input" value={profileName}
                        onChange={(evt) => setProfileName(evt.target.value)} />
                </div>
            </div>

            <div className="field">
                {
                    (() => {
                        const [tmpDriverSettings, setTmpDriverSettings] = useState(driverSettings)
                        const [driverModalIsOpen, setDriverModalIsOpen] = useStateWithCallback(false, (isOpen) => {
                            if (isOpen) {
                                setTmpDriverSettings(driverSettings)
                            }
                        })

                        useEffect(() => {
                            setDriverSettings(tmpDriverSettings)
                        }, [tmpDriverSettings])

                        return (
                            <React.Fragment>
                                <label className="label">Driver</label>
                                <div className="field has-addons">
                                    <div className="select">
                                        <select value={driverType} className={`${isDriverAllowedInWebMode(driverType) ? "" : "has-text-danger"}`}
                                            onChange={(evt) => updateDriverType(evt.target.value as DriverNames)}>
                                            {
                                                Object.values(DriverNames).map(
                                                    (driver, dindex) => {
                                                        if (isDriverAllowedInWebMode(driver)) {
                                                            return <option className="has-text-black" key={dindex} value={driver}>{driver}</option>
                                                        } else {
                                                            return <option className="has-text-danger" key={dindex} value={driver}>{driver}</option>
                                                        }
                                                    }
                                                )
                                            }
                                        </select>
                                    </div>
                                    <p className="control">
                                        <a className="button is-info" onClick={() => {
                                            setDriverModalIsOpen(!driverModalIsOpen)
                                        }}>
                                            Settings
                                        </a>
                                    </p>
                                    {
                                        (() => {
                                            if (isDriverAllowedInWebMode(driverType)) {
                                                return <div></div>
                                            } else return <div className="control is-flex is-align-items-center ml-2 has-text-danger">
                                                <p className="is-justify-content-center">This Driver can only be used with the desktop application.</p>
                                            </div>
                                        })()
                                    }
                                    {
                                        (() => {
                                            if (driverModalIsOpen) {
                                                return (
                                                    <div className={`modal ${driverModalIsOpen ? "is-active" : ""}`}>
                                                        <div className="modal-background"></div>
                                                        <div className="modal-card">
                                                            <header className="modal-card-head">
                                                                <p className="modal-card-title">{driverType} Settings</p>
                                                                <button className="delete" aria-label="close"
                                                                    onClick={() => setDriverModalIsOpen(false)}></button>
                                                            </header>
                                                            <section className="modal-card-body">
                                                                {
                                                                    (() => {
                                                                        switch (driverType) {
                                                                            case DriverNames.DriverSerialPortWebSerial:
                                                                                return (
                                                                                    <DriverWebSerialSetup
                                                                                        cfg={tmpDriverSettings as DriverSerialPortWebSerialParameters}
                                                                                        onConfigUpdate={(cfg) => {
                                                                                            setTmpDriverSettings({ ...tmpDriverSettings, ...cfg })
                                                                                        }}
                                                                                    />
                                                                                )
                                                                            case DriverNames.DriverAdbLogcat:
                                                                                return (
                                                                                    <DriverAdbLogcatSetup
                                                                                        cfg={tmpDriverSettings as DriverAdbLogcatParameters}
                                                                                        onConfigUpdate={(cfg) => {
                                                                                            setTmpDriverSettings({ ...tmpDriverSettings, ...cfg })
                                                                                        }}
                                                                                    />
                                                                                )
                                                                        }
                                                                    })()
                                                                }
                                                            </section>
                                                            <footer className="modal-card-foot">
                                                                <button className="button is-success"
                                                                    onClick={() => {
                                                                        setDriverSettings(tmpDriverSettings);
                                                                        setDriverModalIsOpen(false)
                                                                    }}>
                                                                    Save changes
                                                                </button>
                                                                <button className="button"
                                                                    onClick={() => setDriverModalIsOpen(false)}>
                                                                    Cancel
                                                                </button>
                                                            </footer>
                                                        </div>
                                                    </div>
                                                )
                                            } else return (<div />)

                                        })()
                                    }

                                </div>
                            </React.Fragment>

                        )
                    })()
                }
            </div>

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

        </div>
    );
}

export default ProfileSetup;