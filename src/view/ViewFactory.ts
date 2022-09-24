import * as React from "react";
import { ActionProperties, SetupCustomBuilderProperties, SetupCustomHtmlProperties, ViewSetupProperties, WidgetGroupSetupProperties } from "../app/setup/SetupInterfaces";
import { Driver } from "../drivers/Driver";
import { Parser } from "../parsers/Parser";
import { CustomView } from "./CustomView";


export class ViewFactory {
    static build(driver: Driver,
        view: ViewSetupProperties,
        widgetGroups: WidgetGroupSetupProperties[],
        actions: ActionProperties[],
        customBuilders: SetupCustomBuilderProperties[],
        customHtmls: SetupCustomHtmlProperties[],
        refDiv: React.MutableRefObject<HTMLDivElement>,
        widgetRefDiv: React.MutableRefObject<HTMLDivElement>,
        maxItemPerPage: number) {
        return new CustomView(driver, view, widgetGroups, actions, customBuilders, customHtmls, refDiv, widgetRefDiv, maxItemPerPage)
    }
}