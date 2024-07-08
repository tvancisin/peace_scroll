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
  console.log(data);
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
        'step13', 'step14']
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
    d3.select(".bee_x_axis").remove()
    d3.selectAll(".area, .multiline").remove()

    //BEESWARM VISUALIZATION
    horizontal_svg.append("g")
      .attr("transform", `translate(10, ` + height + `)`)
      .attr("class", "bee_x_axis")
    vis.x_axis = d3.axisBottom(x_horizontal) // small ticks
    // vis.x_axis = d3.axisBottom(x_horizontal).tickSize(-vis.height);
    //scale for vertical bees
    y_vertical.domain(d3.extent(vis.year_division, (d) => d[1][0][0]))


    //MULTILINE CHART
    let multiline_x = d3.scaleUtc()
      .domain(d3.extent(this.unemployment, d => d.date))
      .range([margin.left, width - margin.right]);
    let multiline_y = d3.scaleLinear()
      .domain([0, 100]).nice()
      .range([height - margin.bottom, margin.top]);
    multiline_svg.append("g")
      .attr("class", "multiline_x_axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(multiline_x).ticks(5))
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "Montserrat");
    let points = this.unemployment.map((d) => [multiline_x(d.date), multiline_y(d.unemployment), d.division]);
    let delaunay = d3.Delaunay.from(points)
    let voronoi = delaunay.voronoi([-1, -1, width + 1, height + 1])

    multiline_svg.append("g")
      .attr("class", "multiline_y_axis")
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
      .attr("fill", "#7B8AD6")
      // .attr("opacity", 0.7)
      .attr("class", "area")
      .attr("stroke", "none")
      .attr("stroke-width", 2)
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
      .attr("class", "multiline")
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
      .attr("stroke-width", function (d) {
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
      .style("fill", "white")
      .style("stroke", "black");

    dot.append("text")
      // .attr("text-anchor", "middle")
      .attr("y", -10)
      .attr("x", -10);

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
      console.log(x,width);
      if (x >= width/2) {
        dot.select("text").attr("text-anchor", "end")
      }
      else {
        dot.select("text").attr("text-anchor", "start")
      }
      dot.select("text").text(k + " (" + these[i].unemployment + ")")
        .style("fill", "white")
      // .style("stroke", "black")
      // .style("stroke-width", 2.5)
      // .style("paint-order", "stroke");
      multiline_svg.property("value", these[i]).dispatch("input", { bubbles: true });
    }

    function pointerentered() {
      multiline_path.style("stroke", "black");
      dot.attr("display", null);
    }

    function pointerleft() {
      multiline_path.style("stroke", function (d) {
        if (d[0][2] == sel_actor) {
          return "white"
        }
        else {
          return "black"
        }
      });
      dot.attr("display", "none");
      multiline_svg.node().value = null;
      multiline_svg.dispatch("input", { bubbles: true });
    }


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
          return "Comprehensive"
        }
        else if (d.data[0] == "Framework-substantive, partial") {
          return "Partial"
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



    //BAR CHART
    vis.chart_data = this._chart_data
    // List of subgroups
    vis.subgroups = ["All"]
    let keeys = Object.keys(this._chart_data[0]);
    vis.subgroups.push(keeys[2])

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    vis.groups = ['Pre-negotiation', 'Ceasefire', 'Partial', 'Comprehensive', 'Implementation', 'Renewal', 'Other']

    // Add X axis
    vis.bar_x = d3.scaleBand()
      .domain(vis.groups)
      .range([0, width])
      .padding([0.2])

    barchart_svg.append("g")
      .attr("class", "x_axis")
      .attr("transform", `translate(0, ${height - 10})`)
      .call(d3.axisBottom(vis.bar_x))
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "Montserrat");

    // Add Y axis
    vis.bar_y = d3.scaleLinear()
      .domain([0, 45])
      .range([height - 10, 0]);

    barchart_svg.append("g")
      .attr("class", "y_axis")
      .call(d3.axisLeft(vis.bar_y).ticks(5))
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "Montserrat");

    barchart_svg.selectAll(".domain")
      .attr("visibility", "hidden")

    // Another scale for subgroup position?
    vis.xSubgroup = d3.scaleBand()
      .domain(vis.subgroups)
      .range([0, vis.bar_x.bandwidth()])
      .padding([0.05])

    // color palette = one color per subgroup
    vis.bar_color = d3.scaleOrdinal()
      .domain(vis.subgroups)
      .range(['#7B8AD6', 'white'])

    vis._chart_data.forEach(obj => {
      if (obj.group === 'Framework-substantive, partial') {
        obj.group = 'Partial';
      } else if (obj.group === 'Framework-substantive, comprehensive') {
        obj.group = 'Comprehensive';
      }
    });

    window.scrollTo({ left: 0, top: 0, behavior: "auto" });

    setTimeout(function () {
      hovno = 1;
    }, 800);
  }

  step1(direction) {
    const vis = this;
    console.log("step1", direction);
    console.log(vis.country_array);

    if (this.selected_actor == "Russia") {
      const countriesToRemove = ['France', 'United Kingdom', 'United States of America'];
      const filteredCountries = vis.country_array.filter(country => !countriesToRemove.includes(country));
      map.setFilter('state-fills', ['in', 'ADMIN', ...filteredCountries]);
      map.setPaintProperty(
        'state-fills',
        'fill-color',
        ['match', ['get', 'ADMIN'], 'Russia', 'white', '#7B8AD6']
      );
    }
    else if (this.selected_actor == "China") {
      map.setFilter('state-fills', ['in', 'ADMIN', ...vis.country_array]);
      map.setPaintProperty(
        'state-fills',
        'fill-color',
        ['match', ['get', 'ADMIN'], 'China', 'white', '#7B8AD6']
      );
    }

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

      function containsSovietCountry(string) {
        return soviet.some(country => string.includes(country));
      }
      function containsSyriaCountry(string) {
        return syria.some(country => string.includes(country));
      }
      let current_author = this.selected_actor
      let china_highlight = ['Text of Joint Statement (29/09/2005)', 'Agreement on the Resolution of the Conflict in the Republic of South Sudan (ARCSS) (17/08/2015)',
        'Agreement on the Cessation of Hostilities, Protection of Civilians and Humanitarian Access, Republic of South Sudan (21/12/2017)',
        'The Nationwide Ceasefire Agreement (NCA) between The Government of the Republic of the Union of Myanmar and the Ethnic Armed Organizations (EAO) (15/10/2015)']
      //draw circles
      horizontal_svg.selectAll('.my_circles')
        .data(vis.year_division)
        .join('circle')
        .attr('cx', -50)
        .attr('cy', height / 2)
        .attr("class", function (d) {
          if (current_author == "Russia") {
            let first_word;
            if (containsSovietCountry(d[1][0][1][0].Con)) {
              first_word = "my_circles " + "soviet "
                + d[1][0][1][0].AgtId + " " + "y" +
                d[1][0][1][0].date.getUTCFullYear()
            }
            else if (containsSyriaCountry(d[1][0][1][0].Con)) {
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
          }

          else if (current_author == "China") {
            let all_actors = [];
            d[1].forEach(function (x) {
              all_actors.push(x[1][0].actor)
            })
            const specifiedCountries = ['Russia', 'France', 'United Kingdom', 'United States', 'China'];
            let containsUnitedNations = all_actors.includes('United Nations');
            let containsEurope = all_actors.includes('Conference on Security and Cooperation in Europe');
            let containsAllSpecifiedCountries = specifiedCountries.every(country => all_actors.includes(country));
            let last_agt = "Declaration of the Paris International Conference for Libya (12 November 2021)"
            let china_classes;
            if (!china_highlight.includes(d[1][0][1][0].Agt)) {
              if (containsUnitedNations || containsAllSpecifiedCountries || containsEurope || d[1][0][1][0].AgtId == 2433) {
                china_classes = "my_circles " + "china_high" + " un_p5"
              }
              else {
                china_classes = "my_circles " + "china_high"
              }
            }
            else {
              china_classes = "my_circles"
            }
            return china_classes
          }
        })
        .attr('r', 10)
        .style("fill", "#7B8AD6")
        .style("stroke", "black")
        .style("strokewidth", 0.5)
        .on("click", function (d, i) {
          window.open(i[1][0][1][0].PDF_Hyperlink);
        })
        .on("mouseover", function (d, i) {
          console.log(d, i);
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
            .html(i[1][0][1][0].agt_dat)
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

      horizontal_svg.selectAll(".bee_x_axis").transition()
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
      horizontal_svg.selectAll(".bee_x_axis, .tick line").transition()
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

      horizontal_svg.selectAll(".bee_x_axis, .tick line").transition()
        .attr("visibility", "hidden")
    }
  }

  step2(direction) {
    const vis = this;
    console.log("step2", direction);

    if (direction == "down") {
      if (this.selected_actor == "Russia") {
        d3.selectAll(".soviet").style("fill", "white")
      }
      else if (this.selected_actor == "China") {
        d3.selectAll(".china_high").style("fill", "white")
      }
    }
    else if (direction == "up") {
      d3.selectAll(".my_circles").style("fill", "#7B8AD6")
    }
  }

  step3(direction) {
    const vis = this;
    console.log("step3", direction);

    if (direction === "down") {
      if (this.selected_actor == "Russia") {
        d3.selectAll(".soviet").style("fill", "#7B8AD6")
        d3.selectAll(".syria").style("fill", "white")
        drawContext(context_data, height)
      }
      else if (this.selected_actor == "China") {
        d3.selectAll(".my_circles").style("fill", "#7B8AD6")
        d3.selectAll(".un_p5").style("fill", "white")

      }

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
      if (this.selected_actor == "Russia") {
        d3.selectAll(".soviet").style("fill", "white")
        d3.selectAll(".syria").style("fill", "#7B8AD6")
        d3.select("#legend p").text("Peace agreements addressing conflicts in the former Soviet Union territories.")
        drawContext([], height)
      }
      else if (this.selected_actor == "China") {
        d3.selectAll(".my_circles").style("fill", "#7B8AD6")
        d3.selectAll(".china_high").style("fill", "white")

      }
    }
  }

  step4(direction) {
    const vis = this;
    console.log("step4", direction);

    if (direction === "down") {
      drawContext([], height)
      d3.selectAll(".my_circles").style("fill", "#7B8AD6")

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
            .attr('cx', vis.width + 100)
            .attr('cy', height / 2)
        });
      d3.selectAll(".bee_x_axis, .tick line").transition()
        .attr("visibility", "hidden")
    }
    else if (direction == "up") {
      d3.selectAll(".syria").style("fill", "white")
      horizontal_svg.selectAll(".bee_x_axis, .tick line").attr("visibility", "visible")
      horizontal_svg.selectAll('.my_circles')
        .data(vis.year_division)
        .join('circle')
        .transition().transition().delay(function (d, i) { return i * 2 })
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 10)
      if (this.selected_actor == "Russia") {
        drawContext(context_data, this.height)
      }
      else if (this.selected_actor == "China") {
        d3.selectAll(".un_p5").style("fill", "white")
      }

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
    if (direction == "down") {
      console.log(vis.chart_data);
      barchart_svg.selectAll("rect").remove()
      barchart_svg.selectAll(".bar_text").remove()
      barchart_svg.selectAll(".x_axis, .y_axis").style("opacity", 1)
      barchart_svg.append("g")
        .selectAll("g")
        .data(vis.chart_data)
        .join("g")
        .attr("transform", d => `translate(${vis.bar_x(d.group)}, 0)`)
        .selectAll("rect")
        .data(function (d) { return vis.subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
        .join("rect")
        .attr("rx", 2)
        .attr("fill", d => vis.bar_color(d.key))
        .attr("x", d => vis.xSubgroup(d.key))
        .attr("width", vis.xSubgroup.bandwidth())
        .attr("y", height)
        .attr("height", 0)
        .transition().duration(800)
        .attr("y", d => vis.bar_y(d.value))
        .attr("height", d => (height - 10) - vis.bar_y(d.value))

      barchart_svg.append("g")
        .selectAll("g")
        .data(vis.chart_data)
        .join("g")
        .attr("transform", d => `translate(${vis.bar_x(d.group)}, 0)`)
        .selectAll("text")
        .data(function (d) { return vis.subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
        .join("text")
        .attr("class", "bar_text")
        .text(function (d) {
          console.log(d);
          return Math.round(d.value) + "%"
        })
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("x", d => vis.xSubgroup(d.key) + (vis.xSubgroup.bandwidth() / 2))
        .attr("y", height)
        .transition().duration(800)
        .attr("y", d => vis.bar_y(d.value) - 5)

    }
    else if (direction == "up") {
      barchart_svg.selectAll(".x_axis, .y_axis").style("opacity", 0)

      barchart_svg.selectAll("rect, .bar_text")
        .transition().duration(800)
        .attr("y", height)
        .attr("height", 0)

      barchart_svg.selectAll(".bar_text")
        .transition().delay(900)
        .style("opacity", 0)
    }
  }

  step12(direction) {
    const vis = this;
    console.log("step12", direction);
  }

  step13(direction) {
    const vis = this;
    console.log("step13", direction);
  }

  step14(direction) {
    const vis = this;
    console.log("step14", direction);
    if (direction == "down") {
      barchart_svg.selectAll("rect, .bar_text")
        .transition().duration(500)
        .attr("y", height)
        .attr("height", 0)
      barchart_svg.selectAll(".bar_text")
        .transition().delay(500)
        .style("opacity", 0)
      barchart_svg.selectAll(".x_axis, .y_axis").style("opacity", 0)
    }
    else if (direction == "up") {
      barchart_svg.selectAll(".x_axis, .y_axis").style("opacity", 1)
      barchart_svg.selectAll("rect")
        .transition().duration(500)
        .attr("y", d => vis.bar_y(d.value))
        .attr("height", d => (height - 10) - vis.bar_y(d.value))
      barchart_svg.selectAll(".bar_text")
        .transition().duration(500)
        .attr("y", d => vis.bar_y(d.value) - 5)
      barchart_svg.selectAll(".bar_text")
        .transition().delay(500)
        .style("opacity", 1)
    }

  }

  goToStep(stepIndex, direction) {
    if (hovno === 1) {
      this[this.config.steps[stepIndex]](direction);
    }
  }
}