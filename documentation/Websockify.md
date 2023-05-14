# TCP Sockets via Websockify

TCP sockets are supported by Bellog via [websockify](https://github.com/novnc/websockify) protocol.

## Running on the browser

You can run TCP Sockets drivers from bellog using the browser but you need to have websockify running on your computer.

To support this driver must be configured as follows:

* **Separate websockify process (for running in the browser** set to true
* **Websockify port** set to the **source_port** provided when websockify was run on your computer

```
# Install Websockify (requires Python 3)
pip install websockify

# source_port free port of your PC set in the driver settings
# target_addr and target_port of the device you want to connect to
websockify :source_port [target_addr:target_port]
```

## Running on your pc

If you run bellog from your pc

```
git clone git@github.com:bel-log/bellog.git

cd bellog

npm install

npm start
```

TCP sockets will work out of the box.

However you need the following driver settings:

* **Separate websockify process (for running in the browser** set to false
* **Ip** set to the ip of the device you want to connect to
* **Port** set to the port of the device you want to connect to
