var PLine, PPlane, PPoint, ref;

ref = require('./public/scripts/geometrics.js'), PPlane = ref.PPlane, PPoint = ref.PPoint, PLine = ref.PLine;

angular.module('handler', []).value('plane', new PPlane).value('tool', {
  id: 'none'
});
