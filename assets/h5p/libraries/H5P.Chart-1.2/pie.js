/*global d3*/
H5P.Chart.PieChart = (function () {

  /**
   * Creates a pie chart from the given data set.
   *
   * @class
   * @param {array} params from semantics, contains data set
   * @param {H5P.jQuery} $wrapper
   */
  function PieChart(params, $wrapper) {
    var self = this;
    var dataSet = params.listOfTypes;

    var defColors = d3.scale.ordinal()
      .range(["#90EE90", "#ADD8E6", "#FFB6C1", "#B0C4DE", "#D3D3D3", "#20B2AA", "#FAFAD2"]);

    // Create SVG
    var svg = d3.select($wrapper[0])
      .append("svg");

    svg.append("desc").html(params.figureDefinition);

    var translater = svg.append("g")
      .attr("class", "translater");

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) {
        return d.value;
      });

    var arcs = translater.selectAll(".arc")
      .data(pie(dataSet))
      .enter().append("g")
      .attr("class", "arc");

    var paths = arcs.append("path")
      .style("fill", function(d) {
        if (d.data.color !== undefined) {
          return d.data.color;
        }
        return defColors(dataSet.indexOf(d.data) % 7);
      });

    var texts = arcs.append("svg:text")
      .attr("class", "text")
      .attr("aria-hidden", true)
      .attr("text-anchor", "middle")
      .text(function(d, i) {
        return dataSet[i].text + ': ' + dataSet[i].value;
      })
      .attr("fill", function (d) {
        if (d.data.fontColor !== undefined) {
          return d.data.fontColor;
        }
      });

    /**
     * Fit the current chart to the size of the wrapper.
     */
    self.resize = function () {
      // Scale to smallest value of height and width
      var style = window.getComputedStyle($wrapper[0]);
      var scaleTo = Math.min(parseFloat(style.width), parseFloat(style.height));

      // Do the math
      var width = scaleTo;
      var height = scaleTo;
      var padding = 0;
      var radius = Math.min(width, height) / 2;
      var arc = d3.svg.arc()
        .outerRadius(radius - padding)
        .innerRadius(0);

      // Update positions
      svg.attr('width', width + 'px')
        .attr('height', height + 'px');
      translater.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");
      paths.attr("d", arc);
      texts.attr("transform", function(d) {
        d.innerRadius = 0;
        d.outerRadius = radius - padding;
        return "translate(" + arc.centroid(d) + ")";
      });
    };
  }

  return PieChart;
})();
