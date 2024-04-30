//scroll to top when page refreshed
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
}
//get current width and height of the screen
const width100 = window.innerWidth - 15,
  height100 = window.innerHeight,
  width80 = width100 * 0.80,
  width20 = width100 * 0.20,
  width70 = width80 - 140;
// width50 = width100 * 0.5;
//margins for visualization
const margin = { top: 45, right: 10, bottom: 0, left: 10 },
  height = height100 - margin.top - margin.bottom,
  width = width100 - margin.top - margin.bottom;

//adjusting width and height for current screen
d3.selectAll("#story")
  .style("width", width100 + "px")
d3.selectAll(".graphic__vis, .graphic__vis__1, #visualization, #visualization1")
  .style("width", width100 + "px")
  .style("height", height100 + "px")
d3.selectAll(".graphic__vis__05, .graphic__vis__075")
  .style("left", 140 + "px")
  .style("width", width70 + "px")
  .style("height", height100 + "px")
d3.selectAll(".graphic__prose, .graphic__prose__05, .graphic__prose__075, .graphic__prose__1")
  .style("width", width100 + "px")
// .style("left", width80 + "px")
d3.selectAll("#separator, #separator05")
  .style("width", width100 + "px")
  .style("height", height100 + "px")
d3.selectAll("#separator1")
  .style("width", width100 - 130 + "px")
  .style("height", height100 + "px")
d3.selectAll("#map")
  .style("width", width100 + 50 + "px")
  .style("height", height100 + "px")
// d3.selectAll(".trigger").style("padding-top", height100 / 2 + "px")
d3.selectAll("#mage")
  .style("width", width100 / 5 + "px")
d3.selectAll("p").style("width", width100 / 2 + "px")

//BEESWARM VISUALIZATION
//scaling vertical axis
let y_vertical = d3.scaleTime()
  .range([10, height - 10])
//scaling horizontal axis
let horizontal_svg = d3.select("#visualization")
  .attr("class", "horizontal_bee")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(10,${margin.top})`);
let x_horizontal = d3.scaleTime()
  .range([0, width])
//contex line g
let line = horizontal_svg.append("g")

//LINECHART VISUALIZATION
let line_svg = d3.select("#visualization075")
  .attr("width", width100 - 140)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(20,${margin.top})`);


//DONUTCHART VISUALIZATION
let piechart_svg = d3.select("#visualization05")
  .attr("width", width100 - 140)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${width100 / 2 - 140},${height / 2 + 35})`);
// The arc generator
const radius = Math.min(width100, height) / 2 - 50
const arc = d3.arc()
  .innerRadius(radius * 0.5)         // This is the size of the donut hole
  .outerRadius(radius * 0.8)
  .cornerRadius(8)
// Another arc that won't be drawn. Just for labels positioning
const outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)
// set the color scale
const color = d3.scaleOrdinal()
  .domain(["Intrastate", "Interstate", "Mixed"])
  // .range(d3.schemeDark2);
  .range(["#4f4e4e", "#b2acab", "#726b68"]);


//MAPBOX VISUALIZATION
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FzaGFnYXJpYmFsZHkiLCJhIjoiY2xyajRlczBlMDhqMTJpcXF3dHJhdTVsNyJ9.P_6mX_qbcbxLDS1o_SxpFg';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/sashagaribaldy/cls4l3gpq003k01r0fc2s04tv',
  center: [60.137343, 40.137451],
  zoom: 2,
  attributionControl: false
});
//load initial map
map.on('load', () => {
  // Add a data source containing GeoJSON data.
  map.addSource('states', {
    'type': 'geojson',
    'data': geo_data,
    'generateId': true //This ensures that all features have unique IDs
  });

  map.addLayer({
    'id': 'state-fills',
    'type': 'fill',
    'source': 'states',
    'layout': {},
    'paint': {
      'fill-color': ['match', ['get', 'ADMIN'],
        "Russia", '#dd1e36',
        '#7B8AD6',
        // 'white',
      ],
      'fill-opacity': 0.8
    }
  });

  map.addLayer({
    'id': 'outline',
    'type': 'line',
    'source': 'states',
    'layout': {},
    'paint': {
      'line-color': '#172436',
      'line-width': 0.5
    }
  });
});

Promise.all([
  d3.json("data/russia.json"),
  d3.csv("data/all_update.csv"),
  d3.csv("data/loc_correction.csv"),
  d3.csv("data/agts_with_rus_uk_un_china.csv"),
]).then(function (files) {
  //change date format to GMT
  let parser = d3.timeParse("%d/%m/%Y");
  //change id's to numbers
  files[3].forEach(function (d) {
    d.AgtId = +d.AgtId 
    d.dat = d.date
    d.date = parser(d.date)
  })
  //divide into the three actors
  let three_group = d3.groups(files[3], (d) => d.global_actor),
  russia = three_group[0][1],
  united_kingdom = three_group[1][1],
  united_nations = three_group[2][1],
  china = three_group[3][1];

  // //change agtid to number
  // files[1].forEach(function (d) {
  //   d.AgtId = Number(d.AgtId.substring(0, d.AgtId.length - 2));
  // })
  // //parse all dates
  // files[1].forEach(function (d) {
  //   d.dat = d.date
  //   d.date = parser(d.date)
  // })
  // //divide into the three actors
  // let the_three_group = d3.groups(files[1], (d) => d.global_actor);
  // let un = the_three_group[0][1],
  //   uk = the_three_group[1][1],
  //   ru = the_three_group[2][1];
  //   console.log(ru);

  d3.select('#dropdown_country').on("change", function () {
    let selected = d3.select(this).property('value')
    console.log(selected);
    if (selected == "Russia") {
      prepare_data(russia, "Russia")
    }
    else if (selected == "United Kingdom") {
      prepare_data(united_kingdom, "United Kingdom")
    }
    else if (selected == "United Nations") {
      prepare_data(united_nations, "United Nations")
    }
    else if (selected == "China") {
      prepare_data(china, "United Nations")
    }
  })

  let scrollerVis;
  const prepare_data = function (data, selected_actor) {
    //group by agreements
    let agt_group = d3.groups(data, d => d.AgtId)
    console.log(agt_group);
    //group by agreement type
    let agt_type_group = d3.groups(agt_group, d => d[1][0].agt_type)

    //group by dates
    let year_division = d3.groups(data, d => d.AgtId, d => d.date)
    //sorting years chronologically
    year_division.sort(function (x, y) {
      return d3.ascending(x[1][0][0], y[1][0][0]);
    })

    function find_id(curr_id) {
      let country = files[2].find(function (x) {
        return x.AgtId == curr_id
      })
      return country.country_entity
    }

    let the_array = [];
    data.forEach(function (d) {
      let curr_id = d.AgtId;
      let country = find_id(curr_id)
      d.where_agt = country
      if (the_array.includes(country) == false) {
        the_array.push(country)
      };
    })

    //overview data
    const most = d3.groups(data, d => d.date.getUTCFullYear(), d => d.AgtId),
      maxObject = d3.max(most, (d) => d[1].length),
      maxIndex = most.findIndex((d) => d[1].length === maxObject),
      most_agt = most[maxIndex],
      minObject = d3.min(most, (d) => d[1].length),
      minIndex = most.findIndex((d) => d[1].length === minObject),
      least_agt = most[minIndex];

    //linechart data
    let year_parser = d3.timeParse("%Y");
    linechart_data = most.sort(function (x, y) {
      return d3.ascending(x[0], y[0]);
    })
    linechart_data.forEach(function (d) {
      d[0] = year_parser(d[0])

    })

    //latest agreement
    const last_agt = year_division[year_division.length - 1]
    const found = last_agt[1].find(function (num) {
      return num[1][0].actor_name == selected_actor;
    });

    //populating the text
    let actor = data[0].global_actor;
    d3.select("#title_header").text(actor + " as a Peace Agreement Signatory")
    let num_pp = d3.groups(data, (d) => d.PPName).length
    d3.select("#num_pp").text(num_pp)
    let num_agt = d3.groups(data, (d) => d.Agt).length
    d3.select("#num_agt").text(num_agt)
    let num_act = d3.groups(data, (d) => d.actor_name).length
    d3.select("#num_act").text(num_act)
    let yr_period = d3.extent(year_division, function (d) { return d[1][0][0]; })
    d3.select("#yr_active").text(yr_period[0].getUTCFullYear() + " - " + yr_period[1].getUTCFullYear())

    d3.select(".p1").html(`Russia is the second most prolific international third-party
      signatory of peace agreements between 1990-2022. It follows the United Nations, and
      comes ahead of the United States, the African Union, and the European Union.`)

    d3.select(".p2").html(`Russia has most often acted as a third-party signatory
      in the 1990s. Majority of these agreements relate to the dissolution
      of the Soviet Union. Many of these are protracted conflicts, where
      Russia continues acting as a third - party signatory of peace agreements.`)


    d3.select(".p3").html(`Over the last decade, Russia increasingly acts
    as a signatory on agreements related to conflicts in Syria and, reflecting
    its increased engagements in Africa: Libya, and the Central African Republic.
    These are internationalised conflicts, where Russia is also militarily
    engaged in supporting conflict parties.`)

    //   d3.select(".one").html(actor + ` is a signatory in the PA - X Agreements database
    // as it has been a signatory to ` + num_agt + ` agreements across ` + num_pp +
    //     ` peace processes since ` + yr_period[0].getUTCFullYear() + `. The most recent
    //  signed agreement was as ` + found[1][0].signatory_type + ` on ` + ` <a href=` +
    //     found[1][0].PAX_Hyperlink + ` target="_blank">` + found[1][0].dat + `</a> in ` +
    //     found[1][0].PPName)
    //   d3.select(".two").text(`The year when ` + actor + ` signed the most agreements 
    // was ` + most_agt[0] + `, namely ` + most_agt[1].length + `. In contrast, the 
    // year when they signes the least amount of agreements was ` + least_agt[0] + `.
    //  They only signed one agreement.`)

    scrollerVis = new ScrollerVis({ storyElement: '#story', mapElement: 'map' }, data,
      year_division, the_array, agt_type_group, linechart_data);
  }

  prepare_data(russia, "Russia")

  // let scrollerVis = new ScrollerVis({ storyElement: '#story', mapElement: 'map' }, data_for_scroll, year_division, the_array);
  // helper function to map over dom selection
  function selectionToArray(selection) {
    var len = selection.length
    var result = []
    for (var i = 0; i < len; i++) {
      result.push(selection[i])
    }
    return result
  }

  // select elements
  let graphicEl = document.querySelector('.graphic'),
    graphicEl05 = document.querySelector('.graphic05'),
    graphicEl075 = document.querySelector('.graphic075'),
    graphicEl1 = document.querySelector('.graphic1'),
    graphicVisEl = graphicEl.querySelector('.graphic__vis'),
    graphicVisEl05 = graphicEl05.querySelector('.graphic__vis__05'),
    graphicVisEl075 = graphicEl075.querySelector('.graphic__vis__075'),
    graphicVisEl1 = graphicEl1.querySelector('.graphic__vis__1'),
    triggerEls = selectionToArray(graphicEl.querySelectorAll('.trigger')),
    triggerEls05 = selectionToArray(graphicEl05.querySelectorAll('.trigger')),
    triggerEls075 = selectionToArray(graphicEl075.querySelectorAll('.trigger')),
    triggerEls1 = selectionToArray(graphicEl1.querySelectorAll('.trigger'));

  // handle the fixed/static position of grahpic
  let toggle = function (fixed, bottom) {
    if (fixed) graphicVisEl.classList.add('is-fixed')
    else graphicVisEl.classList.remove('is-fixed')

    if (bottom) graphicVisEl.classList.add('is-bottom')
    else graphicVisEl.classList.remove('is-bottom')
  }

  // handle the fixed/static position of grahpic
  let toggle05 = function (fixed, bottom) {
    if (fixed) graphicVisEl05.classList.add('is-fixed')
    else graphicVisEl05.classList.remove('is-fixed')

    if (bottom) graphicVisEl05.classList.add('is-bottom')
    else graphicVisEl05.classList.remove('is-bottom')
  }

  // handle the fixed/static position of grahpic
  let toggle075 = function (fixed, bottom) {
    if (fixed) graphicVisEl075.classList.add('is-fixed')
    else graphicVisEl075.classList.remove('is-fixed')

    if (bottom) graphicVisEl075.classList.add('is-bottom')
    else graphicVisEl075.classList.remove('is-bottom')
  }

  // handle the fixed/static position of grahpic
  let toggle1 = function (fixed, bottom) {
    if (fixed) graphicVisEl1.classList.add('is-fixed')
    else graphicVisEl1.classList.remove('is-fixed')

    if (bottom) graphicVisEl1.classList.add('is-bottom')
    else graphicVisEl1.classList.remove('is-bottom')
  }

  // setup a waypoint trigger for each trigger element
  let waypoints = triggerEls.map(function (el) {
    // get the step, cast as number					
    let step = +el.getAttribute('data-step')

    return new Waypoint({
      element: el, // our trigger element
      handler: function (direction) {
        // if the direction is down then we use that number,
        // else, we want to trigger the previous one
        var nextStep = direction === 'down' ? step : Math.max(0, step)
        console.log(nextStep);
        scrollerVis.goToStep(nextStep, direction);

        // tell our graphic to update with a specific step
        // graphic.update(nextStep)
      },
      offset: '10%',  // trigger halfway up the viewport
    })
  })

  // setup a waypoint trigger for each trigger element
  let waypoints05 = triggerEls05.map(function (el) {
    // get the step, cast as number					
    let step = +el.getAttribute('data-step')

    return new Waypoint({
      element: el, // our trigger element
      handler: function (direction) {
        // if the direction is down then we use that number,
        // else, we want to trigger the previous one
        var nextStep = direction === 'down' ? step : Math.max(0, step)
        console.log(nextStep);
        scrollerVis.goToStep(nextStep, direction);

        // tell our graphic to update with a specific step
        // graphic.update(nextStep)
      },
      offset: '10%',  // trigger halfway up the viewport
    })
  })

  // setup a waypoint trigger for each trigger element
  let waypoints075 = triggerEls075.map(function (el) {
    // get the step, cast as number					
    let step = +el.getAttribute('data-step')

    return new Waypoint({
      element: el, // our trigger element
      handler: function (direction) {
        // if the direction is down then we use that number,
        // else, we want to trigger the previous one
        var nextStep = direction === 'down' ? step : Math.max(0, step)
        console.log(nextStep);
        scrollerVis.goToStep(nextStep, direction);

        // tell our graphic to update with a specific step
        // graphic.update(nextStep)
      },
      offset: '10%',  // trigger halfway up the viewport
    })
  })

  // setup a waypoint trigger for each trigger element
  let waypoints1 = triggerEls1.map(function (el) {
    // get the step, cast as number					
    let step = +el.getAttribute('data-step')

    return new Waypoint({
      element: el, // our trigger element
      handler: function (direction) {
        // if the direction is down then we use that number,
        // else, we want to trigger the previous one
        var nextStep = direction === 'down' ? step : Math.max(0, step)
        console.log(nextStep);
        // scrollerVis.goToStep(nextStep, direction);

        // tell our graphic to update with a specific step
        // graphic.update(nextStep)
      },
      offset: '10%',  // trigger halfway up the viewport
    })
  })

  // enter (top) / exit (bottom) graphic (toggle fixed position)
  const enterWaypoint = new Waypoint({
    element: graphicEl,
    handler: function (direction) {
      let fixed = direction === 'down'
      let bottom = false
      toggle(fixed, bottom)
    },
  })

  // const exitWaypoint = new Waypoint({
  //   element: graphicEl,
  //   handler: function (direction) {
  //     let fixed = direction === 'up'
  //     let bottom = !fixed
  //     toggle(fixed, bottom)
  //   },
  //   offset: 'bottom-in-view',
  // })

  // enter (top) / exit (bottom) graphic (toggle fixed position)
  const enterWaypoint05 = new Waypoint({
    element: graphicEl05,
    handler: function (direction) {
      let fixed = direction === 'down'
      let bottom = false
      toggle05(fixed, bottom)
    },
  })

  const exitWaypoint05 = new Waypoint({
    element: graphicEl05,
    handler: function (direction) {
      let fixed = direction === 'up'
      let bottom = !fixed
      toggle05(fixed, bottom)
    },
    offset: 'bottom-in-view',
  })

  // enter (top) / exit (bottom) graphic (toggle fixed position)
  const enterWaypoint075 = new Waypoint({
    element: graphicEl075,
    handler: function (direction) {
      let fixed = direction === 'down'
      let bottom = false
      toggle075(fixed, bottom)
    },
  })

  const exitWaypoint075 = new Waypoint({
    element: graphicEl075,
    handler: function (direction) {
      let fixed = direction === 'up'
      let bottom = !fixed
      toggle075(fixed, bottom)
    },
    offset: 'bottom-in-view',
  })

  // enter (top) / exit (bottom) graphic (toggle fixed position)
  const enterWaypoint1 = new Waypoint({
    element: graphicEl1,
    handler: function (direction) {
      let fixed = direction === 'down'
      let bottom = false
      toggle1(fixed, bottom)
    },
  })

  const exitWaypoint1 = new Waypoint({
    element: graphicEl1,
    handler: function (direction) {
      let fixed = direction === 'up'
      let bottom = !fixed
      toggle1(fixed, bottom)
    },
    offset: 'bottom-in-view',
  })

  // const waypoints =
  //   d3.selectAll('.step')
  //     .each(function (d, stepIndex) {
  //       const thethingy = 4 - stepIndex;
  //       return new Waypoint({
  //         element: this,
  //         handler: function (direction) {
  //           const nextStep = thethingy
  //           scrollerVis.goToStep(nextStep, direction);
  //         },
  //         offset: '50%',
  //       });
  //     });
})
  .catch(error => console.error(error));
