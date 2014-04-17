// The circle part should be a square. The extra 200 pixels are to allow for 
// room for interaction tools.
var master = {width: 900,
              height: 800,
              square: 10,
              squareGap: 3,
              squareRad: 3,
              ringWidth: 1,
              toolRad: 5,
              fontsize: 10,
              uibox: 80,
              uiboxRad: 10,
              uiboxGap: 10,
             };

var colors = {red: "#d11c24",
              yellow: "#a57706",
              darkYellow: "#653700",
              green: "#738a05",
              white: "#fcf4dc",
              background: "#0d2c36",
              ring: "#74817d",
              dark: {"u": "#653700",
                     "d": "#a10c04",
                     "l": "#536a00",
                    },
             };

var colorMap = {"l":colors.green,
                "d":colors.red,
                "u":colors.yellow,
               };

var ringWidth = [100, 200, 300, 398];

var active = {shape: "boxes",
              l: 1,
              d: 1,
              u: 1,
              };
// Create main svg chart.
var svg = d3.select("body")
            .append("svg")
            .attr("class", "chart")
            .attr("width", master.width)
            .attr("height", master.height)
            .append("g")
            ;

//var sentenceInfoFileName = "data/exampleSentenceData.csv";
var sentenceInfoFileName = "data/draft2SentenceData.csv";
var termInfoFileName = "data/draft2TermData.csv";

d3.csv(sentenceInfoFileName,
  function(data){
d3.csv(termInfoFileName,
  function(termData){

    var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([master.toolRad, master.toolRad])
                .direction("se")
                .html(
                  function(d) {
                    return d.sent;
                })
                ;

    // We need to have a way to snap everything to a grid.
    var snapGrid = [];
    for (var i = 0; i < master.height/(master.square+master.squareGap) ; i++ ) {
      var tmp = [];
      for (var j = 0; j < master.height/(master.square+master.squareGap) ; j++ ) {
        tmp[j] = 0;
      }
      snapGrid[i] = tmp;
    }
    var termAxis = d3.scale
                     .log()
                     .domain([1, d3.max(termData,
                       function(d){
                         return parseInt(d.rank);
                       })])
                     .range([20, Math.floor(master.height/2)])
                     ;
    var snapGridCenter = Math.floor(snapGrid.length/2)+1;
    snapGrid[snapGridCenter][snapGridCenter] = 1;
    var snapAxis = d3.scale
                     .log()
                     .domain([1, d3.max(data,
                       function(d){
                         return parseInt(d.rank);
                       })])
                     .range([1, (snapGrid.length/2)-1])
                     ;
    function checkCoords(x,y) {
      if (x+snapGridCenter < 0 || y+snapGridCenter < 0 ||  x+snapGridCenter > snapGrid.length || y+snapGridCenter > snapGrid.length){
        return false;
      }
      if (snapGrid[x+snapGridCenter][y+snapGridCenter] == 1) {
        return false;
      }
      return true;
    }
    function getCoords(r, th) {
      var wth = th;
      var wr = r;
      var ax = Math.round(snapAxis(wr+1) * Math.cos((wth)));
      var ay = Math.round(snapAxis(wr+1) * Math.sin((wth)));
      if (checkCoords(ax,ay)) {
        snapGrid[ax+snapGridCenter][ay+snapGridCenter] = 1;
        return {"x": ax,
                "y": ay,
               };
      }
      // If ax,ay is filled, we need to find the next best thing.
      // We're going to be cycling around it.
      for (var i=0; i<5000; i++){
        // Just check each of the eight directions, it won't get things not on
        // +/- 1 slope, but whatever.
        if (checkCoords(ax+i,ay)){
          snapGrid[ax+i+snapGridCenter][ay+snapGridCenter] = 1;
          return {"x": ax+i,
                  "y": ay,
                 };
        }

        if (checkCoords(ax+i,ay+i)){
          snapGrid[ax+i+snapGridCenter][ay+i+snapGridCenter] = 1;
          return {"x": ax+i,
                  "y": ay+i,
                 };
        }
        if (checkCoords(ax,ay+i)){
          snapGrid[ax+snapGridCenter][ay+i+snapGridCenter] = 1;
          return {"x": ax,
                  "y": ay+i,
                 };
        }
        if (checkCoords(ax-i,ay)){
          snapGrid[ax-i+snapGridCenter][ay+snapGridCenter] = 1;
          return {"x": ax-i,
                  "y": ay,
                 };
        }
        if (checkCoords(ax-i,ay-i)){
          snapGrid[ax-i+snapGridCenter][ay-i+snapGridCenter] = 1;
          return {"x": ax-i,
                  "y": ay-i,
                 };
        }
        if (checkCoords(ax,ay-i)){
          snapGrid[ax+snapGridCenter][ay-i+snapGridCenter] = 1;
          return {"x": ax,
                  "y": ay-i,
                 };
        }
        if (checkCoords(ax+i,ay-i)){
          snapGrid[ax+i+snapGridCenter][ay-i+snapGridCenter] = 1;
          return {"x": ax+i,
                  "y": ay-i,
                 };
        }
      }
        if (checkCoords(ax-i,ay+i)){
          snapGrid[ax-i+snapGridCenter][ay+i+snapGridCenter] = 1;
          return {"x": ax-i,
                  "y": ay+i,
                 };
        }
      return {"x": ax,
              "y": ay,
             };

    }

    // Circular axis
    var circAxis = d3.scale
                     .linear()
                     .domain([0, d3.max(data,
                       function(d) {
                         return d.cluster
                       })])
                     .range([0, 360])
                     ;
    // ------------------- Controls and Static Items ------------------------ //
    // Set background
    document.body.style.backgroundColor = colors.background;

    function swapActive(uibox, cat) {
      if (active[cat] == 1){
        svg.selectAll(".boxes")
           .style("opacity",
             function(d){
               if (this.classList[2] == cat) {
                 d.op = 0;
                 return 0;
               } 
               else {
                 return d.op;
               }
             })
        svg.selectAll(".words")
           .style("opacity",
             function(d){
               if (this.classList[2] == cat) {
                 d.op = 0;
               } 
               if (active.shape == "boxes") {
                 return 0;
               } else{
                 return d.op;
               }

             })
        active[cat] = 0;
        uibox.style.fill = colors.dark[cat];
      } else if (active[cat] == 0){
        svg.selectAll(".boxes")
           .style("opacity",
             function(d){
               if (this.classList[2] == cat) {
                 d.op = 1;
                 return 1;
               } 
               else {
                 return d.op;
               }
             })
        svg.selectAll(".words")
           .style("opacity",
             function(d){
               if (this.classList[2] == cat) {
                 d.op = 1;
               } 
               if (active.shape == "boxes") {
                 return 0;
               } else{
                 return d.op;
               }
             })
        active[cat] = 1;
        uibox.style.fill = colorMap[cat];
      }
    }


    // Corner Controls
    svg.append("rect")
       .attr("width", master.uibox)
       .attr("height", master.uibox)
       .attr("rx", master.uiboxRad)
       .attr("ry", master.uiboxRad)
       .style("fill", colors.yellow)
       .attr("x", master.width-master.uiboxGap-master.uibox)
       .attr("y", master.uiboxGap)
       .on("click",
         function() {
           swapActive(this,"u")
         })
       ;
    svg.append("rect")
       .attr("width", master.uibox)
       .attr("height", master.uibox)
       .attr("rx", master.uiboxRad)
       .attr("ry", master.uiboxRad)
       .style("fill", colors.red)
       .attr("x", master.width-(2*master.uiboxGap)-(2*master.uibox))
       .attr("y", master.uiboxGap)
       .on("click",
         function() {
           swapActive(this,"d")
         })
       ;
    svg.append("rect")
       .attr("width", master.uibox)
       .attr("height", master.uibox)
       .attr("rx", master.uiboxRad)
       .attr("ry", master.uiboxRad)
       .style("fill", colors.green)
       .attr("x", master.width-master.uiboxGap-master.uibox)
       .attr("y", (2*master.uiboxGap)+master.uibox)
       .on("click",
         function() {
           swapActive(this,"l")
         })
       ;
    // Rings
    svg.selectAll(".rings")
       .data(ringWidth)
       .enter()
       .append("circle")
       .attr("r", 0)
       .attr("cx", master.height/2)
       .attr("cy", master.height/2)
       .attr("class","rings")
       .style("stroke", colors.ring)
       .style("stroke-width", master.ringWidth)
       .style("fill", "none")
       ;
    svg.selectAll(".rings")
       .data(ringWidth)
       .transition()
       .delay(300)
       .ease("elastic")
       .duration(5000)
       .attr("r", function(d) { return d; })

    // --------------------------- Draw Words ------------------------------- //

    svg.selectAll(".words")
      .data(termData)
      .enter()
      .append("text")
      .attr("class",
        function(d){
          d.op = 1;
          return "words holder "+d.type;
        })
      .text(
        function(d) {
          return d.word;
        })
      .attr("font-size", master.fontsize)
      .attr("fill",
          function(d) {
            return colorMap[d.type];
          })
      .attr("x",master.height/2 - master.square/2)
      .attr("y",master.height/2 - master.square/2)
      .style("opacity",0.0)
      ;
    // -------------------------- Draw Squares ------------------------------ //

    for (i in data) {
      var coords = getCoords(parseInt(data[i].rank),circAxis(data[i].cluster));
      data[i].x = coords["x"];
      data[i].y = coords["y"];
      console.log(coords);
      data[i].op = 1;
    }

    svg.call(tip);
    svg.selectAll(".boxes")
       .data(data)
       .enter()
       .append("rect")
       .attr("class",
         function(d,i) {
           return "boxes "+d.num +" " +d.type;
         })
       .attr("width", master.square)
       .attr("height", master.square)
       .attr("rx", master.squareRad)
       .attr("ry", master.squareRad)
       .attr("x",
         function(d,i) {
           return master.height/2 - master.square/2 + (0*(master.square+master.squareGap));
         })
       .attr("y",
         function(d,i) {
           return master.height/2 - master.square/2 + (0*(master.square+master.squareGap));
         })
       .style("fill",
         function(d) {
           return colorMap[d.type];
         })
       .style("opacity", 1.0)
       .on("mouseover",
         function(d,i) {
           if (d.op != 0){
           tip.show(d);
           var boxMouse = this;
           svg.selectAll(".boxes")
             .transition()
             .duration(200)
             .style("opacity",
               function(d){
                 return d.op == 0 ? 0.0 : (this.classList[1]==boxMouse.classList[1]) ? 1.0 : (0.2);
               })
           }
         })
       .on("mouseout",
         function(d,i) {
           var boxMouse = this;
           tip.hide(d);
           svg.selectAll(".boxes")
             .transition()
             .duration(200)
             .style("opacity",
               function(d){
                 return 1 & d.op;

               })
           ;
         })
       ;
    svg.selectAll(".boxes")
       .transition()
       .delay(300)
       .ease("elastic")
       .duration(5000)
       .attr("x",
         function(d,i) {
           return master.height/2 - master.square/2 + (d.x*(master.square+master.squareGap));
         })
       .attr("y",
         function(d,i) {
           return master.height/2 - master.square/2 + (d.y*(master.square+master.squareGap));
         })
       .style("opacity", 1.0)

    // Center point
    svg.append("rect")
       .attr("width", master.square)
       .attr("height", master.square)
       .attr("rx", master.squareRad)
       .attr("ry", master.squareRad)
       .attr("x", master.height/2 - master.square/2)
       .attr("y", master.height/2 - master.square/2)
       .style("fill", colors.white)
       .on("click",
         function() {
           if (active.shape == "boxes"){
             svg.selectAll(".boxes")
                .transition()
                .duration(800)
                .attr("x", master.height/2 - master.square/2)
                .attr("y", master.height/2 - master.square/2)
                .style("opacity",
                  function(){
                    return "0";
                  })
                ;
             svg.selectAll(".words")
                .transition()
                .duration(800)
                .attr("x",
                  function(d,i){
                    return (termAxis(d.rank) * Math.cos(circAxis(d.cluster))) + master.height/2;
                  })
                .attr("y",
                  function(d,i){
                    return (termAxis(d.rank) * Math.sin(circAxis(d.cluster))) + master.height/2;
                  })
                .style("opacity",
                  function(d){
                    return d.op == 0 ? 0.0 : 1.0;
                  })
                ;
             active.shape = "terms";
           }
           else if (active.shape == "terms"){
             svg.selectAll(".boxes")
                .transition()
                .duration(800)
                .attr("x",
                  function(d,i) {
                    return master.height/2 - master.square/2 + (d.x*(master.square+master.squareGap));
                  })
                .attr("y",
                  function(d,i) {
                    return master.height/2 - master.square/2 + (d.y*(master.square+master.squareGap));
                  })
                .style("opacity",
                  function(d){
                    return d.op == 0 ? 0.0 : 1.0;
                  })
                ;
             svg.selectAll(".words")
                .transition()
                .duration(800)
                .attr("x",master.height/2 - master.square/2)
                .attr("y",master.height/2 - master.square/2)
                .style("opacity","0")
                ;
             active.shape = "boxes";
           }
         })
       ;

// Close term data
  }

);
// Close sentence data
  }

);
