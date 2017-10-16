/*global module,process*/
module.exports = function(config) {
    config.set({

        // Base path that will be used to resolve all file patterns.
        basePath: '',

        // Frameworks to use
        // Available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'requirejs'],

        // List of files / patterns to load in the browser.
        // By default, files are also included in a script tag.
        files: [
            'require.conf.js',
            {pattern: 'node_modules/**/text.js', included: false},
            {pattern: 'src/**/*.js', included: false},
            {pattern: 'src/**/*.html', included: false},
            'test-main.js'
        ],

        // List of files to exclude.
        exclude: [
        ],

        // Preprocess matching files before serving them to the browser.
        // https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/**/!(*spec).js': [ 'coverage' ]
        },

        // Test results reporter to use
        // Possible values: 'dots', 'progress'
        // Available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage', 'html', 'junit'],

        // Web server port.
        port: 9876,

        // Wnable / disable colors in the output (reporters and logs).
        colors: true,

        logLevel: config.LOG_INFO,

        // Rerun tests when any file changes.
        autoWatch: true,

        // Specify browsers to run tests in.
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            'Chrome'
        ],

        // Code coverage reporting.
        coverageReporter: {
            dir: process.env.CIRCLE_ARTIFACTS ?
                process.env.CIRCLE_ARTIFACTS + '/coverage' :
                "dist/reports/coverage",
            check: {
                global: {
                    lines: 80
                }
            }
        },

        // HTML test reporting.
        htmlReporter: {
            outputDir: "dist/reports/tests",
            preserveDescribeNesting: true,
            foldAll: false
        },

        junitReporter: {
            outputDir: process.env.CIRCLE_TEST_REPORTS || 'dist/reports/junit'
        },

        // Continuous Integration mode.
        // If true, Karma captures browsers, runs the tests and exits.
        singleRun: true
    });
};
