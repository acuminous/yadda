var filters = {
    'London teaching jobs': {
        locations: 'United Kingdom:England:London',
        positions: 'Teacher'
    }
}

module.exports = function(key, cb) {
    cb(null, filters[key])
}

