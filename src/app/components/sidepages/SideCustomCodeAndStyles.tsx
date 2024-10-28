import * as React from "react";
import {
    buildDefaultGlobalScript,
} from "../../setup/SetupFactories";
import {useSnapshot} from "valtio";
import {profileStore} from "../ProfileStore";
import {CollapseCard} from "../CollapseCard";
import {GlobalScriptStyleSetup} from "../setup/GlobalScriptStyleSetup";
import { SetupGlobalScriptProperties, SetupGlobalStyleProperties} from "../../setup/SetupInterfaces";


export const SideCustomCodeAndStyles = () => {
    const profile = useSnapshot(profileStore.profile)
    const scripts = profile.scripts
    const styles = profile.styles

    const setScripts = (newVal: SetupGlobalScriptProperties[]) => {
        profileStore.profile.scripts = newVal
    }

    const setStyles = (newVal: SetupGlobalStyleProperties[]) => {
        profileStore.profile.styles = newVal
    }

    function addNewGlobalScript() {
        profileStore.profile.scripts = [...scripts, buildDefaultGlobalScript(scripts)]
    }

    function addNewGlobalStyle() {
        profileStore.profile.styles = [...styles, buildDefaultGlobalScript(styles)]
    }

    return (
        <React.Fragment>
            <h1 className="title">Custom Code and Styles</h1>
            <p>You can add .js scripts or .css styles that will be accessible by any cusotm parser, custom builder
                action, custom html component or match script. <br/>
                They are useful to customize html components or to add code or libraries used to parse a protocol. <br/>
                All scripts and style will be injected inside the head tag of the page.
            </p>
            <br/>
            <CollapseCard title="Global styles">
                {
                    styles.map(
                        (style, index) => {
                            return (
                                <GlobalScriptStyleSetup
                                    key={style.id}
                                    cfg={profileStore.profile.styles[index]}
                                    onDelete={() => setStyles(styles.filter((_val, n_index) => {
                                        return n_index != index
                                    }))}
                                />
                            )

                        }
                    )
                }
                <button className="button is-primary mt-4" onClick={() => addNewGlobalStyle()}>Add New</button>
            </CollapseCard>

            <CollapseCard title="Global scripts">
                {
                    scripts.map(
                        (gscript, index) => {
                            return (
                                <GlobalScriptStyleSetup
                                    key={gscript.id}
                                    cfg={profileStore.profile.scripts[index]}
                                    onDelete={() => setScripts(scripts.filter((_n_script, n_index) => {
                                        return n_index != index
                                    }))}
                                />
                            )

                        }
                    )
                }
                <button className="button is-primary mt-4" onClick={() => addNewGlobalScript()}>Add New</button>
            </CollapseCard>
        </React.Fragment>
    )
}
