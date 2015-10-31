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

    .service 'toolhandler', (mouse, plane, tool) ->
        forPoint = (primitive) ->
            primitive.typename is 'PPoint' and primitive._dist <= 9

        @['none'] = {
            doHighlight: (primitive) ->
                return forPoint primitive
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

        return
