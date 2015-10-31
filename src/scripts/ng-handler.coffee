{PPlane, PPoint, PLine} = require './public/scripts/geometrics.js'

angular.module('handler', [])
    .value 'plane', new PPlane()

    .value 'tool', {
        id: 'none'
        nearList: []
        buffer: {  }
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

        @guides = [
            {
                type: 'x'
                x: 100
            }
            {
                type: 'y'
                y: 500
            }
        ] # {type: 'x', ...}

        @updateGuides = ->
            pts = tool.nearList.filter forPoint
            best = undefined

        @renderGuides = (g) ->
            g.setColor('#ffc300')
            for guide in @guides
                switch guide.type
                    when 'x'
                        g.drawLine(guide.x, -g.transform.y, guide.x, g.viewport.height - g.transform.y)
                    when 'y'
                        g.drawLine(guide.y, -g.transform.x, g.viewport.height - g.transform.x, guide.y)



    .service 'toolhandler', (mouse, plane, tool) ->
        forPoint = (primitive) ->
            primitive.typename is 'PPoint' and primitive._dist <= 9

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

        @['line:A'] = {
            doHighlight: (primitive) ->
                return forPoint(primitive)
            handler: ->
                pts = tool.nearList.filter forPoint
                if pts.length > 0
                    tool.buffer.lineA = pts[0]
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

        return
