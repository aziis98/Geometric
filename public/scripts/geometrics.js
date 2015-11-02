var PCircle, PLine, PPlane, PPoint;

exports.PPlane = PPlane = (function() {
  function PPlane() {
    this.primitives = [];
    this.translation = {
      x: 0,
      y: 0
    };
    this.background = '#e8e8e8';
  }

  PPlane.prototype.render = function(g) {
    var i, len, primitive, ref;
    ref = this.primitives;
    for (i = 0, len = ref.length; i < len; i++) {
      primitive = ref[i];
      primitive.render(g);
    }
  };

  PPlane.prototype.addPrimitive = function(primitive) {
    return this.primitives.push(primitive);
  };

  PPlane.prototype.getClosestTo = function(x, y) {
    var bf, i, len, primitive;
    bf = this.primitives.slice();
    for (i = 0, len = bf.length; i < len; i++) {
      primitive = bf[i];
      primitive._dist = primitive.distance(x, y);
    }
    bf.sort(function(a, b) {
      return a._dist - b._dist;
    });
    return bf;
  };

  return PPlane;

})();

exports.PPoint = PPoint = (function() {
  function PPoint(x1, y1) {
    this.x = x1;
    this.y = y1;
    this.typename = 'PPoint';
    this.renderer = '';
    this.color = '#000000';
    this.nosnap = false;
  }

  PPoint.prototype.render = function(g) {
    g.setColor(this.color);
    g.drawCircle(this.getX(), this.getY(), 5);
    return g.fillCircle(this.getX(), this.getY(), 3);
  };

  PPoint.prototype.highLight = function(g) {
    if (this.isUndependant()) {
      g.setColor('#00b020');
    } else {
      g.setColor('#ff4000');
    }
    g.setLineWidth(2);
    g.drawCircle(this.getX(), this.getY(), 8);
    return g.setLineWidth(1);
  };

  PPoint.prototype.getX = function() {
    var ref;
    return (ref = typeof this.x === "function" ? this.x() : void 0) != null ? ref : this.x;
  };

  PPoint.prototype.getY = function() {
    var ref;
    return (ref = typeof this.y === "function" ? this.y() : void 0) != null ? ref : this.y;
  };

  PPoint.prototype.isUndependant = function() {
    return typeof this.x !== 'function';
  };

  PPoint.prototype.distance = function(x, y) {
    var dx, dy;
    dx = x - this.getX();
    dy = y - this.getY();
    return Math.sqrt(dx * dx + dy * dy);
  };

  PPoint.getCentroid = function(ptlist) {
    return new PPoint((function() {
      var i, len, pt, rx;
      rx = 0;
      for (i = 0, len = ptlist.length; i < len; i++) {
        pt = ptlist[i];
        rx += pt.getX();
      }
      return rx / ptlist.length;
    }), (function() {
      var i, len, pt, ry;
      ry = 0;
      for (i = 0, len = ptlist.length; i < len; i++) {
        pt = ptlist[i];
        ry += pt.getY();
      }
      return ry / ptlist.length;
    }));
  };

  PPoint.getMidpoint = function(a, b) {
    return this.getCentroid([a, b]);
  };

  PPoint.getLineLink = function(line, ctrlPt) {
    var p1;
    ctrlPt.color = '#0000FF';
    ctrlPt.nosnap = true;
    p1 = PLine.getPerpendicular(line, ctrlPt);
    return PLine.getIntersection(p1, line);
  };

  return PPoint;

})();

exports.PLine = PLine = (function() {
  function PLine(a, b, c) {
    this.typename = 'PLine';
    this.renderer = '';
    this.color = '#000000';
    if (a.typename === 'PPoint') {
      this.a = function() {
        return b.getY() - a.getY();
      };
      this.b = function() {
        return a.getX() - b.getX();
      };
      this.c = function() {
        return a.getX() * b.getY() - a.getY() * b.getX();
      };
    } else {
      this.a = a;
      this.b = b;
      this.c = c;
    }
  }

  PLine.prototype.render = function(g) {
    this._ty = -g.transform.y;
    this._a = this.a();
    this._b = this.b();
    this._c = this.c();
    if (this._a === 0) {
      this._y = this._c / this._b;
    }
    this._x1 = (this._c - this._b * this._ty) / this._a;
    this._x2 = (this._c - this._b * (this._ty + g.viewport.height)) / this._a;
    g.setColor(this.color);
    if (this._a !== 0) {
      return g.drawLine(this._x1, this._ty, this._x2, this._ty + g.viewport.height);
    } else {
      return g.drawLine(-g.transform.x, this._y, -g.transform.x + g.viewport.width, this._y);
    }
  };

  PLine.prototype.highLight = function(g) {
    g.setColor('#ff8080');
    g.setLineWidth(2);
    if (this._a !== 0) {
      g.drawLine(this._x1, this._ty, this._x2, this._ty + g.viewport.height);
    } else {
      g.drawLine(-g.transform.x, this._y, -g.transform.x + g.viewport.width, this._y);
    }
    return g.setLineWidth(1);
  };

  PLine.prototype.isUndependant = function() {
    return false;
  };

  PLine.prototype.distance = function(x, y) {
    var _a, _b, _c;
    _a = this.a();
    _b = this.b();
    _c = this.c();
    return Math.abs(_a * x + _b * y - _c) / Math.sqrt(_a * _a + _b * _b);
  };

  PLine.getPerpendicular = function(line, pt) {
    return new PLine(line.b, (function() {
      return -line.a();
    }), (function() {
      return pt.getX() * line.b() - pt.getY() * line.a();
    }));
  };

  PLine.getParallel = function(line, pt) {
    return new PLine(line.a, line.b, (function() {
      return pt.getX() * line.a() + pt.getY() * line.b();
    }));
  };

  PLine.getIntersection = function(l1, l2) {
    var fx, fy;
    fx = function() {
      return -(l2.b() * l1.c() - l1.b() * l2.c()) / (l2.a() * l1.b() - l1.a() * l2.b());
    };
    fy = function() {
      return -(l1.a() * l2.c() - l2.a() * l1.c()) / (l2.a() * l1.b() - l1.a() * l2.b());
    };
    return new PPoint(fx, fy);
  };

  return PLine;

})();

exports.PCircle = PCircle = (function() {
  function PCircle(center, other) {
    this.typename = 'PCircle';
    this.renderer = '';
    this.color = '#000000';
    this.center = center;
    this.radius = function() {
      return center.distance(other.getX(), other.getY());
    };
  }

  PCircle.prototype.render = function(g) {
    g.setColor(this.color);
    return g.drawCircle(this.center.getX(), this.center.getY(), this.radius());
  };

  PCircle.prototype.highLight = function(g) {
    g.setColor('#ff8080');
    g.setLineWidth(2);
    g.drawCircle(this.center.getX(), this.center.getY(), this.radius());
    return g.setLineWidth(1);
  };

  PCircle.prototype.isUndependant = function() {
    return false;
  };

  PCircle.prototype.distance = function(x, y) {
    return Math.abs(this.center.distance(x, y) - this.radius());
  };

  PCircle.getOrthoCircle = function(a, b, c) {
    var l1, l2, p1, p2;
    l1 = new PLine(a, b);
    l2 = new PLine(b, c);
    p1 = PLine.getPerpendicular(l1, PPoint.getMidpoint(a, b));
    p2 = PLine.getPerpendicular(l2, PPoint.getMidpoint(b, c));
    return PLine.getIntersection(p1, p2);
  };

  PCircle.addOrthoCenter = function(plane, a, b, c) {
    var center;
    center = this.getOrthoCircle(a, b, c);
    plane.addPrimitive(center);
    return plane.addPrimitive(new PCircle(center, a));
  };

  PCircle.getTangentLine = function(circle, point) {
    var l1;
    l1 = new PLine(circle.center, point);
    return PLine.getPerpendicular(l1, point);
  };

  PCircle.getLineCircleIntersection = function(circle, line) {
    var a2b2, centermid, ix1, ix2, iy1, iy2, mid, n, v;
    mid = PLine.getIntersection(PLine.getPerpendicular(line, circle.center), line);
    centermid = function() {
      return circle.center.distance(mid.getX(), mid.getY());
    };
    v = function() {
      return Math.sqrt(circle.radius() * circle.radius() - centermid() * centermid());
    };
    a2b2 = function() {
      return Math.sqrt(line.a() * line.a() + line.b() * line.b());
    };
    n = function() {
      return {
        x: line.b() / a2b2(),
        y: -line.a() / a2b2()
      };
    };
    ix1 = function() {
      return n().x * v() + mid.getX();
    };
    iy1 = function() {
      return n().y * v() + mid.getY();
    };
    ix2 = function() {
      return -n().x * v() + mid.getX();
    };
    iy2 = function() {
      return -n().y * v() + mid.getY();
    };
    return [new PPoint(ix1, iy1), new PPoint(ix2, iy2)];
  };

  return PCircle;

})();
