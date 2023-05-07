export interface ToolbarInterface {
    title: string
    connectButton: ToolbarInterfaceButton
    autoScrollDownButton: ToolbarInterfaceButton
    clearButton: ToolbarInterfaceButton
    logButton: ToolbarInterfaceButton
    settingsButton: ToolbarInterfaceButton
    more: Array<{title: string, list: Array<{title: string, onClick: () => {}}>}>
}

export interface ToolbarInterfaceButton {
    isVisible: boolean
    active: boolean
    onClick?: () => {}
}