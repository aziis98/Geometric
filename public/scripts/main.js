var Menu, _plane, ipc, remote;

remote = require('remote');

ipc = require('ipc');

Menu = remote.require('menu');

_plane = void 0;

angular.module('geometric', ['toolbar', 'gcanvas', 'structure', 'infobar', 'handler']).controller('geomCtrl', function($scope, $rootScope, $interval, $timeout, plane, tool, mouse, snapper) {
  var menu;
  $scope.author = "Antonio";
  _plane = plane;
  menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Save',
          click: function(item, focusedWindow) {
            var i, len, primitive, ref, results;
            console.log('Saving...\n');
            ref = plane.primitives;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              primitive = ref[i];
              results.push(console.log(primitive.typename + ' : ' + primitive.renderer));
            }
            return results;
          }
        }, {
          label: 'Settings',
          click: function(item, focusedWindow) {
            return ipc.send('settings.toggle');
          }
        }
      ]
    }, {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: function(item, focusedWindow) {
            if (focusedWindow) {
              return focusedWindow.reload();
            }
          }
        }, {
          label: 'Toggle Full Screen',
          accelerator: (function() {
            if (process.platform === 'darwin') {
              return 'Ctrl+Command+F';
            } else {
              return 'F11';
            }
          })(),
          click: function(item, focusedWindow) {
            if (focusedWindow) {
              return focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
            }
          }
        }, {
          label: 'Toggle Developer Tools',
          accelerator: (function() {
            if (process.platform === 'darwin') {
              return 'Alt+Command+I';
            } else {
              return 'Ctrl+Shift+I';
            }
          })(),
          click: function(item, focusedWindow) {
            if (focusedWindow) {
              return focusedWindow.toggleDevTools();
            }
          }
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
  $(function() {
    var offset;
    $('body').on('selectstart', false);
    $(document).keyup(function(e) {
      if (e.which === 27) {
        tool.id = 'none';
        tool.preview = void 0;
      }
      if (e.which === 13) {
        return $rootScope.$emit('actionComplete');
      }
    });
    offset = $('.gcanvas').offset();
    $(document).mousemove(function(e) {
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.x = e.pageX - offset.left;
      mouse.y = e.pageY - offset.top;
      mouse.button = e.which;
      if (mouse.button === 2) {
        plane.translation.x += mouse.x - mouse.px;
        plane.translation.y += mouse.y - mouse.py;
      }
      if (tool.dragging) {
        snapper.updateGuides();
        if (tool.dragged.nosnap) {
          tool.dragged.x = snapper.pure.x;
          return tool.dragged.y = snapper.pure.y;
        } else {
          tool.dragged.x = snapper.x;
          return tool.dragged.y = snapper.y;
        }
      }
    });
    $(document).mousedown(function(e) {
      var pts;
      mouse.button = e.which;
      if (mouse.button === 3) {
        pts = tool.nearList.filter(function(primitive) {
          return primitive.typename === 'PPoint';
        });
        if (pts.length > 0 && pts[0]._dist <= 9 && pts[0].isUndependant() && pts[0].options.visible) {
          tool.dragging = true;
          return tool.dragged = pts[0];
        }
      }
    });
    $(document).mouseup(function(e) {
      if (tool.dragging) {
        tool.dragging = false;
        return tool.dragged = void 0;
      }
    });
    mouse.vw = $('.gcanvas').width();
    return mouse.vh = $('.gcanvas').height();
  });
  return $(window).resize(function(e) {
    mouse.vw = $('.gcanvas').width();
    return mouse.vh = $('.gcanvas').height();
  });
});
