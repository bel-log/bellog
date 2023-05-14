import * as React from "react";

export const ImportPopup = (props: { isOpen: boolean, onSelect: (name: string, url: string) => void }) => {

    const isOpen = props.isOpen

    /* List is hardcoded to support csp */
    const sampleList = [
        {
            name: "Adb",
            url: "https://raw.githubusercontent.com/bel-log/bellog/master/samples/Adb/Adb_Sample.bll"
        },
        {
            name: "Generic App",
            url: "https://raw.githubusercontent.com/bel-log/bellog/master/samples/Generic%20App/App_Log_Template.bll"
        },
        {
            name: "Iot",
            url: "https://raw.githubusercontent.com/bel-log/bellog/master/samples/Iot/Iot_Log.bll"
        },
        {
            name: "JSON Lint",
            url: "https://raw.githubusercontent.com/bel-log/bellog/master/samples/JSON%20Lint/JSONLint.bll"
        },
        {
            name: "Serial Binary Protocol",
            url: "https://raw.githubusercontent.com/bel-log/bellog/master/samples/Serial%20Binary%20Protocol/Serial_Protocol.bll"
        }
    ]

    return (
        <div className={`modal ${isOpen ? "is-active" : ""}`}>
            <div className="modal-background"></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Import Sample</p>
                </header>
                <section className="modal-card-body">

                    <article className="panel is-primary">
                        {
                            sampleList.map((sample) => {
                                return (
                                    <a key={sample.name} className="panel-block" onClick={() => props.onSelect(sample.name, sample.url)}>
                                        <span className="panel-icon">
                                            <i className="fas fa-book" aria-hidden="true"></i>
                                        </span>
                                        {sample.name}
                                    </a>
                                )
                            })
                        }
                    </article>
                </section>
                <footer className="modal-card-foot">
                    <button className="button"
                        onClick={() => props.onSelect("", "")}>
                        Cancel
                    </button>
                </footer>
            </div>
        </div>

    )
}
