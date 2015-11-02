

exports.PPlane = class PPlane
    constructor: ->
        @primitives = []
        @translation = { x: 0, y: 0 }
        @background = '#e8e8e8'

    render: (g) ->
        for primitive in @primitives
            if primitive.options.visible
                primitive.render g
                if primitive.options.hover or primitive.options.selected
                    primitive.highLight g
        return

    addPrimitive: (primitive) ->
        @primitives.push primitive
        primitive.options.name = primitive.typename[1..].toLowerCase() + (@primitives.filter((p) -> primitive.typename is p.typename).length)

    getClosestTo: (x, y) ->
        bf = @primitives.slice()

        for primitive in bf
            primitive._dist = primitive.distance(x, y)

        bf.sort (a, b) ->
            return a._dist - b._dist

        return bf

exports.PPoint = class PPoint
    constructor: (@x, @y) ->
        @typename = 'PPoint'
        @options = { visible: true }
        @color = '#000000'
        @nosnap = false

    render: (g) ->
        g.setColor @color
        g.drawCircle @getX(), @getY(), 5
        g.fillCircle @getX(), @getY(), 3

    highLight: (g) ->
        if @isUndependant()
            g.setColor '#00b020'
        else
            g.setColor '#ff4000'
        g.setLineWidth(2)
        g.drawCircle @getX(), @getY(), 8
        g.setLineWidth(1)

    getX: ->
        return (@x?() ? @x)
    getY: ->
        return (@y?() ? @y)
    isUndependant: ->
        return typeof @x isnt 'function'

    distance: (x, y) ->
        dx = x - @getX()
        dy = y - @getY()
        return Math.sqrt(dx * dx + dy * dy)


    @getCentroid: (ptlist) ->
        return new PPoint(
            (->
                rx = 0
                for pt in ptlist
                    rx += pt.getX()
                return rx / ptlist.length
            ),
            (->
                ry = 0
                for pt in ptlist
                    ry += pt.getY()
                return ry / ptlist.length
            )
        )

    @getMidpoint: (a, b) ->
        return @getCentroid([a, b])

    @getLineLink: (line, ctrlPt) ->
        ctrlPt.color = '#0000FF'
        ctrlPt.nosnap = true
        p1 = PLine.getPerpendicular(line, ctrlPt)
        return PLine.getIntersection(p1, line)



exports.PLine = class PLine
    constructor: (a, b, c) ->
        @typename = 'PLine'
        @options = { visible: true }
        @color = '#000000'

        if a.typename is 'PPoint'
            @a = -> b.getY() - a.getY()
            @b = -> a.getX() - b.getX()
            @c = -> a.getX() * b.getY() - a.getY() * b.getX()
        else
            @a = a
            @b = b
            @c = c

    render: (g) ->
        @_ty = -g.transform.y
        @_a = @a()
        @_b = @b()
        @_c = @c()

        @_y = @_c / @_b if @_a == 0

        @_x1 = (@_c - @_b * (@_ty)) / @_a
        @_x2 = (@_c - @_b * (@_ty + g.viewport.height)) / @_a

        g.setColor @color
        if @_a != 0
            g.drawLine(@_x1, @_ty, @_x2, @_ty + g.viewport.height)
        else
            g.drawLine(-g.transform.x, @_y, -g.transform.x + g.viewport.width, @_y)
    highLight: (g) ->
        g.setColor('#ff8080')
        g.setLineWidth(2)
        if @_a != 0
            g.drawLine(@_x1, @_ty, @_x2, @_ty + g.viewport.height)
        else
            g.drawLine(-g.transform.x, @_y, -g.transform.x + g.viewport.width, @_y)
        g.setLineWidth(1)

    isUndependant: -> false

    distance: (x, y) ->
        _a = @a()
        _b = @b()
        _c = @c()
        return Math.abs(_a * x + _b * y - _c) / Math.sqrt(_a * _a + _b * _b)

    @getPerpendicular: (line, pt) ->
        return new PLine(line.b, (-> -line.a()),
            (-> pt.getX() * line.b() - pt.getY() * line.a())
        )

    @getParallel: (line, pt) ->
        return new PLine(line.a, line.b,
            (-> pt.getX() * line.a() + pt.getY() * line.b())
        )

    @getIntersection: (l1, l2) ->
        fx = -> - (l2.b() * l1.c() - l1.b() * l2.c()) / (l2.a() * l1.b() - l1.a() * l2.b())
        fy = -> - (l1.a() * l2.c() - l2.a() * l1.c()) / (l2.a() * l1.b() - l1.a() * l2.b())
        return new PPoint(fx, fy)

exports.PCircle = class PCircle
    constructor: (center, other) ->
        @typename = 'PCircle'
        @options = { visible: true }
        @color = '#000000'

        @center = center
        @radius = -> center.distance(other.getX(), other.getY())

    render: (g) ->
        g.setColor @color
        g.drawCircle @center.getX(), @center.getY(), @radius()
    highLight: (g) ->
        g.setColor('#ff8080')
        g.setLineWidth(2)
        g.drawCircle @center.getX(), @center.getY(), @radius()
        g.setLineWidth(1)

    isUndependant: -> false

    distance: (x, y) ->
        return Math.abs(@center.distance(x, y) - @radius())

    @getOrthoCircle: (a, b, c) ->
        l1 = new PLine(a, b)
        l2 = new PLine(b, c)
        p1 = PLine.getPerpendicular(l1, PPoint.getMidpoint(a, b))
        p2 = PLine.getPerpendicular(l2, PPoint.getMidpoint(b, c))
        return PLine.getIntersection(p1, p2)

    @addOrthoCenter: (plane, a, b, c) ->
        center = @getOrthoCircle(a, b, c)
        plane.addPrimitive center
        plane.addPrimitive new PCircle(center, a)

    @getTangentLine: (circle, point) ->
        l1 = new PLine(circle.center, point)
        return PLine.getPerpendicular(l1, point)

    @getLineCircleIntersection: (circle, line) ->
        mid = PLine.getIntersection(PLine.getPerpendicular(line, circle.center), line)
        centermid = -> circle.center.distance(mid.getX(), mid.getY())
        v = -> Math.sqrt(circle.radius() * circle.radius() - centermid() * centermid())
        a2b2 = -> Math.sqrt(line.a() * line.a() + line.b() * line.b() )
        n = -> {
            x: (line.b() / a2b2() )
            y: ( -line.a() / a2b2() )
        }
        ix1 = -> n().x * v() + mid.getX()
        iy1 = -> n().y * v() + mid.getY()

        ix2 = -> -n().x * v() + mid.getX()
        iy2 = -> -n().y * v() + mid.getY()
        return [new PPoint(ix1, iy1), new PPoint(ix2, iy2)]


















#
