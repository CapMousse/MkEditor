angular.module('MkEditor', [])

.service('LocalStorageService', function(){
    this.checkIfLocalStorageSupported = function(){
        return ('localStorage' in window && window['localStorage'] !== null);
    };

    this.get = function(name){
        var data = localStorage.getItem(name);
        return data === null ? null : JSON.parse(data);
    };

    this.set = function(name, value){
        value = JSON.stringify(value);
        return localStorage.setItem(name, value);
    };

    this.remove = function(name){
        return localStorage.removeItem(name);
    };
})

.service('FileService', function() {
    this.saveAsFile = function(content, type, name) {
        if (Blob === void(0)) {
            return alert("Your browser don't support javascript file saving");
        }

        var blobFile = new Blob([content], {type: type});
        name = name || (new Date()).getTime();

        return blobFile;
    }
})

.filter('markdown', function(){
    var timeout = false;

    return function(text){
        var converter = new Showdown.converter();

        if (void(0) === text || '' === text) {
            return text;
        }

        if (timeout === false) {
            timeout = setTimeout(function(){
                Rainbow.color();

                timeout = false;
            }, 100);
        }

        return converter.makeHtml(text);
    };
})

.controller('EditorController', function($scope, LocalStorageService, FileService){
    var layout = document.getElementById('layout');
    var saveMarkdownButton = document.getElementById('saveMarkdown');
    var saveHtmlButton = document.getElementById('saveHtml');
    var fileInput = document.getElementById('fileInput');

    $scope.content = LocalStorageService.get('MkEditorContent') || '';
    $scope.file = null;
    $scope.fullscreen = false;

    $scope.saveContent = function(){
        LocalStorageService.set('MkEditorContent', $scope.content);

        var name = $scope.content.split("\n")[0].trim().replace('#', '');
        var markdownFile = FileService.saveAsFile($scope.content, 'text/plain');

        var converter = new Showdown.converter();
        var htmlFile = FileService.saveAsFile(converter.makeHtml($scope.content), 'text/plain');

        saveMarkdownButton.download = name+".md";
        saveHtmlButton.download = name+".html";

        saveMarkdownButton.href = window.URL.createObjectURL(markdownFile);
        saveHtmlButton.href = window.URL.createObjectURL(htmlFile);
    };

    $scope.setFullscreen = function(){
        var method;

        if (!$scope.fullscreen) {
            if (layout.requestFullScreen) {
                layout.requestFullScreen();
            }

            if (layout.mozRequestFullScreen) {
                layout.mozRequestFullScreen();
            }

            if (layout.webkitRequestFullScreen) {
                layout.webkitRequestFullScreen();
            }

            $scope.fullscreen = true;
        } else {

            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            }

            if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }

            if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }

            $scope.fullscreen = false;
        }
    };

    $scope.saveContent();

    //As angular don't support file input, we need to use "normal" events to check changes
    fileInput.addEventListener('change', function(event){
        var file = fileInput.files[0];
        var fileReader = new FileReader();

        fileReader.onload = function(event) {
            $scope.content = event.target.result;
            $scope.saveContent();
            $scope.$apply();
        };
        fileReader.readAsText(file, "UTF-8");
    })
});