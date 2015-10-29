angular.module('gcanvas', []).directive('geometricCanvas', function() {
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="gcanvas">\n    <canvas id="canvas"></canvas>\n</div>'
  };
}).controller('geometricCtrl', function($scope) {});
