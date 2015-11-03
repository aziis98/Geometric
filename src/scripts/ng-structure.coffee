angular.module('structure', [ 'handler' ])
    .directive 'structure', ->
        restrict: 'E'
        replace: true
        transclude: true
        templateUrl: 'templates/structure.frag.html'

    .directive 'paneListview', ->
        restrict: 'E'
        replace: true
        templateUrl: 'templates/pane-listview.frag.html'
        controller: ($scope, plane, tool) ->
            $scope.$watch((-> plane.primitives), (-> $scope.primitives = plane.primitives))
            $scope.plane = plane
            $scope.select = (index) ->
                for i in [0...plane.primitives.length]
                    if i is index
                        plane.primitives[i].options.selected = !plane.primitives[i].options.selected
                        if plane.primitives[i].options.selected
                            tool.selectedPrimitive = plane.primitives[i]
                        else
                            tool.selectedPrimitive = undefined
                    else
                        plane.primitives[i].options.selected = false
                return

    .directive 'paneProperties', ->
        restrict: 'E'
        replace: true
        templateUrl: 'templates/pane-properties.frag.html'
        controller: ($scope, plane, tool) ->
            $scope.$watch (-> tool.selectedPrimitive), (-> $scope.selected = tool.selectedPrimitive)

    .directive 'valueInput', ->
        restrict: 'E'
        replace: true
        scope:
            value: '='
        templateUrl: (elem, attr) ->
            'templates/property-#{attr.type}.frag.html'
        controller: ($scope) ->
            
