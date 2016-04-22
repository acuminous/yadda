var adBlockPlus = require('adblock-plus-crx')

module.exports = {
    "src_folders": ["tests/runner"],
    "output_folder": "archive/reports",
    "custom_commands_path": "tests/commands",
    "custom_assertions_path": "tests/assertions",
    "page_objects_path": "tests/pages",
    "globals_path": "",
    "test_runner" : {
        "type" : "mocha",
        "options" : {
            "timeout" : "10000",
            "slow" : "5000"
       }
    },

    "selenium": {
        "start_process": true,
        "server_path": "./node_modules/selenium-server-standalone-jar/jar/selenium-server-standalone-2.48.2.jar",
        "log_path": "archive/logs",
        "host": "127.0.0.1",
        "port": 4444,
        "cli_args": {
            "webdriver.chrome.driver": "./node_modules/chromedriver/bin/chromedriver",
            "webdriver.ie.driver": ""
        }
    },

    "test_settings": {
        "default": {
            "launch_url": "https://www.tes.com",
            "selenium_host" : "localhost",
            "silent": true,
            "screenshots": {
                "enabled": true,
                "on_failure" : true,
                "path": "archive/screenshots"
            },
            "desiredCapabilities": {
                "javascriptEnabled": true,
                "acceptSslCerts": true,
                "browserName": "chrome",
                "chromeOptions": {
                    "args": [ "no-sandbox" ],
                    "extensions": [ adBlockPlus.base64() ]
                }
            },
            "globals": {
                "waitForConditionTimeout": 10000
            }
        }
    }
}
