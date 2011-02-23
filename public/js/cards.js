(function() {  
  Card = Backbone.Model.extend({
    defaults: {
      title :   'title...',
      body  :   'body...'
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
      $(this.el).addClass('card').draggable().appendTo('#wall');
    },
    
    clear: function() {
      this.model.clear();
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
})();
