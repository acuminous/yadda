/* jslint node: true */
"use strict";

var express = require('express');
var app = express();
var routes = ['./routes/server', './routes/bottles'];

module.exports = (function() {

    var server;

    app.use(express.bodyParser());

    routes.forEach(function(route) {
        require(route).init(app);
    });

    function start(host, port, next) {
        server = app.listen(port, host, function() {
            app.on('shutdown_request', stop);
            app.set('started', new Date());
            next && next();
        });
    }

    function stop(next) {
        server && server.close(next);
    }

    return {
        start: start,
        stop: stop
    };
})();
