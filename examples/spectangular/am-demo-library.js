/* globals browser, element, by, expect */
/* jslint node: true */
"use strict";
var Yadda = require('yadda');
var Dictionary = Yadda.Dictionary;
var English = Yadda.localisation.English;

var Spectangular = require('./node_modules/spectangular/dist/spectangular.js');
var SpectangularMdLibrary = require('./node_modules/spectangular/dist/libraries/md/md.js');

Spectangular.baseUrl = 'https://material.angularjs.org/latest';
Spectangular.library = SpectangularMdLibrary;

module.exports = (function () {

    var actions = [];

    var dictionary = new Dictionary()
        .define('list', /([^\u0000]*)/, Yadda.converters.list)
        .define('action', /(Show as (list|grid))$/);

    //CSS selectors, see https://angular.github.io/protractor/#/api?view=build$$
    var lists = $$('md-list-item span.md-inline-list-icon-label');
    var grids = $$('md-list-item  div.md-grid-text');

    function openStartPage() {
        Spectangular.loadPage('/#/demo/material.components.bottomSheet', '.demo-toolbar');
    }

    function clickOnButton(action) {
        Spectangular.button({text: action}).click();
        return true;
    }

    function checkNumberOfActions(type) {
        if (type === 'list') {
            expect(lists.count()).toBe(actions.length);
        }
        if (type === 'grid') {
            expect(grids.count()).toBe(actions.length);
        }
    }

    function checkAction(type, action) {
        if (type === 'list') {
            return checkElements(lists, action)
        }
        if (type === 'grid') {
            return checkElements(grids, action);
        }
    }

    function checkElements(elements, action) {
        return elements.filter(function (el) {
            return el.getText().then(function (text) {
                return action.trim().toLocaleLowerCase() === text.trim().toLocaleLowerCase();
            })
        }).then(function (filteredItems) {
            if (!filteredItems) {
                console.log('no filtered items');
                return false;
            }
            if (filteredItems.length === 1) {
                return true;
            }
            console.log('nok length!', filteredItems.length);
            return false;
        });
    }

    var library = English.library(dictionary)
        .given("a list of actions\n$list", function (list) {
            openStartPage();
            actions = list;
        })

        .when("I click on $action", function (action) {
            clickOnButton(action);
        })

        .then("the $type actions are shown", function (type) {
            checkNumberOfActions(type);
            actions.forEach(function (action) {
                expect(checkAction(type, action)).toBe(true);
            })
        });

    return library;
})();
