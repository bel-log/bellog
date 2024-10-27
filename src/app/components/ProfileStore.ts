import {proxy, subscribe, useSnapshot} from 'valtio'
import {SetupProfileObject} from "../setup/SetupInterfaces";

const baseProfile: SetupProfileObject = {
    actions: [],
    builders: [],
    driverSettings: undefined,
    driverType: undefined,
    globalSettings: undefined,
    html: [],
    parsers: [],
    profileName: "",
    scripts: [],
    setupVersion: "",
    styles: [],
    views: [],
    widgetGroups: []
}

export const profileStore = proxy(
    {
        profile: baseProfile,
        setProfile: (newProfile: SetupProfileObject) => {
            profileStore.profile = newProfile
        },
        getDriverSettings: () => {
            return profileStore.profile.driverSettings
        }
    },
)