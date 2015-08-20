'use strict';

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

class App extends React.Component {
  render() {
    return (
      <div className="container fullheight">
        <Navbar onSave={this.handleSave.bind(this)} />
        <div className="row fullheight top-below-navbar">
          <div className="col-sm-2">
            <LocationList data={this.props.data} />
          </div>
          <div className="col-sm-8 fullheight">
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

function main() {
  d3.json('map.json', function(data) {
    window.app = React.render(<App data={data} />, document.querySelector('body'));
  });
}
