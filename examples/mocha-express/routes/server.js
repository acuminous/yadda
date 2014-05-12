/* jslint node: true */
"use strict";

var events = require('events');

module.exports = (function() {

    function init(app) {
        app.get('/api/server', status);
        app.delete('/api/server', shutdown);
    }

    function status(req, res) {
        res.send({ started: req.app.get('started') });
    }

    function shutdown(req, res) {
        res.send(202);
        req.app.emit('shutdown_request');
    }

    return {
        init: init
    };
})();
