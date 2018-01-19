(function() {
    var margin = {top: 20, right: 20, bottom: 70, left: 70},
    width = 800,
    height = 600;

    //id generator
    var counter = 8;
    var generateID = function() {
        return ++counter;
    }

    var ferritinLevels = [
        {
            id: 1,
            date: new Date("9-21-17"),
            level: 3746
        },
        {
            id: 2,
            date: new Date("11-8-17"),
            level: 4614 
        },
        {
            id: 3,
            date: new Date("11-17-17"),
            level: 3820 
        },
        {
            id: 4,
            date: new Date("11-22-17"),
            level: 2554 
        },
        {
            id: 5,
            date: new Date("12-1-17"),
            level: 2000
        },
        {
            id: 6,
            date: new Date("12-15-17"),
            level: 1998 
        },
        {
            id: 7,
            date: new Date("12-28-17"),
            level: 699
        },
        {
            id: 8,
            date: new Date("1-5-18"),
            level: 2613 
        }
    ];

    var tooltip = d3.select('body')
        .append('div')
        .attr("class", "tooltip")
        .attr("opacity", 0);

    var deletionConfirmation = d3.select('body')
        .append('div')
        .attr("class", "confirm-delete")
        .attr("opacity", 0);

    var maxLevel = (function() {
            var max = 0;
            ferritinLevels.forEach(function(level) {
                if(max < level.level) max = level.level;
            });
            return max;
        })();

    window.onload = function() {
        //draw initial chart
        drawChart();

        var dateInput = document.querySelector('#FerritinDate');
        var levelInput = document.querySelector('#FerritinLevel');
        //wire up event listeners
        document.querySelector('#FerritinSubmitBtn').addEventListener('click', function(e) {
        var date = new Date(dateInput.value); 
        var level = parseInt(levelInput.value);
        ferritinLevels.push({
            id: ferritinLevels.length + 1,
            date: date,
            level: level
        });

        drawChart();
        });
    }

    //assign static portions of chart
    var plot = d3.select("#MomChart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + ',' + margin.top + ')');

    //hide deletion confirmation if click event occurs apart from deletion confirmation element
    document.body.addEventListener("click", function(e) {
        deletionConfirmation.transition()
            .duration(300)
            .style("opacity", 0)
            .style("z-index", -1);
    });

    plot.append("text")
        .attr("transform", "translate(" + (0 - margin.left/2 - 12) + "," + (height / 2) + ") rotate(-90)")
        .attr("class", "axis-label")
        .text("Ferritin ng/mL");

    plot.append("text")
        .attr("transform", "translate(" + (width / 2.75) + ',' + (height - margin.bottom / 2) + ")")
        .attr("class", "axis-label")
        .text("Date Measured");

    function drawChart() {
        maxLevel = (function() {
            var max = 0;
            ferritinLevels.forEach(function(level) {
                if(max < level.level) max = level.level;
            });
            return max;
        })();

        var yScale = d3.scaleLinear()
        .domain([(maxLevel < 5000) ? 5000 : maxLevel + 1000, 0])
        .range([0, height - margin.bottom - margin.top]);

        var xScale = d3.scaleTime()
        .domain(d3.extent(ferritinLevels, function(d) {
            return d.date;
        }))
        .range([0, width - margin.left - margin.right]);

        var yAxis = d3.axisLeft(yScale)
        .ticks(8);

        var xAxis = d3.axisBottom(xScale);

        var valueline = d3.line()
            .x(function(d) { return xScale(d.date); })
            .y(function(d) { return yScale(d.level); });


        //remove preexisting lines and axes
        plot.selectAll('path.line').remove();
        plot.select(".x-axis").remove();
        plot.select(".y-axis").remove();

        // Add the valueline path.
        plot.append("path")
        .datum(ferritinLevels)
        .attr("class", "line")
        .attr("d", valueline);

        for(var i = 200; i > 0; i-=10) {
            var goalline = d3.line()
                .x(function(d) {return xScale(d.date)})
                .y(function() { return yScale(i)})

            plot.append("path")
            .datum(ferritinLevels)
            .attr("class", "goalline")
            .attr("d", goalline);
        }

        plot.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0" + ',' + (height - margin.top - margin.bottom) + ")")
        .call(xAxis);

        plot.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        var circles = plot.selectAll('circle')
        .remove()
        .exit()
        .data(ferritinLevels)

        circles.enter()
        .append('circle')
        .attr("class", "point")
        .attr("cx", function(d) {
            return xScale(d.date);
        })
        .attr("cy", function(d) {
            return yScale(d.level);
        })
        .attr("r", 8)
        .attr("fill", function(d) {
            return "#b85cb8";
        })
        .style("opacity", .8)
        .on("touchstart", function(d) {
            var circle = this;
            showTooltip(d, circle);
        })
        .on("touchmove", function(d) {
            var circle = this;
            showTooltip(d, circle);
        })
        .on("mouseover", function(d) {
            var circle = this;
            showTooltip(d, circle);
        })
        .on("mouseout", function(d) {
            d3.select(this).style("opacity", .8)
                           .attr("r", 8);

            tooltip.transition()
                .duration(300)
                .style("opacity", 0)
                .style("z-index", -1);
        })
        .on("click", function(d, e, a) {
            d3.event.stopPropagation();
            d3.event.preventDefault();
            var self = this;
            tooltip.transition()
                .duration(300)
                .style("opacity", 0)
                .style("z-index", -1);

            deletionConfirmation.transition()
                .duration(100)
                .style("opacity", 1);
            
            deletionConfirmation.html('<h5 title="Click To Delete">Delete?</h5>')
                .style("left", (d3.event.pageX - 30) + 'px') 
                .style("top",  (d3.event.pageY - 33) + "px")
                .style("z-index", 10)
                .on("click", function() {
                    var deletionIndex = ferritinLevels.findIndex(function(ferritinLevel) {
                        return ferritinLevel.id === d.id;
                    });
                    if(deletionIndex > -1) {
                        deletionConfirmation.transition()
                            .duration(300)
                            .style("opacity", 0)
                            .style("z-index", -1);

                        //remove level from ferritinLevels
                        ferritinLevels.splice(deletionIndex, 1); 

                        d3.select(self).remove();

                        //hide confirmation
                        drawChart();

                    }
                })
                .on("mouseout", function() {
                    deletionConfirmation.transition()
                        .duration(300)
                        .style("opacity", 0)
                        .style("z-index", -1);
                });
        });
    }

    function showTooltip(d, circle) {
        d3.select(circle).style("opacity", 1)
                        .attr("r", 11);

        tooltip.transition()
            .duration(300)
            .style("opacity", .8);

        tooltip.html('<h5>' + d.date.toDateString() + '</h5><h6>Ferritin Level: ' + d.level + 'ng/mL</h6>')
            .style("left", (d3.event.pageX + 20) + 'px') 
            .style("top",  (d3.event.pageY - 28) + "px")
            .style("z-index", 10);
    }
})();