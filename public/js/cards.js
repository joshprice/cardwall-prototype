(function() {
  Card = function(properties) {
    this.title      = properties.title || '';
    this.body       = properties.body || '';
    this.dimensions = properties.dimensions || '';
    
    makeBody();
    
    function makeBody() {
      this.body = $('<div class="card"></div>');
    }
  };
  
})();