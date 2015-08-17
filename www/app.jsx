'use strict';

class ReferenceSystem {
  constructor(props) {
    this.width = 960;
    this.height = 500;
    this.projection = d3.geo.mercator()
        .scale(1)
        .translate([0, 0]);

    var bbox = props.bbox;
    var bounds = [
      this.projection([bbox[0], bbox[1]]),
      this.projection([bbox[2], bbox[3]])
    ];
    var dx = bounds[1][0] - bounds[0][0];
    var dy = bounds[1][1] - bounds[0][1];
    var x = (bounds[0][0] + bounds[1][0]) / 2;
    var y = (bounds[0][1] + bounds[1][1]) / 2;
    var scale = .9 / Math.max(dx / this.width, dy / this.height);
    var translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];

    this.projection.scale(scale).translate(translate);

    this.path = d3.geo.path()
        .projection(this.projection);
  }
}

class Location extends React.Component {
  render() {
    var point = {type: 'Point', coordinates: this.props.l.fixed.lnglat};
    var d = this.props.rs.path(point);
    return <path d={d} />;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rs: new ReferenceSystem({bbox: props.data.bbox}),
    };
  }
  render() {
    var rs = this.state.rs;
    var locations = this.props.data.locations.map(function(l) {
      return <Location l={l} rs={rs} />;
    })
    return (
      <svg width={rs.width} height={rs.height}>
        {locations}
      </svg>
    );
  }
}

d3.json('map.json', function(data) {
  React.render(<App data={data} />, document.querySelector('body'));
});
