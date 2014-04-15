// The circle part should be a square. The extra 200 pixels are to allow for 
// room for interaction tools.
var master = {width: 1000,
              height: 800,
              square: 10,
              squareGap: 2,
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

    // We need to have a way to snap everything to a grid.
    var snapGrid = [];
    for (var i = 0; i < master.height/(master.square+master.squareGap) ; i++ ) {
      var tmp = [];
      for (var j = 0; j < master.height/(master.square+master.squareGap) ; j++ ) {
        tmp[j] = 0;
      }
      snapGrid[i] = tmp;
    }
    // The center point
    var snapGridCenter = Math.floor(snapGrid.length/2)+1;
    snapGrid[snapGridCenter][snapGridCenter] = 1;
    //var snapAxis = d3.scale
    //                 .linear()
    //                 .domain([0, d3.max[data, 
    //                   function(d){
    //                     return d.rank;
    //                   }]])
    //                 .range([0, snapGrid.length/2])
    //                 ;
    function getCoords(r, th) {
      // The hard coded 40 neeeds to be pulled out
      var origth = th;
      for (var i = 0; i<50; i++) {
        var ax = Math.round((r) * Math.cos((th)));
        var ay = Math.round((r) * Math.sin((th)));
        if (!snapGrid[ax+snapGridCenter][ay+snapGridCenter]) {
          snapGrid[ax+snapGridCenter][ay+snapGridCenter] = 1;
          return {"x": ax,
                  "y": ay,
                 };
        }
        th += 10;
        if (th%360 == origth%360) {
          r += 10;
        }
      }
      return {"x": 0,
              "y": 0,
             };
    }


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

    for (i in data) {
      var coords = getCoords(parseInt(data[i].rank),circAxis(i));
      data[i].x = coords["x"];
      data[i].y = coords["y"];
    }

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
            return master.height/2 -master.square/2 + (d.x*(master.square+master.squareGap));
          })
       .attr("y",
          function(d,i) {
            return master.height/2 -master.square/2 + (d.y*(master.square+master.squareGap));
          })
       .style("fill",
          function(d) {
            return colorMap[d.type];
          })
       ;

  }

);
