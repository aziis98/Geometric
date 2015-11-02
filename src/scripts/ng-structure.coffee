angular.module('structure', [ 'handler' ])
    .directive 'structure', ->
        restrict: 'E'
        replace: true
        transclude: true
        templateUrl: 'templates/structure.frag.html'
    .directive 'paneListview', ->
        restrict: 'E'
        replace: true
        templateUrl: 'templates/pane-listview.frag.html'
        controller: ($scope, plane) ->
            $scope.$watch((-> plane.primitives), (-> $scope.primitives = plane.primitives))
