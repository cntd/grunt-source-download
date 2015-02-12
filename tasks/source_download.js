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

		var projects = options.projects.map(function(item) { return 'user/projects/' + item; });
		run_task('gitarchive', 'source', {
			source: {
				options: {
					format: 'tar',
					remote: 'tmp/source_repo',
					path: projects,
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
		cleanOptions['clean' + project] = {
			src: ['public/' + options.project]
		};

		run_task('clean', 'clean' + project, cleanOptions);

		var copyOptions = {};
		for(var i = 0; i < options.projects.length; i++) {
			var project = options.projects[i];

			// Удаляем папку tmp из картинок
			//cleanOptions['sourceImages'+ project] = {
			//	src: ['public/app/' + project + '/images/tmp']
			//};
			//
			//// Удаляем папку tmp из стилей
			//cleanOptions['sourceCss'+ project] = {
			//	src: ['public/app/' + project + '/stylesheets/tmp']
			//};
			//
			//// Удаляем папку tmp из скриптов
			//cleanOptions['sourceJs'+ project] = {
			//	src: ['public/app/' + project + '/js/tmp']
			//};
			//
			//// Удаляем папку tmp из шрифтов
			//cleanOptions['sourceFonts'+ project] = {
			//	src: ['public/app/' + project + '/fonts/tmp']
			//};

			// Копируем все содержимое, включая кривую структуру папок
			//copyOptions['source_copy' + project] = {
			//	files: [
			//		{expand: true, src: ['tmp/source_docs_files/user/projects/' + project + '/**/*.css', 'tmp/source_docs_files/user/projects/' + project + '/**/*.css.map'], dest: 'public/app/' + project + '/stylesheets'},
			//		{expand: true, src: ['tmp/source_docs_files/user/projects/' + project + '/**/*.js'], dest: 'public/app/' + project + '/js'},
			//		{expand: true, src: ['tmp/source_docs_files/user/projects/' + project + '/**/*.{eot,svg,ttf,woff,woff2,otf}'], dest: 'public/app/' + project + '/fonts'},
			//		{expand: true, src: ['tmp/source_docs_files/user/projects/' + project + '/**/*.{jpg,png,gif}'], dest: 'public/app/' + project + '/images'}
			//	]
			//};
			copyOptions['source_copy' + project] = {
				files: [
					{expand: true, cwd: 'tmp/source_docs_files/user/projects/' + project, src: ['**/*.{sass,js,eot,svg,ttf,woff,woff2,otf,jpg,png,gif}'], dest: 'public/' + options.path + '/' + project},
					//{expand: true, cwd: 'tmp/source_docs_files/user/projects/' + project, src: ['**/*.js'], dest: 'public/' + options.path + '/' + project},
					//{expand: true, cwd: 'tmp/source_docs_files/user/projects/' + project, src: ['**/*.{eot,svg,ttf,woff,woff2,otf}'], dest: 'public/' + options.path + '/' + project},
					//{expand: true, cwd: 'tmp/source_docs_files/user/projects/' + project, src: ['**/*.{jpg,png,gif}'], dest: 'public/' + options.path + '/' + project}
				]
			};
			run_task('copy', 'source_copy' + project, copyOptions);

			// Таск для обрезки лишних путей типа tmp/source_docs_files ...
			//(function(project) {
			//	grunt.registerTask('readFolders' + project, '', function() {
			//
			//		// Копирование картинок
			//		var dirs = grunt.file.expand({cwd: 'public/app/' + project + '/images/tmp/source_docs_files/user/projects/' + project + '/'}, '*');
			//		for(var j = 0; j < dirs.length; j++) {
			//			copyOptions['source_images' + j] = {
			//				files: [
			//					{expand: true, cwd: 'public/app/' + project + '/images/tmp/source_docs_files/user/projects/' + project + '/' + dirs[j] + '/images', src: '**/*', dest: 'public/app/' + project + '/images'}
			//				]
			//			}
			//			run_task('copy', 'source_images' + j, copyOptions);
			//		}
			//
			//		// Копирование шрифтов
			//		dirs = grunt.file.expand({cwd: 'public/app/' + project + '/fonts/tmp/source_docs_files/user/projects/' + project + '/'}, '*');
			//		for(var j = 0; j < dirs.length; j++) {
			//			copyOptions['source_fonts' + j] = {
			//				files: [
			//					{expand: true, cwd: 'public/app/' + project + '/fonts/tmp/source_docs_files/user/projects/' + project + '/' + dirs[j] + '/fonts', src: '**/*', dest: 'public/app/' + path + '/fonts'}
			//				]
			//			}
			//			run_task('copy', 'source_fonts' + j, copyOptions);
			//		}
			//
			//		// Копирование скриптов
			//		dirs = grunt.file.expand({cwd: 'public/app/' + project + '/js/tmp/source_docs_files/user/projects/' + project + '/'}, '*');
			//		for(var j = 0; j < dirs.length; j++) {
			//			copyOptions['source_js' + j] = {
			//				files: [
			//					{expand: true, cwd: 'public/app/' + project + '/js/tmp/source_docs_files/user/projects/' + project + '/' + dirs[j] + '/js', src: '**/*', dest: 'public/app/' + path + '/js'}
			//				]
			//			}
			//			run_task('copy', 'source_js' + j, copyOptions);
			//		}
			//
			//		// Копирование стилей
			//		dirs = grunt.file.expand({cwd: 'public/app/' + project + '/stylesheets/tmp/source_docs_files/user/projects/' + project + '/'}, '*');
			//		for(var j = 0; j < dirs.length; j++) {
			//			copyOptions['source_stylesheets' + j] = {
			//				files: [
			//					{expand: true, cwd: 'public/app/' + project + '/stylesheets/tmp/source_docs_files/user/projects/' + project + '/' + dirs[j] + '/stylesheets', src: '**/*', dest: 'public/app/' + path + '/stylesheets'}
			//				]
			//			}
			//			run_task('copy', 'source_stylesheets' + j, copyOptions);
			//		}
			//	});
			//})(project);


		}

		for(var i = 0; i < options.projects.length; i++) {
			//run_task('readFolders' + options.projects[i]);
			//run_task('clean', 'sourceImages' + options.projects[i], cleanOptions);
			//run_task('clean', 'sourceCss' + options.projects[i], cleanOptions);
			//run_task('clean', 'sourceJs' + options.projects[i], cleanOptions);
			//run_task('clean', 'sourceFonts' + options.projects[i], cleanOptions);
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
