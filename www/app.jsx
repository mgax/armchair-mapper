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

class SvgImage extends React.Component {
  render() {
    var p = this.props;
    var image = (
      '<image width="' + (p.w || 1) + '" height="' + (p.h || 1) + '"' +
      ' x="' + p.x + '" y="' + p.y + '"' +
      ' xlink:href="' + p.src + '" />'
    );
    return <g dangerouslySetInnerHTML={{ __html: image }} />
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

class Photo extends React.Component {
  render() {
    var pos = this.props.p.fixed;
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
    var photos = this.props.data.photos.map(function(p) {
      return <Photo p={p} rs={rs} />;
    })
    return (
      <svg className="map">
        <RasterLayer rs={rs} />
        {photos}
      </svg>
    );
  }
}

class PhotoListItem extends React.Component {
  render() {
    return (
      <li>
        <a href="#" onClick={this.handleClick.bind(this)}>
          {this.props.p.file}
        </a>
      </li>
    );
  }

  handleClick(evt) {
    evt.preventDefault();
    this.props.onClick(this.props.p);
  }
}

class PhotoList extends React.Component {
  render() {
    var photoList = this.props.data.photos.map(function(p) {
      return <PhotoListItem
        key={p.file} p={p}
        onClick={this.handleClick.bind(this)}
        />;
    }.bind(this));
    return <ul className="list-unstyled photoList">{photoList}</ul>;
  }

  handleClick(p) {
    this.props.onClick(p);
  }
}

class PhotoWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {style: {left: 500, top: 200}};
  }

  render() {
    var p = this.props.p;
    return (
      <div className="photoWindow" style={this.state.style}>
        <div className="photoWindow-header">
          {p.file}
          <button
            className="close"
            onClick={this.handleCloseClick.bind(this)}
            >&times;</button>
        </div>
        <svg>
          <g transform={'rotate(' + p.pos.roll + ' 150 150)'}>
            <SvgImage x="0" y="0" w="300" h="300" src={'/img/' + p.file} />
          </g>
        </svg>
      </div>
    );
  }

  componentDidMount() {
    var drag = d3.behavior.drag()
      .origin(function(d) {
        return {x: this.state.style.left, y: this.state.style.top};
      }.bind(this))
      .on('drag', function() {
        this.setState({style: {left: d3.event.x, top: d3.event.y}});
      }.bind(this));

    d3.select(React.findDOMNode(this)).call(drag);
  }

  handleCloseClick(evt) {
    evt.preventDefault();
    this.props.onClose(this.props.p);
  }
}

class OpenPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: []};
  }

  render() {
    var openPhotos = this.state.open.map(function(p) {
      return <PhotoWindow p={p} onClose={this.handleClose.bind(this)} />;
    }.bind(this));
    return <div className="photoWindow-container">{openPhotos}</div>;
  }

  handleOpen(p) {
    var open = [].concat(this.state.open, [p]);
    this.setState({open: open});
  }

  handleClose(p) {
    var open = this.state.open.filter(function(o) { return o !== p; });
    this.setState({open: open});
  }
}

class App extends React.Component {
  render() {
    return (
      <div className="container fullheight">
        <Navbar onSave={this.handleSave.bind(this)} />
        <div className="row fullheight top-below-navbar">
          <div className="col-sm-10 fullheight">
            <Map ref="map" data={this.props.data} />
          </div>
          <div className="col-sm-2">
            <PhotoList
              data={this.props.data}
              onClick={this.handleOpen.bind(this)}
              />
          </div>
        </div>
        <OpenPhotos ref="open" />
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

  handleOpen(p) {
    this.refs.open.handleOpen(p);
  }
}

d3.json('map.json', function(data) {
  window.app = React.render(<App data={data} />, document.querySelector('body'));
});
