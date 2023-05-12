const Webpack = require("webpack");
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config.js')
const Websockify = require('node-websockify-js');
const net = require('net');

async function getPortFree() {
    return new Promise( res => {
        const srv = net.createServer();
        srv.listen(0, () => {
            const port = srv.address().port
            srv.close((err) => res(port))
        });
    })
}

const proxy = {
    proxy: {
        '/websockify': {
            bypass: (req, res) => {
                
                const ip = req.query.ip
                const port = req.query.port
                const freePort = getPortFree()

                freePort.then((freePort) => {
                    try {
                        let wsockify = new Websockify(
                            {
                                source: `localhost:${freePort}`, //WebSocket server binding address
                                target: `${ip}:${port}`, //Proxying TCP port
                                logEnabled: false,      //Disable logging
                            }
                        );
    
                        wsockify.start().then(() => {
                            res.send("Websockify started " + wsockify)
                        }).catch((err) => {
                            res.send("Websockify failed to start")
                        });
                    } catch (error) {
                        res.send("Websockify failed to start with exception " + error.message)
                    }

                })
            }
        }
    }
}

const compiler = Webpack(webpackConfig);
const devServerOptions = { ...{...webpackConfig.devServer, ...proxy}, open: true };
const server = new WebpackDevServer(devServerOptions, compiler);

const runServer = async () => {
  console.log('Starting server...');
  await server.start();
};

runServer();