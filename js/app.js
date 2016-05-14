(function(element, save, load) {
  // Seems like we're supporting javascript :)
  element.className = 'js';
  var state = null;

  // 1. History view
  var history = {
    initialize: function(element) {
      this.body = element.querySelector('tbody');
      this.views = [];
      var i, l = state.history.length, h;
      var tbody = document.createElement('tbody');
      for(i = 0; i < l; i++) {
        h = new this.item(state.history[i]);
        tbody.appendChild(h.view);
      }
      this.body.parentElement.insertBefore(tbody, this.body);
      this.body.parentElement.removeChild(this.body);
      this.body = tbody;
    },
    add : function(from,to) {
      var h = new this.item({from:from, to:to});
      state.history[state.history.length] = h.data;
      this.body.appendChild(h.view);
    },
    update : function() {

    },
    item : function(data) {
      var view = document.createElement('tr'), edit = document.createElement('a');
      
      view.innerHTML = '<td>'+new Date(data.from).toLocaleString()+'</td><td>'+new Date(data.to).toLocaleString()+'</td><td>No Description</td>';
      edit.innerHTML = 'edit';
      edit.setAttribute('href', 'javascript:void(0);');

      this.startEdit = function() {
        var classes = view.className.split(' '), i = classes.indexOf('edit');
        if(i == -1)
          view.className += ' edit';
      }
      this.endEdit = function() {
        var classes = view.className.split(' '), i = classes.indexOf('edit');
        if(i > -1)
          classes.splice(i,1);
        view.className = classes.join(' ');
        /* parse data? */

      }
      edit.onclick = this.startEdit;

      view.appendChild(edit);


      this.view = view;
      this.data = data;
    }
  };

  // 2. Timer view
  var timer = {
    initialize: function(element) {
      this.view = {
        button : element.querySelector('button'),
        label : element.querySelector('span')
      };
      var context = this;
      this.view.button.onclick = function() {
        if(!!state.timer) context.stop(); else context.start();
      }
    },
    start : function() {
      state.timer = new Date().getTime();
      save(state);
      this.update();
    },
    stop : function() {
      history.add(state.timer, new Date().getTime());
      state.timer = null;
      this.update();
      save(state);
    },
    update : function() {
      this.view.button.innerHTML = (!!state.timer ? "Stop" : "Start");
      this.view.label.innerHTML = (!!state.timer ? new Date(state.timer).toLocaleString() : "Ready" );
    }
  }

  // 3. load or default.
  state = load() || { timer: null,   history: [] };

  history.initialize(element.querySelector('[data-app="history"]'));
  timer.initialize(element.querySelector('[data-app="timer"]'));

  history.update();
  timer.update();
})(document.body,
  function(state) /* save(state) */ {
    if(!!state) {
      window.localStorage['time-tracker'] = JSON.stringify(state);
    }
}, function() /* load(state) */{
  if(window.localStorage.hasOwnProperty('time-tracker')) {
    return JSON.parse(window.localStorage['time-tracker']);
  }
  return null;
});
