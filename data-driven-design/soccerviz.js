function createControls(incomingData) {
  function buttonClick(_, datapoint) {
    const maxValue = d3.max(incomingData, d => parseFloat(d[datapoint]));
    const colorQuantize = d3.scaleQuantize()
      .domain([0, maxValue])
      .range(colorbrewer.Reds[3]);
    // const tenColorScale = d3.scaleOrdinal()
    //   .domain(['UEFA', 'CONMEBOL', 'CAF', 'AFC'])
    //   .range(d3.schemeCategory10)
    //   .unknown('#c4b9ac');
    const radiusScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([2, 20]);
    // const ybRamp = d3.scaleLinear()
    //   // .interpolate(d3.interpolateHsl)
    //   .interpolate(d3.interpolateLab)
    //   .domain([0, maxValue])
    //   .range(['yellow', 'blue']);

    d3.selectAll('g.overallG')
      .select('circle')
      .transition()
      .duration(1000)
      // .style('fill', p => tenColorScale(p.region))
      .style('fill', d => colorQuantize(d[datapoint]))
      .attr('r', d => radiusScale(d[datapoint]));
  }

  const dataKeys = Object.keys(incomingData[0])
    .filter(d => !['team', 'region'].includes(d));

  d3.select('#controls')
    .selectAll('button.teams')
    .data(dataKeys)
    .enter()
    .append('button')
    .text(d => d)
    .on('click', buttonClick);
}

function highlightRegion(_, d) {
  const teamColor = d3.rgb('#75739F');

  d3.select(this)
    .raise()
    .select('text')
    .classed('active', true)
    .attr('y', 10);
  d3.selectAll('g.overallG')
    .select('circle')
    .style('fill', p => p.region === d.region ? teamColor.darker(.75) : teamColor.brighter(.5));
    // .each(function (p) {
    //   p.region === d.region ?
    //     d3.select(this).classed('active', true) :
    //     d3.select(this).classed('inactive', true);
    // });
}

function unHighlight() {
  d3.selectAll('g.overallG')
    .select('circle')
    .attr('class', '');
  d3.selectAll('g.overallG')
    .select('text')
    .classed('active', false)
    .attr('y', 30);
}

function teamClick(_, d) {
  d3.selectAll('td.data')
    .data(Object.values(d))
    .html(p => p);
}

function loadSVG(data) {
  d3.selectAll('g').each(function () {
    const gParent = this;
    d3.select(data).selectAll('path').each(function() {
      gParent.appendChild(this.cloneNode(true));
    });
  });

  d3.selectAll('g.overallG').each(function(d) {
    d3.select(this).selectAll('path').datum(d);
  });

  const fourColorScale = d3.scaleOrdinal()
    .domain(['UEFA', 'CONMEBOL', 'CONCACAF', 'AFC'])
    .range(['#5eafc6', '#FE9922', '#93C464', '#fcbc34' ]);

  d3.selectAll('path')
    .style('fill', p => {
      if (p) {
        return fourColorScale(p.region);
      }
    })
    .style('stroke', 'black').style('stroke-width', '2px');
}

function overallTeamViz(incomingData) {
  // d3.text('../resources/modal.html').then(html => {
  //   d3.select('body')
  //     .append('div')
  //     .attr('id', 'infobox')
  //     .html(html);
  // });

  d3.select('svg')
    .append('g')
    .attr('id', 'teamsG')
    .attr('transform', 'translate(50,300)')
    .selectAll('g')
    .data(incomingData)
    .enter()
    .append('g')
    .attr('class', 'overallG')
    .attr('transform', (d, i) => `translate(${i * 50}, 0)`);

  const teamG = d3.selectAll('g.overallG');

  teamG
    .append('circle')
    .attr('r', 0)
    .transition()
    .delay((d, i) => i + 100)
    .duration(750)
    .attr('r', 40)
    .transition()
    .duration(750)
    .attr('r', 20);
  // teamG
  //   .insert('image', 'test')
  //   .attr('xlink:href', d => `../images/${d.team}.png`)
  //   .attr('width', '45px')
  //   .attr('height', '20px')
  //   .attr('x', -22)
  //   .attr('y', -10);
  teamG
    .append('text')
    .attr('y', 30)
    .text(d => d.team)
    .style('pointer-events', 'none');

  d3.html('../resources/icon.svg').then(loadSVG);

  // teamG.on('mouseover', highlightRegion);
  // teamG.on('mouseout', unHighlight);
  // teamG.on('click', teamClick);

  createControls(incomingData);
}

function createSoccerViz() {
  d3.csv('../data/worldcup.csv').then(overallTeamViz).catch(console.error);
}
