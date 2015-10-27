angular.module('toolbar', ['tool'])
.directive 'toolbar', ->
    return {
        restrict: 'E'
        transclude: true
        templateUrl: 'templates/toolbar.frag.html'
    }
.directive 'tool', ->
    return {
        restrict: 'E'
        transclude: true
        templateUrl: 'templates/tool.frag.html'
    }
.directive 'toolitem', ->
    return {
        restrict: 'E'
        scope: {
            icon: '='
            label: '='
            
        }
        templateUrl: 'templates/toolitem.frag.html'
    }
