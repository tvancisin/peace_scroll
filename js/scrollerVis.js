let hovno = 0;
let context_parser = d3.timeParse("%Y/%m/%d");
let mousemove_function, mouseleave_function = null;
let hoveredPolygonId = null;
let path;
const pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(d => d[1])

// re-drawing context lines/text
const drawContext = function (context, height) {
  line.selectAll(".context_line")
    .data(context)
    .join(
      enter => enter.append("line")
        .attr("class", "context_line")
        .attr("x1", function (d) {
          return x_horizontal(context_parser(d.year))
        })
        .attr("x2", function (d) { return x_horizontal(context_parser(d.year)) })
        .attr("y1", function (d, i) {
          i += 1;
          if (i % 2 !== 0) {
            return height * 0.2 - 20
          }
          else {
            return height * 0.2 + 10
          }
        })
        .attr("y2", height)
        .attr("stroke-width", 1)
        .attr("stroke", "white")
        .attr("stroke-opacity", 0.7)
        .attr("stroke-dasharray", "8,8")
        .attr("opacity", 0)
        .transition().duration(500)
        .attr("opacity", 1)
        .selection(),
      update => update
        .transition().duration(500)
        .attr("x1", function (d) { return x_horizontal(context_parser(d.year)) })
        .attr("x2", function (d) { return x_horizontal(context_parser(d.year)) })
        .attr("y1", function (d, i) { return height * 0.3 - i * 30 })
        .attr("y2", height)
        .selection(),
      exit => exit
        .transition().duration(500)
        .attr("opacity", 0)
        .remove()
    )

  line.selectAll(".context_text")
    .data(context)
    .join(
      enter => enter.append("text")
        .attr("class", "context_text")
        .attr('text-anchor', 'start')
        .attr("fill", "white")
        .attr("fill-opacity", 1)
        .attr("font-size", "16px")
        .attr("x", function (d) { return x_horizontal(context_parser(d.year)) - 10 })
        .attr("y", function (d, i) {
          i += 1;
          if (i % 2 !== 0) {
            return height * 0.2 - 30
          }
          else {
            return height * 0.2
          }
        })
        .text(function (d) { return d.text })
        .attr("opacity", 0)
        .transition().duration(500)
        .attr("opacity", 1)
        .selection(),
      update => update
        .transition().duration(500)
        .attr("x", function (d) { return x_horizontal(context_parser(d.year)) + 2 })
        .attr("y", function (d, i) { return height * 0.3 - i * 30 })
        .text(function (d) { return d.text })
        .selection(),
      exit => exit
        .transition().duration(500)
        .attr("opacity", 0)
        .remove()
    )
}

const drawDonut = function (data, direction) {
  const data_ready = pie(Object.entries(data))

  if (direction == "down") {
    path.data(data_ready).transition().duration(1000)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        this._current = interpolate(0);
        return function (t) {
          return arc(interpolate(t));
        };
      })
  }
  else if (direction == "up") {
    path.data(data_ready)
      .transition().duration(1000)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate(this._current, d);
        this._current = d;
        return function (t) {
          return arc(interpolate(t));
        };
      });
  }
}

//context dates
const context_data = [{ year: "1991/07/10", text: "Boris Yeltsin" }, { year: "2000/05/07", text: "Vladimir Putin" },
{ year: "2008/05/07", text: "Dmitry Medvedev" }, { year: "2012/05/07", text: "Vladimir Putin" }]
// soviet countries
const soviet = ["Armenia", "Azerbaijan", "Belarus", "Estonia", "Georgia",
  "Kazakhstan", "Kyrgyzstan", "Latvia", "Lithuania", "Moldova", "Russia",
  "Tajikistan", "Turkmenistan", "Ukraine", "Uzbekistan"];
// middle east countries
const syria = ["Syria", "Libya", "Central African Republic"];

class ScrollerVis {
  constructor(_config, _raw, _year, _array, _agt_type, _line) {
    this.config = {
      another: _config.storyElement,
      map: _config.mapElement,
      vis_width: width100,
      vis_height: height100,
      margin: { top: 50, right: 10, bottom: 20, left: 10 },
      steps: ['step1', 'step2', 'step3', 'step4', 'step5', 'step6',
        'step7', 'step8', 'step9', 'step10', 'step11', 'step12',
        'step13']
    }
    this.raw_data = _raw;
    this.year_division = _year;
    this.country_array = _array;
    this.agt_type_group = _agt_type;
    this.linechart = _line;
    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.width = vis.config.vis_width - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.vis_height - vis.config.margin.top - vis.config.margin.bottom;

    //BEESWARM VISUALIZATION
    // vis.x_axis = d3.axisBottom(x_horizontal).tickSize(-vis.height).ticks(10);
    vis.x_axis = d3.axisBottom(x_horizontal);
    horizontal_svg.append("g")
      .attr("transform", `translate(10, ` + vis.height + `)`)
      .attr("class", "myXaxis")
    //scale for vertical bees
    y_vertical.domain(d3.extent(vis.year_division, (d) => d[1][0][0]))


    //DONUT CHART
    const donut_data = { Interstate: 61, Mixed: 99, Intrastate: 16 }
    const data_ready = pie(Object.entries(donut_data))
    //prepare donut for drawing
    path = piechart_svg
      .selectAll('path')
      .data(data_ready)
      .join('path')
      .attr("class", "slices")
      .attr('fill', d => color(d.data[1]))
      .attr("stroke", "black")
      .style("stroke-width", "4px")
      .style("opacity", 0.7)
    // Add the polylines between chart and labels:
    piechart_svg
      .selectAll('.polyline')
      .data(data_ready)
      .join('polyline')
      .attr("class", "polyline")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr('points', function (d) {
        const posA = arc.centroid(d) // line insertion in the slice
        const posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
        const posC = outerArc.centroid(d); // Label position = almost the same as posB
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        return [posA, posB, posC]
      })
      .style("stroke", "white")
      .style("opacity", 0)
    // Add the polylines between chart and labels:
    piechart_svg
      .selectAll('.polytext')
      .data(data_ready)
      .join('text')
      .attr("class", "polytext")
      .text(d => d.data[0])
      .attr('transform', function (d) {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style('text-anchor', function (d) {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
      })
      .style("fill", "white")
      .style("opacity", 0)

    window.scrollTo({ left: 0, top: 0, behavior: "auto" });

    setTimeout(function () {
      hovno = 1;
    }, 800);
  }

  step1(direction) {
    const vis = this;
    console.log("step1", direction);

    map.setFilter('state-fills', ['in', 'ADMIN', ...vis.country_array]);

    if (direction === "down") {
      //adjust domain
      x_horizontal
        .domain(d3.extent(vis.year_division, (d) => d[1][0][0]))
        .nice();
      //initial simulation
      let simulation = d3.forceSimulation(vis.year_division)
        .force("x", d3.forceX((d) => x_horizontal(d[1][0][0])).strength(3))
        .force("y", d3.forceY(vis.height / 2))
        .force("collide", d3.forceCollide(11))
        .stop();
      //simulate
      for (var i = 0; i < 200; ++i) { simulation.tick(); }
      //voronoi
      const delaunay = d3.Delaunay.from(vis.year_division, d => d.x, d => d.y),
        voronoi = delaunay.voronoi([0, 0, vis.width, vis.height]);

      //draw circles
      horizontal_svg.selectAll('.my_circles')
        .data(vis.year_division)
        .join('circle')
        .attr('cx', -50)
        .attr('cy', vis.height / 2)
        .on("mouseover", function (d, i) {
          d3.select(this).style("stroke", "white")
          d3.select("#hover_description")
            .style("display", "block")
            .style("left", d.x + 20 + "px")
            .style("top", d.y - 20 + "px")
            .html(i[1][0][1][0].Agt)
        })
        .on("mouseout", function (d, i) {
          d3.select(this).style("stroke", "black")
          d3.select("#hover_description")
            .style("display", "none")
        })
        .transition().delay(function (d, i) { return i * 2 })
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr("class", function (d) {
          let first_word
          if (soviet.includes(d[1][0][1][0].where_agt)) {
            first_word = "my_circles " + "soviet "
              + d[1][0][1][0].AgtId + " " + "y" +
              d[1][0][1][0].date.getUTCFullYear()
          }
          else if (syria.includes(d[1][0][1][0].where_agt)) {
            first_word = "my_circles " + "syria "
              + d[1][0][1][0].AgtId + " " + "y" +
              d[1][0][1][0].date.getUTCFullYear()
          }
          else {
            first_word = "my_circles " +
              " " + d[1][0][1][0].AgtId + " " + "y" +
              d[1][0][1][0].date.getUTCFullYear()
          }
          return first_word;
        })
        .attr('r', 10)
        .style("fill", "#7B8AD6")
        .style("stroke", "black")
        .style("strokewidth", 0.5)

      horizontal_svg.selectAll(".myXaxis").transition()
        .call(vis.x_axis)
        .style("stroke-dasharray", "5 5")
        .selectAll("text")
        .attr("transform", "translate(0,-4)")
        .style("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-family", "Montserrat");

      d3.selectAll(".domain")
        .attr("visibility", "hidden")
      d3.selectAll(".myXaxis, .tick line").transition()
        .attr("visibility", "visible")

    }

    else if (direction == "up") {
      d3.selectAll(".soviet")
        .transition()
        .style("fill", "#7B8AD6")

      horizontal_svg.selectAll('.my_circles')
        .data(vis.year_division)
        .join('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .transition().delay(function (d, i) { return i * 2 })
        .attr('cx', -50)
        .attr('cy', vis.height / 2)

      d3.selectAll(".myXaxis, .tick line").transition()
        .attr("visibility", "hidden")
    }
  }

  step2(direction) {
    const vis = this;
    console.log("step2", direction);

    if (direction == "down") {
      d3.selectAll(".soviet").style("fill", "white")
    }
    else if (direction == "up") {
      d3.selectAll(".my_circles").style("fill", "#7B8AD6")
    }
  }

  step3(direction) {
    const vis = this;
    console.log("step3", direction);

    if (direction === "down") {
      d3.selectAll(".soviet").style("fill", "#7B8AD6")
      d3.selectAll(".syria").style("fill", "white")
      drawContext(context_data, vis.height)
    }
    else {
      d3.selectAll(".soviet").style("fill", "white")
      d3.selectAll(".syria").style("fill", "#7B8AD6")
      drawContext([], vis.height)
    }
  }

  step4(direction) {
    const vis = this;
    console.log("step4", direction);

    if (direction === "down") {
      drawContext([], vis.height)
      d3.selectAll(".syria").style("fill", "#7B8AD6")
      x_horizontal.domain(d3.extent(vis.year_division, function (d) {
        return d[1][0][0];
      }))
        .nice();
      //initial simulation
      let simulation = d3.forceSimulation(vis.year_division)
        .force("y", d3.forceY(function (d) { return y_vertical(d[1][0][0]); }).strength(3))
        .force("x", d3.forceX(120 / 2))
        .force("collide", d3.forceCollide(4))
        .stop();
      //simulate
      for (var i = 0; i < 200; ++i) { simulation.tick(); }
      //voronoi
      const delaunay = d3.Delaunay.from(vis.year_division, d => d.x, d => d.y),
        voronoi = delaunay.voronoi([0, 0, vis.width, vis.height]);
      //draw circles
      horizontal_svg.selectAll('.my_circles')
        .data(vis.year_division)
        .join('circle')
        .transition().delay(function (d, i) { return i * 2 })
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 4)

      d3.selectAll(".graphic__vis, #visualization")
        .transition().delay(500)
        .style("width", 130 + "px")
        .style("height", height100 + "px")

      //move x axis to the left
      d3.selectAll(".domain, .tick line").attr("visibility", "hidden")
      vis.x_axis = d3.axisLeft(y_vertical).ticks(5);
      horizontal_svg.selectAll(".myXaxis").attr("transform", `translate(15,0)`)
      horizontal_svg.selectAll(".myXaxis").transition()
        .call(vis.x_axis)
        .selectAll("text")
        .attr("transform", "translate(0,-4)rotate(45)")
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-family", "Montserrat");
    }
    else if (direction == "up") {
      d3.selectAll(".syria").style("fill", "white")
      d3.selectAll(".myXaxis, .tick line").attr("visibility", "visible")
      //redraw x axis to horizontal
      // vis.x_axis = d3.axisBottom(x_horizontal).tickSize(-vis.height).ticks(10);
      vis.x_axis = d3.axisBottom(x_horizontal)
      horizontal_svg.selectAll(".myXaxis")
        .attr("transform", `translate(10, ` + vis.height + `)`)
      horizontal_svg.selectAll(".myXaxis").transition()
        .call(vis.x_axis)
        .style("stroke-dasharray", "5 5")
        .selectAll("text")
        .attr("transform", "translate(0,-4)")
        .style("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-family", "Montserrat");

      d3.selectAll(".graphic__vis, #visualization, #visualization1")
        .style("width", width100 + "px")
        .style("height", height100 + "px")
      //adjust domain
      x_horizontal.domain(d3.extent(vis.year_division, function (d) { return d[1][0][0]; }))
        .nice();
      //initial simulation
      let simulation = d3.forceSimulation(vis.year_division)
        .force("x", d3.forceX(function (d) { return x_horizontal(d[1][0][0]); }).strength(3))
        .force("y", d3.forceY(vis.height / 2))
        .force("collide", d3.forceCollide(11))
        .stop();
      //simulate
      for (var i = 0; i < 200; ++i) { simulation.tick(); }
      //voronoi
      const delaunay = d3.Delaunay.from(vis.year_division, d => d.x, d => d.y),
        voronoi = delaunay.voronoi([0, 0, vis.width, vis.height]);
      //draw circles
      horizontal_svg.selectAll('.my_circles')
        .data(vis.year_division)
        .join('circle')
        .transition().transition().delay(function (d, i) { return i * 2 })
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 10)

      drawContext(context_data, this.height)
    }
  }

  step5(direction) {
    const vis = this;
    console.log("step5", direction);

    if (direction == "down") {
      const donut_data = { Interstate: 61, Mixed: 99, Intrastate: 16 }
      drawDonut(donut_data, direction)
      d3.selectAll(".polyline, .polytext").transition().style("opacity", 1)
    }
    else if (direction == "up") {
      const zero_data = { Interstate: 0, Mixed: 0, Intrastate: 0 }
      drawDonut(zero_data, direction)
      d3.selectAll(".polyline, .polytext").transition().style("opacity", 0)
    }
  }

  step6(direction) {
    const vis = this;
    console.log("step6", direction);
  }

  step7(direction) {
    const vis = this;
    console.log("step7", direction);
    if (direction == "down") {
      const zero_data = { Interstate: 0, Mixed: 0, Intrastate: 0 }
      drawDonut(zero_data, "up")
      d3.selectAll(".polyline, .polytext").transition().style("opacity", 0)
    }
    else if (direction == "up") {
      const donut_data = { Interstate: 61, Mixed: 99, Intrastate: 16 }
      drawDonut(donut_data, "down")
      d3.selectAll(".polyline, .polytext").transition().style("opacity", 1)

    }
  }

  step8(direction) {
    const vis = this;
    console.log("step8", direction);
    
    //LINECHART VISUALIZATION
    console.log(this.linechart);
    // Add X axis --> it is a date format
    const x = d3.scaleTime()
      .domain(d3.extent(this.linechart, function (d) { return d[0]; }))
      .range([0, vis.width-150]);

    line_svg.append("g")
      .attr("transform", `translate(0, ${vis.height - 50})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(this.linechart, function (d) { return d[1].length; })])
      .range([vis.height - 50, 0]);

    line_svg.append("g")
      .call(d3.axisLeft(y));
    // Add the line
    line_svg.append("path")
      .datum(this.linechart)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .curve(d3.curveCatmullRom.alpha(0.2))
        .x(function (d) { return x(d[0]) })
        .y(function (d) { return y(d[1].length) })
      )

  }

  step9(direction) {
    const vis = this;
    console.log("step9", direction);

  }

  step10(direction) {
    const vis = this;
    console.log("step10", direction);

  }

  goToStep(stepIndex, direction) {
    if (hovno === 1) {
      this[this.config.steps[stepIndex]](direction);
    }
  }
}