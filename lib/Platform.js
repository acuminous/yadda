"use strict";

module.exports = Platform;

function Platform() {

    function get_container() {
        /* eslint-disable no-undef */
        if (is_browser()) return window;
        if (is_phantom()) return phantom;
        if (is_node()) return global;
        /* eslint-enable no-undef */
    }

    function is_node() {
        return typeof process !== 'undefined' &&
               typeof global !== 'undefined' &&
               typeof __dirname !== 'undefined';
    }

    function is_browser() {
        return typeof window !== 'undefined';
    }

    function is_phantom() {
        return typeof phantom !== 'undefined';
    }

    function is_karma() {
        return typeof window !== 'undefined' && typeof window.__karma__ !== 'undefined';
    }

    return {
        get_container: get_container,
        is_node: is_node,
        is_browser: is_browser,
        is_phantom: is_phantom,
        is_karma: is_karma
    };

}
