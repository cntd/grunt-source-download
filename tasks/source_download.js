/*
 * grunt-source-download
 *
 *
 * Copyright (c) 2014 Stas Karpov
 * Licensed under the MIT license.
 */
var exec = require('child_process').exec;
var readDir = require('readdir');
'use strict';

module.exports = function (grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	var run_task = function(task, subtask, config) {
		var default_config = config || grunt.config.get(task);
		grunt.config.set(task, default_config);
		grunt.task.run(task + ':' + subtask);
	};

	grunt.registerMultiTask('source_download', 'Download files from source for specific project and version', function () {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			clean: true,
			projects: []
		});

		var cleanOptions = {
			source: {
				src: ['tmp/source_repo', 'tmp/source_docs_files.tar', 'tmp/source_docs_files']
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

		var paths = options.projects.map(function(item) { return 'user/projects/' + item; });
		run_task('gitarchive', 'source', {
			source: {
				options: {
					format: 'tar',
					remote: 'tmp/source_repo',
					path: paths,
					output: 'tmp/source_docs_files.tar',
					treeIsh: options.tag
				}
			}
		});

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

		// Сперва удаляем все, что было
		cleanOptions['clean' + path] = {
			src: ['public/' + options.path]
		};

		run_task('clean', 'clean' + path, cleanOptions);

		var copyOptions = {};
		for(var i = 0; i < options.projects.length; i++) {
			var path = options.projects[i];

			// Удаляем папку tmp из картинок
			//cleanOptions['sourceImages'+ path] = {
			//	src: ['public/app/' + path + '/images/tmp']
			//};
			//
			//// Удаляем папку tmp из стилей
			//cleanOptions['sourceCss'+ path] = {
			//	src: ['public/app/' + path + '/stylesheets/tmp']
			//};
			//
			//// Удаляем папку tmp из скриптов
			//cleanOptions['sourceJs'+ path] = {
			//	src: ['public/app/' + path + '/js/tmp']
			//};
			//
			//// Удаляем папку tmp из шрифтов
			//cleanOptions['sourceFonts'+ path] = {
			//	src: ['public/app/' + path + '/fonts/tmp']
			//};

			// Копируем все содержимое, включая кривую структуру папок
			//copyOptions['source_copy' + path] = {
			//	files: [
			//		{expand: true, src: ['tmp/source_docs_files/user/projects/' + path + '/**/*.css', 'tmp/source_docs_files/user/projects/' + path + '/**/*.css.map'], dest: 'public/app/' + path + '/stylesheets'},
			//		{expand: true, src: ['tmp/source_docs_files/user/projects/' + path + '/**/*.js'], dest: 'public/app/' + path + '/js'},
			//		{expand: true, src: ['tmp/source_docs_files/user/projects/' + path + '/**/*.{eot,svg,ttf,woff,woff2,otf}'], dest: 'public/app/' + path + '/fonts'},
			//		{expand: true, src: ['tmp/source_docs_files/user/projects/' + path + '/**/*.{jpg,png,gif}'], dest: 'public/app/' + path + '/images'}
			//	]
			//};
			copyOptions['source_copy' + path] = {
				files: [
					{expand: true, cwd: 'tmp/source_docs_files/user/projects/' + path, src: ['**/*.sass'], dest: 'public/' + options.path + '/' + path + '/stylesheets'},
					{expand: true, cwd: 'tmp/source_docs_files/user/projects/' + path, src: ['**/*.js'], dest: 'public/' + options.path + '/' + path + '/js'},
					{expand: true, cwd: 'tmp/source_docs_files/user/projects/' + path, src: ['**/*.{eot,svg,ttf,woff,woff2,otf}'], dest: 'public/' + options.path + '/' + path + '/fonts'},
					{expand: true, cwd: 'tmp/source_docs_files/user/projects/' + path, src: ['**/*.{jpg,png,gif}'], dest: 'public/' + options.path + '/' + path + '/images'}
				]
			};
			run_task('copy', 'source_copy' + path, copyOptions);

			// Таск для обрезки лишних путей типа tmp/source_docs_files ...
			//(function(path) {
			//	grunt.registerTask('readFolders' + path, '', function() {
			//
			//		// Копирование картинок
			//		var dirs = grunt.file.expand({cwd: 'public/app/' + path + '/images/tmp/source_docs_files/user/projects/' + path + '/'}, '*');
			//		for(var j = 0; j < dirs.length; j++) {
			//			copyOptions['source_images' + j] = {
			//				files: [
			//					{expand: true, cwd: 'public/app/' + path + '/images/tmp/source_docs_files/user/projects/' + path + '/' + dirs[j] + '/images', src: '**/*', dest: 'public/app/' + path + '/images'}
			//				]
			//			}
			//			run_task('copy', 'source_images' + j, copyOptions);
			//		}
			//
			//		// Копирование шрифтов
			//		dirs = grunt.file.expand({cwd: 'public/app/' + path + '/fonts/tmp/source_docs_files/user/projects/' + path + '/'}, '*');
			//		for(var j = 0; j < dirs.length; j++) {
			//			copyOptions['source_fonts' + j] = {
			//				files: [
			//					{expand: true, cwd: 'public/app/' + path + '/fonts/tmp/source_docs_files/user/projects/' + path + '/' + dirs[j] + '/fonts', src: '**/*', dest: 'public/app/' + path + '/fonts'}
			//				]
			//			}
			//			run_task('copy', 'source_fonts' + j, copyOptions);
			//		}
			//
			//		// Копирование скриптов
			//		dirs = grunt.file.expand({cwd: 'public/app/' + path + '/js/tmp/source_docs_files/user/projects/' + path + '/'}, '*');
			//		for(var j = 0; j < dirs.length; j++) {
			//			copyOptions['source_js' + j] = {
			//				files: [
			//					{expand: true, cwd: 'public/app/' + path + '/js/tmp/source_docs_files/user/projects/' + path + '/' + dirs[j] + '/js', src: '**/*', dest: 'public/app/' + path + '/js'}
			//				]
			//			}
			//			run_task('copy', 'source_js' + j, copyOptions);
			//		}
			//
			//		// Копирование стилей
			//		dirs = grunt.file.expand({cwd: 'public/app/' + path + '/stylesheets/tmp/source_docs_files/user/projects/' + path + '/'}, '*');
			//		for(var j = 0; j < dirs.length; j++) {
			//			copyOptions['source_stylesheets' + j] = {
			//				files: [
			//					{expand: true, cwd: 'public/app/' + path + '/stylesheets/tmp/source_docs_files/user/projects/' + path + '/' + dirs[j] + '/stylesheets', src: '**/*', dest: 'public/app/' + path + '/stylesheets'}
			//				]
			//			}
			//			run_task('copy', 'source_stylesheets' + j, copyOptions);
			//		}
			//	});
			//})(path);


		}

		for(var i = 0; i < options.projects.length; i++) {
			//run_task('readFolders' + options.paths[i]);
			//run_task('clean', 'sourceImages' + options.paths[i], cleanOptions);
			//run_task('clean', 'sourceCss' + options.paths[i], cleanOptions);
			//run_task('clean', 'sourceJs' + options.paths[i], cleanOptions);
			//run_task('clean', 'sourceFonts' + options.paths[i], cleanOptions);
		}


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
