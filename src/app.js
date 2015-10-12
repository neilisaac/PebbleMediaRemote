/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');


function actuate(cmd) {
    console.log("actuating " + cmd);
    ajax(
        {
            url: 'http://api.theysaidso.com/qod.json',
            type: 'json'
        },
        function(data, status, request) {
            console.log('Quote of the day is: ' + data.contents.quote);
        },
        function(error, status, request) {
            console.log('The ajax request failed: ' + error);
        }
    );
}


function showmenu(items) {
    var menu = new UI.Menu({
        sections: [{
            title: 'Media Remote',
            items: items
        }]
    });
    menu.on('select', function(e) {
        if (e.item && e.item.callback) {
            e.item.callback(e);
        }
    });
    menu.show();
    return menu;
}


showmenu([
    { title: "Pre-amp on", callback: function() { actuate("preamp/on"); } },
    { title: "Pre-amp off" },
    { title: "TV power" },
    { }
]);

/*
main.on('click', 'up', function(e) {
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Pebble.js',
        icon: 'images/menu_icon.png',
        subtitle: 'Can do Menus'
      }, {
        title: 'Second Item',
        subtitle: 'Subtitle Text'
      }]
    }]
  });
  menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
  });
  menu.show();
});

main.on('click', 'select', function(e) {
  var wind = new UI.Window({
    fullscreen: true,
  });
  var textfield = new UI.Text({
    position: new Vector2(0, 65),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: 'Text Anywhere!',
    textAlign: 'center'
  });
  wind.add(textfield);
  wind.show();
});
*/