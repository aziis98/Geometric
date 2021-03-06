angular.module('toolbar', ['ngAnimate']).directive('toolbar', function() {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    templateUrl: 'templates/toolbar.frag.html'
  };
}).directive('toolgroup', function() {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      groupicon: '@'
    },
    controller: function($scope) {
      return $scope.menu = false;
    },
    templateUrl: 'templates/toolgroup.frag.html'
  };
}).directive('toolitem', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      icon: '@',
      label: '@',
      tool: '@'
    },
    templateUrl: 'templates/toolitem.frag.html',
    controller: function($scope, tool) {
      return $scope.setTool = function($event) {
        $event.stopPropagation();
        return tool.id = $scope.tool;
      };
    }
  };
});
