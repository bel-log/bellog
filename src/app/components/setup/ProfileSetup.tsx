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


const ProfileSetup = (props: { profile: SetupProfileObject, onConfigUpdate: any, onExportRequest, onImportRequest }) => {

    const [p, applyCache] = usePropagator<SetupProfileObject>(props.profile, props.onConfigUpdate)

    const [profileName, setProfileName] = [p.profileName.val, p.profileName.set]
    const [driverType, setDriverType] = [p.driverType.val, p.driverType.set]
    const [driverSettings, setDriverSettings] = [p.driverSettings.val, p.driverSettings.set]
    const [scripts, setScripts] = [p.scripts.val, p.scripts.set]
    const [styles, setStyles] = [p.styles.val, p.styles.set]
    const [parsers, setParsers] = [p.parsers.val, p.parsers.set]
    const [builders, setBuilders] = [p.builders.val, p.builders.set]
    const [actions, setActions] = [p.actions.val, p.actions.set]
    const [htmlElems, setHtmlElems] = [p.html.val, p.html.set]
    const [views, setViews] = [p.views.val, p.views.set]
    const [widgetGroups, setWidgetGroups] = [p.widgetGroups.val, p.widgetGroups.set]
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

    function cloneAction(action:ActionProperties) {
        const actionForNewID = buildDefaultAction(actions, builders)
        const actionCopy = {...action, ...{id: actionForNewID.id}}
        setActions([...actions, JSON.parse(JSON.stringify(actionCopy))])
    }

    return (
        <div>
            <script>
                {
                    scripts.map((script) => {
                        return "try {" + script.code + "} catch(e) {}"
                    })
                }
            </script>
            <style>
                {
                    styles.map((style) => {
                        return style.code
                    })
                }
            </style>
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
                                        <select value={driverType} onChange={(evt) => updateDriverType(evt.target.value as DriverNames)}>
                                            {
                                                Object.values(DriverNames).map(
                                                    (driver, dindex) => {
                                                        return <option key={dindex} value={driver}>{driver}</option>
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
                    {
                        htmlElems.map(
                            (htmlelem, index) => {
                                return (
                                    <CustomHtmlComponentSetup
                                        key={htmlelem.id}
                                        cfg={htmlelem}
                                        onConfigChange={(newHtmlElem) =>
                                            setHtmlElems(
                                                htmlElems.map((val, n_index) => {
                                                    if (n_index == index)
                                                        return { ...val, ...newHtmlElem }
                                                    else
                                                        return val
                                                }))}
                                        onDelete={() => setHtmlElems(htmlElems.filter((val, n_index) => {
                                            return n_index != index
                                        }))}
                                        onSortUp={() => {
                                            if (htmlElems.length > 0 && index > 0) {
                                                setHtmlElems([...htmlElems.slice(0, index-1), htmlelem, htmlElems[index-1], ...htmlElems.slice(index+1)])
                                            }
                                        }}
                                        onSortDown={() => {
                                            if (htmlElems.length > 0 && index < (htmlElems.length - 1)) {
                                                setHtmlElems([...htmlElems.slice(0, index), htmlElems[index+1], htmlelem, ...htmlElems.slice(index+2)])
                                            }
                                        }}
                                    />
                                )

                            }
                        )
                    }
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
                                            styles.map((val, n_index) => {
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
                                            scripts.map((n_script, n_index) => {
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
                                            parsers.map((val, n_index) => {
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
                                            builders.map((val, n_index) => {
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
                {
                    actions.map(
                        (action, index) => {
                            return (
                                <CollapseCard title={action.name}
                                deleteIcon
                                sortArrowIcon
                                duplicateIcon
                                deleteClick={() => setActions(actions.filter((val, n_index) => {
                                    return n_index != index
                                }))}
                                sortUpClick={() => {
                                    if (views.length > 0 && index > 0) {
                                        setActions([...actions.slice(0, index-1), action, actions[index-1], ...actions.slice(index+1)])
                                    }
                                }}
                                sortDownClick={() => {
                                    if (views.length > 0 && index < (views.length - 1)) {
                                        setActions([...actions.slice(0, index), actions[index+1], action, ...actions.slice(index+2)])
                                    }
                                }}
                                duplicateClick={() => {
                                    cloneAction(action)
                                }}
                                >
                                    
                                    <Action
                                        key={action.id}
                                        cfg={action}
                                        customBuilders={builders}
                                        onConfigChange={(newScript) =>
                                            setActions(
                                                actions.map((val, n_index) => {
                                                    if (n_index == index)
                                                        return { ...val, ...newScript }
                                                    else
                                                        return val
                                                }))}
                                    />
                                </CollapseCard>
                            )

                        }
                    )
                }
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
                    {
                        views.map((val, index) => {
                            return <CollapseCard key={val.id} title={val.name} deleteIcon deleteClick={() => {
                                setViews(views.filter((val, n_index) => {
                                    return n_index != index
                                }))
                            }}
                            sortArrowIcon={true}
                            sortUpClick={() => {
                                if (views.length > 0 && index > 0) {
                                    setViews([...views.slice(0, index-1), val, views[index-1], ...views.slice(index+1)])
                                }
                            }}
                            sortDownClick={() => {
                                if (views.length > 0 && index < (views.length - 1)) {
                                    setViews([...views.slice(0, index), views[index+1], val, ...views.slice(index+2)])
                                }
                            }}
                            >
                                <ViewSetup
                                    cfg={val}
                                    customParsers={parsers}
                                    customHtmlComponents={htmlElems}
                                    widgetsGroups={widgetGroups}
                                    onConfigChange={(newView) =>
                                        setViews(
                                            views.map((val, n_index) => {
                                                if (n_index == index)
                                                    return { ...val, ...newView }
                                                else
                                                    return val
                                            }))}
                                />
                            </CollapseCard>
                        })
                    }
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
                    widgetGroups.map((val, index) => {
                        return <CollapseCard key={val.id} title={val.name} deleteIcon deleteClick={() => setWidgetGroups(widgetGroups.filter((val, n_index) => {
                            return n_index != index
                        }))}
                        sortArrowIcon={true}
                        sortUpClick={() => {
                            if (views.length > 0 && index > 0) {
                                setWidgetGroups([...widgetGroups.slice(0, index-1), val, widgetGroups[index-1], ...widgetGroups.slice(index+1)])
                            }
                        }}
                        sortDownClick={() => {
                            if (views.length > 0 && index < (views.length - 1)) {
                                setWidgetGroups([...widgetGroups.slice(0, index), widgetGroups[index+1], val, ...widgetGroups.slice(index+2)])
                            }
                        }}>
                            <WidgetGroup
                                cfg={val}
                                customHtmlComponents={htmlElems}
                                availableActions={actions}
                                onConfigChange={(newView) =>
                                    setWidgetGroups(
                                        widgetGroups.map((val, n_index) => {
                                            if (n_index == index)
                                                return { ...val, ...newView }
                                            else
                                                return val
                                        }))}
                            />
                        </CollapseCard>
                    })
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