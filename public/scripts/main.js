angular.module('geometric', ['toolbar', 'gcanvas', 'infobar', 'handler']).controller('geomCtrl', function($scope, $rootScope, $interval, $timeout, plane, tool, mouse, snapper) {
  $scope.author = "Antonio";
  $(function() {
    var offset;
    $('body').on('selectstart', false);
    $(document).keyup(function(e) {
      if (e.which === 27) {
        tool.id = 'none';
      }
      if (e.which === 13) {
        return $rootScope.$emit('actionComplete');
      }
    });
    offset = $('.gcanvas').offset();
    $(document).mousemove(function(e) {
      var pts;
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.x = e.pageX - offset.left;
      mouse.y = e.pageY - offset.top;
      mouse.button = e.which;
      if (mouse.button === 2) {
        plane.translation.x += mouse.x - mouse.px;
        plane.translation.y += mouse.y - mouse.py;
      }
      if (mouse.button === 3) {
        pts = tool.nearList.filter(function(primitive) {
          return primitive.typename === 'PPoint';
        });
        if (pts.length > 0 && pts[0]._dist <= 9 && pts[0].isUndependant()) {
          pts[0].x = snapper.x;
          return pts[0].y = snapper.y;
        }
      }
    });
    mouse.vw = $('.gcanvas').width();
    return mouse.vh = $('.gcanvas').height();
  });
  return $(window).resize(function(e) {
    mouse.vw = $('.gcanvas').width();
    return mouse.vh = $('.gcanvas').height();
  });
});
