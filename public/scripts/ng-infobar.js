angular.module('infobar', ['handler']).directive('infoBar', function() {
  return {
    restrict: 'E',
    scope: {},
    replace: true,
    templateUrl: 'templates/infobar.frag.html',
    controller: function($scope, $interval, tool) {
      return $scope.$watch((function() {
        return tool.id;
      }), (function() {
        return $scope.tool = tool.id;
      }));
    }
  };
});
