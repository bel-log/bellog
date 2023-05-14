import * as React from "react";
import { createContext, useEffect, useState } from "react";
import ProfileSetup from "../setup/ProfileSetup";
import { DriverFactory } from "../../drivers/DriverFactory";
import { buildToolbarState, ToolbarContext } from "../Toolbar";
import { Driver, DriverOpenClose, DriverStatus, isDriverOpenClose } from "../../drivers/Driver";
import { SetupProfileObject } from "../../setup/SetupInterfaces";
import { ParserFactory } from "../../parsers/ParserFactory";
import { ViewFactory } from "../../view/ViewFactory";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import * as serialize from "serialize-javascript"
import CardItem from "../CardItem";
import { buildDefaultProfile } from "../../setup/SetupFactories";
import { useNavigate } from "react-router-dom";
import { PROFILE_VERSION, VERSION } from "../../../Version";
import { ImportPopup } from "../ImportPopup";
import { isWebMode } from "../../utility/env";

export const PageHome = (props) => {

    const navigate = useNavigate()

    const [toolbarState, setToolbarState] = React.useContext(ToolbarContext)

    const [importOpen, setImportOpen] = useState(false)

    const profiles = useLiveQuery(async () => {
        return await db.profiles
            .toArray();
    });

    useEffect(() => {
        setToolbarState(
            buildToolbarState({
                clearButton: { isVisible: false },
                settingsButton: { isVisible: false },
                connectButton: { isVisible: false },
                more: [],
                title: "Home"
            })
        )
    }, [])

    async function addNewProfile() {
        try {

            // Add the new friend!
            const id = await db.profiles.add({
                name: "New Profile",
                path: "/",
                setup: serialize(buildDefaultProfile())
            });

        } catch (error) {
            console.log(`Failed to add ${name}: ${error}`);
        }
    }

    async function deleteProfile(id: number) {
        try {

            const ret = await db.profiles.delete(id)

        } catch (error) {
            console.log(`Failed to add ${name}: ${error}`);
        }
    }
    
    return (
        <React.Fragment>
            <div className="is-flex is-flex-wrap-wrap is-align-items-stretch">
                {
                    profiles?.map((profile) => {
                        return <CardItem key={profile.id} title={profile.name} icon="fa-microchip" 
                        editHref={`#/profile/${profile.id}/setup`}
                        profileHref={`#/profile/${profile.id}/runtime`}
                        onDeleteClick={() => deleteProfile(profile.id)}/>

                    })
                }

                <ImportPopup isOpen={importOpen} onSelect={async function (name:string, url: string): Promise<void> {
                    if(url !== "" && name !== "") {
                        const response = await fetch(url);
                        const text = await response.text();
                        await db.profiles.add({
                            name: name,
                            path: "/",
                            setup: text
                        });
                    }
                    setImportOpen(false)
                } }/>
                <CardItem title="Add New" icon="fa-plus" onClick={(e) => {e.stopPropagation();addNewProfile()}}/>
                <CardItem title="Import sample" icon="fa-upload" onClick={(e) => {setImportOpen(true)}}/>
                <div className="m-1 is-unselectable" style={{position: "fixed", bottom: 0, right: 0}}>{VERSION}</div>
            </div>
        </React.Fragment>

    );
}

export default PageHome;