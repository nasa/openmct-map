/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2016, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

/*global require,window*/
var allTestFiles = [];

var JS_REGEXP = /^\/base\/src\/.*\.js$/;

var pathToModule = function(path) {
    return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

requirejs.config({
    // Karma serves files from the basePath defined in karma.conf.js
    baseUrl: '/base',

    // dynamically load all test files
    deps: Object.keys(window.__karma__.files)
        .filter(JS_REGEXP.test.bind(JS_REGEXP))
        .map(pathToModule),

    // we have to kickoff jasmine, as it is asynchronous
    callback: function () {
        var args = [].slice.apply(arguments);
        window.__karma__.start.apply(window.__karma__, args);
    }
});
