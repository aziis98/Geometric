var PCircle, PLine, PPlane, PPoint, ref;

ref = require('./public/scripts/geometrics.js'), PPlane = ref.PPlane, PPoint = ref.PPoint, PLine = ref.PLine, PCircle = ref.PCircle;

angular.module('handler', []).value('plane', new PPlane()).value('tool', {
  id: 'none',
  nearList: [],
  buffer: {
    centroid: []
  },
  dragging: false,
  dragged: void 0,
  preview: void 0,
  selectedPrimitive: void 0
}).value('mouse', {
  x: 0,
  y: 0,
  px: 0,
  py: 0,
  button: 0,
  vw: 1920,
  vh: 1080
}).filter('titlecase', function() {
  return function(input) {
    return input.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };
}).service('snapper', function(mouse, plane, tool) {
  this.x = 0;
  this.y = 0;
  this.pure = {
    x: 0,
    y: 0
  };
  this.guides = [];
  this.updateGuides = function() {
    var ptsX, ptsY;
    this.guides = [];
    this.x = mouse.x - plane.translation.x;
    this.y = mouse.y - plane.translation.y;
    this.pure.x = mouse.x - plane.translation.x;
    this.pure.y = mouse.y - plane.translation.y;
    ptsX = plane.primitives.filter(function(p) {
      return p.typename === 'PPoint' && p.options.visible;
    }).map(function(p) {
      return {
        obj: p,
        dist: Math.abs(p.getX() - (mouse.x - plane.translation.x))
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
      return p.typename === 'PPoint' && p.options.visible;
    }).map(function(p) {
      return {
        obj: p,
        dist: Math.abs(p.getY() - (mouse.y - plane.translation.y))
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
    if (tool.dragging) {
      g.setColor('#ffc300');
      g.setLineWidth(1);
      ref1 = this.guides;
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        guide = ref1[i];
        switch (guide.type) {
          case 'x':
            results.push(g.drawLine(guide.x, -g.transform.y, guide.x, g.viewport.height - g.transform.y));
            break;
          case 'y':
            results.push(g.drawLine(-g.transform.x, guide.y, g.viewport.width - g.transform.x, guide.y));
            break;
          default:
            results.push(void 0);
        }
      }
      return results;
    }
  };
}).service('toolhandler', function(mouse, plane, tool, snapper) {
  var forCircle, forLine, forPoint, getPreviewPoint;
  forPoint = function(primitive) {
    return primitive.typename === 'PPoint' && primitive._dist <= 9;
  };
  forLine = function(primitive) {
    return primitive.typename === 'PLine' && primitive._dist <= 5;
  };
  forCircle = function(primitive) {
    return primitive.typename === 'PCircle' && primitive._dist <= 7;
  };
  getPreviewPoint = function() {
    return new PPoint((function() {
      return snapper.pure.x;
    }), (function() {
      return snapper.pure.y;
    }));
  };
  this['none'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive) || forLine(primitive) || forCircle(primitive);
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
  this['point-dep-line:line'] = {
    doHighlight: function(primitive) {
      return forLine(primitive);
    },
    handler: function() {
      var lines;
      lines = tool.nearList.filter(forLine);
      if (lines.length > 0) {
        tool.buffer.theLine = lines[0];
        return 'point-dep-line:point';
      }
      return 'point-dep-line:line';
    }
  };
  this['point-dep-line:point'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive);
    },
    handler: function() {
      var pts;
      pts = tool.nearList.filter(forPoint);
      if (pts.length > 0) {
        plane.addPrimitive(PPoint.getLineLink(tool.buffer.theLine, pts[0]));
        return 'none';
      }
      return 'point-dep-line:point';
    }
  };
  this['point-centroid'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive);
    },
    handler: function() {
      var clist, pts;
      pts = tool.nearList.filter(forPoint);
      if (pts.length > 0) {
        tool.buffer.centroid.push(pts[0]);
        clist = tool.buffer.centroid.slice(0);
        clist.push(getPreviewPoint());
        tool.preview = PPoint.getCentroid(clist);
        tool.preview.color = '#cccccc';
        return 'point-centroid';
      }
    },
    doComplete: function() {
      plane.addPrimitive(PPoint.getCentroid(tool.buffer.centroid));
      tool.buffer.centroid = [];
      return 'none';
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
        tool.preview = new PLine(tool.buffer.lineA, getPreviewPoint());
        tool.preview.color = '#cccccc';
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
  this['line-perpendicular:line'] = {
    doHighlight: function(primitive) {
      return forLine(primitive);
    },
    handler: function() {
      var lines;
      lines = tool.nearList.filter(forLine);
      if (lines.length > 0) {
        tool.buffer.theLine = lines[0];
        tool.preview = PLine.getPerpendicular(tool.buffer.theLine, getPreviewPoint());
        tool.preview.color = '#cccccc';
        return 'line-perpendicular:point';
      } else {
        return 'line-perpendicular:line';
      }
    }
  };
  this['line-perpendicular:point'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive);
    },
    handler: function() {
      var pts;
      pts = tool.nearList.filter(forPoint);
      if (pts.length > 0) {
        plane.addPrimitive(PLine.getPerpendicular(tool.buffer.theLine, pts[0]));
        return 'none';
      }
      return 'line-perpendicular:point';
    }
  };
  this['line-parallel:line'] = {
    doHighlight: function(primitive) {
      return forLine(primitive);
    },
    handler: function() {
      var lines;
      lines = tool.nearList.filter(forLine);
      if (lines.length > 0) {
        tool.buffer.theLine = lines[0];
        tool.preview = PLine.getParallel(tool.buffer.theLine, getPreviewPoint());
        tool.preview.color = '#cccccc';
        return 'line-parallel:point';
      } else {
        return 'line-parallel:line';
      }
    }
  };
  this['line-parallel:point'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive);
    },
    handler: function() {
      var pts;
      pts = tool.nearList.filter(forPoint);
      if (pts.length > 0) {
        plane.addPrimitive(PLine.getParallel(tool.buffer.theLine, pts[0]));
        return 'none';
      }
      return 'line-parallel:point';
    }
  };
  this['line-intersection:a'] = {
    doHighlight: function(primitive) {
      return forLine(primitive);
    },
    handler: function() {
      var lines;
      lines = tool.nearList.filter(forLine);
      if (lines.length > 0) {
        tool.buffer.theLine = lines[0];
        return 'line-intersection:b';
      } else {
        return 'line-intersection:a';
      }
    }
  };
  this['line-intersection:b'] = {
    doHighlight: function(primitive) {
      return forLine(primitive);
    },
    handler: function() {
      var lines;
      lines = tool.nearList.filter(forLine);
      if (lines.length > 0) {
        plane.addPrimitive(PLine.getIntersection(tool.buffer.theLine, lines[0]));
        return 'none';
      } else {
        return 'line-intersection:b';
      }
    }
  };
  this['circle:center'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive);
    },
    handler: function() {
      var pts;
      pts = tool.nearList.filter(forPoint);
      if (pts.length > 0) {
        tool.buffer.theCenter = pts[0];
        tool.preview = new PCircle(tool.buffer.theCenter, getPreviewPoint());
        tool.preview.color = '#cccccc';
        return 'circle:radius';
      }
      return 'circle:center';
    }
  };
  this['circle:radius'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive);
    },
    handler: function() {
      var pts;
      pts = tool.nearList.filter(forPoint);
      if (pts.length > 0) {
        plane.addPrimitive(new PCircle(tool.buffer.theCenter, pts[0]));
        return 'none';
      }
      return 'circle:radius';
    }
  };
  this['circle-orthocenter:A'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive);
    },
    handler: function() {
      var pts;
      pts = tool.nearList.filter(forPoint);
      if (pts.length > 0) {
        tool.buffer.orthoA = pts[0];
        return 'circle-orthocenter:B';
      }
      return 'circle-orthocenter:A';
    }
  };
  this['circle-orthocenter:B'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive);
    },
    handler: function() {
      var pts;
      pts = tool.nearList.filter(forPoint);
      if (pts.length > 0) {
        tool.buffer.orthoB = pts[0];
        tool.preview = new PCircle(PCircle.getOrthoCircle(tool.buffer.orthoA, tool.buffer.orthoB, getPreviewPoint()), tool.buffer.orthoA);
        tool.preview.color = '#cccccc';
        return 'circle-orthocenter:C';
      }
      return 'circle-orthocenter:B';
    }
  };
  this['circle-orthocenter:C'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive);
    },
    handler: function() {
      var pts;
      pts = tool.nearList.filter(forPoint);
      if (pts.length > 0) {
        PCircle.addOrthoCenter(plane, tool.buffer.orthoA, tool.buffer.orthoB, pts[0]);
        return 'none';
      }
      return 'circle-orthocenter:C';
    }
  };
  this['circle-tangent:circle'] = {
    doHighlight: function(primitive) {
      return forCircle(primitive);
    },
    handler: function() {
      var circles;
      circles = tool.nearList.filter(forCircle);
      if (circles.length > 0) {
        tool.buffer.theCircle = circles[0];
        return 'circle-tangent:point';
      }
      return 'circle-tangent:circle';
    }
  };
  this['circle-tangent:point'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive);
    },
    handler: function() {
      var pts;
      pts = tool.nearList.filter(forPoint);
      if (pts.length > 0) {
        plane.addPrimitive(PCircle.getTangentLine(tool.buffer.theCircle, pts[0]));
        return 'none';
      }
      return 'circle-tangent:point';
    }
  };
  this['circle-intersection-line:circle'] = {
    doHighlight: function(primitive) {
      return forCircle(primitive);
    },
    handler: function() {
      var circles;
      circles = tool.nearList.filter(forCircle);
      if (circles.length > 0) {
        tool.buffer.theCircle = circles[0];
        return 'circle-intersection-line:line';
      }
      return 'circle-intersection-line:circle';
    }
  };
  this['circle-intersection-line:line'] = {
    doHighlight: function(primitive) {
      return forLine(primitive);
    },
    handler: function() {
      var inters, lines;
      lines = tool.nearList.filter(forLine);
      if (lines.length > 0) {
        inters = PCircle.getLineCircleIntersection(tool.buffer.theCircle, lines[0]);
        plane.addPrimitive(inters[0]);
        plane.addPrimitive(inters[1]);
        return 'none';
      }
      return 'circle-intersection-line:line';
    }
  };
});
