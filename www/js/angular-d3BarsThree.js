d3Angular.directive('d3BarsThree', ['$window', '$timeout', 
        function($window, $timeout) {
            return {
                restrict: 'A',
                scope: { data: '=', label: '@', onClick: '&' },
                link: function(scope, ele, attrs) {
                    var renderTimeout;
                    var margin = parseInt(attrs.margin) || 5,
                        barHeight = parseInt(attrs.barHeight) || 6,
                        barPadding = parseInt(attrs.barPadding) || 15,
                        rowHeight = parseInt(attrs.rowHeight) || 20,
                        bindProperty1 = attrs.bindProperty1,
                        bindProperty2 = attrs.bindProperty2,
                        bindProperty3 = attrs.bindProperty3,
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
                        var maxValue1 = d3.max(matchDetails.result.players, function(d) { return d[bindProperty1]; });
                        var maxValue2 = d3.max(matchDetails.result.players, function(d) { return d[bindProperty2]; });
                        var maxValue3 = d3.max(matchDetails.result.players, function(d) { return d[bindProperty3]; });
                        var colorPivot1 = maxValue1 / 4;  // 4 colors
                        var colorPivot2 = maxValue2 / 4;  // 4 colors
                        var colorPivot3 = maxValue3 / 4;  // 4 colors
                        svg.selectAll('*').remove();

                        if (!data) return;
                        if (renderTimeout) clearTimeout(renderTimeout);

                        renderTimeout = $timeout(function() {
                            var width = d3.select(ele[0])[0][0].offsetWidth - margin - labelImageWidth,
                            height = scope.data.length * (rowHeight + barPadding),
                            color1 = d3.scale.linear()
                                .domain([1,maxValue1])
                                .range([d3.rgb('green').brighter(), d3.rgb('green').darker()]);
                            color2 = d3.scale.linear()
                                .domain([1,maxValue2])
                                .range([d3.rgb('red').brighter(), d3.rgb('red').darker()]);
                            color3 = d3.scale.linear()
                                .domain([1,maxValue3])
                                .range([d3.rgb('teal').brighter(), d3.rgb('teal').darker()]);
                            xScale1 = d3.scale.linear()
                                .domain([0, maxValue1])
                                .range([0, width]),
                            xScale2 = d3.scale.linear()
                                .domain([0, maxValue2])
                                .range([0, width]),
                            xScale3 = d3.scale.linear()
                                .domain([0, maxValue3])
                                .range([0, width]);

                            svg.attr('height', height);

                            var unflattenData = [];
                            data.forEach(function (d, index) {
                                unflattenData.push({ key: bindProperty1, index: index, dy: 0, value: d, color: color1, xScale: xScale1 });
                                unflattenData.push({ key: bindProperty2, index: index, dy: barHeight+1 , value: d, color: color2, xScale: xScale2 });
                                unflattenData.push({ key: bindProperty3, index: index, dy: barHeight*2+2, value: d, color: color3, xScale: xScale3 });
                            });

                            if (rightToLeft) {
                                svg.selectAll('rect')
                                    .data(data)
                                    .enter()
                                    .append("svg:image")
                                    .attr("xlink:href", function (d) { return scope.$parent.getHeroImageUrl(d.hero_id); })
                                    .attr('x', width)
                                    .attr('y', function(d,i) { return i * (rowHeight + barPadding); })
                                    .attr('width', labelImageWidth)  // this is the size of the image
                                    .attr('height', 20);

                                svg.selectAll('rect')
                                    .data(unflattenData)
                                    .enter()
                                    .append('rect')
                                    .on('click', function(d,i) { return scope.onClick({item: d}); })
                                    .attr('height', barHeight)
                                    .attr('width', 20)
                                    .attr('x', function(d) { return width - 20; })
                                    .attr('y', function(d,i) { return (d.index * (rowHeight + barPadding)) + d.dy; })
                                    .attr('fill', function(d) { return d.color(d.value[d.key]); })
                                    .transition()
                                    .duration(1000)
                                    .attr('width', function(d) { return d.xScale(d.value[d.key]); })
                                    .attr('x', function(d) { return width - d.xScale(d.value[d.key]); });
                            
                                 svg.selectAll('text')
                                    .data(data)
                                    .enter()
                                    .append('text')
                                    .attr('fill', 'black')
                                    .attr('y', function(d,i) { return (i+1) * (rowHeight + barPadding) - 5; })
                                    .attr('x', width-15)
                                    .text(function(d) { return d[bindProperty1] + ' / ' + d[bindProperty2] + ' / ' + d[bindProperty3]; });
                            } else {
                                svg.selectAll('rect')
                                    .data(data)
                                    .enter()
                                    .append("svg:image")
                                    .attr("xlink:href", function (d) { return scope.$parent.getHeroImageUrl(d.hero_id); })
                                    .attr('x', Math.round(margin/2))
                                    .attr('y', function(d,i) { return i * (rowHeight + barPadding); })
                                    .attr('width', labelImageWidth)  // this is the size of the image
                                    .attr('height', 20);

                                svg.selectAll('rect')
                                    .data(unflattenData)
                                    .enter()
                                    .append('rect')
                                    .on('click', function(d,i) { return scope.onClick({item: d}); })
                                    .attr('height', barHeight)
                                    .attr('width', 20)
                                    .attr('x', Math.round(margin/2) + labelImageWidth)
                                    .attr('y', function(d,i) { return (d.index * (rowHeight + barPadding)) + d.dy; })
                                    .attr('fill', function(d) { return d.color(d.value[d.key]); })
                                    .transition()
                                    .duration(1000)
                                    .attr('width', function(d) { return d.xScale(d.value[d.key]); });
                            
                                 svg.selectAll('text')
                                    .data(data)
                                    .enter()
                                    .append('text')
                                    .attr('fill', 'black')
                                    .attr('y', function(d,i) { return (i+1) * (rowHeight + barPadding) - 5; })
                                    .attr('x', Math.round(margin/2))
                                    .text(function(d) { return d[bindProperty1] + ' / ' + d[bindProperty2] + ' / ' + d[bindProperty3]; });
                            }
                        }, 200);
                    };
                }
            };}
        ]);