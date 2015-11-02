remote = require 'remote'
ipc = require 'ipc'
Menu = remote.require 'menu'

_plane = undefined

angular.module('geometric', [ 'toolbar', 'gcanvas', 'structure', 'infobar', 'handler' ])
    .controller 'geomCtrl', ($scope, $rootScope, $interval, $timeout, plane, tool, mouse, snapper) ->
        $scope.author = "Antonio"

        _plane = plane


        menu = Menu.buildFromTemplate [
            {
                label: 'File'
                submenu: [
                    {
                        label: 'Save'
                        click: (item, focusedWindow) ->
                            console.log 'Saving...\n'
                            for primitive in plane.primitives
                                console.log primitive.typename + ' : ' + primitive.renderer
                    }
                    {
                        label: 'Settings'
                        click: (item, focusedWindow) ->
                            ipc.send('settings.toggle')
                    }
                ]
            }
            {
                label: 'View',
                submenu: [
                    {
                        label: 'Reload'
                        accelerator: 'CmdOrCtrl+R'
                        click: (item, focusedWindow) ->
                            if focusedWindow
                                focusedWindow.reload()
                    }
                    {
                        label: 'Toggle Full Screen'
                        accelerator: (->
                            if process.platform is 'darwin'
                                return 'Ctrl+Command+F'
                            else
                                return 'F11'
                        )()
                        click: (item, focusedWindow) ->
                            if focusedWindow
                                focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
                    }
                    {
                        label: 'Toggle Developer Tools'
                        accelerator: (->
                            if (process.platform == 'darwin')
                                return 'Alt+Command+I'
                            else
                                return 'Ctrl+Shift+I'
                        )()
                        click: (item, focusedWindow) ->
                            if (focusedWindow)
                                focusedWindow.toggleDevTools()
                    }
                ]
            }
        ]

        Menu.setApplicationMenu menu


        $ ->
            $('body').on 'selectstart', false
            $(document).keyup (e) ->
                if e.which == 27
                    tool.id = 'none'
                    tool.preview = undefined
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

                if tool.dragging
                    snapper.updateGuides()
                    if tool.dragged.nosnap
                        tool.dragged.x = snapper.pure.x
                        tool.dragged.y = snapper.pure.y
                    else
                        tool.dragged.x = snapper.x
                        tool.dragged.y = snapper.y


            $(document).mousedown (e) ->
                mouse.button = e.which

                if mouse.button == 3
                    pts = tool.nearList.filter (primitive) -> primitive.typename is 'PPoint'
                    if pts.length > 0 and pts[0]._dist <= 9 and pts[0].isUndependant()
                        tool.dragging = true
                        tool.dragged = pts[0]


            $(document).mouseup (e) ->
                if tool.dragging
                    tool.dragging = false
                    tool.dragged = undefined

            mouse.vw = $('.gcanvas').width()
            mouse.vh = $('.gcanvas').height()


        $(window).resize (e) ->
            mouse.vw = $('.gcanvas').width()
            mouse.vh = $('.gcanvas').height()
