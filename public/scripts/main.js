angular.module('geometric', ['toolbar', 'gcanvas', 'infobar']).controller('geomCtrl', function($scope) {
  return $scope.author = "Antonio";
});

$(function() {
  return $('body').on('selectstart', false);
});
