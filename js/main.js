//scroll to top when page refreshed
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
}

// Get the button
let mybutton = document.getElementById("myBtn");

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}



//get current width and height of the screen
const width100 = window.innerWidth - 10, // minus scroll width 10 px
  height100 = window.innerHeight,
  width80 = width100 * 0.80,
  width20 = width100 * 0.20;
// width50 = width100 * 0.5;
//margins for visualization
const margin = { top: 50, right: 10, bottom: 20, left: 10 },
  height = height100 - margin.top - margin.bottom,
  width = width80 - margin.top - margin.bottom;

//adjusting width and height for current screen
d3.selectAll("#story")
  .style("width", width100 + "px")
d3.selectAll(`.graphic__vis, .graphic__vis__1,
 .graphic__vis__05, .graphic__vis__06, .graphic__vis__075`)
  .style("width", width80 + "px")
  .style("height", height100 + "px")
  .style("left", width20 + "px")
d3.selectAll(`#visualization, #visualization05,
 #visualization06,#visualization075, #visualization1`)
  .style("width", width80 + "px")
  .style("height", height100 + "px")
d3.selectAll(`.graphic__prose, .graphic__prose__05,
 .graphic__prose__06, .graphic__prose__075, .graphic__prose__1`)
  .style("width", width20 + "px")
  .style("left", 0 + "px")
d3.selectAll("#separator, #separator05, #separator1")
  .style("width", width100 + "px")
  .style("height", height100 + "px")
d3.selectAll("#separator05, #separator1")
  .style("width", width100 + "px")
  .style("height", height100 - 200 + "px")
d3.select("#map")
  .style("width", width80 + "px")
  .style("height", height100 + "px")
  .style("left", 0 + "px")
d3.selectAll(".trigger")
  .style("padding-top", height100 / 3 + "px")
  .style("height", height100 - 100 + "px")
d3.selectAll(".four, .seventeen")
  .style("height", 400 + "px")
d3.selectAll(".nine")
  .style("height", 100 + "px")

//BEESWARM VISUALIZATION
let horizontal_svg = d3.select("#visualization")
  .attr("class", "horizontal_bee")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(20,${margin.top})`);
let x_horizontal = d3.scaleTime()
  .range([0, width])
let y_vertical = d3.scaleTime()
  .range([10, height])
let line = horizontal_svg.append("g") //contex line


//MULTILINE VISUALIZATION
let multiline_svg = d3.select("#visualization075")
  .attr("width", width + 30)
  .attr("height", height)
  // .attr("viewBox", [0, 0, width, height])
  .append("g")
  .attr("transform", `translate(20,${margin.top})`);


//DONUTCHART VISUALIZATION
let piechart_svg = d3.select("#visualization05")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${width / 2},${height / 2 + 35})`);
// The arc generator
const radius = Math.min(width, height) / 2 - 50
const arc = d3.arc()
  .innerRadius(radius * 0.5)
  .outerRadius(radius * 0.80)
  .cornerRadius(4)
// Another arc that won't be drawn. Just for labels positioning
const outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)
// set the color scale
const color = d3.scaleOrdinal()
  .domain(["Pre-negotiation", "Ceasefire", "Implementation", "Framework-substantive, partial", "Framework-substantive, comprehensive", "Renewal", "Other"])
  // .range(d3.schemeDark2);
  .range(["rgb(255, 221, 123)", "rgb(255, 87, 51)", "rgb(255, 64, 129)", "rgb(61, 105, 62)", "white", "gray", "rgb(29, 0, 255)"]);


//BARCHART VISUALIZATION
let barchart_svg = d3.select("#visualization06")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(30,${margin.top})`);

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
    // 'paint': {
    //   'fill-color': ['match', ['get', 'ADMIN'],
    //     "Russia", 'white',
    //     '#7B8AD6',
    //     // 'white',
    //   ],
    //   'fill-opacity': 0.8
    // }
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

//change date format to GMT
let parser = d3.timeParse("%Y-%m-%d");

Promise.all([
  d3.json("data/russia.json"),
  d3.csv("data/all_update.csv"),
  d3.csv("data/loc_correction.csv"),
  // d3.csv("data/agts_with_rus_uk_un_china.csv"),
  d3.csv("data/v8_all_agts_with_uk_rus_un_china.csv"),
  // d3.csv("data/v7_paax_all_with_third.csv"),
  d3.csv("data/paax_practical_third_labelled_signatories.csv"),
]).then(function (files) {
  //new multiline data
  let just_year_parser = d3.timeParse("%Y");
  const all_year_agt = d3.groups(files[4], d => +d.year, d => d.AgtId);
  all_year_agt.sort(function (x, y) {
    return d3.ascending(x[0], y[0]);
  })
  let all_sorted = []
  all_year_agt.forEach(function (d) {
    all_sorted.push({
      date: just_year_parser(d[0]),
      value: d[1].length
    })
  })
  const act_group = d3.groups(files[3], d => d.global_actor, d => +d.year, d => d.AgtId);
  act_group.forEach(function (d) {
    d[1].sort(function (x, y) {
      return d3.ascending(x[0], y[0]);
    })
  })

  //prepare dates and ids for timeline
  files[3].forEach(function (d) {
    d.AgtId = +d.AgtId
    d.dat = d.date
    d.date = parser(d.date)
  })

  //four actors division
  let four_group = d3.groups(files[3], (d) => d.global_actor),
    russia = four_group[0][1],
    united_kingdom = four_group[1][1],
    china = four_group[2][1],
    united_nations = four_group[3][1];

    console.log(four_group);

  //data for multiline chart
  const multiline_data = d3.groups(files[3], d => d.global_actor, d => +d.year, d => d.AgtId);
  multiline_data.forEach(function (d) {
    d[1].sort(function (x, y) {
      return d3.ascending(x[0], y[0]);
    })
  })

  //data for bar and line charts
  files[4].forEach(function (d) {
    d.AgtId = +d.AgtId
    d.dat = d.date
    d.date = parser(d.date)
  })
  // const all_year_agt = d3.groups(files[4], d => +d.year, d => d.AgtId);
  const all_stage_agt = d3.groups(files[4], d => d.stage_label, d => d.AgtId);
  const ru_stage_agt = d3.groups(russia, d => d.stage_label, d => d.AgtId);
  const un_stage_agt = d3.groups(united_nations, d => d.stage_label, d => d.AgtId);
  const uk_stage_agt = d3.groups(united_kingdom, d => d.stage_label, d => d.AgtId);
  const ch_stage_agt = d3.groups(china, d => d.stage_label, d => d.AgtId);
  //generate objects with percentages
  const object_calc = function (data) {
    let totalagts = 0;
    data.forEach(function (d) {
      totalagts += d[1].length
    })
    let all_percent_object = [];
    data.forEach(function (d) {
      all_percent_object.push({
        stage: d[0],
        percentage: (d[1].length / totalagts) * 100
      })
    })
    return all_percent_object
  }
  //ready data
  let all_percent_bar = object_calc(all_stage_agt)
  let ru_percent_bar = object_calc(ru_stage_agt)
  let uk_percent_bar = object_calc(uk_stage_agt)
  let un_percent_bar = object_calc(un_stage_agt)
  let ch_percent_bar = object_calc(ch_stage_agt)

  //dropdown functions for different actors
  d3.select("#russia").on("click", function () {
    d3.select("#separator").style("background-image", "url(img/ru.PNG)")
    prepare_data(russia, ru_percent_bar, "Russia")
  })
  d3.select("#kingdom").on("click", function () {
    d3.select("#separator").style("background-image", "url(img/uk.PNG)")
    prepare_data(united_kingdom, uk_percent_bar, "United Kingdom")
  })
  d3.select("#nations").on("click", function () {
    d3.select("#separator").style("background-image", "url(img/un.png)")
    prepare_data(united_nations, un_percent_bar, "United Nations")
  })
  d3.select("#china").on("click", function () {
    d3.select("#separator").style("background-image", "url(img/ch.PNG)")
    prepare_data(china, ch_percent_bar, "China")
  })

  let scrollerVis;
  const prepare_data = function (data, chart_data, selected_actor) {
    let agt_group = d3.groups(data, d => d.AgtId)
    let actorIndex = act_group.findIndex(entry => entry[0] === selected_actor);
    // Remove the array containing "Russia"
    let actorArray = act_group.splice(actorIndex, 1)[0];
    // Push the removed array to the end of the array of arrays
    act_group.push(actorArray);

    let unemployment = []
    act_group.forEach(function (d) {
      d[1].forEach(function (m) {
        unemployment.push({
          division: d[0],
          date: just_year_parser(m[0]),
          unemployment: m[1].length
        })
      })
    })

    //prepare barchart data
    const comb_chart = all_percent_bar.map((obj1) => {
      const obj2 = chart_data.find((obj2) => obj2.stage === obj1.stage);
      return { ...obj1, chart_data: obj2 ? obj2.percentage : 0 };
    });
    // Renamed attribute names
    const fin_comb_chart = comb_chart.map(obj => ({
      group: obj.stage,
      All: obj.percentage,
      [selected_actor]: obj.chart_data
    }));


    //group by agreement stage for DONUT
    let agt_stage_group = d3.groups(data, d => d.stage_label, d => d.AgtId)
    //group by dates
    let year_division = d3.groups(data, d => d.AgtId, d => d.date)
    //sorting years chronologically
    year_division.sort(function (x, y) {
      return d3.ascending(x[1][0][0], y[1][0][0]);
    })

    function find_id(curr_id) {
      // let id_countries = d3.groups(files[2], d => d.AgtId == curr_id)
      const result = files[2].filter((d) => d.AgtId == curr_id);
      console.log(curr_id, result);
      let country = files[2].find(function (x) {
        return x.AgtId == curr_id
      })
      return country.country_entity
    }

    let the_array = [];
    agt_group.forEach(function (d) {
      d[1].forEach(function (x) {
        let check_actor = x.AgtId;
        let country = files[2].filter(function (x) {
          return x.AgtId == check_actor
        })
        country.forEach(function (x) {
          if (the_array.includes(x.country_entity) == false) {
            the_array.push(x.country_entity)
          };
        })
      })
    })
    console.log(the_array);

    //overview data
    const most = d3.groups(data, d => d.date.getUTCFullYear(), d => d.AgtId),
      maxObject = d3.max(most, (d) => d[1].length),
      maxIndex = most.findIndex((d) => d[1].length === maxObject),
      most_agt = most[maxIndex],
      minObject = d3.min(most, (d) => d[1].length),
      minIndex = most.findIndex((d) => d[1].length === minObject),
      least_agt = most[minIndex];

    //latest agreement
    const last_agt = year_division[year_division.length - 1]
    const found = last_agt[1].find(function (num) {
      return num[1][0].actor_name == selected_actor;
    });

    //populating the text
    let actor = data[0].global_actor;
    d3.select("#title_header").text(actor + " as a Third-Party in Peace Agreements")
    let num_pp = d3.groups(data, (d) => d.PPName).length
    d3.select("#num_pp").text(num_pp)
    let num_agt = d3.groups(data, (d) => d.agt_dat).length
    console.log(data, num_agt);
    d3.select("#num_agt").text(num_agt)
    let num_act = d3.groups(data, (d) => d.actor_name).length
    d3.select("#num_act").text(num_act)
    let yr_period = d3.extent(year_division, function (d) { return d[1][0][0]; })
    d3.select("#yr_active").text(yr_period[0].getUTCFullYear() + " - " + yr_period[1].getUTCFullYear())

    if (selected_actor == "Russia") {
      d3.select(".council_separator").text("Russia and other UN Security Council Permanent Members")
      d3.select(".p1").html(`Russia is the second most prolific international third-party
      signatory of peace agreements between 1990-2022. It follows the United Nations, and
      comes ahead of the United States, the African Union, and the European Union.</br></br>
      <span class="dot"></span><p id="leg_p">Individual peace agreements signed by Russia 
      (hover over for more detail)</p>`)
      d3.select(".p2").html(`Russia has most often acted as a third-party signatory
      in the 1990s. Majority of these agreements relate to the dissolution
      of the Soviet Union. Many of these are protracted conflicts, where
      Russia continues acting as a third - party signatory of peace agreements.</br></br>
      <span class="dot1"></span><p id="leg_p">Peace agreements addressing conflicts in the 
      former Soviet Union territories.</p>`)
      d3.select(".p3").html(`Over the last decade, Russia increasingly acts
      as a signatory on agreements related to conflicts in Syria and, reflecting
      its increased engagements in Africa: Libya, and the Central African Republic.
      These are internationalised conflicts, where Russia is also militarily
      engaged in supporting conflict parties.</br></br>
      <span class="dot1"></span><p id="leg_p">Peace agreements addressing conflicts
      in Syria, Libya, and the Central African Republic.`)

      d3.select(".p4").html(`Russia is the most prolific signatory of
      peace agreements of all UN Security Council Permanent Members.</br></br> In a number of years 
      (1995, 2016-2018) it has signed more agreements than the United Nations.
      </br></br><span class="rec"></span><p id="leg_p">Overall agreements.</p>
      <span class="rec1"></span><p id="leg_p">Russian agreements</br> (hover over lines for other actors).</p>`)

      d3.select(".p6").html(`Russia primarily signs pre-negotiation and
      ceasefire agreements. These represent over half of
      all agreements signed. For more details on the categories see
      <a href="https://www.peaceagreements.org/files/Definitions_v7.pdf" target="_blank">here</a>.`)

      d3.select(".p8").html(`Compared with all agreements, Russia signs more pre-negotiation agreements 
      and less comprehensive and implementation agreements.</br></br><span class="dot2"></span><p id="leg_p">Overall agreements (% of all).</p>
      <span class="dot3"></span><p id="leg_p">Russian signature (% of all signed by Russia).</p>`)
      d3.select(".p9").html(`Pre-negotiation agreements represent 30% of all agreements with 
      third-party signatories, but 35% of all agreements signed by Russia.</br></br><span class="dot2">
      </span><p id="leg_p">Overall agreements (% of all).</p>
      <span class="dot3"></span><p id="leg_p">Russian signature (% of all signed by Russia).</p>`)
      d3.select(".p10").html(`Comprehensive agreements represent 6% of all agreements signed,
       but only 4% of all agreements signed by Russia.</br></br> Implementation agreements 
       represent 20% of all agreements signed, but only 17% of all agreements 
       signed by Russia. </br></br><span class="dot2">
      </span><p id="leg_p">Overall agreements (% of all).</p>
      <span class="dot3"></span><p id="leg_p">Russian signature (% of all signed by Russia).</p>`)


      d3.select(".p12").html(`The geographic spread of Russian engagement as a 
      third-party signatory of peace agreements reflects its permanent seat on 
      the United Nations Security Council and its role as a regional power.</br></br> Like 
      other members of the Permanent Five, Russia participates in large international 
      conferences and in UN Security Council resolutions that function as peace agreements. 
      This gives it a global reach. `)
      d3.select(".p13").html(`But most of its focus – and where its activity has 
      been over the last decade – relates to conflicts in its neighbourhood and a 
      number of select locales, where Russia is acting both as a military partner 
      and a peacemaker.`)

      d3.select("#research_header").text(`Read our research on Russia and its approaches to conflict, peace processes and mediation:`)

      d3.select("#vik1").html(`<a href="https://peacerep.org/publication/third-parties-peace-agreements-data-trends/" target="_blank"><img
            id="publications" src="img/m1.png" /></a>`)
      d3.select("#vik2").html(`<a href="https://peacerep.org/publication/non-western-approaches-to-peacemaking-and-peacebuilding-state-of-the-art-and-an-agenda-for-research/"
          target="_blank"><img id="publications" src="img/m2.png" /></a>`)
      d3.select("#vik3").html(`<a href="https://www.taylorfrancis.com/chapters/edit/10.4324/9781003372011-6/competition-norms-kasia-houghton?context=ubx&refId=214196cc-d7dc-4753-b173-9aa154a0d415"
          target="_blank"><img id="publications" src="img/m3.png" /></a>`)
      d3.select("#vik4").html(`<a href="https://peacerep.org/publication/russias-engagement-mariani-2022/" target="_blank"><img
            id="publications" src="img/m4.png" /></a>`)
      d3.select("#vik5").html(`<a href="https://peacerep.org/publication/russia-and-china-in-liberal-peacebuilding/" target="_blank"><img
            id="publications" src="img/m5.png" /></a>`)


      
    }
    else if (selected_actor == "China") {
      d3.select(".council_separator").text("China and other UN Security Council Permanent Members")
      d3.select(".p1").html(`China is not the most prolific third-party signatory of
      peace agreements since 1990, ranking 15th of all actors, who have acted as 
      third-party signatories. In terms of frequency, this puts it alongside actors 
      such as Egypt, Kenya, and Nigeria.</br></br><span class="dot"></span><p id="leg_p">
      Individual peace agreements signed by China (hover over for more detail)</p>`)
      d3.select(".p2").html(`As one of the UN Security Council (UNSC) permanent members, 
      China has participated in all major international conferences (e.g., for Cambodia, 
      Bosnia and Herzegovina, Afghanistan, Libya), with the key exception of negotiations 
      relating to Israel and Palestine. Nearly all agreements signed by China as a third-party have 
      been the result of large international conferences or UNSC resolutions.</br></br><span class="dot1"></span><p id="leg_p">Peace agreements 
      resulting from large international conferences or UNSC resolutions.</p>`)
      d3.select(".p3").html(`Most agreements China has signed include the UN or other 
      permanent members of the UN Security Council. </br></br>
      <span class="dot1"></span><p id="leg_p">Peace agreements signed by China and 
      the UN or all other permanent members of the UNSC.`)

      d3.select(".p4").html(`China is the least prolific third-party signatory of 
      peace agreements of all UN Security Council permanent members. China signed 38 
      agreements as a third-party since 1990, in comparison to Russian 134 signatures 
      and the US 127 signatures.</br></br><span class="rec"></span><p id="leg_p">Overall agreements.</p>
      <span class="rec1"></span><p id="leg_p">Chinese agreements.</p>`)

      d3.select(".p6").html(`Chinese involvement as a third-party signatory seems to 
      come at the point when there is a broad international consensus regarding a 
      peace process.</br></br> Implementation agreements are the biggest category and 
      represent 31% of all agreements signed by China.</br></br> For more details on the categories see
      <a href="https://www.peaceagreements.org/files/Definitions_v7.pdf" target="_blank">here</a>.`)

      d3.select(".p8").html(`Compared with all agreements, China signs more comprehensive and 
      implementation agreements, and less ceasefires and partial ones. .</br></br><span class="dot2"></span><p id="leg_p">Overall agreements (% of all).</p>
      <span class="dot3"></span><p id="leg_p">Chinese signature (% of all signed by China).</p>`)
      d3.select(".p9").html(`Comprehensive agreements 
      present only 6% of all agreements signed by third-parties, but amount to 11% of all agreements 
      signed by China.</br></br> Similarly, 32% of all agreements signed by China are implementation agreements, 
      but the overall proportion of such agreements is 20%.</br></br><span class="dot2">
      </span><p id="leg_p">Overall agreements (% of all).</p>
      <span class="dot3"></span><p id="leg_p">Chinese signature (% of all signed by China).</p>`)
      d3.select(".p10").html(`In contrast, only 8% of all agreements signed by China are ceasefires, 
      with the overall proportion of such agreements at 18%.</br></br><span class="dot2">
      </span><p id="leg_p">Overall agreements (% of all).</p>
      <span class="dot3"></span><p id="leg_p">Chinese signature (% of all signed by China).</p>`)

      d3.select(".p12").html(`The geographic spread of Chinese engagement as a third-party 
      signatory of peace agreements reflects its permanent seat on the United 
      Nations Security Council.`)
      d3.select(".p13").html(`China has been involved in peace agreements in Asia, Europe, 
      the Middle East and Africa, all geographic areas where the UNSC has been highly active.`)

      d3.select("#research_header").text(`Read our research on China and its approaches to conflict, peace processes and mediation:`)

      d3.select("#vik1").html(`<a href="https://peacerep.org/publication/third-parties-peace-agreements-data-trends/" target="_blank"><img
            id="publications" src="img/c1.PNG" /></a>`)
      d3.select("#vik2").html(`<a href="https://peacerep.org/publication/chinas-stance-on-the-war-in-ukraine/"
          target="_blank"><img id="publications" src="img/c2.PNG" /></a>`)
      d3.select("#vik3").html(`<a href="https://peacerep.org/publication/domestic-actors-china-international-conflict-management/"
          target="_blank"><img id="publications" src="img/c3.PNG" /></a>`)
      d3.select("#vik4").html(`<a href="https://peacerep.org/publication/global-china-and-the-quest-for-peace-in-bosnia-and-herzegovina/" target="_blank"><img
            id="publications" src="img/c4.PNG" /></a>`)
      d3.select("#vik5").html(`<a href="https://peacerep.org/publication/russia-and-china-in-liberal-peacebuilding/" target="_blank"><img
            id="publications" src="img/c5.PNG" /></a>`)

    }

    scrollerVis = new ScrollerVis({ storyElement: '#story', mapElement: 'map' }, data,
      year_division, the_array, agt_stage_group, multiline_data, fin_comb_chart,
      unemployment, all_sorted, selected_actor);
  }

  prepare_data(russia, ru_percent_bar, "Russia")

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
    graphicEl06 = document.querySelector('.graphic06'),
    graphicEl075 = document.querySelector('.graphic075'),
    graphicEl1 = document.querySelector('.graphic1'),
    graphicVisEl = graphicEl.querySelector('.graphic__vis'),
    graphicVisEl05 = graphicEl05.querySelector('.graphic__vis__05'),
    graphicVisEl06 = graphicEl06.querySelector('.graphic__vis__06'),
    graphicVisEl075 = graphicEl075.querySelector('.graphic__vis__075'),
    graphicVisEl1 = graphicEl1.querySelector('.graphic__vis__1'),
    triggerEls = selectionToArray(graphicEl.querySelectorAll('.trigger')),
    triggerEls05 = selectionToArray(graphicEl05.querySelectorAll('.trigger')),
    triggerEls06 = selectionToArray(graphicEl06.querySelectorAll('.trigger')),
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
  let toggle06 = function (fixed, bottom) {
    if (fixed) graphicVisEl06.classList.add('is-fixed')
    else graphicVisEl06.classList.remove('is-fixed')

    if (bottom) graphicVisEl06.classList.add('is-bottom')
    else graphicVisEl06.classList.remove('is-bottom')
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
      offset: '60%',  // trigger halfway up the viewport
    })
  })

  // setup a waypoint trigger for each trigger element
  let waypoints06 = triggerEls06.map(function (el) {
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

  const exitWaypoint = new Waypoint({
    element: graphicEl,
    handler: function (direction) {
      let fixed = direction === 'up'
      let bottom = !fixed
      toggle(fixed, bottom)
    },
    offset: 'bottom-in-view',
  })

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
  const enterWaypoint06 = new Waypoint({
    element: graphicEl06,
    handler: function (direction) {
      let fixed = direction === 'down'
      let bottom = false
      toggle06(fixed, bottom)
    },
  })

  const exitWaypoint06 = new Waypoint({
    element: graphicEl06,
    handler: function (direction) {
      let fixed = direction === 'up'
      let bottom = !fixed
      toggle06(fixed, bottom)
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
