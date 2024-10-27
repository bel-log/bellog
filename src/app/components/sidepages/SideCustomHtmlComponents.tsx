import * as React from "react";
import {buildDefaultCustomHtmlElem} from "../../setup/SetupFactories";
import {useSnapshot} from "valtio";
import {profileStore} from "../ProfileStore";
import {CollapseCard} from "../CollapseCard";
import {CollpaseGroup} from "../CollapseGroup";
import {CustomHtmlComponentSetup} from "../setup/CustomHtmlComponentSetup";


export const SideCustomHtmlComponents = () => {

    const profile = useSnapshot(profileStore.profile)
    const htmlElems = profile.html

    const setHtmlElems = (newArray: any[]) => { profileStore.profile.html = newArray}

    function addNewCustomHtmlComponent() {
        profileStore.profile.html = [...htmlElems, buildDefaultCustomHtmlElem(htmlElems)]
    }


    return (
        <React.Fragment>
            <h1 className="title">Custom Html Components</h1>
            <p>Data received is always displayed on the runtime as html object.<br/>
                It is often necessary to create your own visual object to display data according to your needs.<br/>
                Bellog embeds the <a href="https://bulma.io/documentation/">Bulma CSS framework</a>, so good-looking object can be easily achieve by checking out the framework examples.<br/>
            </p><br/>
            <p>
                Html code supports expressions like {"${myJsFunc()}"}<br/>
                Variables with two leading {"$$"} are special Bellog's bindings to replace with incoming data received and parsed
            </p>
            <br/>
            <CollapseCard title="Custom Html Components">
                <CollpaseGroup array={htmlElems} deleteIcon
                               getTitle={(index) => htmlElems[index].name}
                               getId={(index) => htmlElems[index].id}
                               setNewArray={(array) => { setHtmlElems(array) }}
                >
                    {
                        (htmlelem, index) => (
                            <CustomHtmlComponentSetup
                                key={htmlelem.id}
                                cfg={profileStore.profile.html[index]}
                            />
                        )
                    }
                </CollpaseGroup>
                <button className="button is-primary mt-4" onClick={() => addNewCustomHtmlComponent()}>Add New</button>
            </CollapseCard>
        </React.Fragment>
    )
}
