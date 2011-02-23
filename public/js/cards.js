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
        '<h1>' + this.title + '</h1>' +
        '<ul>' +
          '<li>Good stuff</li>' +
          '<li>Bad stuff</li>' +
          '<li>Normal stuff</li>' +
        '</ul>' +
      '</form>');
    }
    $('#wall').append(that.body);
  };
  
})();