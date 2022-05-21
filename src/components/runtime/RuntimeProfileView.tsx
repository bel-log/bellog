import * as React from "react";
import { createContext, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import ProfileSetup from "../setup/ProfileSetup";
import { DriverFactory } from "../../drivers/DriverFactory";
import { buildToolbarState, ToolbarContext } from "../Toolbar";
import { Driver, DriverOpenClose, DriverStatus, isDriverOpenClose } from "../../drivers/Driver";
import { SetupProfileObject, ViewSetupProperties } from "../../app/setup/SetupInterfaces";
import { ParserFactory } from "../../parsers/ParserFactory";
import { ViewFactory } from "../../view/ViewFactory";
import { embeddedHtmlComponents } from "../../app/setup/SetupDefaults";
import { Observable } from "../../utility/Observable";

export const RuntimeProfileView = forwardRef((props: {
    driver: Driver, view: ViewSetupProperties, profile: SetupProfileObject, selected: boolean
    dataObserver: Observable, onConnectClick?: () => void, onClearClick?: () => void
}, ref) => {

    const profile = props.profile
    const view = props.view
    const htmls = [...profile.html, ...embeddedHtmlComponents]

    const [toolbarState, setToolbarState] = useContext(ToolbarContext)
    const [autoScrollOn, setAutoScrollOn] = useState(false)

    const viewRef = useRef<HTMLDivElement>()
    const selectedRef = useRef(props.selected)

    function buildToolbar(driver: Driver) {
        let toolbarNewState
        const driverOpenClose = driver as DriverOpenClose
        const clearButton = {
            isVisible: true, active: true, onClick: () => {
                viewRef.current.innerHTML = ""
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
        const parser = ParserFactory.build(view.parser, profile.parsers)
        const customView = ViewFactory.build(parser, view, htmls, viewRef)

        const onReceive = (data) => {
            if (profile.globalSettings.shareDataBetweenViews || selectedRef.current) {
                // Uint8Array | string
                parser.put(data)
            }
        }

        props.dataObserver.subscribe(onReceive)

        parser.onAccept((acc) => {
            customView.putParsedObject(acc, true)
        })
        parser.onRefuse((acc) => {
            customView.putParsedObject(acc, false)
        })

        
        document.addEventListener('scroll', function (e) {
            if ((document.documentElement.scrollTop + 50) >= (document.documentElement.scrollHeight - document.documentElement.clientHeight)) {

            }
            else {
                setAutoScrollOn(false)
            }
        });

        return () => {
            props.dataObserver.unsubscribe(onReceive)
        }
    }, [])

    useEffect(() => {
        if (props.selected)
            buildToolbar(props.driver)
        selectedRef.current = props.selected

        const intervalId = setInterval(() => {
            if(autoScrollOn)
                window.scrollTo({ top: document.documentElement.scrollHeight, left: 0, behavior: "auto" })
        }, 100);

        return () => clearInterval(intervalId);
    }, [props.selected, autoScrollOn])

    return (
        <React.Fragment>
            <div ref={viewRef}></div>
        </React.Fragment>
    );
});

export default RuntimeProfileView;
