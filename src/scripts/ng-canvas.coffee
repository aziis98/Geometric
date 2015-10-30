Graphics = require 'node-canvas-graphics-wrapper'

angular.module('gcanvas', [])
    .directive 'geometricCanvas', () ->
        restrict: 'E'
        replace: true
        scope: { }
        template: '''
            <div class="gcanvas">
                <canvas id="canvas" ng-click="onClick()"></canvas>
            </div>
        '''
        controller: ($scope, $interval, plane, tool, mouse) ->
            $scope.onClick = ->
                console.log 'clicked!'

            $scope.$on 'actionComplete', ->
                console.log 'actionComplete()'

            $scope.getGraphics = ->
                theCanvas = $('#canvas')[0]
                theCanvas.width = mouse.vw
                theCanvas.height = mouse.vh
                Graphics.createFromCanvas(theCanvas, { width: theCanvas.width, height: theCanvas.height })


            render = (g) ->
                g.ctx.clearRect(0, 0, g.viewport.width, g.viewport.height)

                nearList = plane.getClosestTo(mouse.x - plane.translation.x, mouse.y - plane.translation.y)
                g.translate(plane.translation.x, plane.translation.y)
                plane.render g
                for primitive in plane.primitives.slice().sort((a, b) -> a.typename.localeCompare(b.typename))
                    if $scope.toolhandler[tool.id].highlight.has(primitive.typename)
                        primitive.highLight g
                g.translate(-plane.translation.x, -plane.translation.y)

                if tool.id != 'none'
                    g.setColor('#000000')
                    g.drawLine(mouse.x - 10, mouse.y, mouse.x + 10, mouse.y)
                    g.drawLine(mouse.x, mouse.y - 10, mouse.x, mouse.y + 10)

            $interval((-> render($scope.getGraphics())), 1000 / 120)

            $scope.toolhandler = {
                'point': {
                    #highlight: ['PPoint', 'PLine', '...']
                    highlight: []
                    handler: (nearList) ->

                    onComplete: ->

                }
            }
