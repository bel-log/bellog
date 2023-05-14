import * as React from "react";
import { DriverNames } from "../drivers/Driver";

// Defined by Webpack.DefinePlugin
declare const LOCAL_MODE: boolean;

export function isWebMode(): boolean {
    try {
        if(LOCAL_MODE)
            return false;
    } catch (e) {}

    return true;
}

export function isDriverAllowedInWebMode(driverName: DriverNames): boolean {
    try {
        if (DriverNames.DriverWebSockify === driverName && !LOCAL_MODE) {
            return false;
        }
    } catch(e) {
        return false;
    }

    return true;
}

export function getDriverWarning(driverName: DriverNames): React.ReactNode {
    if (DriverNames.DriverWebSockify === driverName) {
        return <div>TCP sockets are not supported outside the box in web mode.
            <a href="https://github.com/bel-log/bellog/blob/master/documentation/Websockify.md">Check the documentation.</a>
        </div>
    }
    return <div></div>;
}