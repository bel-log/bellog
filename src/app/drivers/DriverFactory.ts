import { Driver, DriverNames, DriverSettings } from "./Driver";
import { DriverClipboard, DriverClipboardDefaults } from "./DriverClipboard";
import { DriverSerialPortWebSerial, DriverSerialPortWebSerialDefaults, DriverSerialPortWebSerialParameters } from "./DriverSerialportWebserial";
import { DriverAdbLogcat, DriverAdbLogcatDefaults, DriverAdbLogcatParameters } from "./DriverAdbLogcat";
import { DirverLoggerDecorator } from "./DirverLoggerDecorator";
import { DriverWebSockify, DriverWebSockifyDefaults, DriverWebSockifyParameters } from "./DriverWebSockify";
import { DriverFileRead, DriverFileReadDefaults } from "./DriverFileRead";

export class DriverFactory {

    static build(driver: DriverNames, settings: DriverSettings): Driver {
        switch (driver) {
            case DriverNames.DriverClipboard:
                return new DriverClipboard()
            case DriverNames.DriverSerialPortWebSerial:
                return new DirverLoggerDecorator(new DriverSerialPortWebSerial(settings as DriverSerialPortWebSerialParameters))
            case DriverNames.DriverAdbLogcat:
                return new DirverLoggerDecorator(new DriverAdbLogcat(settings as DriverAdbLogcatParameters))
            case DriverNames.DriverWebSockify:
                return new DirverLoggerDecorator(new DriverWebSockify(settings as DriverWebSockifyParameters))
            case DriverNames.DriverFileRead:
                return new DriverFileRead()
            default:
                return new DriverClipboard()
        }
    }

    static getDefaultParams(driverName: string): DriverSettings {
        switch (driverName) {
            case DriverNames.DriverClipboard:
                return DriverClipboardDefaults
            case DriverNames.DriverSerialPortWebSerial:
                return DriverSerialPortWebSerialDefaults
            case DriverNames.DriverAdbLogcat:
                return DriverAdbLogcatDefaults
            case DriverNames.DriverWebSockify:
                return DriverWebSockifyDefaults
            case DriverNames.DriverFileRead:
                return DriverFileReadDefaults
            default:
                return DriverClipboardDefaults
        }
    }
}