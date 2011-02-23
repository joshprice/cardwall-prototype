(function() {  
  Card = Backbone.Model.extend({
    defaults: {
      title : 'title...',
      body  : 'body...',
      x     : 0,
      y     : 0
    },
    
    initialize: function() {
      if (!this.get('title')) this.set({ 'title': this.defaults.title });
      if (!this.get('body')) this.set({ 'title': this.defaults.body });
    },
    
    clear: function() {
      this.destroy();
      this.view.remove();
    }
  });
  
  CardView = Backbone.View.extend({
    tagName   : 'article',
    template  : _.template($('#card-template').html()),
    
    initialize: function() {
      _.bindAll(this, 'render');
      this.model.view = this;
    },
    
    render : function() {
      var model = this.model;
      var cardView = $(this.el);
      cardView.html(this.template(this.model.toJSON()));
      cardView.addClass('card')
        .appendTo('#wall')
        .draggable({
          stop: function(event, ui) {
            model.save({ x: ui.position.left, y: ui.position.top })
          }
        })
        .keypress(function() {
          model.save({
            title: cardView.find(".title").html(),
            body: cardView.find(".body").html()
          });
        })
        .css({
          position: "absolute",
          left: model.get("x"),
          top: model.get("y")
        });
    },
    
    clear: function() {
      this.model.clear();
    }
  });
  
  CardCollection = Backbone.Collection.extend({
    model: Card,
    localStorage: new Store('cards')
  });
  
  Cards = new CardCollection;
  
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
})();
