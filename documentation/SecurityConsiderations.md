# Security Considerations

Bellog does not send data to any server, all streams are processed locally.

However to run bellog relies heavily on runtime evaluation of javascript code.
If you are using thid-party bellog proejcts (.bll files) this can be dangerous since a malicious project may inject bad code
depending on browser vulnerabilities.

Basic protection agains thid-party script that may send private data to their server or inject malicous data to your device
is provided via a csp policy in page header

```
<meta http-equiv="Content-Security-Policy" content="default-src ws: localhost:* 'self' 'unsafe-inline' 'unsafe-eval'">
```

This prevents any cross origin request.

**This is not a complete protection since unsafe evaluation and unsafe-inline permission still allow a malicous bll project to inject dangerous code.**

**Examples are popup or instructions that fakes to be from bellog to ask for money or link to external infected sites**

**TL;DR always ensure to get bellog projects from a trusted source**

## Websockets

TCP driver can be used using Websockets with the Websockify protocol.
Before setting up a Websocket or TCP Driver be sure to understand how they work to prevent any risk.
Websocket runs as a server on your PC and any page opened in the browser can potentially connect to it allowing attacks on your devices.