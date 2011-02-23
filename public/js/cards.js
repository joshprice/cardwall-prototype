(function() {
  Card = function(properties) {
    var that = this;
    this.title = properties.title || '';
    this.body  = properties.body || '';
    this.x     = properties.x || 0;
    this.y     = properties.y || 0;
    
    makeBody();
    
    function makeBody() {
      that.body = $('' +
        '<div class="card" id="card_' + (card_count += 1) + '">' +
          '<h1 contenteditable>' + that.title + '</h1>' +
          '<p contenteditable>' + that.body + '</p>' +
        '</div>').draggable();
    }
    $('#wall').append(that.body);
  };
})();

var card_count = 0;
new Card({title: 'blah', body: 'blah'})
