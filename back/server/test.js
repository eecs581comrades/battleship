const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());

const port = 3000;
const localNetworkHost = '0.0.0.0';

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/assets/serverSocketTesting.html');
});

server.listen(port, localNetworkHost, () => {
    console.log(`Server Tester is now active on http://${localNetworkHost}:${port}`)
});