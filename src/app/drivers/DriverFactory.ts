import { Driver, DriverNames, DriverSettings } from "./Driver";
import { DriverBackendSerialPort, DriverBackendSerialPortDefaults, DriverBackendSerialPortParameters } from "./DriverBackendSerialPort";
import { DriverClipboard, DriverClipboardDefaults } from "./DriverClipboard";
import { DriverSerialPortWebSerial, DriverSerialPortWebSerialDefaults, DriverSerialPortWebSerialParameters } from "./DriverSerialportWebserial";

export class DriverFactory {

    static build(driver: DriverNames, settings: DriverSettings): Driver {
        switch (driver) {
            case DriverNames.DriverClipboard:
                return new DriverClipboard()
            case DriverNames.DriverSerialPortWebSerial:
                return new DriverSerialPortWebSerial(settings as DriverSerialPortWebSerialParameters)
            case DriverNames.DriverBackendSerialPort:
                return new DriverBackendSerialPort(settings as DriverBackendSerialPortParameters)
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
            case DriverNames.DriverBackendSerialPort:
                return DriverBackendSerialPortDefaults
            default:
                return DriverClipboardDefaults
        }
    }
}