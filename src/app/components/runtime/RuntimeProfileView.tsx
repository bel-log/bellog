import * as React from "react";
import { createContext, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import ProfileSetup from "../setup/ProfileSetup";
import { DriverFactory } from "../../drivers/DriverFactory";
import { buildToolbarState, ToolbarContext } from "../Toolbar";
import { Driver, DriverNames, DriverOpenClose, DriverStatus, isDriverOpenClose } from "../../drivers/Driver";
import { SetupProfileObject, ViewSetupProperties } from "../../setup/SetupInterfaces";
import { ParserFactory } from "../../parsers/ParserFactory";
import { ViewFactory } from "../../view/ViewFactory";
import { Observable } from "../../utility/Observable";
import { buildDefaultProfile } from "../../setup/SetupFactories";
import { ParserNames } from "../../parsers/Parser";
import { WidgetGroup } from "../setup/WidgetGroup";

export const RuntimeProfileView = forwardRef((props: {
    visible: boolean
    driver: Driver, view: ViewSetupProperties, profile: SetupProfileObject, selected: boolean
    dataTxObserver: Observable, dataRxObserver: Observable, onConnectClick?: () => void, onClearClick?: () => void
}, ref) => {

    const profile = props.profile
    const globalSettings = { ...buildDefaultProfile().globalSettings, ...profile?.globalSettings ?? {} }
    const view = props.view
    const htmls = [...profile.html]
    const visible = props.visible
    const widgetViewSize = view.widgetFrameSize

    const [toolbarState, setToolbarState] = useContext(ToolbarContext)
    const [autoScrollOn, setAutoScrollOn] = useState(false)

    const viewRef = useRef<HTMLDivElement>()
    const widgetViewRef = useRef<HTMLDivElement>()
    const selectedRef = useRef(props.selected)
    const hasDataRef = useRef(false)

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

        if (isDriverOpenClose(driver)) {

            toolbarNewState = buildToolbarState({
                settingsButton: { isVisible: false },
                connectButton: connectButton,
                clearButton: clearButton,
                autoScrollDownButton: autoScrollButton,
                title: profile.profileName
            })
            driverOpenClose.onStatusChange(() => {
                buildToolbar(driver)
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
        
        viewRef.current.innerHTML = defContent
        hasDataRef.current = false
        
        const onReceive = (data) => {
            if (globalSettings.shareDataBetweenViews || selectedRef.current) {
                // Uint8Array | string
                parser.put(data, false)
            }
        }

        const onTransmit = (data) => {
            if (globalSettings.shareDataBetweenViews || selectedRef.current) {
                // Uint8Array | string
                parser.put(data, true)
            }
        }

        props.dataRxObserver.subscribe(onReceive)
        props.dataTxObserver.subscribe(onTransmit)

        parser.onAccept((acc, parseInfo) => {
            if(!hasDataRef.current) {
                viewRef.current.innerHTML = ""
                hasDataRef.current = true
            }
            customView.putParsedObject(acc, true, parseInfo)
        })
        parser.onRefuse((acc, parseInfo) => {
            if(!hasDataRef.current) {
                viewRef.current.innerHTML = ""
                hasDataRef.current = true
            }
            customView.putParsedObject(acc, false, parseInfo)
        })

        document.addEventListener('mousewheel', function (e) {
            setAutoScrollOn(false)
        });

        return () => {
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
    }, [props.selected, autoScrollOn])

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
        <div className={`is-flex-grow-1 ${visible ? "" : "is-hidden"}`} style={{overflow: "hidden"}}>
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
                <div ref={viewRef} className="pl-1" style={{...getWrapStyle(view), ...{overflow: "auto", flexGrow: "1"}}}>
                </div>
            </div>
        </div>
    );
});

export default RuntimeProfileView;
