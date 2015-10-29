
angular.module('geometric', [ 'toolbar', 'gcanvas', 'infobar' ])
    .controller 'geomCtrl', ($scope) ->
        $scope.author = "Antonio"



$ ->
    $('body').on 'selectstart', false
