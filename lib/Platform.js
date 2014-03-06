module.exports = Platform;

function Platform() {

    function get_container() {
        if (is_browser()) return window;
        if (is_node()) return global; 
        if (is_phantom()) return phantom;
    }

    function is_node() {
        return typeof global != 'undefined' &&
               typeof global.process != 'undefined' &&
               global.process.title == 'node';
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