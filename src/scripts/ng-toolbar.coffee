angular.module('toolbar', [])
    .directive 'toolbar', ->
        return {
            restrict: 'E'
            transclude: true
            templateUrl: 'templates/toolbar.frag.html'
        }
    .directive 'toolgroup', ->
        return {
            restrict: 'E'
            transclude: true
            templateUrl: 'templates/toolgroup.frag.html'
        }
    .directive 'toolitem', ->
        return {
            restrict: 'E'
            scope: {
                icon: '@'
                label: '@'
            }
            templateUrl: 'templates/toolitem.frag.html'
        }
