
import {Driver, DriverSettings} from "../../drivers/Driver";
import {View} from "../../view/View";

export interface Profile {
    name: string
    driver: Driver
    views: View[]
}