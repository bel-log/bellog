import * as React from "react";
import {
    createContext, useEffect,
    useState
} from "react";
import * as serialize from "serialize-javascript"
import ProfileSetup from "../setup/ProfileSetup";
import { buildToolbarState, ToolbarContext } from "../Toolbar";
import { DriverNames } from "../../drivers/Driver";
import { SetupProfileObject } from "../../setup/SetupInterfaces";
import { buildDefaultGlobalStyle, buildDefaultProfile } from "../../setup/SetupFactories";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import { useParams } from "react-router-dom";
import { normalizeProfile } from "../../setup/SetupNormalizer";
import { checkVersionForRedirection } from "../../../Version";
import { SetupSideBarItems, SetupSiedBar } from "../SetupSideBar";

export const PageProfileSetup = () => {

    const [toolbarState, setToolbarState] = React.useContext(ToolbarContext)

    // Used to update the ProfileSetup on loading of new profile
    const [tmpKeyId, setTmpKeyId] = useState(0)

    const [tmpProfile, setTmpProfile] = useState<SetupProfileObject>(null)

    const { profileId } = useParams()

    const [sideBarItem, setSideBarItem] = useState(SetupSideBarItems.MainSettings)

    const notificationRef = React.useRef(null)

    useLiveQuery(async () => {
        let profile = await db.profiles.get(parseInt(profileId))

        const profileObj = normalizeProfile(JSON.parse(profile.setup) as SetupProfileObject)
        checkVersionForRedirection(profileObj.setupVersion)
        setTmpProfile(profileObj)
    });

    async function saveProfile() {
        try {
            let id = parseInt(profileId)
            let res = await db.profiles.update(id, {
                name: tmpProfile.profileName,
                setup: JSON.stringify(tmpProfile)
            })

            if (notificationRef.current) {
                notificationRef.current.style.animationName = "none";

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        notificationRef.current.style.animationName = ""
                    }, 0);
                })
            }

        } catch (e) {
            console.log(`Failed to save profile`);
        }
    }

    function exportProfile() {
        const a = document.createElement('a');
        a.download = (tmpProfile as SetupProfileObject).profileName + ".bll";
        a.href = URL.createObjectURL(new Blob([JSON.stringify(tmpProfile)], { type: 'text/plain' }));
        a.click();
        URL.revokeObjectURL(a.href)
    }

    function loadProfile(e) {
        let fileInput = e.target
        let file = fileInput.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function (e) {
                setTmpProfile(normalizeProfile(JSON.parse(reader.result as string)))
                // Force element update (profile prop is read only on first render)
                setTmpKeyId(tmpKeyId + 1)
            }
            reader.readAsText(file);
            fileInput.value = ""
        } else {

        }
    }

    useEffect(() => {
        setToolbarState(
            buildToolbarState({
                clearButton: { isVisible: false },
                settingsButton: { isVisible: false },
                connectButton: { isVisible: false },
                more: [],
                title: "Profile"
            })
        )

        notificationRef.current.style.animationName = "none";
    }, [])

    useEffect(() => {
        const saveShortcutListener = async (evt) => {
            if ((evt.key === 's' || evt.key === 'S') && evt.ctrlKey) {
                saveProfile()
                evt.preventDefault()
            }
        }
        document.addEventListener('keydown', saveShortcutListener);

        return () => {
            document.removeEventListener('keydown', saveShortcutListener)
        }
    }, [tmpProfile])

    return (
        <React.Fragment>
            <div className="columns is-gapless" style={{height: "100%"}}>
                <SetupSiedBar
                    onSelect={(name) => setSideBarItem(name)}
                />
                <div className="column" style={{ overflow: "auto" }}>
                    {
                        tmpProfile ? <div className="p-2">
                            <ProfileSetup key={tmpKeyId} profile={tmpProfile}
                                sideBarItem={sideBarItem}
                                onConfigUpdate={(newData) => {
                                    setTmpProfile({ ...tmpProfile, ...newData })
                                }}
                            />

                            <button className="button is-success mt-4" onClick={() => { saveProfile() }}>Save</button>

                            <div className="field is-grouped mt-4">
                                <div className="control">
                                    <div className="file is-primary" onClick={() => exportProfile()}>
                                        <label className="file-label">

                                            <span className="file-cta">
                                                <span className="file-icon">
                                                    <i className="fas fa-download"></i>
                                                </span>
                                                <span className="file-label">
                                                    Export profile
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div className="control">
                                    <div className="file is-primary">
                                        <label className="file-label">
                                            <input className="file-input" type="file" name="import" accept=".bll" onChange={(e) => loadProfile(e)} />
                                            <span className="file-cta">
                                                <span className="file-icon">
                                                    <i className="fas fa-upload"></i>
                                                </span>
                                                <span className="file-label">
                                                    Import profile
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div> : ""

                    }
                    <div ref={notificationRef} className="fadeNotification notification is-success">
                        Profile updated successfully!
                    </div>
                </div>
            </div>


        </React.Fragment>


    );
}

export default ProfileSetup;