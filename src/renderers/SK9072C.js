import * as React from 'react';
import { useState, useEffect } from 'react';
import stringify from "json-stringify-pretty-compact";
import JsonDiv from "./generic/matchrenderer/JsonDiv";

class CcapiMsg
{
    constructor(name, svc, ruid)
    {
        this.name = name
        this.svc = svc
        this.ruid = ruid
    }
}

function hexStringToByteArray(hexString) {
    if (hexString.length % 2 !== 0) {
      throw "Must have an even number of hex digits to convert to bytes";
    }
    var numBytes = hexString.length / 2;
    var byteArray = new Uint8Array(numBytes);
    for (var i = 0; i < numBytes; i++) {
      byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return byteArray;
  }

  function buf2hex(buffer) { // buffer is an ArrayBuffer
    return buffer
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
  }

  function my_replacer(key, value) {
    if (value instanceof Uint8Array) {
        return buf2hex(value);
    }
    return value;
  }

function getNiceJson(obj)
{
    return stringify(obj, {
        replacer: my_replacer
    })
}

var svcCache = []

function getSvcName(decode)
{
    var associatedMSG = svcCache.find(
        elem => elem.ruid == decode.ruid
    )
    var svcName
    if(associatedMSG === undefined || associatedMSG === null)
    {
        if(decode.svc !== undefined || decode.svc !== null)
        {
            svcName = decode.svc
            svcCache.push(
                new CcapiMsg("mqtt", decode.svc, decode.ruid)
            )
        }
        else
        {
            svcName = "???"
        }
    }
    else
    {
        svcCache = svcCache.filter( elem => elem.ruid != decode.ruid)
        svcName = associatedMSG.svc
    }

    return svcName
}

const matcher = {
    build: () => {
        return [
            {
                regex: /MQTT CCAPI RECV:/gm,
                groupup: false,
                build: (data) => {
                    try {
                        var cborhexstr = data
                            .replace("MQTT CCAPI RECV: ", "")
                            .match(/[a-z0-9]+/img)[0]
                        var cborarray = hexStringToByteArray(cborhexstr)
                        var decode = CBOR.decode(cborarray.buffer)

                        return React.createElement(JsonDiv, {
                            title: "MQTT CCAPI RECV" + "   " + getSvcName(decode),
                            jsonString: getNiceJson(decode)
                        }, null);
                    }
                    catch (e) {
                        return React.createElement('div', {
                            style: {
                                color: "red"
                            }
                        }, data);
                    }
                }
            },
            {
                regex: /MQTT CCAPI SEND:/gm,
                groupup: false,
                build: (data) => {
                    try {
                        var cborhexstr = data
                            .replace("MQTT CCAPI SEND: ", "")
                            .match(/[a-z0-9]+/img)[0]
                        var cborarray = hexStringToByteArray(cborhexstr)
                        var decode = CBOR.decode(cborarray.buffer)

                        return React.createElement(JsonDiv, {
                            title: "MQTT CCAPI SEND" + "   " + getSvcName(decode),
                            jsonString: getNiceJson(decode)
                        }, null);

                    }
                    catch (e) {
                        return React.createElement('div', {
                            style: {
                                color: "red"
                            }
                        }, data);
                    }
                }
            },
            {
                regex: /FILE CCAPI RECV:/gm,
                groupup: false,
                build: (data) => {
                    try {
                        var cborhexstr = data
                            .replace("FILE CCAPI RECV: ", "")
                            .match(/[a-z0-9]+/img)[0]
                        var cborarray = hexStringToByteArray(cborhexstr)
                        var decode = CBOR.decode(cborarray.buffer)

                        return React.createElement(JsonDiv, {
                            title: "FILE CCAPI RECV",
                            jsonString: getNiceJson(decode)
                        }, null);

                    }
                    catch (e) {
                        return React.createElement('div', {
                            style: {
                                color: "red"
                            }
                        }, data);
                    }
                }
            },
            {
                regex: /FILE CCAPI SEND:/gm,
                groupup: false,
                build: (data) => {
                    try {
                        var cborhexstr = data
                            .replace("FILE CCAPI SEND: ", "")
                            .match(/[a-z0-9]+/img)[0]
                        var cborarray = hexStringToByteArray(cborhexstr)
                        var decode = CBOR.decode(cborarray.buffer)

                        return React.createElement(JsonDiv, {
                            title: "FILE CCAPI SEND",
                            jsonString: getNiceJson(decode)
                        }, null);
                    }
                    catch (e) {
                        return React.createElement('div', {
                            style: {
                                color: "red"
                            }
                        }, data);
                    }
                }
            },
            {
                regex: /TCP CCAPI RECV:/gm,
                groupup: false,
                build: (data) => {
                    try {
                        var b64 = data.replace("TCP CCAPI RECV: ", "")
                        var cborarray = Buffer.from(b64, 'base64');
        
                        var decode = CBOR.decode(new Uint8Array(cborarray).buffer)

                        return React.createElement(JsonDiv, {
                            title: "TCP CCAPI RECV",
                            jsonString: getNiceJson(decode)
                        }, null);

                    }
                    catch (e) {
                        return React.createElement('div', {
                            style: {
                                color: "red"
                            }
                        }, data);
                    }
                }
            },
            {
                regex: /TCP CCAPI SEND:/gm,
                groupup: false,
                build: (data) => {
                    try {
                        var b64 = data.replace("TCP CCAPI SEND: ", "")
                        var cborarray = Buffer.from(b64, 'base64');
                        var decode = CBOR.decode(new Uint8Array(cborarray).buffer)

                        return React.createElement(JsonDiv, {
                            title: "TCP CCAPI SEND",
                            jsonString: getNiceJson(decode)
                        }, null);

                    }
                    catch (e) {
                        return React.createElement('div', {
                            style: {
                                color: "red"
                            }
                        }, data);
                    }
                }
            },
            {
                regex: /^(?!.*CCAPI_ERR_CODE_NO_ERROR).*ERROR.*$/gmi,
                groupup: false,
                build: (data) => {
                    return React.createElement('div', {
                        style: {
                            color: "red"
                        }
                    }, data);
                }
            },
            {
                name: "ccapi",
                regex: /ccapi\.c/gmi,
                groupup: true,
                groupstate: useState([]),
                build: (data) => {
                    return React.createElement('div',null, data);
                }
            },
            {
                name: "sys",
                regex: /sys\_task\.c/gmi,
                groupup: true,
                groupstate: useState([]),
                build: (data) => {
                    return React.createElement('div', {
                        style: {
                            color: "chocolate"
                        }
                    }, data);
                }
            },
            {
                name: "port_firpol",
                regex: /ccapi_port_firpol\.c/gmi,
                groupup: true,
                groupstate: useState([]),
                build: (data) => {
                    return React.createElement('div', null, data);
                }
            },
            {
                name: "port_port_log",
                regex: /ccapi_port_log\.c/gmi,
                groupup: true,
                groupstate: useState([]),
                build: (data) => {
                    return React.createElement('div', null, data);
                }
            },
            {
                name: "teltonika",
                regex: /teltonika\.c/gmi,
                groupup: true,
                groupstate: useState([]),
                build: (data) => {
                    return React.createElement('div', null, data);
                }
            }
        ]
    }
}


export default matcher;