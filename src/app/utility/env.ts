import { DriverNames } from "../drivers/Driver";

declare const BACKEND_MODE: boolean;

export default function isDriverAllowedInWebMode(driverName: DriverNames): boolean {
    return true;//(driverName.toLowerCase().indexOf("backend") < 0 || BACKEND_MODE)
}