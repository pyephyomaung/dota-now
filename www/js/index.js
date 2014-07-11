function loadData() {
    console.log("loading data...");
    $.getJSON("data/abilities.json", function(r) { contextHelper.abilities = r.abilities; });
    $.getJSON("data/heroes.json", function(r) { contextHelper.heroes = r.heroes; });
    $.getJSON("data/items.json", function(r) { contextHelper.items = r.items; });
    $.getJSON("data/lobbies.json", function(r) { contextHelper.lobbies = r.lobbies; });
    $.getJSON("data/mods.json", function(r) { contextHelper.mods = r.mods; });
    $.getJSON("data/regions.json", function(r) { contextHelper.regions = r.regions; });
}

// ANGULAR APP
var app = angular.module('dotaNow', ['onsen.directives', 'ngTouch', 'd3Angular']);
app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

document.addEventListener('deviceready', function() {
    console.log("bootstrapping angular app");
    angular.bootstrap(document, ['dotaNow']);
}, false);
 
app.factory('Data', function() {
    var Data = {};
    Data.abilities = null;
    Data.heroes = null;
    Data.items = null;
    Data.lobbies = null;
    Data.mods = null;
    Data.regions = null;
    Data.currentMatch = null;

    // constants
    Data.STEAM_API_KEY = '59075AC07E0A6BC19847673DBC2B2802';
    Data.URL_GET_LEAGUE_LISTING = 'http://www.corsproxy.com/api.steampowered.com/IDOTA2Match_570/GetLeagueListing/V001/?key=' + Data.STEAM_API_KEY;
    Data.URL_GET_LIVE_LEAGUE_GAMES = 'http://www.corsproxy.com/api.steampowered.com/IDOTA2Match_570/GetLiveLeagueGames/V001/?key=' + Data.STEAM_API_KEY;
    Data.URL_GET_MATCH_HISTORY = 'http://www.corsproxy.com/api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?key=' + Data.STEAM_API_KEY + '&min_players=10&tournament_games_only=true&league_id=';
    Data.URL_GET_MATCH_DETAILS = 'http://www.corsproxy.com/api.steampowered.com/IDOTA2Match_570/GetMatchDetails/V001/?key=' + Data.STEAM_API_KEY + '&match_id=';
    Data.URL_HERO_IMAGE = 'http://media.steampowered.com/apps/dota2/images/heroes/';
    Data.URL_ITEM_IMAGE = 'http://media.steampowered.com/apps/dota2/images/items/';
    Data.URL_ABILITY_IMAGE = 'http://media.steampowered.com/apps/dota2/images/abilities/';
    
    // url getters
    Data.getLeagueListingUrl = function () { return Data.URL_GET_LEAGUE_LISTING; };
    Data.getLiveLeagueGamesUrl = function () { return Data.URL_GET_LIVE_LEAGUE_GAMES; };
    Data.getMatchHistoryUrl = function (leagueId) { return Data.URL_GET_MATCH_HISTORY + leagueId; };
    Data.getMatchDetailsUrl = function (matchId) { return Data.URL_GET_MATCH_DETAILS + matchId; };
    Data.getHeroImageUrl = function (heroId) { return Data.URL_HERO_IMAGE + _.find(Data.heroes, {id: heroId}).name + '_eg.png'; };
    Data.getItemImageUrl = function (itemId) { return Data.URL_ITEM_IMAGE + _.find(Data.items, {id: itemId}).name + '_eg.png'; };
    Data.getAbilityImageUrl = function (abilityId) { 
        var ability = _.find(Data.abilities, {id: abilityId + ''});
        if (ability != null && ability.name == 'stats') return 'img/stats.png';
        else return Data.URL_ABILITY_IMAGE + ability.name + '_lg.png'; 
    };
    Data.getHeroName = function (heroId) { return _.find(Data.heroes, {id: heroId}).localized_name; };

    Data.isRadiant = function (player) { return (player != null && player.player_slot <= 4); };

    $.getJSON("data/abilities.json", function(r) { console.log("loading abilities.json"); Data.abilities = r.abilities; });
    $.getJSON("data/heroes.json", function(r) { console.log("loading heroes.json"); Data.heroes = r.heroes; });
    $.getJSON("data/items.json", function(r) { console.log("loading items.json"); Data.items = r.items; });
    $.getJSON("data/lobbies.json", function(r) { console.log("loading lobbies.json"); Data.lobbies = r.lobbies; });
    $.getJSON("data/mods.json", function(r) { console.log("loading mods.json"); Data.mods = r.mods; });
    $.getJSON("data/regions.json", function(r) { console.log("loading regions.json"); Data.regions = r.regions; });

    return Data;
});

app.controller('Page1Ctrl', function($scope, $http, Data) {
    $scope.isLoading = true;
    $scope.inputMatch = { inputMatchId: '683689782' };
    // $scope.inputMatch = { inputMatchId: '117762656' };
    $scope.getLeagueName = function (leagueName) {
        return leagueName.replace(/#DOTA_Item_/g, "").replace(/_/g, " ");
    };

    var url = Data.getLeagueListingUrl();
    $http.get(url).
        success(function(data, status, headers, config) {
            $scope.leagues = _.filter(data.result.leagues, {"leagueid": 600});  // TI 4 for now
            $scope.isLoading = false;
        }).
        error(function(data, status, headers, config) {
            alert("Error getting leagues listing");
        });

    $scope.next = function(index) {
        var selectedLeague = $scope.leagues[index];
        if (selectedLeague != null) {
            Data.leagueId = selectedLeague.league_id;
            $scope.ons.navigator.pushPage('page_marches.html', {title: selectedLeague.name});
        } else {
            alert('League not found');
        }
    };

    $scope.goToMatch = function() {
        Data.matchId = $scope.inputMatch.inputMatchId;
        $scope.ons.navigator.pushPage('page_match.html');
    };
});

app.controller('Page_MarchesCtrl', function($scope, $http, Data) {
    $scope.isLoading = true;
    var url = Data.getMatchHistoryUrl(Data.leagueId);
    $http.get(url).
        success(function(data, status, headers, config) {
            $scope.matchHistory = data.result;
            $scope.isLoading = false;
        }).
        error(function(data, status, headers, config) {
            alert("Error getting leagues listing");
        });

    $scope.next = function(index) {
        var match = $scope.matchHistory.matches[index];
        Data.matchId = match.match_id;
        $scope.ons.navigator.pushPage('page_match.html');
    };
});

app.controller('Page_MatchCtrl', function($scope, $http, Data) {
    $scope.isLoading = true;

    var matchId = Data.matchId;
    var url = Data.getMatchDetailsUrl(matchId);
    Data.matchDetails = null;
    $http.get(url).
        success(function(data, status, headers, config) {
            //alert(JSON.stringify(data));
            Data.matchDetails = data;
            $scope.isLoading = false;
        }).
        error(function(data, status, headers, config) {
            alert("Error getting match detail");
        });
});

app.controller('Page_Match_TimelineCtrl', function($scope, Data) {
});

app.controller('Page_Match_StatsCtrl', function($scope, $http, Data) {
    $scope.lobbies = Data.lobbies;
    $scope.mods = Data.mods;
    $scope.toHHmmss = toHHmmss;
    $scope.getHeroImageUrl = Data.getHeroImageUrl;
    $scope.getHeroName = Data.getHeroName;
    $scope.$watch(function () { return Data.matchDetails; }, function (value) {
        $scope.matchDetails = value;
        if (value != null) {
            $scope.radiantPlayers = _.filter(value.result.players, function (x) {return Data.isRadiant(x)});
            $scope.direPlayers = _.filter(value.result.players, function (x) {return !Data.isRadiant(x)});
        }
    });
});

app.controller('Page_Match_LineupsCtrl', function($scope, Data) {
    $scope.getHeroImageUrl = Data.getHeroImageUrl;
    $scope.getItemImageUrl = Data.getItemImageUrl;
    $scope.getAbilityImageUrl = Data.getAbilityImageUrl;
    $scope.isRadiant = Data.isRadiant;
    $scope.toHHmmss = toHHmmss;
    $scope.$watch(function () { return Data.matchDetails; }, function (value) {
        $scope.matchDetails = value.result;
        if (value != null) {
            $scope.players = value.result.players;
            $scope.radiantPlayers = _.filter(value.result.players, function (x) {return Data.isRadiant(x)});
            $scope.direPlayers = _.filter(value.result.players, function (x) {return !Data.isRadiant(x)});
            $scope.radiantPicksBans = _.sortBy(_.filter(value.result.picks_bans, {team: 0}), 'order');
            $scope.direPicksBans = _.sortBy(_.filter(value.result.picks_bans, {team: 1}), 'order');
        }
    });
});

function toHHmmss(minute_num) {
    var hours   = Math.floor(minute_num / 3600);
    var minutes = Math.floor((minute_num - (hours * 60)) / 60);
    var seconds = minute_num - (hours * 60) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}