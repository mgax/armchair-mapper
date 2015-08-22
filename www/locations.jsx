'use strict';

class LocationListItem extends React.Component {
  render() {
    return (
      <li>
        <a href="#" onClick={this.handleClick.bind(this)}>
          {this.props.l.id}
        </a>
      </li>
    );
  }

  handleClick(evt) {
    evt.preventDefault();
    this.props.onClick(this.props.l);
  }
}

class LocationList extends FluxComponent {
  fetchState(store) {
    var data = store.getData();
    return {
      locations: data.locations,
    };
  }

  render() {
    var locationList = this.state.locations.map(function(l) {
      return <LocationListItem
        key={l.id} l={l}
        onClick={this.handleClick.bind(this)}
        />;
    }.bind(this));
    return (
      <div>
        <h3>
          locations{' '}
          <div className="btn-group btn-group-xs" role="group">
            <button
              type="button" className="btn btn-default"
              onClick={this.handleCreateClick.bind(this)}
              ><i className="fa fa-plus" /></button>
          </div>
        </h3>
        <ul className="list-unstyled locationList">{locationList}</ul>
      </div>
    );
  }

  handleCreateClick(evt) {
    evt.preventDefault();
    dataController.emitCreateLocation();
  }

  handleClick(l) {
    console.log('click', l);
  }
}
