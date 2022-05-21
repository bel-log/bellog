import * as React from 'react';
import {useEffect, useRef, useState, forwardRef, useImperativeHandle} from "react";


const CGPP485Renderer = forwardRef((props, ref) => {

    function onNewData(data: Uint8Array)
    {

    }

    useImperativeHandle(ref, () => ({
        render: (data: Uint8Array) => {
            onNewData(data)
        }
     }));

    return (
        <div>

        </div>
    );

});

export default CGPP485Renderer;