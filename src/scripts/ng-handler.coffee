{PPlane, PPoint, PLine} = require './public/scripts/geometrics.js'

angular.module('handler', [])
    .value 'plane', new PPlane
    .value 'tool', { id: 'none' }
