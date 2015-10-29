

exports.PPlane = class PPlane
    constructor: ->
        @primitives = []

    render: (g) ->
        for primitive in @primitives
            primitive.render g
        return

    addPrimitive: (primitive) ->
        @primitives.push primitive

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
        @selected = false

    render: (g) ->
        g.setColor '#000000'
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

exports.PLine = class PLine
    constructor: (a, b, c) ->
        @typename = 'PLine'
        @selected = false
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

        g.setColor('#000000')
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

    @getIntersection: (l1, l2) ->
        fx = -> - (l2.b() * l1.c() - l1.b() * l2.c()) / (l2.a() * l1.b() - l1.a() * l2.b())
        fy = -> - (l1.a() * l2.c() - l2.a() * l1.c()) / (l2.a() * l1.b() - l1.a() * l2.b())
        return new PPoint(fx, fy)
























#
