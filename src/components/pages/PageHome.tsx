import * as React from "react";
import { createContext, useEffect, useState } from "react";
import ProfileSetup from "../setup/ProfileSetup";
import { DriverFactory } from "../../drivers/DriverFactory";
import { buildToolbarState, ToolbarContext } from "../Toolbar";
import { Driver, DriverOpenClose, DriverStatus, isDriverOpenClose } from "../../drivers/Driver";
import { SetupProfileObject } from "../../app/setup/SetupInterfaces";
import { ParserFactory } from "../../parsers/ParserFactory";
import { ViewFactory } from "../../view/ViewFactory";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../app/db/db";
import * as serialize from "serialize-javascript"
import CardItem from "../CardItem";
import { buildDefaultProfile } from "../../app/setup/SetupFactories";
import { useNavigate } from "react-router-dom";

export const PageHome = (props) => {

    const navigate = useNavigate()

    const [toolbarState, setToolbarState] = React.useContext(ToolbarContext)

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

    function editProfile(id: number) {
        navigate("/profile/" + id + "/setup")
    }

    function runProfile(id: number) {
        navigate("/profile/" + id + "/runtime")
    }

    return (
        <React.Fragment>
            <div className="is-flex is-flex-wrap-wrap is-align-items-stretch">
                {
                    profiles?.map((profile) => {
                        return <CardItem key={profile.id} title={profile.name} icon="fa-microchip" 
                        onClick={() => runProfile(profile.id)}
                        onDeleteClick={() => deleteProfile(profile.id)}
                        onEditClick={() => {editProfile(profile.id)}}/>

                    })
                }

                <CardItem title="Add New" icon="fa-plus" onClick={() => addNewProfile()}/>

            </div>
        </React.Fragment>

    );
}

export default PageHome;