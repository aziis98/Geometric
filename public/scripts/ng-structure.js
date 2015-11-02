angular.module('structure', ['handler']).directive('structure', function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: 'templates/structure.frag.html'
  };
}).directive('paneListview', function() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/pane-listview.frag.html',
    controller: function($scope, plane) {
      return $scope.$watch((function() {
        return plane.primitives;
      }), (function() {
        return $scope.primitives = plane.primitives;
      }));
    }
  };
});
