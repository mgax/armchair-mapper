'use strict';

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

class PhotoList extends FluxComponent {
  fetchState(store) {
    var data = store.getData();
    return {
      photos: data.photos,
    };
  }

  render() {
    var photoList = this.state.photos.map(function(p) {
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
