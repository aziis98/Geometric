var PLine, PPlane, PPoint, ref;

ref = require('./public/scripts/geometrics.js'), PPlane = ref.PPlane, PPoint = ref.PPoint, PLine = ref.PLine;

angular.module('handler', []).value('plane', new PPlane()).value('tool', {
  id: 'none',
  nearList: [],
  buffer: {}
}).value('mouse', {
  x: 0,
  y: 0,
  px: 0,
  py: 0,
  button: 0,
  vw: 1920,
  vh: 1080
}).service('toolhandler', function(mouse, plane, tool) {
  var forPoint;
  forPoint = function(primitive) {
    return primitive.typename === 'PPoint' && primitive._dist <= 9;
  };
  this['none'] = {
    doHighlight: function(primitive) {
      return forPoint(primitive);
    }
  };
  this['point'] = {
    doHighlight: function(primitive) {
      return false;
    },
    handler: function() {
      plane.addPrimitive(new PPoint(mouse.x - plane.translation.x, mouse.y - plane.translation.y));
      return 'none';
    },
    doComplete: function() {
      return 'point';
    }
  };
});
