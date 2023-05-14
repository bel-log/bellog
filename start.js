const Webpack = require("webpack");
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config.js')
const Websockify = require('node-websockify-js');
const net = require('net');

async function getPortFree() {
    return new Promise(res => {
        const srv = net.createServer();
        srv.listen(0, () => {
            const port = srv.address().port
            srv.close((err) => res(port))
        });
    })
}

const webSocketMap = {}

const proxy = {
    proxy: {
        /* This REST api is called by the browser to request opening a raw tcp socket using websokify
         * query is ip=xxx.xxx.xxx.xxx&port=xxxx
         * To keep the socket opened this REST api with additional 'keepalive=true' param must be sent by the browser every 30s
         * The timeout here is 1m becore closing the socket
         */
        '/websockify': {
            bypass: (req, res) => {

                const ip = req.query.ip
                const port = req.query.port
                const freePort = getPortFree()

                const wid = `${ip}:${port}`

                if (req.query.keepalive) {
                    if (webSocketMap.hasOwnProperty(wid)) {
                        // Websocket already ready, refresh keep alive
                        clearInterval(webSocketMap[wid].timer)
                        webSocketMap[wid].timer = setInterval(webSocketMap[wid].cb, 1 * 60 * 1000)
                        res.send({ port: freePort, err: null })
                    } else {
                        res.send({ err: "Websocket not ready" })
                    }
                    return
                }

                if (!webSocketMap.hasOwnProperty(wid)) {
                    webSocketMap[wid] = {}
                   
                    webSocketMap[wid].timer = -1
                    webSocketMap[wid].cb = () => {
                        console.log(`Clear ${wid}`)
                        console.log(`Clear ${webSocketMap[wid].timer}`)
                        webSocketMap[wid].ws.terminate()
                        clearInterval(webSocketMap[wid].timer)
                        delete webSocketMap[wid]
                    }

                    freePort.then((freePort) => {
                        try {
                            let wsockify = new Websockify(
                                {
                                    source: `localhost:${freePort}`, //WebSocket server binding address
                                    target: `${ip}:${port}`, //Proxying TCP port
                                    logEnabled: true,      //Disable logging
                                }
                            );
    
                            wsockify.start().then(() => {
                                res.send({ port: freePort, err: null })
                                webSocketMap[wid].ws = wsockify
                                webSocketMap[wid].port = freePort
                                webSocketMap[wid].timer = setInterval(webSocketMap[wid].cb, 1 * 60 * 1000)
                            }).catch((err) => {
                                res.send({ err: err.message })
                                clearInterval(webSocketMap[wid].timer)
                                delete webSocketMap[wid]
                            });
                        } catch (err) {
                            res.send({ err: err.message })
                            clearInterval(webSocketMap[wid].timer)
                            delete webSocketMap[wid]
                        }
    
                    })
                } else {
                    res.send({ port: webSocketMap[wid].port, err: null })
                }
            }
        }
    }
}


// Add local mode flag accessible from frontend code as constant
// This can be used to toggle functionalities that require server running on localhost like websockify
webpackConfig.plugins.push(new Webpack.DefinePlugin({
    LOCAL_MODE: JSON.stringify(true)
}))

webpackConfig.mode = "development"

const compiler = Webpack(webpackConfig);
const devServerOptions = { ...{ ...webpackConfig.devServer, ...proxy }, open: true };
const server = new WebpackDevServer(devServerOptions, compiler);

const runServer = async () => {
    console.log('Starting server...');
    await server.start();
};

runServer();