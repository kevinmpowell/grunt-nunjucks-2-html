/**
 * grunt-nunjucks-2-html
 * https://github.com/vitkarpov/grunt-nunjucks-2-html
 *
 * Copyright (c) 2014 Vit Karpov
 * Licensed under the MIT license.
 */

var nunjucks = require('nunjucks');
var path = require('path');
var async = require('async');
var _ = require('lodash');

module.exports = function(grunt) {
    'use strict';

    grunt.registerMultiTask('nunjucks', 'Renders nunjucks` template to HTML', function() {
        var options = this.options();
        var completeTask = this.async();

        if (!options.data) {
            grunt.log.warn('Template`s data is empty. Guess you forget to specify data option');
        }

        var envOptions = { watch: false };
        if (options.tags) {
            envOptions.tags = options.tags;
        }

        var basePath = options.paths || '';
        var env = nunjucks.configure(basePath, envOptions);

        if (typeof options.configureEnvironment === 'function') {
            options.configureEnvironment.call(this, env, nunjucks);
        }

        async.each(this.files, function(f, done) {
            var filepath = path.join(process.cwd(), f.src[0]);

            // We need to clone the data
            var data = _.cloneDeep(options.data || {});

            if (typeof options.preprocessData === 'function') {
                data = options.preprocessData.call(f, data);
            }

            var template = grunt.file.read(filepath);
            env.renderString(template, data, function(err, res) {
                if (err) {
                    grunt.log.error(err);
                    grunt.fail.warn('Faild to compile one of sources.');
                    return done();
                }
                grunt.file.write(f.dest, res);
                grunt.log.writeln('File "' + f.dest + '" created.');
                done();
            });

        }, function(err) {
            if (err) {
                grunt.log.error(err);
                grunt.fail.warn('Something went wrong.');
            }
            completeTask();
        });
    });
};
