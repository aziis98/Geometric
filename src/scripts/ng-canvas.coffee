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
                if plane.removeDirty
                    plane.primitives = plane.primitives.filter((p) -> !p.options.remove)
                    plane.removeDirty = false

                tool.nearList = plane.getClosestTo(mouse.x - plane.translation.x, mouse.y - plane.translation.y).filter((p) -> p.options.visible)

                if tool.id != 'none'
                    snapper.updateGuides()

                # render
                g.translate(plane.translation.x, plane.translation.y)

                plane.render g

                if tool.preview
                    tool.preview.render g

                if !tool.dragged?.nosnap
                    snapper.renderGuides g

                hprs = tool.nearList[..].sort((a, b) -> -a.typename.localeCompare(b.typename)).filter toolhandler[tool.id].doHighlight
                if hprs.length > 0 and hprs[0].options.visible
                    hprs[0].highLight g

                g.translate(-plane.translation.x, -plane.translation.y)

                if tool.id != 'none'
                    g.setColor('#000000')
                    g.drawLine(mouse.x - 10, mouse.y, mouse.x + 10, mouse.y)
                    g.drawLine(mouse.x, mouse.y - 10, mouse.x, mouse.y + 10)

            $interval (->
                start = new Date().getTime()
                render($scope.getGraphics())
                console.log 'Speed: ' + ((new Date().getTime()) - start)
            ), 1
