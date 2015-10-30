angular.module('toolbar', [ 'ngAnimate' ])
    .directive 'toolbar', ->
        return {
            restrict: 'E'
            transclude: true
            replace: true
            templateUrl: 'templates/toolbar.frag.html'
        }
    .directive 'toolgroup', ->
        return {
            restrict: 'E'
            transclude: true
            replace: true
            scope:
                groupicon: '@'
            controller: ($scope) ->
                $scope.menu = false
            templateUrl: 'templates/toolgroup.frag.html'
        }
    .directive 'toolitem', ->
        return {
            restrict: 'E'
            replace: true
            scope: {
                icon: '@'
                label: '@'
                tool: '@'
            }
            templateUrl: 'templates/toolitem.frag.html'
            controller: ($scope, tool) ->
                $scope.setTool = ($event) ->
                    $event.stopPropagation()
                    tool.selectTool($scope.tool)
        }
