module.exports = Platform;

function Platform() {

    function get_container() {
        if (is_browser()) return window;
        if (is_phantom()) return phantom;
        if (is_node()) return global;         
    }

    function is_node() {
        return typeof module != 'undefined' &&
               typeof module.exports != 'undefined';
    }

    function is_browser() {
        return typeof window != 'undefined';
    }

    function is_phantom() {
        return typeof phantom != 'undefined';
    }

    return {
        get_container: get_container,
        is_node: is_node,
        is_browser: is_browser,
        is_phantom: is_phantom
    }

}
