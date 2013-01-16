Yadda.Library.English = function(dictionary, library) {
    
    var library = library ? library : new Yadda.Library(dictionary);
    
    var prefix_signature = function(prefix, signature) {
        var regex_delimiters = new RegExp('^/|/$', 'g');
        var start_of_signature = new RegExp(/^(?:\^)/);
        return signature.toString()
            .replace(regex_delimiters, '')
            .replace(start_of_signature, prefix);
    }    

    library.given = function(signatures, fn, ctx) {
        return Yadda.Util.ensure_array(signatures).each(function(signature) {
            var signature = prefix_signature('(?:[Gg]iven|[Ww]ith|[Aa]nd) ', signature)
            return library.define(signature, fn, ctx);
        });
    };

    library.when = function(signatures, fn, ctx) {
        return Yadda.Util.ensure_array(signatures).each(function(signature) {
            var signature = prefix_signature('(?:[Ww]hen|[Aa]nd) ', signature)
            return library.define(signature, fn, ctx);
        });
    };

    library.then = function(signatures, fn, ctx) {
        return Yadda.Util.ensure_array(signatures).each(function(signature) {
            var signature = prefix_signature('(?:[Tt]hen|[Ee]xpect|[Aa]nd) ', signature)
            return library.define(signature, fn, ctx);
        });
    };

    return library;
}