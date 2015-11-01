var PLine, PPlane, PPoint, ref;

ref = require('./public/scripts/geometrics.js'), PPlane = ref.PPlane, PPoint = ref.PPoint, PLine = ref.PLine;

angular.module('handler', []).value('plane', new PPlane()).value('tool', {
  id: 'none',
  nearList: [],
  buffer: {},
  dragging: false,
  dragged: void 0
}).value('mouse', {
  x: 0,
  y: 0,
  px: 0,
  py: 0,
  button: 0,
  vw: 1920,
  vh: 1080,
  dirty: true
}).service('snapper', function(mouse, plane, tool) {
  this.x = 0;
  this.y = 0;
  this.guides = [
    {
      type: 'x',
      x: 100
    }, {
      type: 'y',
      y: 500
    }
  ];
  this.updateGuides = function() {
    var ptsX, ptsY;
    this.guides = [];
    this.x = mouse.x;
    this.y = mouse.y;
    ptsX = plane.primitives.filter(function(p) {
      return p.typename === 'PPoint';
    }).map(function(p) {
      return {
        obj: p,
        dist: Math.abs(p.getX() - mouse.x)
      };
    }).sort(function(a, b) {
      return a.dist - b.dist;
    });
    if (ptsX.length > 1) {
      if (ptsX[1].dist <= 5) {
        this.x = ptsX[1].obj.getX();
        this.guides.push({
          type: 'x',
          x: ptsX[1].obj.getX()
        });
      }
    }
    ptsY = plane.primitives.filter(function(p) {
      return p.typename === 'PPoint';
    }).map(function(p) {
      return {
        obj: p,
        dist: Math.abs(p.getY() - mouse.y)
      };
    }).sort(function(a, b) {
      return a.dist - b.dist;
    });
    if (ptsY.length > 1) {
      if (ptsY[1].dist <= 5) {
        this.y = ptsY[1].obj.getY();
        return this.guides.push({
          type: 'y',
          y: ptsY[1].obj.getY()
        });
      }
    }
  };
  this.renderGuides = function(g) {
    var guide, i, len, ref1, results;
    g.setColor('#ffc300');
    ref1 = this.guides;
    results = [];
    for (i = 0, len = ref1.length; i < len; i++) {
      guide = ref1[i];
      switch (guide.type) {
        case 'x':
          results.push(g.drawLine(guide.x, -g.transform.y, guide.x, g.viewport.height - g.transform.y));
          break;
        case 'y':
          results.push(g.drawLine(-g.transform.x, guide.y, g.viewport.height - g.transform.x, guide.y));
          break;
        default:
          results.push(void 0);
      }
    }
    return results;
  };
}).service('toolhandler', function(mouse, plane, tool) {
  var forPoint;
  forPoint = function(primitive) {
    return primitive.typename === 'PPoint' && primitive._dist <= 9;
  };
  this['none'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive);
    }
  };
  this['point'] = {
    doHighlight: function(primitive) {
      return false;
    },
    handler: function() {
      plane.addPrimitive(new PPoint(mouse.x - plane.translation.x, mouse.y - plane.translation.y));
      return 'none';
    },
    doComplete: function() {
      return 'point';
    }
  };
  this['line:A'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive);
    },
    handler: function() {
      var pts;
      pts = tool.nearList.filter(forPoint);
      if (pts.length > 0) {
        tool.buffer.lineA = pts[0];
        return 'line:B';
      } else {
        return 'line:A';
      }
    }
  };
  this['line:B'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive);
    },
    handler: function() {
      var pts;
      pts = tool.nearList.filter(forPoint);
      if (pts.length > 0) {
        plane.addPrimitive(new PLine(tool.buffer.lineA, pts[0]));
        return 'none';
      } else {
        return 'line:B';
      }
    }
  };
});
