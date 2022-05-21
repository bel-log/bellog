import * as React from "react";

export const CardItem = (props : {title: string, icon: string, onClick?: () => void, onEditClick?: () => void, onDeleteClick?: () => void}) => {

    return (
        <div className="column is-narrow is-clickable" onClick={() => props?.onClick?.()}>
            <div className="card" style={{ width: "12.5rem" }}>
                <header className="card-header">
                    <p className="card-header-title">
                        {props.title}
                    </p>
                </header>
                <div className="is-flex is-justify-content-center is-align-items-center is-flex-direction-column" style={{ height: "11.875rem" }}>
                    <div className="is-flex-grow-1 is-flex is-justify-content-center is-align-items-center" style={{ aspectRatio: "4/3", width:"100%" }}>
                        <i className={`fas fa-8x ${props.icon}`}></i>
                    </div>
                    {
                        (props.onEditClick || props.onDeleteClick) ?
                            <div className="card-footer" style={{ height: "2.50rem", width: "100%" }}>
                                {
                                    (props.onEditClick) ?
                                        <a className="card-footer-item" onClick={(e) => {e.stopPropagation();props.onEditClick();}}>Edit</a> : ""
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