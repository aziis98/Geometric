angular.module('infobar', [ 'handler' ])
    .directive 'infoBar', () ->
        restrict: 'E'
        scope: { }
        replace: true
        templateUrl: 'templates/infobar.frag.html'
        controller: ($scope, $rootScope, $interval, tool) ->
            $scope.$watch((-> tool.id), (-> $scope.tool = tool.id))

            $scope.actionComplete = ->
                $rootScope.$emit 'actionComplete'
            # $scope.tool = tool.id
