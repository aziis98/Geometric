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
          tool.id = toolhandler[tool.id].handler();
          if (tool.id === 'none') {
            return tool.preview = void 0;
          }
        }
      };
      $rootScope.$on('actionComplete', function() {
        if (toolhandler[tool.id].doComplete) {
          tool.id = toolhandler[tool.id].doComplete();
          return tool.preview = void 0;
        }
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
        g.setColor(plane.background);
        g.fillRect(0, 0, g.viewport.width, g.viewport.height);
        tool.nearList = plane.getClosestTo(mouse.x - plane.translation.x, mouse.y - plane.translation.y);
        if (tool.id !== 'none') {
          snapper.updateGuides();
        }
        g.translate(plane.translation.x, plane.translation.y);
        plane.render(g);
        if (tool.preview) {
          tool.preview.render(g);
        }
        snapper.renderGuides(g);
        ref = plane.primitives.slice().sort(function(a, b) {
          return a.typename.localeCompare(b.typename);
        });
        for (i = 0, len = ref.length; i < len; i++) {
          primitive = ref[i];
          if (toolhandler[tool.id].doHighlight(primitive)) {
            primitive.highLight(g);
          }
        }
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
