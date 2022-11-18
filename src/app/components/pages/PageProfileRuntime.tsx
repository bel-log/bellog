import * as React from "react";
import {createContext, useEffect, useState} from "react";
import ProfileSetup from "../setup/ProfileSetup";
import {DriverFactory} from "../../drivers/DriverFactory";
import {buildToolbarState, ToolbarContext} from "../Toolbar";
import {Driver, DriverOpenClose, DriverStatus, isDriverOpenClose} from "../../drivers/Driver";
import {SetupProfileObject} from "../../setup/SetupInterfaces";
import {ParserFactory} from "../../parsers/ParserFactory";
import { ViewFactory } from "../../view/ViewFactory";
import { db } from "../../db/db";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import RuntimeProfile from "../runtime/RuntimeProfile";
import { normalizeProfile } from "../../setup/SetupNormalizer";
import { checkVersionForRedirection } from "../../../Version";



export const PageProfileRuntime = () => {

    const [keyId, setKeyId] = useState(0)

    const [toolbarState, setToolbarState] = React.useContext(ToolbarContext)

    const { profileId } = useParams()

    let tmpKeyId = keyId
    const profile = useLiveQuery(async () => {
        let tmpProfile = await db.profiles.get(parseInt(profileId))

        const profileObj = normalizeProfile(JSON.parse(tmpProfile.setup) as SetupProfileObject)
        checkVersionForRedirection(profileObj.setupVersion)
        // Re-build runtime if profile changes
        setKeyId(++tmpKeyId)
       return normalizeProfile(profileObj)
    }, []);

    return (
        <React.Fragment>
        {
            profile ?
            <RuntimeProfile key={keyId} profile={profile}/> : ""
        }
        </React.Fragment>
    );
}

export default PageProfileRuntime;