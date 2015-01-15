/*
 * grunt-source-download
 *
 *
 * Copyright (c) 2014 Stas Karpov
 * Licensed under the MIT license.
 */
var exec = require('child_process').exec;
'use strict';

module.exports = function (grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	var run_task = function(task, subtask, config) {
		var default_config = grunt.config.get(task) || config;
		grunt.config.set(task, default_config);
		grunt.task.run(task + ':' + subtask);
	};

	grunt.registerMultiTask('source_download', 'Download files from source for specific project and version', function () {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			clean: true,
			paths: [],
			name: 'source'
		});

		var cleanOptions = {
			source: {
				src: ['tmp/source_repo', 'tmp/source_docs_files.tar', 'tmp/source_docs_files']
			},
			sourcePublic: {
				src: ['public/app/' + options.name + '/elements']
			},
			sourceImages: {
				src: 'public/app/' + options.name + '/elements/images/tmp'
			}
		};

		grunt.loadNpmTasks('grunt-untar');
		grunt.loadNpmTasks('grunt-git');
		grunt.loadNpmTasks('grunt-contrib-clean');
		grunt.loadNpmTasks('grunt-contrib-copy');

		if(options.clean) {
			run_task('clean', 'source', cleanOptions)
		}
		run_task('gitclone', 'source', {
			source: {
				options: {
					repository: 'http://composer:composer@phd.box.dmz/diffusion/SRC/source.git',
					directory: 'tmp/source_repo'
				}
			}
		});

		run_task('gitarchive', 'source', {
			source: {
				options: {
					format: 'tar',
					remote: 'tmp/source_repo',
					path: options.paths,
					output: 'tmp/source_docs_files.tar',
					treeIsh: options.tag
				}
			}
		});

		run_task('clean', 'sourcePublic', cleanOptions);

		run_task('untar', 'source', {
			source: {
				options: {
					mode: 'tar'
				},
				files: {
					'tmp/source_docs_files': 'tmp/source_docs_files.tar'
				}
			}
		});

		var images = ['tmp/source_docs_files/**/*.jpg', 'tmp/source_docs_files/**/*.png', 'tmp/source_docs_files/**/*.gif'];
		var copyOptions = {
			source: {
				files: [
					{expand: true, flatten: true, src: ['tmp/source_docs_files/**/*.css', 'tmp/source_docs_files/**/*.css.map'], dest: 'public/app/' + options.name + '/elements/stylesheets/css'},
					{expand: true, flatten: true, src: ['tmp/source_docs_files/**/*.js'], dest: 'public/app/' + options.name + '/elements/js'},
					{expand: true, src: images, dest: 'public/app/' + options.name + '/elements/images'}
				]
			}
		};
		for(var i = 0; i < options.paths.length; i++) {
			copyOptions['sourceImages-' + options.paths[i]] = {
				files: [
					{expand: true, cwd: 'public/app/' + options.name + '/elements/images/tmp/source_docs_files/' + options.paths[i] + '/', src: '**/*', dest: 'public/app/' + options.name + '/elements/images'}
				]
			}
		}
		run_task('copy', 'source', copyOptions);
		for(var i = 0; i < options.paths.length; i++) {
			run_task('copy', 'sourceImages-' + options.paths[i], copyOptions);
		}

		run_task('clean', 'sourceImages', cleanOptions);

		run_task('clean', 'source', cleanOptions);


		////Iterate over all specified file groups.
		//this.files.forEach(function (f) {
		//	// Concat specified files.
		//	var src = f.src.filter(function (filepath) {
		//		// Warn on and remove invalid source files (if nonull was set).
		//		if (!grunt.file.exists(filepath)) {
		//			grunt.log.warn('Source file "' + filepath + '" not found.');
		//			return false;
		//		} else {
		//			return true;
		//		}
		//	}).map(function (filepath) {
		//		// Read file source.
		//		return grunt.file.read(filepath);
		//	}).join(grunt.util.normalizelf(options.separator));
		//
		//	// Handle options.
		//	src += options.punctuation;
		//
		//	// Write the destination file.
		//	grunt.file.write(f.dest, src);
		//
		//	// Print a success message.
		//	grunt.log.writeln('File "' + f.dest + '" created.');
		//});
	});

};
