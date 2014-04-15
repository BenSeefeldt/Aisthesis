// The circle part should be a square. The extra 200 pixels are to allow for 
// room for interaction tools.
var master = {width: 1000,
              height: 800,
              square: 10,
              squareRad: 3,
              ringWidth: 1,
             };

var colors = {red: "#d11c24",
              yellow: "#a57706",
              green: "#738a05",
              white: "#fcf4dc",
              background: "#0d2c36",
              ring: "#74817d",
             };

var colorMap = {"l":colors.green,
                "d":colors.red,
                "u":colors.yellow,
               };

var ringWidth = [100, 200, 300, 398];

// Create main svg chart.
var svg = d3.select("body")
            .append("svg")
            .attr("class", "chart")
            .attr("width", master.width)
            .attr("height", master.height)
            .append("g")
            ;

var sentenceInfoFileName = "data/exampleSentenceData.csv";

d3.csv(sentenceInfoFileName,

  function(data){
    // Circular axis
    var circAxis = d3.scale
                     .linear()
                     .domain([0, data.length])
                     .range([0, 360])
                     ;
    // ------------------- Controls and Static Items ------------------------ //
    // Set background
    document.body.style.backgroundColor = colors.background;


    // Center point
    svg.append("rect")
       .attr("width", master.square)
       .attr("height", master.square)
       .attr("rx", master.squareRad)
       .attr("ry", master.squareRad)
       .attr("x", master.height/2 - master.square/2)
       .attr("y", master.height/2 - master.square/2)
       .style("fill", colors.white)
       ;

    // Rings
    svg.selectAll(".rings")
       .data(ringWidth)
       .enter()
       .append("circle")
       .attr("r", function(d) { return d; })
       .attr("cx", master.height/2)
       .attr("cy", master.height/2)
       .attr("class","rings")
       .style("stroke", colors.ring)
       .style("stroke-width", master.ringWidth)
       .style("fill", "none")
       ;

    // -------------------------- Draw Squares ------------------------------ //

    svg.selectAll(".boxes")
       .data(data)
       .enter()
       .append("rect")
       .attr("class", "boxes")
       .attr("width", master.square)
       .attr("height", master.square)
       .attr("rx", master.squareRad)
       .attr("ry", master.squareRad)
       .attr("x",
          function(d,i) {
            return (d.rank*40 * Math.cos(circAxis(i)) + master.height/2 );
          })
       .attr("y",
          function(d,i) {
            return (d.rank*40 * Math.sin(circAxis(i)) + master.height/2 );
          })
       .style("fill",
          function(d) {
            return colorMap[d.type];
          })
       ;

  }

);
