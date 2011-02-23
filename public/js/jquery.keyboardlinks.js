(function($){

  var pluginName, methods, 
  allLinks, allTextLinks, allUrlLinks,
  pluginsContainerEl, $autoCompleteInputContainerEl, $autoCompleteListContainerEl,
  $autoCompleteInputEl,  $linksCounterEl,
  textHash,
  settings, initializedFlag,
  scanLinksTimer;

  initializedFlag = false;
  pluginName = 'keyboardlinks';

  function _initVars(){
    pluginsContainerEl = $autoCompleteInputContainerEl = $autoCompleteListContainerEl = null;
    $autoCompleteInputEl = $linksCounterEl = null;
    allLinks = []; allTextLinks = []; allUrlLinks = [];
    textHash = {};
  }

  function _initSettings(){
    return {

      // set to true if you want the plugin to add its defualt styles to the page
      autoStyle: false,

      // link scanning on / off
      linkScanningFlag: true,

      // time between link scanning
      linkScanningTime: 5000,

      // overwrite this function if you want to be able to rearrange the order of the elements in the
      // toolbar or add your own elements to the toolbar
      appendToContainer: function(toolbarEl, inputEl, linksCounterEl){
        toolbarEl.append(linksCounterEl).append(inputEl).prependTo(this);
      },

      // use this function to add categories to the links, make it return an empty string to not have any categories
      categorizeFunc: function(link){
        return '';
      },

      // Use this to change the sort order of the links, currently defaults to category then link text.
      // Receives a array the elements of which contain object structured like this
      /*
     *  {
     *    label: auto complete list label - defaults to link text
     *    link: jquery link object
     *    category: string representing the category of the link
     *  }
        */
      sortLinksFunc: function(autoCompleteLinkObjectArray /* array of the objects used in jqueries auto complete to store list label and link*/){
        autoCompleteLinkObjectArray.sort(function(a, b){
          var a2, b2;
          a2 = (a.category + a.label).toLowerCase();
          b2 = (b.category + b.label).toLowerCase();
          if (a2 > b2){
            return 1;
          }
          if (a2 < b2){
            return -1;
          }
          return 0;
        });
      },

      // use this to decide what to do with a link when its been selected by the user
      // receives a jquery link object
      actionSelectedLinkFunc: function($link){
        var url = $link.attr('href');
        if (url){
          window.location.href = url;
        }
        else{
          $link.trigger('click');
        }
      },

      // this callback is triggered when the plugin is searching for links it has not already
      // added, this occurs on initialization and every 5 seconds (unless default changed) if
      // linkScanningFlag is set to true
      keyboardlinkscollectinglinks: function(event){},

      // this callback is triggered when the plugin has finished searching for links it has not already
      // added, this occurs on initialization and every 5 seconds (unless default changed) if
      // linkScanningFlag is set to true
      keyboardlinkscollectedlinks: function(event){}
    };
  }


  function regexEsc(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }

  function _autoStyle(){
    var styles;

    if (settings.autoStyle){


      styles = [

      /* Autocomplete
----------------------------------*/
      // had to change the position to fixed so that when the page was scrolled using scrollTo the list
      // stayed where it was originally
      '#kbl-autocomplete-list-container .ui-autocomplete { position: fixed; cursor: default; }',

      /* workarounds */
      '* html #kbl-autocomplete-list-container .ui-autocomplete { width:1px; } /* without this, the menu expands to 100% in IE6 */',

      /* Menu
----------------------------------*/
      '#kbl-autocomplete-list-container .ui-menu {',
      'list-style:none;',
      'padding: 2px;',
      'margin: 0;',
      'display:block;',
      '}',

      '#kbl-toolbar, #kbl-autocomplete-list-container .ui-menu .ui-menu-item a, ',
      '#kbl-autocomplete-list-container .ui-autocomplete-category{',
      'font-family: Verdana, sans-serif',
      '}',

      '#kbl-autocomplete-list-container .ui-menu .ui-menu {',
      'margin-top: -3px;',
      '}',

      '#kbl-autocomplete-list-container .ui-menu .ui-menu-item {',
      'margin:0;',
      'padding: 0;',
      'width: 100%;',
      '}',

      '#kbl-autocomplete-list-container .ui-menu .ui-menu-item a {',
      'text-decoration:none;',
      'display:block;',
      'padding:.2em .4em;',
      'line-height:1.5;',
      'zoom:1;',
      'background-color:#555555;',
      'font-size:11px;',
      'color: #FFFFFF;',
      'margin: 2px 2px 2px 5px;',
      '}',

      '#kbl-autocomplete-list-container .ui-menu .ui-menu-item a.ui-state-hover,',

      '#kbl-autocomplete-list-container .ui-menu .ui-menu-item a.ui-state-active {',
      'margin: 2px 2px 2px 2px;',
      'background-color: #333333 !important;',
      '}',

      '#kbl-autocomplete-list-container .ui-autocomplete-category{',
      'margin: 2px 2px 2px 2px;',
      'font-size:13px;',
      'background-color: #777777',
      '}',

      '#kbl-autocomplete-list-container .ui-autocomplete {',
      'max-height: 110px;',
      'overflow-y: auto;',
      'background-color: #777777;',
      '-moz-box-shadow: 2px 2px 4px darkgrey;',
      '-webkit-box-shadow: 2px 2px 4px darkgrey;',
      'text-align: left;',
      '}',

      '#kbl-toolbar{',
      '-moz-box-shadow: 2px 2px 4px grey;',
      '-webkit-box-shadow: 2px 2px 4px grey;',
      'background-color: #555555;',
      'left: 0;',
      'top: 0;',
      'margin: auto;',
      'padding: 5px;',
      'position: fixed;',
      'text-align:right;', 
      'width: 100%;',
      'z-index: 1000',
      '}',

      '#kbl-autocomplete-list-container .ui-corner-all{',
      '-moz-border-radius: 3px;',
      '-webkit-border-radius: 3px;',
      '}',

      '#kbl-toolbar input{',
      'margin-right: 50px;',
      'width: 200px;',
      '}',

      '#kbl-toolbar #counter{',
      'color: white;',
      'text-shadow: 1px 1px 2px #CECECE;',
      'margin-right: 20px;', 
      '}',

      '.' + pluginName + '-link-highlight{',
      'padding: 5px;',
      'border-left: 4px solid orange !important;',
      'border-right: 4px solid orange !important;',
      'color: #FFFFFF !important;',
      'background-color: #333333 !important;',
      '-moz-border-radius: 3px;',
      '-webkit-border-radius: 3px;',
      '}',

      '.link-scanning, .link-scanning ul{',
        'filter: alpha(opacity=70);',
        'opacity: 0.7;',
      '}'

      ];

      $("<style type='text/css'> " + styles.join('') + "  </style>").appendTo("head");      
    }
  }


  function addAutoCompleteToPage(container){

    _autoStyle();

    $autoCompleteInputContainerEl = $('<div id="kbl-toolbar" style="display:none;" />');
    $autoCompleteInputEl = $('<input type="text" id="autocomplete" />');
    $linksCounterEl = $('<span id="counter"></span>');
    $autoCompleteListContainerEl = $('<div id="kbl-autocomplete-list-container"/>');

    settings.appendToContainer.call(container, $autoCompleteInputContainerEl, $autoCompleteInputEl, $linksCounterEl);
    container.append($autoCompleteListContainerEl);

    $.widget( "custom.catcomplete", $.ui.autocomplete, {
      isAnyOptionHighligted: function(){
        return $('.ui-state-hover', this.menu.element).length > 0;
      },
      _renderMenu: function( ul, items ) {
        var self, currentCategory;
        self = this;
        currentCategory = "";
        $.each( items, function( index, item ) {
          if ( item.category !== currentCategory ) {
            ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
            currentCategory = item.category;
          }
          self._renderItem( ul, item );
        });
      },
      _renderItem:function(a,b){
        return $("<li></li>").data("item.autocomplete",b).append($(
          "<a class='" + pluginName + "-autocomplete-list-item-link'></a>").text(b.label)).appendTo(a);
      }
    });
  }

  function show(){
    $autoCompleteInputEl.val('');
    $autoCompleteInputContainerEl.slideDown('fast', function(){
      // must wait until finished animating before focus because IE triggers a blur event otherwise
      $autoCompleteInputEl.focus();
    });
    pluginsContainerEl.trigger(pluginName + 'show');
  }

  function hide(){
    $autoCompleteInputEl.catcomplete('close');
    $autoCompleteInputContainerEl.slideUp('fast', function(){
      pluginsContainerEl.trigger(pluginName + 'hide');
    });
    $autoCompleteInputEl.val('');
  }

  function addEventListeners(){

    $(document).bind('keypress.' + pluginName, function(e){
      // make sure that the autocomplete container is only shown when l or L is pressed when
      // a text field or textarea is NOT the originator of the event
      if ((e.which === 108 || e.which === 76) && (!$(e.target).is('input:text, textarea'))){
        // prevent the l or L being added to the text field (IE)
        e.preventDefault();
        show();
      }
      // if esc pressed, event.which seems to return 0 in ubuntu ff so using keyCode
      if (e.keyCode === 27){
        hide();
      }

    });

    $autoCompleteInputEl.bind('keydown.' + pluginName, function(e){
      /*
       * the purpose of this listener is to catch the problem when the user
       * - uses the right arrow key to select a option
       * - which then selects the option in the text field but does not fire the select event
       * - this leaves the user with the text field with the selected link text, no highlighted option and
       *    the options still displayed
       *
       * so get around this by adding a keydown listener which checks for return pressed and no
       * options selected where it then tries to find a link matching the text in the box and then processes
       * it as normal
       */
      var link;
      // check that return was pressed and that any option is NOT highlighted as this code is
      if (e.which === 13 && !$autoCompleteInputEl.catcomplete('isAnyOptionHighligted')){
        link = textHash[$(this).val()];
        if (link){
          settings.actionSelectedLinkFunc($(link));
        }
      }
    });

    $autoCompleteInputEl.bind('blur.' + pluginName, function(){
      hide();
    });

    pluginsContainerEl.bind(pluginName + 'collectinglinks', settings[pluginName + 'collectinglinks']);
    pluginsContainerEl.bind(pluginName + 'collectedlinks', settings[pluginName + 'collectedlinks']);

  }

  function _processAllLinks(callback){
    var scannedClass, autocompleteListItemLinkClass, newLinksToProcessFlag;
    newLinksToProcessFlag = false;
    scannedClass = '.' + pluginName + '-scanned';
    autocompleteListItemLinkClass = '.' + pluginName + "-autocomplete-list-item-link";
    // make sure that you dont add scanned links or links from the autocomplete list
    $('a:not(' + scannedClass + ', ' + autocompleteListItemLinkClass + ')').each(function(){
      var $link, autoCompleteObj, linkText;

      newLinksToProcessFlag = true;
      
      $link = $(this);
      linkText = {};
      autoCompleteObj = {};

      // remove beginning and trailing spaces from text
      linkText = $link.text().replace(/^\s*|\s*$/g, '');
      textHash[linkText] = $link;

      autoCompleteObj.label = linkText;
      autoCompleteObj.link = $link;

      autoCompleteObj.category = settings.categorizeFunc($link);

      if(linkText.match(/^http/ig)){
        allUrlLinks.push(autoCompleteObj);
      }
      else{
        allTextLinks.push(autoCompleteObj);
      }

      // add scanned class so that you dont scan the same links again
      $link.addClass(pluginName + '-scanned');

      allLinks.push(autoCompleteObj);
    });

    callback(newLinksToProcessFlag);
  }


  function collectAllNewLinksOnPage(){

    pluginsContainerEl.trigger(pluginName + 'collectinglinks');
    
    _processAllLinks(function(newLinksToProcessFlag){
      if (newLinksToProcessFlag){
        // space out the sort calls
        $.each([allLinks, allTextLinks, allUrlLinks], function(index, arrayElement){
          setTimeout(function(){
            settings.sortLinksFunc(arrayElement);
          }, 200 * (index + 1));
        });
      }
      pluginsContainerEl.trigger(pluginName + 'collectedlinks');
    });

  }

  function initAutoCompleteWidget(){
    
    var filterLinksIgnoringCommandtext, $previouslyFocusedLink;

    filterLinksIgnoringCommandtext = function(commandText, input, links){
      var searchInput, regexInput;
      // remove the command text from the input if its not an empty string
      searchInput = commandText ? input.slice(commandText.length) : input;

      if (searchInput){
        // create regex expression from input minus command text
        regexInput = new RegExp(regexEsc(searchInput), 'i');
        links = $.map(links, function(item){
          return regexInput.test(item.label) ? item : null;
        });
      }
      return links;
    };

    $("#autocomplete").catcomplete({
      source: function(userInput, callback){
        var input, results;
        input = userInput.term;

        if ((/^l:/i).test(input)){
          results = filterLinksIgnoringCommandtext('l:', input, allUrlLinks);
        }
        else if ((/^t:/i).test(input)){
          results = filterLinksIgnoringCommandtext('t:', input, allTextLinks);
        }
        else if ((/^\*/).test(input)){
          results = filterLinksIgnoringCommandtext('*', input, allLinks);
        }
        else {
          results = filterLinksIgnoringCommandtext('', input, allLinks);
        }

        $linksCounterEl.text(results.length + " links found");
        callback(results);
      },
      select: function(e, selectedObj){
        var selectedLink;

        // check that tab key did not activate selection, if so ignore as want tab to be a way of
        // deactivating the autocomplete
        if (e.which !== 9){
          selectedLink = selectedObj.item.link;
          settings.actionSelectedLinkFunc($(selectedLink));
        }
      },
      focus: function(event, selectedObj){
        var $link;
        if ($previouslyFocusedLink){
          $previouslyFocusedLink.removeClass(pluginName + '-link-highlight');
        }
        $autoCompleteInputContainerEl.addClass('link-scanning');
        $autoCompleteListContainerEl.addClass('link-scanning');
        $link = $(selectedObj.item.link);
        $.scrollTo($link, {
          offset: -170
        });
        $link.addClass(pluginName + '-link-highlight');
        $previouslyFocusedLink = $link;
      },
      close: function(event){
        $linksCounterEl.text('0 links found');
        if ($previouslyFocusedLink){
          $previouslyFocusedLink.removeClass(pluginName + '-link-highlight');
        }
        $autoCompleteInputContainerEl.removeClass('link-scanning');
        $autoCompleteListContainerEl.removeClass('link-scanning');
      }
    });

    // wrap the autocomplete list with a container that i can use to make sure that my style rules
    // only effect my autocomplete and nothing else on the page
    $autoCompleteInputEl.catcomplete('widget').appendTo($autoCompleteListContainerEl);
  }

  function _removeScannedLinksClasses(){
    var scannedClass = pluginName + '-scanned';
    // make sure that you dont add scanned links or links from the autocomplete list
    $('a.' + scannedClass).removeClass(scannedClass);
  }

  methods = {

    init: function(options){

      _initVars();

      settings = _initSettings();

      pluginsContainerEl = this;

      if (options){
        $.extend(settings, options);
      }

      addAutoCompleteToPage(this);
      addEventListeners();
      collectAllNewLinksOnPage();
      initAutoCompleteWidget();

      if (settings.linkScanningFlag){
        scanLinksTimer = setInterval(collectAllNewLinksOnPage, settings.linkScanningTime);
      }

      initializedFlag = true;
    },

    show: function( ) {
      show();
    },
    hide : function( ) {
      hide();
    },
    destroy: function(){
      if (initializedFlag){
        $autoCompleteInputEl.catcomplete('destroy');
        $(document).unbind('.' + pluginName);
        $autoCompleteInputContainerEl.remove();
        $autoCompleteListContainerEl.remove();
        _removeScannedLinksClasses();
        clearTimeout(scanLinksTimer);
        // reset vars to empty values
        _initVars();
        initializedFlag = false;
      }
    }
  };

  $.fn[pluginName] = function( method ) {

    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      if (initializedFlag === false){
        return methods.init.apply( this, arguments );
      }
      else{
        $.error('plugin ' + pluginName + ' can only be initialized once per page');
      }
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.' + pluginName );
    }
  };

  
  return this;


}(jQuery));