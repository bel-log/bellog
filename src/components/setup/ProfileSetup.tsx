import * as React from "react";
import {Property} from "csstype";
import {RendererList} from "../../renderers/rendererslist";
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
import {GenericRendererPropertiesSetup, GenericRendererSetup, MatchEntry} from "../../renderers/generic/Generic";
import {useStateWithCallback} from "../../utility/customHooks";
import {GlobalScriptSetup} from "./GlobalScriptSetup";
import {CustomParsersSetup} from "./CustomParsersSetup";
import {CollapseCard} from "../CollapseCard";
import {
    buildDefaultCustomHtmlElem,
    buildDefaultCustomParser,
    buildDefaultDriverWebSerialSettings,
    buildDefaultGlobalScript,
    buildDefaultGlobalStyle, buildDefaultView
} from "../../app/setup/SetupFactories";
import {GlobalStyleSetup} from "./GlobalStyleSetup";
import {SetupCustomParserProperties} from "../../app/setup/SetupInterfaces";
import {DriverWebSerialSetup} from "./DriverWebSerialSetup";
import {DriverSerialPortWebSerial, DriverSerialPortWebSerialParameters} from "../../drivers/DriverSerialportWebserial";
import {CustomHtmlComponentSetup} from "./CustomHtmlComponentSetup";
import {ViewSetup} from "./ViewSetup";
import * as serialize from "serialize-javascript"
import {DriverNames} from "../../drivers/Driver";
import {SetupProfileObject} from "../../app/setup/SetupInterfaces";


const ProfileSetup = (props: { profile: SetupProfileObject, onConfigUpdate: any, onExportRequest, onImportRequest }) => {

    const [profileName, setProfileName] = useStateWithCallback(props.profile.profileName, (profileName) => {
        props.onConfigUpdate({profileName: profileName})
    })

    const [driver, setDriver] = useStateWithCallback(props.profile.driver, (driver) => {
        props.onConfigUpdate({driver: driver})
    })

    const [scripts, setScripts] = useStateWithCallback(props.profile.scripts ?? [], (newScripts) => {
        props.onConfigUpdate({scripts: newScripts})
    })

    const [styles, setStyles] = useStateWithCallback(props.profile.styles ?? [], (newStyles) => {
        props.onConfigUpdate({styles: newStyles})
    })

    const [parsers, setParsers] = useStateWithCallback(props.profile.parsers ?? [], (newParsers) => {
        props.onConfigUpdate({parsers: newParsers})
    })

    const [htmlElems, setHtmlElems] = useStateWithCallback(props.profile.html ?? [], (htmlElems) => {
        props.onConfigUpdate({html: htmlElems})
    })

    const [views, setViews] = useStateWithCallback(props.profile.views ?? [], (views) => {
        props.onConfigUpdate({views: views})
    })

    function addNewGlobalScript() {
        setScripts([...scripts, buildDefaultGlobalScript(scripts)])
    }

    function addNewGlobalStyle() {
        setStyles([...styles, buildDefaultGlobalStyle(styles)])
    }

    function addNewCustomParser() {
        setParsers([...parsers, buildDefaultCustomParser(parsers)])
    }

    function addNewCustomHtmlComponent() {
        setHtmlElems([...htmlElems, buildDefaultCustomHtmlElem(htmlElems)])
    }

    function addNewView() {
        setViews([...views, buildDefaultView(views)])
    }

    useEffect(() => {
        setProfileName(props.profile.profileName)
    }, [])

    return (
        <div>
            <script>
                {
                    "try {" +
                    scripts.map((script) => {
                        return script.code
                    })
                    + "} catch(e) {}"

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
                           onChange={(evt) => setProfileName(evt.target.value)}/>
                </div>
            </div>

            <div className="field">
                {
                    (() => {
                        const [tmpDriverSettings, setTmpDriverSettings] = useState(driver.settings)
                        const [driverModalIsOpen, setDriverModalIsOpen] = useStateWithCallback(false, (isOpen) => {
                            if (isOpen) {
                                setTmpDriverSettings(driver.settings)
                            }
                        })

                        useEffect(() => {
                            setDriver({
                                name: driver.name,
                                settings: tmpDriverSettings
                            })
                        }, [tmpDriverSettings])
                        return (
                            <React.Fragment>
                                <label className="label">Driver</label>
                                <div className="field has-addons">
                                    <div className="select">
                                        <select value={driver.name} onChange={(evt) => setDriver(
                                            {...driver, ...{name: evt.target.value, settings: buildDefaultDriverWebSerialSettings(evt.target.value)}}
                                        )}>
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
                                                                <p className="modal-card-title">{driver.name} Settings</p>
                                                                <button className="delete" aria-label="close"
                                                                        onClick={() => setDriverModalIsOpen(false)}></button>
                                                            </header>
                                                            <section className="modal-card-body">
                                                                {
                                                                    (() => {
                                                                        switch (driver.name) {
                                                                            case DriverNames.DriverSerialPortWebSerial:
                                                                                return (
                                                                                    <DriverWebSerialSetup
                                                                                        cfg={tmpDriverSettings as DriverSerialPortWebSerialParameters}
                                                                                        onConfigUpdate={(cfg) => {
                                                                                            setTmpDriverSettings({...tmpDriverSettings, ...cfg})
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
                                                                            setDriver({...driver, ...{settings: tmpDriverSettings}});
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
                                            } else return (<div/>)

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
                                                    return {...val, ...newHtmlElem}
                                                else
                                                    return val
                                            }))}
                                    onDelete={() => setHtmlElems(htmlElems.filter((val, n_index) => {
                                        return n_index != index
                                    }))}
                                />
                            )

                        }
                    )
                }
                <button className="button is-primary" onClick={() => addNewCustomHtmlComponent()}>Add New</button>
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
                                                    return {...val, ...newStyle}
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
                <button className="button is-primary" onClick={() => addNewGlobalStyle()}>Add New</button>
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
                                                    return {...n_script, ...newScript}
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
                <button className="button is-primary" onClick={() => addNewGlobalScript()}>Add New</button>
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
                                                    return {...val, ...newScript}
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
                <button className="button is-primary" onClick={() => addNewCustomParser()}>Add New</button>
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
                        return <CollapseCard key={val.id} title={val.name}>
                            <ViewSetup
                                cfg={val}
                                customParsers={parsers}
                                customHtmlComponents={htmlElems}
                                onConfigChange={(newView) =>
                                    setViews(
                                        views.map((val, n_index) => {
                                            if (n_index == index)
                                                return {...val, ...newView}
                                            else
                                                return val
                                        }))}
                                onDelete={() => setViews(views.filter((val, n_index) => {
                                    return n_index != index
                                }))}
                            />
                        </CollapseCard>
                    })
                }
            </div>

        </div>
    );
}

export default ProfileSetup;