import * as React from "react";
import { getCookie, setCookie } from 'typescript-cookie'


export const PageDiscaimer = (props) => {

    const [modelIsOpen, setModelIsOpen] = React.useState(true);

    return (
        <div className={`modal ${modelIsOpen ? "is-active" : ""}`}>
        <div className="modal-background"></div>
        <div className="modal-card">
            <header className="modal-card-head">
                <p className="modal-card-title">Security Considerations</p>
                <button className="delete" aria-label="close"
                    onClick={() => setModelIsOpen(false)}></button>
            </header>
            <section className="modal-card-body">
                Before using Bellog read the <a href="https://github.com/bel-log/bellog/blob/master/documentation/SecurityConsiderations.md">Security consideration</a><br/>
                By accepting here you agree that you have read and understood the security considerations and that you will use Bellog at your own risk. <br></br>
                Bellog is not responsible for any damage caused by bugs, missing protections or mistake in documentation included the above mentioned security considerations.
            </section>
            <footer className="modal-card-foot">
                <button className="button is-success"
                    onClick={() => {
                        setCookie("securityDiscalimerAccepted", "true", { expires: 365 })
                        setModelIsOpen(false)
                        location.reload();
                    }}>
                    Accept
                </button>
                <button className="button"
                    onClick={() => setModelIsOpen(false)}>
                    Cancel
                </button>
            </footer>
        </div>
    </div>

    );
}

export default PageDiscaimer;