

angular.module('geometric', [ 'toolbar', 'gcanvas', 'infobar', 'handler' ])
    .controller 'geomCtrl', ($scope, $rootScope, $interval, $timeout, plane, tool, mouse, snapper) ->
        $scope.author = "Antonio"

        $ ->
            $('body').on 'selectstart', false
            $(document).keyup (e) ->
                if e.which == 27
                    tool.id = 'none'
                if e.which == 13
                    $rootScope.$emit 'actionComplete'

            offset = $('.gcanvas').offset()
            $(document).mousemove (e) ->
                mouse.px = mouse.x
                mouse.py = mouse.y
                mouse.x = e.pageX - offset.left
                mouse.y = e.pageY - offset.top
                mouse.button = e.which

                if mouse.button == 2 # middle maybe
                    plane.translation.x += mouse.x - mouse.px
                    plane.translation.y += mouse.y - mouse.py

                if mouse.button == 3 # right button
                    pts = tool.nearList.filter (primitive) -> primitive.typename is 'PPoint'
                    if pts.length > 0 and pts[0]._dist <= 9 and pts[0].isUndependant()
                        pts[0].x = snapper.x
                        pts[0].y = snapper.y

            mouse.vw = $('.gcanvas').width()
            mouse.vh = $('.gcanvas').height()


        $(window).resize (e) ->
            mouse.vw = $('.gcanvas').width()
            mouse.vh = $('.gcanvas').height()
