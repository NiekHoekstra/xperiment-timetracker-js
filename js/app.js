(function(element, save, load) {
  // Seems like we're supporting javascript :)
  element.className = 'js';
  var state = null,
      ce = function(e) { return document.createElement(e); };

   var dateToString = function(date) {
     var m = date.getMinutes().toString();
     if(m.length < 2) m = "0"+m;
     return  date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear()+' '+date.getHours()+':'+m;
   }
   var stringToDate = function (str) {
     var d = new Date(), parts = str.replace(' ', '-').replace(':', '-').split('-'), l = parts.length;
     d.setDate(parts[0]);
     d.setMonth(parts[1]-1);
     d.setFullYear(parts[2]);
     d.setHours(parts[3]);
     d.setMinutes(parts[4]);
     return d;
   }

  // 1. History view
  var history = {
    initialize: function(element) {
      this.body = element.querySelector('tbody');
      this.views = [];
      var i, l = state.history.length, h;
      var tbody = ce('tbody');
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
    item : function(model) {
      var view = ce('tr'),
          edit = ce('a'),
          cancel = ce('a'),
          del = ce('a'),
          props=  ['from',      'to',         'description'],
          input = [ce('input'), ce('input'),  ce('input')],
          span =  [ce('span'),  ce('span'),   ce('span')],
          toLabel = [
            function(raw) { var d = new Date(); d.setTime(raw); return dateToString(d); },
            null,
            function(raw) { return raw; }
          ],
          toModel = [
            function(raw) { return stringToDate(raw).getTime(); },
            null,
            toLabel[2]
          ],
          toEdit = [
            toLabel[0],
            toLabel[0],
            toLabel[2]
          ],
          i,
          l = props.length,
          td,
          context = this;

      toLabel[1] = toLabel[0];
      toModel[1] = toModel[0];

      for(i = 0; i < l; i++) {
        td = ce('td');
        input[i].className = 'editor';
        span[i].className = 'no-editor';
        //debugger;
        span[i].innerHTML = toLabel[i](model[props[i]]);
        td.appendChild(input[i]);
        td.appendChild(span[i]);
        view.appendChild(td);
      }
      del.innerHTML = 'del';
      del.className = 'editor';
      del.onclick = function() {
        if(confirm('delete?')) {
          i = state.history.indexOf(model);
          state.history.splice(i, 1);
          view.parentElement.removeChild(view);
          save(state);
        }
      }
      cancel.innerHTML = 'cancel';
      cancel.className = 'editor';
      cancel.onclick = function() {
        var classes = view.className.split(' ');
        i = classes.indexOf('edit');
        classes.splice(i,1);
        view.className = classes.join(' ');
      }

      edit.innerHTML = 'edit';
      edit.setAttribute('href', 'javascript:void(0);')
      del.setAttribute('href', 'javascript:void(0);');
      cancel.setAttribute('href', 'javascript:void(0);');
      td = ce('td');
      td.appendChild(edit);
      td.appendChild(del);
      td.appendChild(cancel);
      view.appendChild(td);
      edit.onclick = function() {
        if(view.className.indexOf('edit') == -1) {
          // start edit
          view.className += ' edit';
          for(i = 0; i <l; i++) {
              input[i].value = toEdit[i](model[props[i]]);
          }
          this.innerHTML = "save";
        }else{
          var classes = view.className.split(' ');
          //try {
          for(i = 0; i < l; i++) {
            model[props[i]] = toModel[i](input[i].value);
            span[i].innerHTML = toLabel[i](model[props[i]]);
          }
          save(state);
          //save()
          //} catch(e) {

          //}
          i = classes.indexOf('edit');
          classes.splice(i,1);
          // end edit
          view.className = classes.join(' ');
          this.innerHTML = 'edit';
        }
      }

      this.view = view;
      this.data = model;
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
      this.view.label.innerHTML = (!!state.timer ? new Date(state.timer).toLocaleString() : "-" );
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
