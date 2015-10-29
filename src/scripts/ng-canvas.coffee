angular.module('gcanvas', [])
    .directive 'geometricCanvas', () ->
        restrict: 'E'
        replace: true
        template: '''
            <div class="gcanvas">
                <canvas id="canvas"></canvas>
            </div>
        '''
    .controller 'geometricCtrl', ($scope) ->
