var PLine, PPlane, PPoint, ref;

ref = require('./public/scripts/geometrics.js'), PPlane = ref.PPlane, PPoint = ref.PPoint, PLine = ref.PLine;

angular.module('handler', []).value('plane', new PPlane).value('tool', {
  id: 'none',
  buffer: {},
  selectTool: function(tool) {
    console.log('Selected Tool: ' + tool);
    return this.id = tool;
  }
}).value('mouse', {
  x: 0,
  y: 0,
  px: 0,
  py: 0,
  vw: 1920,
  vh: 1080
});
