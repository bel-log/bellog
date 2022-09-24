import { buildDefaultCustomHtmlElem, buildDefaultCustomParser, buildDefaultGlobalScript, buildDefaultGlobalStyle, buildDefaultProfile, buildDefaultView, buildDefaultViewMatch } from "./SetupFactories"
import { SetupProfileObject } from "./SetupInterfaces"



export function normalizeProfile(profile: SetupProfileObject): SetupProfileObject {
    const defaultProfile = buildDefaultProfile()
    const defaultStyle = buildDefaultGlobalStyle([])
    const defaultScript = buildDefaultGlobalScript([])
    const defaultCustomParser = buildDefaultCustomParser([])
    const defaultHtml = buildDefaultCustomHtmlElem([])
    const defaultView = buildDefaultView([])
    const defaultMatch = buildDefaultViewMatch([])
    let profileObj = profile
    profileObj = { ...defaultProfile, ...profileObj }
    profileObj.globalSettings = { ...defaultProfile.globalSettings, ...profileObj.globalSettings }
    profileObj.styles = profileObj.styles.map((it) => {
        return { ...defaultStyle, ...it }
    })
    profileObj.scripts = profileObj.scripts.map((it) => {
        return { ...defaultScript, ...it }
    })
    profileObj.parsers = profileObj.parsers.map((it) => {
        return { ...defaultCustomParser, ...it }
    })
    profileObj.html = profileObj.html.map((it) => {
        return { ...defaultHtml, ...it }
    })
    profileObj.views = profileObj.views.map((it) => {
        it.matchers = it.matchers.map((mit) => {
            return { ...defaultMatch, ...mit }
        })
        return { ...defaultView, ...it }
    })
    return profileObj
}