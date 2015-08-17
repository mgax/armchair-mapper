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
      var url = this.url(d[0], d[1], d[2]);
      var image = (
        '<image width="1" height="1" x="' + d[0] + '" y="' + d[1] + '"' +
        ' xlink:href="' + url + '" />'
      );
      return <g dangerouslySetInnerHTML={{ __html: image }} />
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

class Location extends React.Component {
  render() {
    var pos = this.props.l.fixed;
    var point = {type: 'Point', coordinates: [pos.lng, pos.lat]};
    var d = this.props.rs.path(point);
    return <path d={d} />;
  }
}

class Map extends React.Component {
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
        <RasterLayer rs={rs} />
        {locations}
      </svg>
    );
  }
}

class LocationListItem extends React.Component {
  render() {
    return (
      <li>
        <a href="#" onClick={this.handleClick.bind(this)}>
          {this.props.l.file}
        </a>
      </li>
    );
  }

  handleClick(evt) {
    evt.preventDefault();
    this.props.onClick(this.props.l);
  }
}

class LocationList extends React.Component {
  render() {
    var locationList = this.props.data.locations.map(function(l) {
      return <LocationListItem
        key={l.file} l={l}
        onClick={this.handleClick.bind(this)}
        />;
    }.bind(this));
    return <ul className="list-unstyled">{locationList}</ul>;
  }

  handleClick(l) {
    this.props.onClick(l);
  }
}

class App extends React.Component {
  render() {
    return (
      <div className="container">
        <Navbar onSave={this.handleSave.bind(this)} />
        <div className="row">
          <div className="col-sm-10">
            <Map ref="map" data={this.props.data} />
          </div>
          <div className="col-sm-2">
            <LocationList
              data={this.props.data}
              onClick={this.handleOpen.bind(this)}
              />
          </div>
        </div>
      </div>
    );
  }

  handleSave() {
    $.ajax({
      url: 'map.json',
      method: 'POST',
      data: JSON.stringify(this.props.data),
      contentType: 'application/json',
    });
  }

  handleOpen(l) {
    console.log('opening', l);
  }
}

d3.json('map.json', function(data) {
  window.app = React.render(<App data={data} />, document.querySelector('body'));
});
