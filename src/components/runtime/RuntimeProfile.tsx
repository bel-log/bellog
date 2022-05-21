import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { DriverFactory } from "../../drivers/DriverFactory";
import { SetupProfileObject } from "../../app/setup/SetupInterfaces";
import { embeddedHtmlComponents } from "../../app/setup/SetupDefaults";
import RuntimeProfileView from "./RuntimeProfileView";
import { DriverOpenClose, DriverStatus, isDriverOpenClose } from "../../drivers/Driver";
import { Observable } from "../../utility/Observable";

export const RuntimeProfile = (props: { profile: SetupProfileObject }) => {

    const profile = props.profile
    const views = props.profile?.views ?? []
    const htmls = [...profile.html, ...embeddedHtmlComponents]

    const [selectedView, setSelectedView] = useState(0)
    const [tmpKey, setTmpKey] = useState(0)

    const dataObserver = useMemo(() => {
        return new Observable()
    }, [])

    const driver = useMemo(() => {
        return DriverFactory.build(profile.driver)
    }, [])

    useEffect(() => {
              // set scripts
              let script = document.createElement('script');
              script.type = 'text/javascript';
              script.innerHTML = "try {" +
                  profile.scripts?.map((script) => {
                      return script.code
                  }).join("\r\n")
                  + "} catch(e) {}";
      
              document.head.appendChild(script);
      
              // set style
              let style = document.createElement('style');
              style.innerHTML = profile.styles?.map((style) => {
                  return style.code
              }).join("\r\n")
      
              document.head.appendChild(style);

              driver.onReceive((data) => {
                dataObserver.notify(data)
              })
    
      return () => {
            // onDestroy
            if (isDriverOpenClose(driver)) {
                const driverOpenClose = driver as DriverOpenClose
                driverOpenClose.close()
            }
            driver.destroy()
      }
    }, [])
    

    function connectButtonOnClick(driver: DriverOpenClose) {
        if (driver.status === DriverStatus.CLOSE) {
            driver.open()
        } else {
            driver.close()
        }
    }

    function clearButtononClick() {
        if(profile.globalSettings.shareDataBetweenViews) {
            // Delete all other views
            setTmpKey(tmpKey+1)
        }
    }

    return (
        <React.Fragment key={tmpKey}>
            <div>
                <div className="tabs is-boxed pt-1 pl-1">
                    <ul>
                        {
                            views.map((val, index) => {
                                return <li key={index} className={`${selectedView === index ? "is-active" : ""}`}
                                    onClick={() => { setSelectedView(index) }}><a>{val.name}</a></li>
                            })
                        }
                    </ul>

                </div>
            </div>
            {
                views.map((val, index) => {
                    return <div key={index}
                        className={`p-1 ${selectedView === index ? "" : "is-hidden"}`} style={{ whiteSpace: val.autoWrap ? "normal" : "nowrap" }}>
                            <RuntimeProfileView 
                            driver={driver} view={views[index]} profile={profile} selected={selectedView == index}
                            dataObserver={dataObserver}
                            onConnectClick={() => {connectButtonOnClick(driver as DriverOpenClose)}}
                            onClearClick={() => {clearButtononClick()}}/>
                    </div>
                })
            }
        </React.Fragment>

    );
}

export default RuntimeProfile;
