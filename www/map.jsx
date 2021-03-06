'use strict';

class ReferenceSystem {
  constructor(props) {
    this.width = 780;
    this.height = 400;
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

    this.tile = d3.geo.tile()
        .size([this.width, this.height]);
  }
}

class RasterLayer extends React.Component {
  render() {
    var rs = this.props.rs;

    var tiles = rs.tile
        .scale(rs.projection.scale() * 2 * Math.PI)
        .translate(rs.projection.translate())
        ();

    var tileNodes = tiles.map(function(d) {
      return <SvgImage x={d[0]} y={d[1]} src={this.url(d[0], d[1], d[2])} />
    }.bind(this));

    var transform = 'scale(' + tiles.scale + ')'
                  + 'translate(' + tiles.translate + ')';
    return <g transform={transform}>{tileNodes}</g>;
  }

   url(x, y, z) {
    var quad = '';
    for (var i = z; i > 0; i--) {
      var digit = 0;
      var mask = 1 << (i - 1);
      if ((x & mask) !== 0) digit += 1;
      if ((y & mask) !== 0) digit += 2;
      quad = quad + digit;
    }
    var n = (Math.random() * 4 | 0);
    return 'http://ak.dynamic.t' + n + '.tiles.virtualearth.net/comp/ch/' +
      quad + '?mkt=en-us&it=A,G,L,LA&shading=hill&og=98&n=z';
  }
}

class PhotoPoint extends React.Component {
  render() {
    var pos = this.props.p.fixed;
    var point = {type: 'Point', coordinates: [pos.lng, pos.lat]};
    var d = this.props.rs.path(point);
    return <path d={d} />;
  }
}

class Map extends FluxComponent {
  constructor(props) {
    super(props);
    this.rs = new ReferenceSystem({bbox: this.state.bbox});
  }

  fetchState(store) {
    var data = store.getData();
    return {
      bbox: data.bbox,
      photos: data.photos,
    };
  }

  render() {
    var photos = this.state.photos.map(function(p) {
      return <PhotoPoint p={p} rs={this.rs} />;
    }.bind(this));
    return (
      <svg className="map">
        <RasterLayer rs={this.rs} />
        {photos}
      </svg>
    );
  }
}
