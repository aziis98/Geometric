{PPlane, PPoint, PLine, PCircle} = require './public/scripts/geometrics.js'

angular.module('handler', [])
    .value 'plane', new PPlane()

    .value 'tool', {
        id: 'none'
        nearList: []
        buffer:
            centroid: []
        dragging: false
        dragged: undefined
        preview: undefined
    }

    .value 'mouse', {
        x: 0
        y: 0
        px: 0
        py: 0
        button: 0
        vw: 1920
        vh: 1080
    }

    .service 'snapper', (mouse, plane, tool) ->
        @x = 0
        @y = 0
        @pure = {
            x: 0
            y: 0
        }

        @guides = []

        @updateGuides = ->
            @guides = []
            @x = mouse.x - plane.translation.x
            @y = mouse.y - plane.translation.y

            @pure.x = mouse.x - plane.translation.x
            @pure.y = mouse.y - plane.translation.y

            ptsX = plane.primitives
                .filter((p) -> p.typename is 'PPoint')
                .map((p) -> { obj: p, dist: Math.abs(p.getX() - (mouse.x - plane.translation.x)) })
                .sort((a, b) -> a.dist - b.dist)

            if ptsX.length > 1
                if ptsX[1].dist <= 5
                    @x = ptsX[1].obj.getX()
                    @guides.push({
                        type: 'x'
                        x: ptsX[1].obj.getX()
                    })

            ptsY = plane.primitives
                .filter((p) -> p.typename is 'PPoint')
                .map((p) -> { obj: p, dist: Math.abs(p.getY() - (mouse.y - plane.translation.y)) })
                .sort((a, b) -> a.dist - b.dist)

            if ptsY.length > 1
                if ptsY[1].dist <= 5
                    @y = ptsY[1].obj.getY()
                    @guides.push({
                        type: 'y'
                        y: ptsY[1].obj.getY()
                    })

        @renderGuides = (g) ->
            if tool.dragging
                g.setColor('#ffc300')
                g.setLineWidth(1)
                for guide in @guides
                    switch guide.type
                        when 'x'
                            g.drawLine(guide.x, -g.transform.y, guide.x, g.viewport.height - g.transform.y)
                        when 'y'
                            g.drawLine(-g.transform.x, guide.y, g.viewport.width - g.transform.x, guide.y)

        return



    .service 'toolhandler', (mouse, plane, tool, snapper) ->
        forPoint = (primitive) ->
            primitive.typename is 'PPoint' and primitive._dist <= 9
        forLine = (primitive) ->
            primitive.typename is 'PLine' and primitive._dist <= 5
        forCircle = (primitive) ->
            primitive.typename is 'PCircle' and primitive._dist <= 7


        getPreviewPoint = ->
            return new PPoint((-> snapper.pure.x), (-> snapper.pure.y))

        @['none'] = {
            doHighlight: (primitive) ->
                return forPoint(primitive)
        }

        @['point'] = {
            doHighlight: (primitive) ->
                return false
            handler: ->
                plane.addPrimitive new PPoint(mouse.x - plane.translation.x, mouse.y - plane.translation.y)
                return 'none'
            doComplete: ->
                return 'point'
        }

        @['point-dep-line:line'] = {
            doHighlight: (primitive) ->
                return forLine(primitive)
            handler: ->
                lines = tool.nearList.filter forLine
                if lines.length > 0
                    tool.buffer.theLine = lines[0]
                    return 'point-dep-line:point'
                return 'point-dep-line:line'
        }
        @['point-dep-line:point'] = {
            doHighlight: (primitive) ->
                return forPoint(primitive)
            handler: ->
                pts = tool.nearList.filter forPoint
                if pts.length > 0
                    plane.addPrimitive PPoint.getLineLink(tool.buffer.theLine, pts[0])
                    return 'none'
                return 'point-dep-line:point'
        }

        @['point-centroid'] = {
            doHighlight: (primitive) ->
                return forPoint(primitive)
            handler: ->
                pts = tool.nearList.filter forPoint
                if pts.length > 0
                    tool.buffer.centroid.push pts[0]
                    clist = tool.buffer.centroid[..]
                    clist.push getPreviewPoint()
                    tool.preview = PPoint.getCentroid(clist)
                    tool.preview.color = '#cccccc'
                    return 'point-centroid'
            doComplete: ->
                plane.addPrimitive PPoint.getCentroid(tool.buffer.centroid)
                tool.buffer.centroid = []
                return 'none'
        }

        @['line:A'] = {
            doHighlight: (primitive) ->
                return forPoint(primitive)
            handler: ->
                pts = tool.nearList.filter forPoint
                if pts.length > 0
                    tool.buffer.lineA = pts[0]
                    tool.preview = new PLine(tool.buffer.lineA, getPreviewPoint())
                    tool.preview.color = '#cccccc'
                    return 'line:B'
                else
                    return 'line:A'
        }
        @['line:B'] = {
            doHighlight: (primitive) ->
                return forPoint(primitive)
            handler: ->
                pts = tool.nearList.filter forPoint
                if pts.length > 0
                    plane.addPrimitive new PLine(tool.buffer.lineA, pts[0])
                    return 'none'
                else
                    return 'line:B'
        }

        @['line-perpendicular:line'] = {
            doHighlight: (primitive) ->
                return forLine(primitive)
            handler: ->
                lines = tool.nearList.filter forLine
                if lines.length > 0
                    tool.buffer.theLine = lines[0]
                    tool.preview = PLine.getPerpendicular(tool.buffer.theLine, getPreviewPoint())
                    tool.preview.color = '#cccccc'
                    return 'line-perpendicular:point'
                else
                    return 'line-perpendicular:line'
        }
        @['line-perpendicular:point'] = {
            doHighlight: (primitive) ->
                return forPoint(primitive)
            handler: ->
                pts = tool.nearList.filter forPoint
                if pts.length > 0
                    plane.addPrimitive PLine.getPerpendicular(tool.buffer.theLine, pts[0])
                    return 'none'
                return 'line-perpendicular:point'
        }

        @['line-parallel:line'] = {
            doHighlight: (primitive) ->
                return forLine(primitive)
            handler: ->
                lines = tool.nearList.filter forLine
                if lines.length > 0
                    tool.buffer.theLine = lines[0]
                    tool.preview = PLine.getParallel(tool.buffer.theLine, getPreviewPoint())
                    tool.preview.color = '#cccccc'
                    return 'line-parallel:point'
                else
                    return 'line-parallel:line'
        }
        @['line-parallel:point'] = {
            doHighlight: (primitive) ->
                return forPoint(primitive)
            handler: ->
                pts = tool.nearList.filter forPoint
                if pts.length > 0
                    plane.addPrimitive PLine.getParallel(tool.buffer.theLine, pts[0])
                    return 'none'
                return 'line-parallel:point'
        }

        @['line-intersection:a'] = {
            doHighlight: (primitive) ->
                return forLine(primitive)
            handler: ->
                lines = tool.nearList.filter forLine
                if lines.length > 0
                    tool.buffer.theLine = lines[0]
                    return 'line-intersection:b'
                else
                    return 'line-intersection:a'
        }
        @['line-intersection:b'] = {
            doHighlight: (primitive) ->
                return forLine(primitive)
            handler: ->
                lines = tool.nearList.filter forLine
                if lines.length > 0
                    plane.addPrimitive PLine.getIntersection(tool.buffer.theLine, lines[0])
                    return 'none'
                else
                    return 'line-intersection:b'
        }

        @['circle:center'] = {
            doHighlight: (primitive) ->
                return forPoint(primitive)
            handler: ->
                pts = tool.nearList.filter forPoint
                if pts.length > 0
                    tool.buffer.theCenter = pts[0]
                    tool.preview = new PCircle(tool.buffer.theCenter, getPreviewPoint())
                    tool.preview.color = '#cccccc'
                    return 'circle:radius'
                return 'circle:center'
        }
        @['circle:radius'] = {
            doHighlight: (primitive) ->
                return forPoint(primitive)
            handler: ->
                pts = tool.nearList.filter forPoint
                if pts.length > 0
                    plane.addPrimitive new PCircle(tool.buffer.theCenter, pts[0])
                    return 'none'
                return 'circle:radius'
        }

        @['circle-orthocenter:A'] = {
            doHighlight: (primitive) ->
                return forPoint(primitive)
            handler: ->
                pts = tool.nearList.filter forPoint
                if pts.length > 0
                    tool.buffer.orthoA = pts[0]
                    return 'circle-orthocenter:B'
                return 'circle-orthocenter:A'
        }
        @['circle-orthocenter:B'] = {
            doHighlight: (primitive) ->
                return forPoint(primitive)
            handler: ->
                pts = tool.nearList.filter forPoint
                if pts.length > 0
                    tool.buffer.orthoB = pts[0]
                    tool.preview = new PCircle(PCircle.getOrthoCircle(tool.buffer.orthoA, tool.buffer.orthoB, getPreviewPoint()), tool.buffer.orthoA)
                    tool.preview.color = '#cccccc'
                    return 'circle-orthocenter:C'
                return 'circle-orthocenter:B'
        }
        @['circle-orthocenter:C'] = {
            doHighlight: (primitive) ->
                return forPoint(primitive)
            handler: ->
                pts = tool.nearList.filter forPoint
                if pts.length > 0
                    PCircle.addOrthoCenter(plane, tool.buffer.orthoA, tool.buffer.orthoB, pts[0])
                    return 'none'
                return 'circle-orthocenter:C'
        }

        @['circle-tangent:circle'] = {
            doHighlight: (primitive) ->
                return forCircle(primitive)
            handler: ->
                circles = tool.nearList.filter forCircle
                if circles.length > 0
                    tool.buffer.theCircle = circles[0]
                    return 'circle-tangent:point'
                return 'circle-tangent:circle'
        }
        @['circle-tangent:point'] = {
            doHighlight: (primitive) ->
                return forPoint(primitive)
            handler: ->
                pts = tool.nearList.filter forPoint
                if pts.length > 0
                    plane.addPrimitive PCircle.getTangentLine(tool.buffer.theCircle, pts[0])
                    return 'none'
                return 'circle-tangent:point'
        }

        @['circle-intersection-line:circle'] = {
            doHighlight: (primitive) ->
                return forCircle(primitive)
            handler: ->
                circles = tool.nearList.filter forCircle
                if circles.length > 0
                    tool.buffer.theCircle = circles[0]
                    return 'circle-intersection-line:line'
                return 'circle-intersection-line:circle'
        }
        @['circle-intersection-line:line'] = {
            doHighlight: (primitive) ->
                return forLine(primitive)
            handler: ->
                lines = tool.nearList.filter forLine
                if lines.length > 0
                    inters = PCircle.getLineCircleIntersection(tool.buffer.theCircle, lines[0])
                    plane.addPrimitive inters[0]
                    plane.addPrimitive inters[1]
                    return 'none'
                return 'circle-intersection-line:line'
        }



        return
