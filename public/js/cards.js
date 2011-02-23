(function() {  
  Card = Backbone.Model.extend({
    defaults: {
      title :   'title...',
      body  :   'body...'
    },
    
    initialize: function() {
      if (!this.get('title')) this.set({ 'title': this.defaults.title });
      if (!this.get('body')) this.set({ 'title': this.defaults.body });      
    }    
  });
  
  CardCollection = Backbone.Collection.extend({
    model: Card,
    localStorage: new Store('cards')
  });
  
  Cards = new CardCollection;
  
  CardView = Backbone.View.extend({
    tagName   : 'div',
    template  : _.template($('#card-template').html()),
    
    initialize: function() {
      _.bindAll(this, 'render');
      this.model.view = this;
    },
    
    render : function() {
      $(this.el).html(this.template(this.model.toJSON()));
      $(this.el).addClass('card').appendTo('body');
    }
  });
  
  AppView = Backbone.View.extend({
    el  : $('#wall'),
    
    initialize: function() {
      _.bindAll(this, 'addOne', 'addAll');
      Cards.bind('refresh', this.addAll);
      Cards.bind('add', this.addOne);
      Cards.fetch();
    },
        
    addOne: function(card) {
      var view = new CardView({model: card});
      view.render();
    },
    
    addAll: function() {
      Cards.each(this.addOne);
    }
  });
  
  Application = new AppView;
  
  
  // Card = function(properties) {
  //   var that = this;
  //   this.title      = properties.title || '';
  //   this.body       = properties.body || '';
  //   this.dimensions = properties.dimensions || '';
  //   
  //   makeBody();
  //   
  //   function makeBody() {
  //     that.body = $('' +
  //     '<form class="card" id="card_1">' +
  //       '<h1>' + that.title + '</h1>' +
  //       '<p>' + that.body + '</p>' +
  //     '</form>').draggable();
  //   }
  //   $('#wall').append(that.body);
  // };
})();