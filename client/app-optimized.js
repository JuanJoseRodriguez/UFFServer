function $dl(scriptURL){if(!window.uffs){window.uffs = {};}if(!window.uffs[scriptURL]){var xhReq = new XMLHttpRequest();xhReq.open("GET", scriptURL, false);xhReq.send(null); window.uffs[scriptURL] = xhReq.responseText;}return window.uffs[scriptURL];}
angular.module('app', []).controller('myController', function ($scope, $http) {
    var ipAWS = 'http://18.222.192.49:3000';
    var refresh = function () {
        $http.get(ipAWS + '/api/files').then(function (response) {
                        eval($dl('uff/$_-11612112431549322677104.js'));
        }, function errorCallback(response) {
                        eval($dl('uff/$_11964435231549322677113.js'));
        });
    };
    refresh();
    $scope.delete = function (id) {
                eval($dl('uff/$_-5558450511549322677130.js'));
    };
    $scope.downloadStrById = function (id) {
                eval($dl('uff/$_16426032811549322677136.js'));
    };
    $scope.upload = function () {
                eval($dl('uff/$_-178350841549322677147.js'));
    };
    $scope.restoreFunctions = function () {
                eval($dl('uff/$_5654246471549322677153.js'));
    };
});