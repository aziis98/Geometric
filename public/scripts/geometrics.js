var PLine, PPlane, PPoint;

exports.PPlane = PPlane = (function() {
  function PPlane() {
    this.primitives = [];
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
    this.selected = false;
  }

  PPoint.prototype.render = function(g) {
    g.setColor('#000000');
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

  return PPoint;

})();

exports.PLine = PLine = (function() {
  function PLine(a, b, c) {
    this.typename = 'PLine';
    this.selected = false;
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
    g.setColor('#000000');
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
