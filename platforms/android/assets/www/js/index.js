(function() {
    var app = angular.module('dotaNow', ['onsen.directives', 'ngTouch']);

    document.addEventListener('deviceready', function() {
        console.log("bootstrapping angular app");
        angular.bootstrap(document, ['dotaNow']);
    }, false);

    app.factory('Data', function() {
        var Data = {};
        Data.tournments = getTournments();
        return Data;
    });

    app.controller('Page1Ctrl', function($scope, Data) {
        $scope.tournments = Data.tournments;

        $scope.next = function(index) {
            Data.tournmentIndex = index;
            var t = Data.tournments[index];
            $scope.ons.navigator.pushPage('page_marches.html', {title: t.title});
        };
    });

    app.controller('Page_MarchesCtrl', function($scope, Data) {
        $scope.teams = Data.tournments[Data.tournmentIndex].teams;

        $scope.next = function(index) {
            Data.matchIndex = index;
            var t = Data.tournments[Data.tournmentIndex].teams[index];
            $scope.ons.navigator.pushPage('page_match.html');
        };
    });

    app.controller('Page_MatchCtrl', function($scope, Data) {
        $scope.match = Data.tournments[Data.tournmentIndex].teams[Data.matchIndex];
    });

    function getTournments() {
        var rtn = [];
        rtn.push({ 
            title: 'The International 4',
            logo: 'img/ti4/alliance.png',
            teams : [
                [
                    {name: "Alliance", flag: 'img/ti4/alliance.png'}, 
                    {name: "Titan", flag: 'img/ti4/titan.png'}
                ],
                [
                    {name: "Titan", flag: 'img/ti4/titan.png'},
                    {name: "Alliance", flag: 'img/ti4/alliance.png'}
                ]
            ]
        });
        return rtn;
    }
})();