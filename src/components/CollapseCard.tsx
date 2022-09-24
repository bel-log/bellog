import * as React from "react";
import {useState} from "react";

export const CollapseCard = (props : {title: string, expanded?: boolean, 
    eyeIcon?:boolean, eyeOff?:boolean, 
    eyeClick?:(eyeOff: boolean) => void,
    deleteIcon?: boolean,
    deleteClick?:() => void,
    sortArrowIcon?:boolean,
    sortUpClick?:() => void,
    sortDownClick?:() => void,
    children: React.ReactNode}) => {

    const [isExpanded, setIsExpanded] = useState(props.expanded ?? false)

    function expand() {
        setIsExpanded(!isExpanded)
    }

    return (
        <div className="card is-fullwidth is-unselectable">
            <header className="card-header is-clickable"  onClick={() => expand()}>
                <p className="card-header-title">{props.title}</p>
                {
                    props.sortArrowIcon ? <a className="card-header-icon is-clickable" 
                    onClick={(e) => {e.stopPropagation(); setIsExpanded(false); props?.sortUpClick()}}>
                        <i className={`fa fa-arrow-up`} ></i> </a> : ""
                }
                {
                    props.sortArrowIcon ? <a className="card-header-icon is-clickable" 
                    onClick={(e) => {e.stopPropagation(); setIsExpanded(false); props?.sortDownClick()}}>
                        <i className={`fa fa-arrow-down`} ></i> </a> : ""
                }
                {
                    props.eyeIcon ? <a className="card-header-icon is-clickable" 
                    onClick={(e) => {e.stopPropagation(); props?.eyeClick(props.eyeOff ?? false)}}>
                        <i className={`fa ${(props.eyeOff) ? "fa-eye-slash" : "fa-eye" }`} ></i> </a> : ""
                }
                {
                    props.deleteIcon ? <a className="card-header-icon is-clickable has-text-danger" 
                    onClick={(e) => {e.stopPropagation(); props?.deleteClick()}}>
                        <i className={`fa fa-trash`} ></i> </a> : ""
                }
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