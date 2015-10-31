angular.module('infobar', ['handler']).directive('infoBar', function() {
  return {
    restrict: 'E',
    scope: {},
    replace: true,
    templateUrl: 'templates/infobar.frag.html',
    controller: function($scope, $rootScope, $interval, tool) {
      $scope.$watch((function() {
        return tool.id;
      }), (function() {
        return $scope.tool = tool.id;
      }));
      return $scope.actionComplete = function() {
        return $rootScope.$emit('actionComplete');
      };
    }
  };
});
