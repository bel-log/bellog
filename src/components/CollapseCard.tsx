import * as React from "react";
import {useState} from "react";

export const CollapseCard = (props : {title: string, expanded?: boolean, children: React.ReactNode}) => {

    const [isExpanded, setIsExpanded] = useState(props.expanded ?? false)

    function expand() {
        setIsExpanded(!isExpanded)
    }

    return (
        <div className="card is-fullwidth">
            <header className="card-header is-clickable"  onClick={() => expand()}>
                <p className="card-header-title">{props.title}</p>
                <a className="card-header-icon card-toggle">
                    <i className="fa fa-angle-down" ></i>
                </a>
            </header>
            <div className={`card-content ${isExpanded ? "" : "is-hidden"}`}>
                <div>
                    {props.children}
                </div>
            </div>
        </div>
    )
}