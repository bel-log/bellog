import * as React from "react";

export const CardItem = (props : {title: string, icon: string, onClick?: (e) => void, profileHref?: string, editHref?: string, onDeleteClick?: () => void}) => {

    return (
        <div className="column is-narrow">
            <div className="card" style={{ width: "12.5rem" }}>
                <a className="card-header"  href={props.profileHref ?? "#"} onClick={props?.onClick}>
                    <p className="card-header-title">
                        {props.title}
                    </p>
                </a>
                <div className="is-flex is-justify-content-center is-align-items-center is-flex-direction-column" style={{ height: "11.875rem" }} >
                    <a className="is-flex-grow-1 is-flex is-justify-content-center is-align-items-center" 
                        style={{ aspectRatio: "4/3", width:"100%", color: "inherit" }}  href={props.profileHref ?? "#"} onClick={props?.onClick}>
                        <i className={`fas fa-8x ${props.icon}`}></i>
                    </a>
                    {
                        (props.editHref || props.onDeleteClick) ?
                            <div className="card-footer" style={{ height: "2.50rem", width: "100%" }}>
                                {
                                    (props.editHref) ?
                                        <a className="card-footer-item" href={props.editHref}>Edit</a> : ""
                                }
                                {
                                    (props.onDeleteClick) ?
                                        <a className="card-footer-item" onClick={(e) =>  {e.stopPropagation();props.onDeleteClick();}}>Delete</a> : ""
                                }
                            </div> : ""
                    }

                </div>
            </div>
        </div>

    );
}

export default CardItem;