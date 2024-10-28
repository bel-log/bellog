import * as React from "react";
import {
    buildDefaultCustomBuilder,
    buildDefaultCustomParser
} from "../../setup/SetupFactories";
import {useSnapshot} from "valtio";
import {profileStore} from "../ProfileStore";
import {CollapseCard} from "../CollapseCard";
import {CustomParsersSetup} from "../setup/CustomParsersSetup";
import {CustomBuildersSetup} from "../setup/CustomBuildersSetup";
import { SetupCustomBuilderProperties, SetupCustomParserProperties} from "../../setup/SetupInterfaces";


export const SideCustomParserAndBuilders = () => {

    const profile = useSnapshot(profileStore.profile)
    const [parsers, setParsers] = [profile.parsers, (newVal: SetupCustomParserProperties[]) => {
        profileStore.profile.parsers = newVal
    }]
    const [builders, setBuilders] = [profile.builders, (newVal: SetupCustomBuilderProperties[])  => {
        profileStore.profile.builders = newVal
    }]


    function addNewCustomParser() {
        setParsers([...parsers, buildDefaultCustomParser(parsers)])
    }

    function addNewCustomBuilder() {
        setBuilders([...builders, buildDefaultCustomBuilder(builders)])
    }

    return (
        <React.Fragment>
            <h1 className="title">Custom Parsers and Builders</h1>
            <p>A parser contains the code to parse the data received from the driver.<br/>
                For example CRC calculations, matching command code, base64 deconding and so on.<br/>
                A builder instead takes data from an Action and sends it. <br/>
            </p>
            <br/>
            <CollapseCard title="Custom parsers">
                {
                    parsers.map(
                        (parser, index) => {
                            return (
                                <CustomParsersSetup
                                    key={parser.id}
                                    cfg={profileStore.profile.parsers[index]}
                                    onDelete={() => setParsers(parsers.filter((_val, n_index) => {
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
                                    cfg={profileStore.profile.builders[index]}
                                    onDelete={() => setBuilders(builders.filter((_val, n_index) => {
                                        return n_index != index
                                    }))}
                                />
                            )

                        }
                    )
                }
                <button className="button is-primary mt-4" onClick={() => addNewCustomBuilder()}>Add New</button>
            </CollapseCard>
        </React.Fragment>
    )
}
