{PPlane, PPoint, PLine} = require './public/scripts/geometrics.js'

angular.module('handler', [])
    .value 'plane', new PPlane

    .value 'tool', {
        id: 'none'
        buffer: {  }
        selectTool: (tool) ->
            console.log 'Selected Tool: ' + tool
            @id = tool
    }
    .value 'mouse', {
        x: 0
        y: 0
        px: 0
        py: 0
        vw: 1920
        vh: 1080
    }
