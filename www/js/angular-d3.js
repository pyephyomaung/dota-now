angular
    .module('d3', [])
    .factory('d3Service', ['$document', '$window', '$q', '$rootScope',
        function($document, $window, $q, $rootScope) {
            var d = $q.defer(),
            d3service = {
              d3: function() { return d.promise; }
            };
            
            function onScriptLoad() {
                // Load client in the browser
                $rootScope.$apply(function() { d.resolve($window.d3); });
            }
            
            var scriptTag = $document[0].createElement('script');
            scriptTag.type = 'text/javascript'; 
            scriptTag.async = true;
            scriptTag.src = 'vendors/bower_components/d3/d3.min.js';
            scriptTag.onreadystatechange = function () {
                if (this.readyState == 'complete') onScriptLoad();
            }
            scriptTag.onload = onScriptLoad;

            var s = $document[0].getElementsByTagName('body')[0];
            s.appendChild(scriptTag);

            return d3service;
        }]);



angular
    .module('d3Angular', ['d3'])
    .directive('d3Bars', ['$window', '$timeout', 'd3Service', 
        function($window, $timeout, d3Service) {
            return {
                restrict: 'A',
                scope: { data: '=', label: '@', onClick: '&' },
                link: function(scope, ele, attrs) {
                    d3Service.d3().then(function(d3) {

                    var renderTimeout;
                    var margin = parseInt(attrs.margin) || 5,
                        barHeight = parseInt(attrs.barHeight) || 20,
                        barPadding = parseInt(attrs.barPadding) || 5,
                        bindProperty = attrs.bindProperty,
                        rightToLeft = attrs.rightToLeft != undefined && attrs.rightToLeft == "true";

                    var svg = d3.select(ele[0])
                        .append('svg')
                        .style('width', '100%');

                    $window.onresize = function() {
                        scope.$apply();
                    };

                    scope.$watch(function() {
                        return angular.element($window)[0].innerWidth;
                    }, function() {
                        scope.render(scope.data);
                    });

                    scope.$watch('data', function(newData) {
                        scope.render(newData);
                    }, true);


                    scope.render = function(data) {
                        var labelImageWidth = 35;   // hard coded label image width
                        var matchDetails = scope.$parent.matchDetails;  // matchDetail from parent scope
                        var maxValue = d3.max(matchDetails.result.players, function(d) { return d[bindProperty]; });
                        var colorPivot = maxValue / 4;  // 4 colors
                        svg.selectAll('*').remove();

                        if (!data) return;
                        if (renderTimeout) clearTimeout(renderTimeout);

                        renderTimeout = $timeout(function() {
                            var width = d3.select(ele[0])[0][0].offsetWidth - margin - labelImageWidth,
                            height = scope.data.length * (barHeight + barPadding),
                            color = d3.scale.linear()
                                .domain([0, colorPivot, colorPivot*2, maxValue])
                                .range(['red', 'orange', 'yellow', 'green']),
                            xScale = d3.scale.linear()
                                .domain([0, maxValue])
                                .range([0, width]);

                            svg.attr('height', height);

                            if (rightToLeft) {
                                svg.selectAll('rect')
                                    .data(data)
                                    .enter()
                                    .append("svg:image")
                                    .attr("xlink:href", function (d) { return scope.$parent.getHeroImageUrl(d.hero_id); })
                                    .attr('x', width)
                                    .attr('y', function(d,i) { return i * (barHeight + barPadding); })
                                    .attr('width', labelImageWidth)  // this is the size of the image
                                    .attr('height', 20);

                                svg.selectAll('rect')
                                    .data(data)
                                    .enter()
                                    .append('rect')
                                    .on('click', function(d,i) { return scope.onClick({item: d}); })
                                    .attr('height', barHeight)
                                    .attr('width', 20)
                                    .attr('x', function(d) { return width - 20; })
                                    .attr('y', function(d,i) { return i * (barHeight + barPadding); })
                                    .attr('fill', function(d) { return color(d[bindProperty]); })
                                    .transition()
                                    .duration(1000)
                                    .attr('width', function(d) { return xScale(d[bindProperty]); })
                                    .attr('x', function(d) { return width - xScale(d[bindProperty]); })
                            
                                 svg.selectAll('text')
                                    .data(data)
                                    .enter()
                                    .append('text')
                                    .attr('fill', '#fff')
                                    .attr('y', function(d,i) { return i * (barHeight + barPadding) + 15; })
                                    .attr('x', width - 30)
                                    .text(function(d) { return d[bindProperty]; });
                            } else {
                                svg.selectAll('rect')
                                    .data(data)
                                    .enter()
                                    .append("svg:image")
                                    .attr("xlink:href", function (d) { return scope.$parent.getHeroImageUrl(d.hero_id); })
                                    .attr('x', Math.round(margin/2))
                                    .attr('y', function(d,i) { return i * (barHeight + barPadding); })
                                    .attr('width', labelImageWidth)  // this is the size of the image
                                    .attr('height', 20);

                                svg.selectAll('rect')
                                    .data(data)
                                    .enter()
                                    .append('rect')
                                    .on('click', function(d,i) { return scope.onClick({item: d}); })
                                    .attr('height', barHeight)
                                    .attr('width', 20)
                                    .attr('x', Math.round(margin/2) + labelImageWidth)
                                    .attr('y', function(d,i) { return i * (barHeight + barPadding); })
                                    .attr('fill', function(d) { return color(d[bindProperty]); })
                                    .transition()
                                    .duration(1000)
                                    .attr('width', function(d) { return xScale(d[bindProperty]); });
                            
                                 svg.selectAll('text')
                                    .data(data)
                                    .enter()
                                    .append('text')
                                    .attr('fill', '#fff')
                                    .attr('y', function(d,i) { return i * (barHeight + barPadding) + 15; })
                                    .attr('x', Math.round(margin/2) + labelImageWidth + 5)
                                    .text(function(d) { return d[bindProperty]; });
                            }
                        }, 200);
                    };
                });
            }}
        }]);