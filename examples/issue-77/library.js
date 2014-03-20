var French = require('../../lib/localisation/French');

module.exports = (function() {

    var library = French.library()    

    .define("étant donné un navigateur")
    .define("quand on ouvre l'url http://linuxfr.org")
    .define("alors la page d'accueil de Linuxfr s'ouvre")

    return library;
})();
