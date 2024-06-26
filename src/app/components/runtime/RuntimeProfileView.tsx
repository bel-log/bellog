import * as React from "react";
import {forwardRef, useContext, useEffect, useRef, useState} from "react";
import {buildToolbarState, ToolbarContext} from "../Toolbar";
import {
    Driver,
    DriverNames,
    DriverOpenClose,
    DriverStatus,
    isDriverLoggable,
    isDriverOpenClose
} from "../../drivers/Driver";
import {SetupProfileObject, ViewSetupProperties} from "../../setup/SetupInterfaces";
import {ParserFactory} from "../../parsers/ParserFactory";
import {ViewFactory} from "../../view/ViewFactory";
import {Observable} from "../../utility/Observable";
import {buildDefaultProfile} from "../../setup/SetupFactories";
import {ParserInfoType, ParserNames} from "../../parsers/Parser";

export const RuntimeProfileView = forwardRef((props: {
    visible: boolean, logEnabled: boolean, onLogEnabledToggle: (enabled: boolean) => void, onLogImport: () => void,
    driver: Driver, view: ViewSetupProperties, profile: SetupProfileObject, selected: boolean
    dataTxObserver: Observable, dataRxObserver: Observable, driverErrorObserver:Observable, onConnectClick?: () => void, onClearClick?: () => void
}, ref) => {


    const profile = props.profile
    const globalSettings = { ...buildDefaultProfile().globalSettings, ...profile?.globalSettings ?? {} }
    const view = props.view
    const htmls = [...profile.html]
    const visible = props.visible
    const widgetViewSize = view.widgetFrameSize
    const logEnabled = props.logEnabled

    const [toolbarState, setToolbarState] = useContext(ToolbarContext)
    const [autoScrollOn, setAutoScrollOn] = useState(false)

    const viewRef = useRef<HTMLDivElement>()
    const widgetViewRef = useRef<HTMLDivElement>()
    const selectedRef = useRef(props.selected)
    const hasDataRef = useRef(false)
    const logEnabledRef = useRef(false)
    const fileWriterRef = useRef(null)

    const defContent = profile.driverType == DriverNames.DriverClipboard ?
     "<div style=\"width: '100%'\" class=\"has-text-centered is-unselectable\">Paste some text with Ctrl-V</div>" : ""

    function buildToolbar(driver: Driver) {
        let toolbarNewState
        const driverOpenClose = driver as DriverOpenClose
        const clearButton = {
            isVisible: true, active: true, onClick: () => {
                viewRef.current.innerHTML = defContent
                hasDataRef.current = false
                props.onClearClick?.()
            }
        }

        const connectButton = {
            isVisible: isDriverOpenClose(driver), active: driverOpenClose.status === DriverStatus.OPEN, onClick: () => {
                props.onConnectClick?.()
            }
        }

        const autoScrollButton = {
            isVisible: true, active: autoScrollOn, onClick: () => {
                setAutoScrollOn(!autoScrollOn)
            }
        }

        const logButton = {
            isVisible: isDriverLoggable(driver), active: logEnabled, 
            onClick: () => {
                props.onLogEnabledToggle(!logEnabled)
            },
            onImportClick: () => {
                props.onLogImport()
            }
        }

        if (isDriverOpenClose(driver)) {

            toolbarNewState = buildToolbarState({
                settingsButton: { isVisible: false },
                connectButton: connectButton,
                clearButton: clearButton,
                logButton: logButton,
                autoScrollDownButton: autoScrollButton,
                title: profile.profileName
            })
            driverOpenClose.onStatusChange(() => {
                buildToolbar(driver)
                // TODO Move toolbar logic into RuntimeProfile
                if(driverOpenClose.status === DriverStatus.OPEN) {
                    document.dispatchEvent(new Event("bellog:DriverOpened"))
                } else {
                    document.dispatchEvent(new Event("bellog:DriverClosed"))
                }
            })
        } else {
            toolbarNewState = buildToolbarState({
                settingsButton: { isVisible: false },
                connectButton: { isVisible: false },
                autoScrollDownButton: autoScrollButton,
                clearButton: clearButton,
                title: profile.profileName
            })
        }
        setToolbarState(toolbarNewState)
    }

    useEffect(() => {
        const driver = props.driver
        const parser = ParserFactory.build(driver.name, view.parserType, view.customParserID, profile.parsers)
        const customView = ViewFactory.build(driver, view, profile.widgetGroups, profile.actions, 
                                            profile.builders, profile.html, viewRef, widgetViewRef, globalSettings.maximumItemsPerView)
        
        customView.init()
        driver.attach(viewRef.current)
        
        viewRef.current.innerHTML = defContent
        hasDataRef.current = false
        
        const onReceive = (obj) => {
            const data = obj.data
            const chunkInfo = obj.chunkInfo
            if (globalSettings.shareDataBetweenViews || selectedRef.current) {
                // Uint8Array | string
                parser.put(data, chunkInfo)
                if(fileWriterRef.current && logEnabledRef.current) {
                    fileWriterRef.current.write(data)
                }
            }
        }

        const onTransmit = (obj) => {
            const data = obj.data
            const chunkInfo = obj.chunkInfo
            if (globalSettings.shareDataBetweenViews || selectedRef.current) {
                // Uint8Array | string
                parser.put(data, chunkInfo)
            }
        }

        const onError = (error) => {
            customView.putDriverError(error)
        }

        props.driverErrorObserver.subscribe(onError)
        props.dataRxObserver.subscribe(onReceive)
        props.dataTxObserver.subscribe(onTransmit)


        parser.onAccept((acc, chunkInfo: ParserInfoType) => {
            if(!hasDataRef.current) {
                viewRef.current.innerHTML = ""
                hasDataRef.current = true
            }
            customView.putParsedObject(acc, true, chunkInfo)
        })
        parser.onRefuse((acc, chunkInfo: ParserInfoType) => {
            if(!hasDataRef.current) {
                viewRef.current.innerHTML = ""
                hasDataRef.current = true
            }
            customView.putParsedObject(acc, false, chunkInfo)
        })

        document.addEventListener('mousewheel', function (e) {
            setAutoScrollOn(false)
        });

        return () => {
            props.driverErrorObserver.unsubscribe(onError)
            props.dataRxObserver.unsubscribe(onReceive)
            props.dataTxObserver.unsubscribe(onTransmit)
        }
    }, [])

    useEffect(() => {
        if (props.selected)
            buildToolbar(props.driver)
        selectedRef.current = props.selected

        const intervalId = setInterval(() => {
            if (autoScrollOn)
                viewRef.current.scrollTo({ top: viewRef.current.scrollHeight, left: 0, behavior: "auto" })
        }, 100);

        return () => clearInterval(intervalId);
    }, [props.selected, autoScrollOn, logEnabled])

    function getWrapStyle(view: ViewSetupProperties): React.CSSProperties {
        if (view.autoWrap) {
            if (view.parserType === ParserNames.RawParser) {
                return {
                    whiteSpace: "normal",
                    wordWrap: "break-word"
                }
            } else {
                return {
                    whiteSpace: "normal"
                }
            }

        } else {
            return { whiteSpace: "nowrap" }
        }
    }

    return (
        <div id={`${view.name}`} className={`is-flex-grow-1 ${visible ? "" : "is-hidden"}`} style={{overflow: "hidden"}}>
            {
                view.widgetGroupIds.length > 0 ?
                    <div className="" style={{
                        overflowY: "scroll", height: "100%",
                        resize: widgetViewSize === 100 ? "none" : "horizontal", width: widgetViewSize + "vw", maxWidth: "100%",
                        float: "left"
                    }}>
                        {
                            view.widgetGroupIds.map((widgetGroupId) => {
                                const widgetGroup = profile.widgetGroups.find((it) => it.id === widgetGroupId.id)
                                if (widgetGroup) {
                                    return <div className="container p-2" key={widgetGroup.id}>
                                        <p className="has-text-centered mb-1">{widgetGroup.name}</p>
                                        <div ref={widgetViewRef} style={{ gap: "0.5em" }}>
                                            
                                        </div>
                                    </div>
                                }
                            })
                        }
                    </div>
                    : ""
            }
            <div className="is-flex" style={{height: "100%", width: "auto", overflow: "auto"}}>
                <div  id={`${view.name}_log`} ref={viewRef} tabIndex={0} className="pl-1" 
                style={{...getWrapStyle(view), ...{overflow: "auto", flexGrow: "1"}}}>
                </div>
            </div>
        </div>
    );
});

export default RuntimeProfileView;
