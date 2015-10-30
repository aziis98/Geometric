angular.module('geometric', ['toolbar', 'gcanvas', 'infobar', 'handler']).controller('geomCtrl', function($scope, $interval, $timeout, tool, mouse) {
  $scope.author = "Antonio";
  $(function() {
    var offset;
    $('body').on('selectstart', false);
    $(document).keyup(function(e) {
      if (e.which === 27) {
        tool.id = 'none';
      }
      if (e.which === 13) {
        return $scope.$broadcast('actionComplete');
      }
    });
    offset = $('.gcanvas').offset();
    $(document).mousemove(function(e) {
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.x = e.pageX - offset.left;
      return mouse.y = e.pageY - offset.top;
    });
    mouse.vw = $('.gcanvas').width();
    return mouse.vh = $('.gcanvas').height();
  });
  return $(window).resize(function(e) {
    mouse.vw = $('.gcanvas').width();
    return mouse.vh = $('.gcanvas').height();
  });
});
