import { usePropagator, useStateWithCallback } from "../../utility/customHooks";
import * as React from "react";
import { DriverAdbLogcatParameters } from "../../drivers/DriverAdbLogcat";

export const DriverAdbLogcatSetup = (props: { cfg: DriverAdbLogcatParameters, onConfigUpdate: any }) => {

    const [p, applyCache] = usePropagator<DriverAdbLogcatParameters>(props.cfg, props.onConfigUpdate)

    const [clearLogAtConnection, setClearLogAtConnection] = [p.clearLogAtConnection.val, p.clearLogAtConnection.set]

    return (
        <React.Fragment>


            <div className="field">
                <div className="control">
                    <label className="checkbox">
                        <input type="checkbox" checked={clearLogAtConnection} onChange={(evt) => { setClearLogAtConnection(evt.target.checked) }}></input>
                        &nbsp;Clear Log At Connection
                    </label>
                </div>
            </div>



        </React.Fragment>

    )
}
