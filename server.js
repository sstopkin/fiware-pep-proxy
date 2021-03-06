var config = require('./config'),
    fs = require('fs'),
    https = require('https'),
    Root = require('./controllers/root').Root,
    IDM = require("./lib/idm.js").IDM,
    errorhandler = require('errorhandler');

config.azf = config.azf || {};
config.https = config.https || {};

var log = require('./lib/logger').logger.getLogger("Server");

var express = require('express');
var cors = require('cors');

process.on('uncaughtException', function (err) {
  log.error('Caught exception: ' + err);
});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var app = express();

app.use(cors())

//app.use(express.bodyParser());

app.use (function(req, res, next) {

    var bodyChunks = [];
    req.on('data', function(chunk) {
       bodyChunks.push(chunk);
    });

    req.on('end', function() {
        if (bodyChunks.length > 0) {
            req.body = Buffer.concat(bodyChunks);
        };
        next();
    });
});

app.use(errorhandler({log: log.error}))

app.use(function (req, res, next) {
    "use strict";
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'HEAD, POST, PUT, GET, OPTIONS, DELETE');
    res.header('Access-Control-Allow-Headers', 'origin, content-type, X-Auth-Token, Tenant-ID, Authorization');
    //log.debug("New Request: ", req.method);
    if (req.method == 'OPTIONS') {
        log.debug("CORS request");
        res.statusCode = 200;
        res.header('Content-Length', '0');
        res.send();
        res.end();
    }
    else {
        next();
    }
});

var port = config.pep_port || 80;
if (config.https.enabled) port = config.https.port || 443;
app.set('port', port);

for (var p in config.public_paths) {
    log.debug('Public paths', config.public_paths[p]);
    app.all(config.public_paths[p], Root.public);
}

app.all('/*', Root.pep);

log.info('Starting PEP proxy in port ' + port + '. IdM authentication ...');

IDM.authenticate (function (token) {

    log.info('Success authenticating PEP proxy. Proxy Auth-token: ', token);

}, function (status, e) {
    log.error('Error in keystone communication', e);
});

if (config.https.enabled === true) {
    var options = {
        key: fs.readFileSync(config.https.key_file),
        cert: fs.readFileSync(config.https.cert_file)
    };

    https.createServer(options, function(req,res) {
        app.handle(req, res);
    }).listen(app.get('port'));
} else {
    app.listen(app.get('port'));
}
