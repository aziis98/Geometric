angular.module('toolbar', []).directive('toolbar', function() {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'templates/toolbar.frag.html'
  };
}).directive('toolgroup', function() {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'templates/toolgroup.frag.html'
  };
}).directive('toolitem', function() {
  return {
    restrict: 'E',
    scope: {
      icon: '@',
      label: '@'
    },
    templateUrl: 'templates/toolitem.frag.html'
  };
});
