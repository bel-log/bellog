import * as React from "react";
import {createContext, useEffect, useState} from "react";
import ProfileSetup from "../setup/ProfileSetup";
import {DriverFactory} from "../../drivers/DriverFactory";
import {buildToolbarState, ToolbarContext} from "../Toolbar";
import {Driver, DriverOpenClose, DriverStatus, isDriverOpenClose} from "../../drivers/Driver";
import {SetupProfileObject} from "../../app/setup/SetupInterfaces";
import {ParserFactory} from "../../parsers/ParserFactory";
import { ViewFactory } from "../../view/ViewFactory";
import { db } from "../../app/db/db";
import { useLocation, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import RuntimeProfile from "../runtime/RuntimeProfile";
import { normalizeProfile } from "../../app/setup/SetupNormalizer";



export const PageRedirector = () => {

    const { profileVersion } = useParams()

    let url = window.location.href.replace(window.location.hash, "")
    let fileNameForLocalUse = ""
    let versionPath = profileVersion ? `/${profileVersion}` : "v0"
    if(url.endsWith("index.html")) {
        url = url.replace("index.html", "")
        fileNameForLocalUse = "index.html"
    }

    window.location.href = `${url}${versionPath}/${fileNameForLocalUse}${window.location.hash}`

    return (
        <React.Fragment>
        </React.Fragment>
    );
}

export default PageRedirector;