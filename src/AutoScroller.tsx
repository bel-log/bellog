import * as React from "react";
import {Property} from "csstype";
import {useEffect, useState} from "react";

interface AutoScrollerProperties {
    deps: any[]
}

const AutoScroller = (props : AutoScrollerProperties) => {
    const divRef = React.useRef(null);
    const [enableAutoScrollBottom, setEnableAutoScrollBottom] = useState(true)
    const [lastScrollTop, setLastScrollTop] = useState(0)

    useEffect(() => {
        if(enableAutoScrollBottom) {
            divRef.current.scrollIntoView()
        }
    }, [props.deps]);

    useEffect(() => {
        document.addEventListener('scroll', function (e) {
            var st = document.documentElement.scrollTop
            if (st > lastScrollTop){
                // downscroll code
                if ((document.documentElement.scrollTop + 50) >= (document.documentElement.scrollHeight - document.documentElement.clientHeight)) {
                    setEnableAutoScrollBottom(true)
                }
            } else {
                // upscroll code
                setEnableAutoScrollBottom(false)
            }
            setLastScrollTop(st <= 0 ? 0 : st); // For Mobile or negative scrolling
        });

    })

    return (
        <div ref={divRef}></div>
    );
};

export default AutoScroller;