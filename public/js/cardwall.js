$(document).ready(function() {
  $('#wall').click(function() { Cards.create() });
  $(document).bind("keypress", "n", function() { Cards.create() });
});
