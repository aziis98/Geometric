var Graphics;

Graphics = require('node-canvas-graphics-wrapper');

angular.module('gcanvas', ['handler']).directive('geometricCanvas', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {},
    template: '<div class="gcanvas">\n    <canvas id="canvas" ng-click="onClick()"></canvas>\n</div>',
    controller: function($scope, $rootScope, $interval, plane, tool, toolhandler, mouse, snapper) {
      var render;
      $scope.onClick = function() {
        if (toolhandler[tool.id].handler) {
          return tool.id = toolhandler[tool.id].handler();
        }
      };
      $rootScope.$on('actionComplete', function() {
        return console.log('actionComplete() in canvas');
      });
      $scope.getGraphics = function() {
        var theCanvas;
        theCanvas = $('#canvas')[0];
        theCanvas.width = mouse.vw;
        theCanvas.height = mouse.vh;
        return Graphics.createFromCanvas(theCanvas, {
          width: theCanvas.width,
          height: theCanvas.height
        });
      };
      render = function(g) {
        var i, len, primitive, ref;
        g.ctx.clearRect(0, 0, g.viewport.width, g.viewport.height);
        if (mouse.dirty) {
          mouse.x -= plane.translation.x;
          mouse.y -= plane.translation.y;
          mouse.dirty = false;
        }
        tool.nearList = plane.getClosestTo(mouse.x, mouse.y);
        snapper.updateGuides();
        g.translate(plane.translation.x, plane.translation.y);
        plane.render(g);
        ref = plane.primitives.slice().sort(function(a, b) {
          return a.typename.localeCompare(b.typename);
        });
        for (i = 0, len = ref.length; i < len; i++) {
          primitive = ref[i];
          if (toolhandler[tool.id].doHighlight(primitive)) {
            primitive.highLight(g);
          }
        }
        snapper.renderGuides(g);
        g.translate(-plane.translation.x, -plane.translation.y);
        if (tool.id !== 'none') {
          g.setColor('#000000');
          g.drawLine(mouse.x - 10, mouse.y, mouse.x + 10, mouse.y);
          return g.drawLine(mouse.x, mouse.y - 10, mouse.x, mouse.y + 10);
        }
      };
      return $interval((function() {
        return render($scope.getGraphics());
      }), 1000 / 120);
    }
  };
});
