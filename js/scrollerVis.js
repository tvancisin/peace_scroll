let hovno = 0;
let context_parser = d3.timeParse("%Y/%m/%d");
let mousemove_function, mouseleave_function = null;
let hoveredPolygonId = null;
let path;
let zero_donut;
let non_zero;
const pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function (d) {
    return d[1].length
  })

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
  const data_ready = pie(data)
  console.log(data_ready);

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
  constructor(_config, _raw, _year, _array, _agt_stage, _multiline, _chart,
    _unemployment, _all_sorted, _selected) {
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
    this.agt_stage_group = _agt_stage;
    this.multiline_data = _multiline;
    this._chart_data = _chart;
    this.unemployment = _unemployment;
    this.all_sorted = _all_sorted
    this.selected_actor = _selected
    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.width = vis.config.vis_width - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.vis_height - vis.config.margin.top - vis.config.margin.bottom;
    d3.select(".myXaxis").remove()

    //BEESWARM VISUALIZATION
    horizontal_svg.append("g")
      .attr("transform", `translate(10, ` + height + `)`)
      .attr("class", "myXaxis")
    vis.x_axis = d3.axisBottom(x_horizontal) // small ticks
    // vis.x_axis = d3.axisBottom(x_horizontal).tickSize(-vis.height);
    //scale for vertical bees
    y_vertical.domain(d3.extent(vis.year_division, (d) => d[1][0][0]))

    //DONUT CHART
    // zero_donut = _.cloneDeep(this.agt_stage_group)
    const desiredOrder = [
      'Pre-negotiation',
      'Ceasefire',
      'Framework-substantive, partial',
      'Framework-substantive, comprehensive',
      'Implementation',
      'Renewal'
    ];
    // Sorting the data array based on the desired order
    const sortedData = this.agt_stage_group.sort((a, b) => {
      const indexA = desiredOrder.indexOf(a[0]);
      const indexB = desiredOrder.indexOf(b[0]);
      return indexA - indexB;
    });
    zero_donut = sortedData.map((d) => d.map(e => e));
    zero_donut.forEach(function (d) {
      d[1] = [];
    })
    const data_ready = pie(this.agt_stage_group)
    //prepare donut for drawing
    path = piechart_svg
      .selectAll('path')
      .data(data_ready)
      .join('path')
      .attr("class", "slices")
      .attr('fill', d => color(d.data[1]))
      // .attr('fill', "gray")
      .attr("stroke", "black")
      .style("stroke-width", "2px")
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
        posC[0] = radius * 0.88 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
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
      .text(function (d) {
        if (d.data[0] == "Framework-substantive, comprehensive") {
          return "FS, comprehensive"
        }
        else if (d.data[0] == "Framework-substantive, partial") {
          return "FS, partial"
        }
        else {
          return d.data[0]
        }
      })
      .attr('transform', function (d) {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.7 * (midangle < Math.PI ? 1 : -1);
        pos[1] -= 10;
        return `translate(${pos})`;
      })
      .style('text-anchor', function (d) {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
      })
      .style("fill", "white")
      .style("opacity", 0)

    //MULTILINE CHART
    let multiline_x = d3.scaleUtc()
      .domain(d3.extent(this.unemployment, d => d.date))
      .range([margin.left, width - margin.right]);
    let multiline_y = d3.scaleLinear()
      .domain([0, 100]).nice()
      .range([height - margin.bottom, margin.top]);
    multiline_svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .attr("class", "multi_axis")
      .call(d3.axisBottom(multiline_x).ticks(width / 80).tickSizeOuter(0))
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "Montserrat");
    let points = this.unemployment.map((d) => [multiline_x(d.date), multiline_y(d.unemployment), d.division]);
    console.log(points);
    let delaunay = d3.Delaunay.from(points)
    let voronoi = delaunay.voronoi([-1, -1, width + 1, height + 1])

    multiline_svg.append("g")
      .attr("class", "multi_y")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(multiline_y).ticks(5))
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "Montserrat")
      .call(g => g.select(".domain").remove())
      .call(voronoi ? () => { } : g => g.selectAll(".tick line").clone()
        .attr("x2", width - margin.left - margin.right)
        .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        // .text("↑ Unemployment (%)")
      );

    // Add the area
    multiline_svg.append("path")
      .datum(this.all_sorted)
      .attr("fill", "#379FDF")
      .attr("stroke", "#101723")
      .attr("stroke-width", 1.5)
      .attr("d", d3.area()
        // .curve(d3.curveMonotoneX)
        .curve(d3.curveCardinal.tension(0.6))
        .x(d => multiline_x(d.date))
        .y0(multiline_y(0))
        .y1(d => multiline_y(d.value))
      )

    // Group the points by series.
    let multiline_groups = d3.rollup(points, v => Object.assign(v, { z: v[0][2] }), d => d[2]);

    // Draw the lines.
    let line = d3.line()
      .curve(d3.curveCardinal.tension(0.5));
    // .curve(d3.curveMonotoneX)
    let sel_actor = this.selected_actor

    let multiline_path = multiline_svg.append("g")
      .attr("fill", "none")
      .selectAll("path")
      .data(multiline_groups.values())
      .join("path")
      // .style("mix-blend-mode", "multiply")
      .attr("d", line)
      .attr("stroke", function (d) {
        if (d[0][2] == sel_actor) {
          return "white"
        }
        else {
          return "black"
        }
      })
      .attr("stroke-width", function(d){
        if (d[0][2] == sel_actor) {
          return 3 
        }
        else {
          return 2 
        }

      })
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")

    let these = this.unemployment;

    // Add an invisible layer for the interactive tip.
    let dot = multiline_svg.append("g")
      .attr("display", "none");

    dot.append("circle")
      .attr("r", 5)
      .style("fill", "white");

    dot.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -8);

    multiline_svg
      .on("pointerenter", pointerentered)
      .on("pointermove", pointermoved)
      .on("pointerleave", pointerleft)
      .on("touchstart", event => event.preventDefault());


    // When the pointer moves, find the closest point, update the interactive tip, and highlight
    // the corresponding line. Note: we don't actually use Voronoi here, since an exhaustive search
    // is fast enough.
    function pointermoved(event) {
      const [xm, ym] = d3.pointer(event);
      const i = d3.leastIndex(points, ([x, y]) => Math.hypot(x - xm, y - ym));
      const [x, y, k] = points[i];
      multiline_path.style("stroke", ({ z }) => z === k ? "white" : "black").filter(({ z }) => z === k).raise();
      dot.attr("transform", `translate(${x},${y})`);
      dot.select("text").text(k).style("fill", "white");
      multiline_svg.property("value", these[i]).dispatch("input", { bubbles: true });
    }

    function pointerentered() {
      multiline_path.style("stroke", "black");
      dot.attr("display", null);
    }

    function pointerleft() {
      multiline_path.style("stroke", function(d){
        if (d[0][2] == sel_actor) {
          return "white"
        }
        else {
          return "black"
        }
      } );
      dot.attr("display", "none");
      multiline_svg.node().value = null;
      multiline_svg.dispatch("input", { bubbles: true });
    }

    //BAR CHART
    // List of subgroups = header of the csv files = soil condition here
    const subgroups = ["All"]
    const keys = Object.keys(this._chart_data[0]);
    subgroups.push(keys[1])

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    const groups = ['Pre-negotiation', 'Ceasefire', 'Framework-substantive, partial', 'Framework-substantive, comprehensive', 'Implementation', 'Renewal', 'Other']

    // Add X axis
    const bar_x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])

    barchart_svg.append("g")
      .attr("transform", `translate(0, ${height - 10})`)
      .call(d3.axisBottom(bar_x))
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "Montserrat");

    // Add Y axis
    const bar_y = d3.scaleLinear()
      .domain([0, 45])
      .range([height - 10, 0]);

    barchart_svg.append("g")
      .call(d3.axisLeft(bar_y).ticks(5))
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "Montserrat");

    barchart_svg.selectAll(".domain")
      .attr("visibility", "hidden")

    // Another scale for subgroup position?
    const xSubgroup = d3.scaleBand()
      .domain(subgroups)
      .range([0, bar_x.bandwidth()])
      .padding([0.05])

    // color palette = one color per subgroup
    const bar_color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(['#e41a1c', '#377eb8'])

    // Show the bars
    barchart_svg.append("g")
      .selectAll("g")
      // Enter in data = loop group per group
      .data(this._chart_data)
      .join("g")
      .attr("transform", d => `translate(${bar_x(d.group)}, 0)`)
      .selectAll("rect")
      .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
      .join("rect")
      .attr("rx", 4)
      .attr("x", d => xSubgroup(d.key))
      .attr("y", d => bar_y(d.value))
      .attr("width", xSubgroup.bandwidth())
      .attr("height", d => (height - 10) - bar_y(d.value))
      .attr("fill", d => bar_color(d.key));

    window.scrollTo({ left: 0, top: 0, behavior: "auto" });

    setTimeout(function () {
      hovno = 1;
    }, 800);
  }

  step1(direction) {
    const vis = this;
    console.log("step1", direction);

    map.setFilter('state-fills', ['in', 'ADMIN', ...vis.country_array]);
    horizontal_svg.selectAll(".tick").remove()
    if (direction === "down") {
      //adjust domain
      x_horizontal
        .domain(d3.extent(vis.year_division, (d) => d[1][0][0]))
        .nice();
      //initial simulation
      let simulation = d3.forceSimulation(vis.year_division)
        .force("x", d3.forceX((d) => x_horizontal(d[1][0][0])).strength(3))
        .force("y", d3.forceY(height / 2))
        .force("collide", d3.forceCollide(11))
        .stop();
      //simulate
      for (var i = 0; i < 200; ++i) { simulation.tick(); }
      //voronoi
      const delaunay = d3.Delaunay.from(vis.year_division, d => d.x, d => d.y),
        voronoi = delaunay.voronoi([0, 0, vis.width, height]);



      //draw circles
      horizontal_svg.selectAll('.my_circles')
        .data(vis.year_division)
        .join('circle')
        .attr('cx', -50)
        .attr('cy', height / 2)
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
        .on("mouseover", function (d, i) {
          console.log(d);
          d3.select(this).style("stroke", "white")
          d3.select("#hover_description")
            .style("display", "block")
            .style("left", function () {
              if (d.x >= width100 / 2) {
                return d.x - width20 - 150 + "px"
              }
              else {
                return d.x - width20 + 20 + "px"
              }
            })
            .style("top", d.y + "px")
            .html(i[1][0][1][0].Agt)
        })
        .on("mouseout", function (d, i) {
          d3.select(this).style("stroke", "black")
          d3.select("#hover_description")
            .style("display", "none")
        })


      const totalElements = horizontal_svg.selectAll('.my_circles').size();
      const transitionDuration = 300; // Duration of transition in milliseconds
      const delayStep = transitionDuration / totalElements;

      horizontal_svg.selectAll('.my_circles')
        .each(function (_, i) {
          // Reverse the selection order
          const reversedIndex = totalElements - i - 1;
          // Calculate delay based on reversed index
          const delay = delayStep * reversedIndex;
          // Transition with delay
          d3.select(this)
            .transition()
            .delay(delay)
            .duration(transitionDuration)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
        });

      horizontal_svg.selectAll(".myXaxis").transition()
        .call(vis.x_axis)
        .style("stroke-dasharray", "5 5")
        .selectAll("text")
        .attr("transform", "translate(0,-4)")
        .style("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-family", "Montserrat");

      horizontal_svg.selectAll(".domain")
        .attr("visibility", "hidden")
      horizontal_svg.selectAll(".myXaxis, .tick line").transition()
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
        .attr('cy', height / 2)

      horizontal_svg.selectAll(".myXaxis, .tick line").transition()
        .attr("visibility", "hidden")
    }
  }

  step2(direction) {
    const vis = this;
    console.log("step2", direction);

    if (direction == "down") {
      d3.selectAll(".soviet").style("fill", "white")
      d3.select("#legend p").text("Peace agreements addressing conflicts in the former Soviet Union territories.")
      d3.select(".dot").style("background-color", "white")
    }
    else if (direction == "up") {
      d3.selectAll(".my_circles").style("fill", "#7B8AD6")
      d3.select("#legend p").text("Individual peace agreements signed by Russia (hover over for more detail).")
      d3.select(".dot").style("background-color", "#7B8AD6")
    }
  }

  step3(direction) {
    const vis = this;
    console.log("step3", direction);

    if (direction === "down") {
      d3.select("#legend p").text("Peace agreements addressing conflicts in Syria, Libya, and the Central African Republic.")
      d3.selectAll(".soviet").style("fill", "#7B8AD6")
      d3.selectAll(".syria").style("fill", "white")
      drawContext(context_data, height)

      // horizontal_svg.selectAll('.my_circles')
      //   .data(vis.year_division)
      //   .join('circle')
      //   .attr('cx', d => d.x)
      //   .attr('cy', d => d.y)
      //   .transition().delay(function (d, i) { return i * 2 })
      //   .attr('cx', -50)
      //   .attr('cy', vis.height / 2)

      // d3.selectAll(".myXaxis, .tick line").transition()
      //   .attr("visibility", "visible")
    }
    else {
      d3.selectAll(".soviet").style("fill", "white")
      d3.selectAll(".syria").style("fill", "#7B8AD6")
      d3.select("#legend p").text("Peace agreements addressing conflicts in the former Soviet Union territories.")
      drawContext([], height)
    }
  }

  step4(direction) {
    const vis = this;
    console.log("step4", direction);

    if (direction === "down") {
      drawContext([], height)
      d3.selectAll(".syria").style("fill", "#7B8AD6")

      const totalElements = horizontal_svg.selectAll('.my_circles').size();
      console.log(totalElements);
      const transitionDuration = 300; // Duration of transition in milliseconds
      const delayStep = transitionDuration / totalElements;

      horizontal_svg.selectAll('.my_circles')
        .each(function (_, i) {
          // Reverse the selection order
          const reversedIndex = totalElements - i - 1;
          // Calculate delay based on reversed index
          const delay = delayStep * reversedIndex;
          // Transition with delay
          d3.select(this)
            .transition()
            .delay(delay)
            .duration(transitionDuration)
            .attr('cx', vis.width + 100)
            .attr('cy', height / 2)
        });

      // horizontal_svg.selectAll('.my_circles')
      //   .transition().delay(function (d, i) { return i * 2 })
      //   .attr('r', 3)
      //   .attr('cx', vis.width + 100)
      //   .attr('cy', vis.height / 2)

      d3.selectAll(".myXaxis, .tick line").transition()
        .attr("visibility", "hidden")
      //   x_horizontal.domain(d3.extent(vis.year_division, function (d) {
      //     return d[1][0][0];
      //   }))
      //     .nice();
      //   //initial simulation
      //   let simulation = d3.forceSimulation(vis.year_division)
      //     .force("y", d3.forceY(function (d) { return y_vertical(d[1][0][0]); }).strength(3))
      //     .force("x", d3.forceX(120 / 2))
      //     .force("collide", d3.forceCollide(4))
      //     .stop();
      //   //simulate
      //   for (var i = 0; i < 200; ++i) { simulation.tick(); }
      //   //voronoi
      //   const delaunay = d3.Delaunay.from(vis.year_division, d => d.x, d => d.y),
      //     voronoi = delaunay.voronoi([0, 0, vis.width, vis.height]);
      //   //draw circles
      //   horizontal_svg.selectAll('.my_circles')
      //     .data(vis.year_division)
      //     .join('circle')
      //     .transition().delay(function (d, i) { return i * 2 })
      //     .attr('cx', d => d.x)
      //     .attr('cy', d => d.y)
      //     .attr('r', 4)

      //   d3.selectAll(".graphic__vis, #visualization")
      //     .transition().delay(500)
      //     .style("width", 130 + "px")
      //     .style("height", height100 + "px")

      //   //move x axis to the left
      //   d3.selectAll(".domain, .tick line").attr("visibility", "hidden")
      //   vis.x_axis = d3.axisLeft(y_vertical).ticks(5);
      //   horizontal_svg.selectAll(".myXaxis").attr("transform", `translate(15,0)`)
      //   horizontal_svg.selectAll(".myXaxis").transition()
      //     .call(vis.x_axis)
      //     .selectAll("text")
      //     .attr("transform", "translate(0,-4)rotate(45)")
      //     .style("text-anchor", "start")
      //     .style("font-size", "12px")
      //     .style("font-family", "Montserrat");
      // }
      // else if (direction == "up") {
      //   d3.selectAll(".syria").style("fill", "white")
      //   d3.selectAll(".myXaxis, .tick line").attr("visibility", "visible")
      //   //redraw x axis to horizontal
      //   // vis.x_axis = d3.axisBottom(x_horizontal).tickSize(-vis.height).ticks(10);
      //   vis.x_axis = d3.axisBottom(x_horizontal)
      //   horizontal_svg.selectAll(".myXaxis")
      //     .attr("transform", `translate(10, ` + vis.height + `)`)
      //   horizontal_svg.selectAll(".myXaxis").transition()
      //     .call(vis.x_axis)
      //     .style("stroke-dasharray", "5 5")
      //     .selectAll("text")
      //     .attr("transform", "translate(0,-4)")
      //     .style("fill", "white")
      //     .style("text-anchor", "middle")
      //     .style("font-size", "14px")
      //     .style("font-family", "Montserrat");

      //   d3.selectAll(".graphic__vis, #visualization, #visualization1")
      //     .style("width", width100 + "px")
      //     .style("height", height100 + "px")
      //   //adjust domain
      //   x_horizontal.domain(d3.extent(vis.year_division, function (d) { return d[1][0][0]; }))
      //     .nice();
      //   //initial simulation
      //   let simulation = d3.forceSimulation(vis.year_division)
      //     .force("x", d3.forceX(function (d) { return x_horizontal(d[1][0][0]); }).strength(3))
      //     .force("y", d3.forceY(vis.height / 2))
      //     .force("collide", d3.forceCollide(11))
      //     .stop();
      //   //simulate
      //   for (var i = 0; i < 200; ++i) { simulation.tick(); }
      //   //voronoi
      //   const delaunay = d3.Delaunay.from(vis.year_division, d => d.x, d => d.y),
      //     voronoi = delaunay.voronoi([0, 0, vis.width, vis.height]);
      //   //draw circles
      //   horizontal_svg.selectAll('.my_circles')
      //     .data(vis.year_division)
      //     .join('circle')
      //     .transition().transition().delay(function (d, i) { return i * 2 })
      //     .attr('cx', d => d.x)
      //     .attr('cy', d => d.y)
      //     .attr('r', 10)

      //   drawContext(context_data, this.height)
    }
    else if (direction == "up") {
      d3.selectAll(".syria").style("fill", "white")
      horizontal_svg.selectAll(".myXaxis, .tick line").attr("visibility", "visible")
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

  //MULTILINE
  step5(direction) {
    const vis = this;
    console.log("step5", direction);

  }

  step6(direction) {
    const vis = this;
    console.log("step6", direction);

  }

  step7(direction) {
    const vis = this;
    console.log("step7", direction);

  }

  //DONUT
  step8(direction) {
    const vis = this;
    console.log("step8", direction);

    if (direction == "down") {
      drawDonut(this.agt_stage_group, direction)
      d3.selectAll(".polyline, .polytext").transition().style("opacity", 1)
    }
    else if (direction == "up") {
      drawDonut(zero_donut, direction)
      d3.selectAll(".polyline, .polytext").transition().style("opacity", 0)
    }
  }

  step9(direction) {
    const vis = this;
    console.log("step9", direction);
  }

  step10(direction) {
    const vis = this;
    console.log("step10", direction);
    if (direction == "down") {
      drawDonut(zero_donut, "up")
      d3.selectAll(".polyline, .polytext").transition().style("opacity", 0)
    }
    else if (direction == "up") {
      drawDonut(this.agt_stage_group, "down")
      d3.selectAll(".polyline, .polytext").transition().style("opacity", 1)
    }
  }

  step11(direction) {
    const vis = this;
    console.log("step11", direction);
    //draw multiline chart
    // let multiline_path = multiline_svg.selectAll(".line")
    //   .data(this.multiline_data)
    //   .join("path")
    //   .attr("class", "line")
    //   .attr("fill", "none")
    //   .attr("stroke", function (d) { return multiline_color(d[0]) })
    //   // .attr("stroke", "black")
    //   .attr("stroke-width", 2)
    //   .attr("d", function (d) {
    //     return d3.line()
    //       .curve(d3.curveMonotoneX)
    //       // .curve(d3.curveCatmullRom.alpha(0.4))
    //       .x(function (d) { return multiline_x(d[0]); })
    //       .y(function (d) { return multiline_y(+d[1].length); })
    //       (d[1])
    //   })

    if (direction == "down") {

      //   multiline_path
      //     .attr("stroke-dasharray", function (d) {
      //       // Get the path length of the current element
      //       const pathLength = this.getTotalLength();
      //       return `0 ${pathLength}`
      //     })
      //     .transition()
      //     .duration(5000)
      //     .attr("stroke-dasharray", function (d) {
      //       // Get the path length of the current element
      //       const pathLength = this.getTotalLength();
      //       return `${pathLength} ${pathLength}`
      //     });

    }
    else if (direction == "up") {


      //   multiline_path
      //     .attr("stroke-dasharray", function (d) {
      //       // Get the path length of the current element
      //       const pathLength = this.getTotalLength();
      //       return `${pathLength} ${pathLength}`
      //     })
      //     .transition()
      //     .duration(1000)
      //     .attr("stroke-dasharray", function (d) {
      //       // Get the path length of the current element
      //       const pathLength = this.getTotalLength();
      //       return `0 ${pathLength}`
      //       // return `${pathLength} ${pathLength}`
      //     });

    }

    // let pos, idx;
    // var mouseG = multiline_svg.append("g") // this the black vertical line to folow mouse
    //   .attr("class", "mouse-over-effects");

    // mouseG.append("path")
    //   .attr("class", "mouse-line")
    //   .style("stroke", "gray")
    //   .style("stroke-width", "1px")
    //   .style("opacity", "0");

    // var lines = document.getElementsByClassName("line");
    // var mousePerLine = mouseG.selectAll(".mouse-per-line")
    //   .data(this.multiline_data)
    //   .enter()
    //   .append("g")
    //   .attr("class", "mouse-per-line");

    // mousePerLine.append("circle")
    //   .attr("r", 7)
    //   .style("stroke", function (d) {
    //     return "white"
    //   })
    //   .style("fill", "none")
    //   .style("stroke-width", "1px")
    //   .style("opacity", "0");

    // mousePerLine.append("text")
    //   .attr("transform", "translate(10,3)");

    // mouseG.append("rect")
    //   .attr("width", vis.width)
    //   .attr("height", height)
    //   .attr("fill", "none")
    //   .attr("pointer-events", "all")
    //   .on("mouseout", function () {
    //     d3.select(".mouse-line").style("opacity", "0");
    //     d3.selectAll(".mouse-per-line circle").style("opacity", "0");
    //     d3.selectAll(".mouse-per-line text").style("opacity", "0")
    //   })
    //   .on("mouseover", function () {
    //     d3.select(".mouse-line").style("opacity", "1");
    //     d3.selectAll(".mouse-per-line circle").style("opacity", "1");
    //     d3.selectAll(".mouse-per-line text").style("opacity", "1")

    //   })
    //   .on("mousemove", function () {
    //     var mouse = d3.pointer(event, this);
    //     d3.select(".mouse-line")
    //       .attr("d", function () {
    //         var d = "M" + mouse[0] + "," + height;
    //         d += " " + mouse[0] + "," + 0;
    //         return d;
    //       })
    //     // .attr("d",function(){
    //     //   var d = "M" + w +"," + mouse[1];
    //     //   d+=" " +0 + "," + mouse[1];
    //     //   return d;
    //     // });

    //     d3.selectAll(".mouse-per-line")
    //       .attr("transform", function (d, i) {
    //         // console.log(width / (mouse[0]));
    //         var xDate = multiline_x.invert(mouse[0]),
    //           bisect = d3.bisector(function (d) { return d.date; }).right;
    //         idx = bisect(d.values, xDate);
    //         // console.log("xDate:", xDate);
    //         // console.log("bisect", bisect);
    //         // console.log("idx:", idx)

    //         var beginning = 0,
    //           end = lines[i].getTotalLength(),
    //           target = null;

    //         // console.log("end", end);

    //         while (true) {
    //           target = Math.floor((beginning + end) / 2)
    //           // console.log("Target:", target);
    //           pos = lines[i].getPointAtLength(target);
    //           // console.log("Position", pos.y);
    //           // console.log("What is the position here:", pos)
    //           if ((target === end || target == beginning) && pos.x !== mouse[0]) {
    //             break;
    //           }

    //           if (pos.x > mouse[0]) end = target;
    //           else if (pos.x < mouse[0]) beginning = target;
    //           else break; // position found
    //         }
    //         d3.select(this).select("text")
    //           .text(multiline_y.invert(pos.y).toFixed(1))
    //           .attr("fill", function (d) {
    //             // return color(d.name)
    //             return "white"
    //           });
    //         return "translate(" + mouse[0] + "," + pos.y + ")";

    //       });

    //   });

  }

  step12(direction) {
    const vis = this;
    console.log("step12", direction);
  }

  step13(direction) {
    const vis = this;
    console.log("step13", direction);
  }

  goToStep(stepIndex, direction) {
    if (hovno === 1) {
      this[this.config.steps[stepIndex]](direction);
    }
  }
}