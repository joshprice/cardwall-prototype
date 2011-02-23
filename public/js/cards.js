(function() {
  Card = function(properties) {
    var that = this;
    this.title      = properties.title || '';
    this.body       = properties.body || '';
    this.dimensions = properties.dimensions || '';
    
    makeBody();
    
    function makeBody() {
      that.body = $('' +
      '<form class="card" id="card_1">' +
        '<h1>' + that.title + '</h1>' +
        '<p>' + that.body + '</p>' +
      '</form>');
    }
    $('#wall').append(that.body);
  };
  
})();