angular.module('infobar', ['handler']).directive('infoBar', function() {
  return {
    restrict: 'E',
    scope: {},
    replace: true,
    templateUrl: 'templates/infobar.frag.html',
    controller: function($scope, tool) {
      return $scope.tool = tool.id;
    }
  };
});
