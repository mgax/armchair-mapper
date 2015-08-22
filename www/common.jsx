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

class App extends FluxComponent {
  fetchState(store) {
    return {
      data: store.getData(),
    };
  }

  render() {
    if(! this.state.data) { return <p>Loading...</p>; }
    return (
      <div className="container fullheight">
        <Navbar onSave={this.handleSave.bind(this)} />
        <div className="row fullheight top-below-navbar">
          <div className="col-sm-2">
            <LocationList data={this.state.data} />
          </div>
          <div className="col-sm-8 fullheight">
            <Map ref="map" data={this.state.data} />
          </div>
          <div className="col-sm-2">
            <PhotoList
              data={this.state.data}
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
      data: JSON.stringify(this.state.data),
      contentType: 'application/json',
    });
  }

  handleOpen(p) {
    this.refs.open.handleOpen(p);
  }
}

function main() {
  window.app = React.render(<App />, document.querySelector('body'));
  dataController.load();
}
