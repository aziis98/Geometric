angular.module('infobar', [ 'handler' ])
    .directive 'infoBar', () ->
        restrict: 'E'
        scope: { }
        replace: true
        templateUrl: 'templates/infobar.frag.html'
        controller: ($scope, tool) ->
            $scope.tool = tool.id
