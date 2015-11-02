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
      $scope.$watch((function() {
        return plane.primitives;
      }), (function() {
        return $scope.primitives = plane.primitives;
      }));
      $scope.plane = plane;
      return $scope.select = function(index) {
        var i, j, ref;
        for (i = j = 0, ref = plane.primitives.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          if (i === index) {
            plane.primitives[i].options.selected = !plane.primitives[i].options.selected;
          } else {
            plane.primitives[i].options.selected = false;
          }
        }
      };
    }
  };
}).directive('paneProperties', function() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/pane-properties.frag.html',
    controller: function($scope, plane) {
      return $scope.$watch((function() {
        return plane.primitives.filter(function(p) {
          return p.options.selected;
        })[0];
      }), (function() {
        return $scope.current = plane.primitives.filter(function(p) {
          return p.options.selected;
        })[0];
      }));
    }
  };
});
