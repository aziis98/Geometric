

angular.module('geometric', [ 'toolbar', 'gcanvas', 'infobar', 'handler' ])
    .controller 'geomCtrl', ($scope, $interval, $timeout, tool, mouse) ->
        $scope.author = "Antonio"

        $ ->
            $('body').on 'selectstart', false
            $(document).keyup (e) ->
                if e.which == 27
                    tool.id = 'none'
                if e.which == 13
                    $scope.$broadcast 'actionComplete'

            offset = $('.gcanvas').offset()
            $(document).mousemove (e) ->
                mouse.px = mouse.x
                mouse.py = mouse.y
                mouse.x = e.pageX - offset.left
                mouse.y = e.pageY - offset.top


            mouse.vw = $('.gcanvas').width()
            mouse.vh = $('.gcanvas').height()


        $(window).resize (e) ->
            mouse.vw = $('.gcanvas').width()
            mouse.vh = $('.gcanvas').height()
