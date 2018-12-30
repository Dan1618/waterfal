import { Component, OnInit } from '@angular/core';
import * as d3 from "d3";

@Component({
  selector: 'app-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss']
})
export class WaterfallComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.renderChart();
  }

  async renderChart() {
    var formatChange = d3.format("+d"),
      formatValue = d3.format("d");

    var svg = d3.select("svg");

    var margin = { top: 20, right: 40, bottom: 40, left: 80 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // await d3.tsv("../../assets/data1.tsv").then(data => {
    //   data.forEach(element => {
    //     element.value = +element.value;
    //   });
    await d3.csv("../../assets/data2.csv").then(data => {
      data.forEach(element => {
        element.contribution = +element.contribution;
      });

      //  data = data.sort((a,b) =>         a.contribution - b.contribution)

      data = data.filter(element => {
        // return element.variable_name !== "Intercept" &&
        return element.variable_name !== ""
      })

      data.reduce(function (v, d) { return d.value1 = (d.value0 = v) + d.contribution; }, 0);

      var x = d3.scaleLinear()
        .domain([d3.min(data, d => Math.min(d.value0, d.value1, d.contribution)),
        d3.max(data, d => Math.max(d.value0, d.value1, d.contribution))])
        .range([0, width]);

      var y = d3.scaleBand()
        .domain(data.map(function (d) { return d.variable_name; }))
        .rangeRound([0, height])
        .padding(0.1);

      g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "axis axis--x")
        .call(d3.axisBottom(x));

      g.append("g").selectAll("rect")
        .data(data)
        .enter().append("rect")
        .attr("class", function (d) { return "rect rect--" + (d.value0 < d.value1 ? "positive" : "negative"); })
        .attr("y", function (d) { return y(d.variable_name); })
        .attr("x", function (d) { return x(d.value0 < d.value1 ? d.value0 : d.value1); })
        .attr("width", function (d) { return d.value0 < d.value1 ? x(d.value1) - x(d.value0) : x(d.value0) - x(d.value1); })
        .attr("height", y.bandwidth());

      var label = g.append("g").selectAll("text")
        .data(data)
        .enter().append("text")
        .attr("class", function (d) { return "label label--" + (d.value0 < d.value1 ? "positive" : "negative"); })
        .attr("y", function (d) { return y(d.variable_name) + y.bandwidth() / 2; });

      label.append("tspan")
        .attr("class", "label-change")
        .attr("dy", "-.2em")
        // .text(function (d) { return formatChange(d.value1 - d.value0); });
        .text(function (d) { return d.value1 - d.value0 });

      label.append("tspan")
        .attr("class", "label-value")
        .attr("dy", "1.1em")
        // .text(function (d) { return formatValue(d.value1); });
        .text(function (d) { return d.value1; });

      label.selectAll("tspan")
        .attr("x", function (d) { return x(d.value1) + (d.value0 < d.value1 ? -6 : 6); });

      g.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(" + x(0) + ",0)")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(x(0) + 6));
    })
  }
}
