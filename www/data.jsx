'use strict';

var DATA_LOAD = 'DATA_LOAD';
var LOCATION_CREATE = 'LOCATION_CREATE';
var LOCATION_DESTROY = 'LOCATION_DESTROY';
var CHANGE_EVENT = 'change';


class SceneStore extends EventEmitter {

  constructor(options) {
    super();
    this._data = null;
    this.dispatcherIndex = options.dispatcher.register(this._handle.bind(this));
  }

  _load(data) {
    this._data = data;
  }

  getData() {
    return this._data;
  }

  getLocations() {
    return this._data.locations;
  }

  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

  _handle(payload) {
    var action = payload.action;
    var text;

    switch(action.actionType) {
      case DATA_LOAD:
        this._load(action.data);
        this.emitChange();
        break;
    }

    return true; // No errors. Needed by promise in Dispatcher.
  }

}


class DataController {

  constructor() {
    this.dispatcher = new Flux.Dispatcher();
    this.store = new SceneStore({dispatcher: this.dispatcher});
  }

  load() {
    d3.json('map.json', function(resp) {
      this.emitServerLoad(resp);
    }.bind(this));
  }

  emitServerLoad(data) {
    this.dispatcher.dispatch({
      source: 'SERVER_ACTION',
      action: {
        actionType: DATA_LOAD,
        data: data,
      },
    });
  }

}


class FluxComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.fetchState(dataController.store);
  }

  componentDidMount() {
    dataController.store.addChangeListener(this._handler = (function() {
      this.setState(this.fetchState(dataController.store));
    }.bind(this)));
  }

  componentWillUnmount() {
    dataController.store.removeChangeListener(this._handler);
  }

}


var dataController = new DataController();
