import "./App.css";
import { useEffect, useState } from "react";
import * as d3 from "d3";

function App() {
  const [data, setData] = useState([]);
  const [baseTemp, setBaseTemp] = useState();
  const colors = ["rgb(69, 117, 180)","rgb(116, 173, 209)", "rgb(171, 217, 233)", "rgb(224, 243, 248)", "rgb(255, 255, 191)", "rgb(254, 224, 144)", "rgb(253, 174, 97)", "rgb(244, 109, 67)", "rgb(215, 48, 39)"]
  const monthsArray = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const tempRange = [ 3.9, 5, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, ""]




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

  const height = 500;
  const width = 1200;
  const padding = 55;
  let variance;
  let temp;

  function drawHeatMap() {
    d3.select("body svg").remove();
    d3.select("#legendContainer svg").remove();

    let legend = d3
    .select('#legendContainer')
    .append("svg")
    .attr("id", "legend")
    .style("margin-bottom", "100px")
    .selectAll("g") 
    .data(colors)
    .enter()
    .append('g')
  
  legend
    .append('rect')
    .attr('width', 18)
    .attr('height', 18)
    .attr('fill', (d) => d)
    .attr("stroke-width", 1)
    .attr("stroke", 'black')
    .attr("x", 0)
    .attr("y", (d, i)=> (i * 17));
  
  legend
    .append('text')
    .attr("fill", "black")
    .attr("x", 18) 
    .attr("y", (d, i)=> i * 17 + 22)
    .text((d, i) => "- " + tempRange[i]);



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
      .select(".App #container")
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
        temp = baseTemp + variance
        if (temp <= 3.9) {
          return colors[0];
        } else if (temp <= 5) {
          return colors[1];
        } else if (temp <= 6.1) {
          return colors[2];
        } else if (temp <= 7.2) {
          return colors[3];
        } else if (temp <= 8.3) {
          return colors[4];
        } else if (temp <= 9.5) {
          return colors[5];
        } else if (temp <= 10.6) {
          return colors[6];
        } else if (temp <= 11.7) {
          return colors[7];
        } else {
          return colors[8];
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
        return yScale(new Date(0, d.month - 1, 0, 0, 0, 0, 0));
      })
      .on('mouseover', (event, d)=> {
        tooltip.transition()
          .style('visibility', 'visible')
        tooltip.html(d.year + " - " + monthsArray[d.month - 1]   + "<br></br>" + "Temp: " + (baseTemp + d.variance) + "℃"+ "<br></br>" + "Variance: " + d.variance + "℃")
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
      <div id="container"></div>
      <div id="legandTooltipContainer">
        <div id="legendContainer"></div>
        <div id="tooltip"></div>
      </div>
    </div>
  );
}

export default App;
