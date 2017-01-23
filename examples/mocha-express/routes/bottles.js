"use strict";

var _ = require('underscore');
var uuid = require('node-uuid');

module.exports = (function() {

    var bottles = {};

    function init(app) {
        app.put('/api/bottles', updateBottles);
        app.get('/api/bottles', listBottles);
        app.delete('/api/bottles/:id', deleteBottle);
    }

    function updateBottles(req, res) {
        bottles = _.chain(req.body).map(toBottles).indexBy('id').value();
        res.json(_.map(bottles, toJson));
    }

    function listBottles(req, res) {
        res.json(_.chain(bottles).filter(byQueryParameters(req)).map(toJson).value());
    }

    function deleteBottle(req, res) {
        delete bottles[req.params.id];
        res.send(204);
    }

    function toBottles(json) {
        return _.extend(json, { id: uuid.v1() });
    }

    function toJson(bottle) {
        return _.chain(bottle).clone().extend({ uri: '/api/bottles/' + bottle.id }).omit('id').value();
    }

    function byQueryParameters(req) {
        return _.matches(req.query);
    }

    return {
        init: init
    };
})();
