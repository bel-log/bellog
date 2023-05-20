import * as React from "react";

export enum SetupSideBarItems {
    MainSettings = "MainSettings",
    View = "View",
    CustomHtmlComponents = "CustomHtmlComponents",
    CustomParserAndBuilders = "CustomParserAndBuilders",
    Actions = "Actions",
    CustomCodeAndStyles = "CustomCodeAndStyles",
    OtherSettings = "OtherSettings"
}

export const SetupSiedBar = (props: { onSelect?: (name: SetupSideBarItems) => void }) => {

    return (
        <div className="column is-flex is-flex-direction-column 
                    is-align-items-center is-justify-content-space-between has-background-color-primary-plus " 
            style={{width: "60px", flex: "none"}}>
            <span className={`mt-5 has-tooltip-right icon is-large is-clickable has-text-white	`}
                data-tooltip="Main settings" onClick={() => props.onSelect && props.onSelect(SetupSideBarItems.MainSettings)}>
                <i className="fas fa-lg fa-address-card "></i>
            </span>

            <span className={`has-tooltip-right icon is-large is-clickable has-text-white	`}
                data-tooltip="View" onClick={() => props.onSelect && props.onSelect(SetupSideBarItems.View)}>
                <i className="fas fa-lg fa-mountain-sun "></i>
            </span>

            <span className={`has-tooltip-right icon is-large is-clickable has-text-white	`}
                data-tooltip="Custom Html Components" onClick={() => props.onSelect && props.onSelect(SetupSideBarItems.CustomHtmlComponents)}>
                <i className="fas fa-lg fa-pencil "></i>
            </span>

            <span className={`has-tooltip-right icon is-large is-clickable has-text-white	`}
                data-tooltip="Custom Parser and Builders" onClick={() => props.onSelect && props.onSelect(SetupSideBarItems.CustomParserAndBuilders)}>
                <i className="fas fa-lg fa-oil-well "></i>
            </span>

            <span className={`has-tooltip-right icon is-large is-clickable has-text-white	`}
                data-tooltip="Actions" onClick={() => props.onSelect && props.onSelect(SetupSideBarItems.Actions)}>
                <i className="fas fa-lg fa-bolt"></i>
            </span>

            <span className={`has-tooltip-right icon is-large is-clickable has-text-white	`}
                data-tooltip="Custom Code and Styles" onClick={() => props.onSelect && props.onSelect(SetupSideBarItems.CustomCodeAndStyles)}>
                <i className="fas fa-lg fa-code "></i>
            </span>

            <span className={`mb-5 has-tooltip-right icon is-large is-clickable has-text-white	`}
                data-tooltip="Other Settings" onClick={() => props.onSelect && props.onSelect(SetupSideBarItems.OtherSettings)}>
                <i className="fas fa-lg fa-gear "></i>
            </span>
        </div>
    )
}
