Graphics = require 'node-canvas-graphics-wrapper'

angular.module('gcanvas', [ 'handler' ])
    .directive 'geometricCanvas', () ->
        restrict: 'E'
        replace: true
        scope: { }
        template: '''
            <div class="gcanvas">
                <canvas id="canvas" ng-click="onClick()"></canvas>
            </div>
        '''
        controller: ($scope, $rootScope, $interval, plane, tool, toolhandler, mouse, snapper) ->
            $scope.onClick = ->
                if toolhandler[tool.id].handler
                    tool.id = toolhandler[tool.id].handler()
                    if tool.id is 'none'
                        tool.preview = undefined

            $rootScope.$on 'actionComplete', ->
                if toolhandler[tool.id].doComplete
                    tool.id = toolhandler[tool.id].doComplete()
                    tool.preview = undefined

            $scope.getGraphics = ->
                theCanvas = $('#canvas')[0]
                theCanvas.width = mouse.vw
                theCanvas.height = mouse.vh
                Graphics.createFromCanvas(theCanvas, { width: theCanvas.width, height: theCanvas.height })

            render = (g) ->
                g.ctx.clearRect(0, 0, g.viewport.width, g.viewport.height)

                g.setColor(plane.background)
                g.fillRect(0, 0, g.viewport.width, g.viewport.height)

                # update

                tool.nearList = plane.getClosestTo(mouse.x - plane.translation.x, mouse.y - plane.translation.y)

                if tool.id != 'none'
                    snapper.updateGuides()

                # render
                g.translate(plane.translation.x, plane.translation.y)

                plane.render g

                if tool.preview
                    tool.preview.render g

                snapper.renderGuides g

                for primitive in plane.primitives.slice().sort((a, b) -> a.typename.localeCompare(b.typename))
                    if toolhandler[tool.id].doHighlight(primitive)
                        primitive.highLight g

                g.translate(-plane.translation.x, -plane.translation.y)

                if tool.id != 'none'
                    g.setColor('#000000')
                    g.drawLine(mouse.x - 10, mouse.y, mouse.x + 10, mouse.y)
                    g.drawLine(mouse.x, mouse.y - 10, mouse.x, mouse.y + 10)

            $interval((-> render($scope.getGraphics())), 1000 / 120)
