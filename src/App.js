import "./App.css";
import { useEffect, useState } from "react";
import * as d3 from "d3";

function App() {
  const [data, setData] = useState([]);
  const [baseTemp, setBaseTemp] = useState();
  const colors = ["SteelBlue","LightSteelBlue", "Orange", "Crimson"]

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json",
        );
        const result = await response.json();
        console.log("result.monthlyVariance", result.monthlyVariance);
        const monthlyVariance = result.monthlyVariance;
        setData(monthlyVariance);
        setBaseTemp(result.baseTemperature);
      } catch (error) {
        console.log(error);
      }
    };
    dataFetch();
  }, []);

  useEffect(() => {
    if (data) {
      console.log("data: ", data);
      drawHeatMap();
    }
  }, [data]);

  const height = 800;
  const width = 800;
  const padding = 60;
  let variance;

  function drawHeatMap() {
    d3.select("body svg").remove();
    d3.select("#legendContainer svg").remove();

    let legend = d3
    .select('#legendContainer')
    .append("svg")
    .attr("id", "legend")
    .selectAll("g") 
    .data(colors)
    .enter()
    .append('g')
  
  legend
    .append('rect')
    .attr('width', 18)
    .attr('height', 18)
    .attr('fill', (d) => d)
    .attr("x", 0)
    .attr("y", (d, i)=> i * 18);
  
  legend
    .append('text')
    .attr("fill", "black")
    .attr("x", 18) 
    .attr("y", (d, i)=> i * 18 + 16)
    .text((d) => d);



    const xScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.year), d3.max(data, (d) => d.year + 1)])
      .range([padding, width - padding]);

    const yScale = d3
      .scaleTime()
      .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
      .range([padding, height - padding]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"));

    const svg = d3
      .select("body #container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

      let tooltip = d3
      .select("#tooltip")

    svg
      .append("g")
      .call(xAxis)
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - padding})`);

    svg
      .append("g")
      .call(yAxis)
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding}, 0)`);

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("fill", (d) => {
        variance = d.variance;
        if (variance <= -2) {
          return "SteelBlue";
        } else if (variance <= 0) {
          return "LightSteelBlue";
        } else if (variance <= 1) {
          return "Orange";
        } else {
          return "Crimson";
        }
      })
      .attr("data-year", (d) => d.year)
      .attr("data-month", (d) => d.month - 1)
      .attr("data-temp", (d) => baseTemp + d.variance)
      .attr("height", (height - 2 * padding) / 12)
      .attr(
        "width",
        (width - 2 * padding) /
          (d3.max(data, (d) => d.year) - d3.min(data, (d) => d.year)),
      )
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => {
        console.log(d.month);
        return yScale(new Date(0, d.month - 1, 0, 0, 0, 0, 0));
      })
      .on('mouseover', (event, d)=> {
        tooltip.transition()
          .style('visibility', 'visible')
        tooltip.text(d.year)
        tooltip.attr("data-year", d.year)
      })
      .on('mouseout', (event, d)=> {
        tooltip.transition()
          .style("visibility", "hidden")
      })
      ;
  }

  return (
    <div className="App">
      <h1 id="title">Monthly Global Land-Surface Temperature</h1>
      <p id="description">
        1753 - 2015: base temperature {baseTemp && baseTemp}℃
      </p>
      <div id="tooltip"></div>
      <div id="container"></div>
      <div id="legendContainer">
      </div>
    </div>
  );
}

export default App;
