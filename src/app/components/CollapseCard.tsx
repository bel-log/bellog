import * as React from "react";
import {useLayoutEffect, useState} from "react";

export const CollapseCard =  (props : {title: string, expanded?: boolean, 
    eyeIcon?:boolean, eyeOff?:boolean, 
    eyeClick?:(eyeOff: boolean) => void,
    deleteIcon?: boolean,
    deleteClick?:() => void,
    sortArrowIcon?:boolean,
    sortUpClick?:() => void,
    sortDownClick?:() => void,
    duplicateIcon?: boolean,
    duplicateClick?:() => void,
    children: React.ReactNode}) => {

    const ref = React.useRef<HTMLDivElement>()
    useLayoutEffect(() => {
        if(ref.current) {
            ref.current.getAnimations().forEach((anim) => {
                anim.cancel()
            })
        }
    })

    const [isExpanded, setIsExpanded] = useState(props.expanded ?? false)

    function expand() {
        setIsExpanded(!isExpanded)
    }

    function animate(up:boolean, onclick: () => void) {

        let obj1, obj2
        if(up) {
            obj1 = ref.current
            obj2 = ref.current.previousElementSibling
        } else {
            obj1 = ref.current.nextElementSibling
            obj2 = ref.current
        }
        if(obj1 === null || obj2 === null)
            return
        const anim = obj1.animate(
            [{ transform: `translateY(-${obj1.clientHeight}px)` }],
            {
                duration: 200,
                iterations: 1,
                fill: 'forwards'
            }
        )
        const anim2 =obj2.animate(
            [{ transform: `translateY(${obj2.clientHeight}px)` }],
            {
                duration: 200,
                iterations: 1,
                fill: 'forwards'
            }
        )
        anim.onfinish =(ev: AnimationPlaybackEvent) => {
            onclick()
        }
    }

    return (
        <div ref={ref} className="card is-fullwidth is-unselectable">
            <header className="card-header is-clickable"  onClick={() => expand()}>
                <p className="card-header-title">{props.title}</p>
                {
                    props.sortArrowIcon ? <a className="card-header-icon is-clickable" 
                    onClick={(e) => {
                            e.stopPropagation(); 
                            setIsExpanded(false); 

                            animate(true, () => {props?.sortUpClick()})
                        }}>
                        <i className={`fa fa-arrow-up`} ></i> </a> : ""
                }
                {
                    props.sortArrowIcon ? <a className="card-header-icon is-clickable" 
                    onClick={(e) => {
                            e.stopPropagation(); 
                            setIsExpanded(false); 
                            animate(false, () => {props?.sortDownClick()})
                        }}>
                        <i className={`fa fa-arrow-down`} ></i> </a> : ""
                }
                {
                    props.duplicateIcon ? <a className="card-header-icon is-clickable" 
                    onClick={(e) => {e.stopPropagation(); props?.duplicateClick()}}>
                        <i className={`fa fa-copy`} ></i> </a> : ""
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
            {
                <div className={`card-content ${isExpanded ? "": "is-hidden"}`}>
                    <div>
                        {props.children}
                    </div>
                </div> 
            }
        </div>
    )
}