/**
 * Media Remote
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');


function actuate(cmd) {
    console.log("actuating " + cmd);
    ajax(
        {
            url: 'http://omega-078b.local:5000/remote',
            data: {command: cmd},
            type: 'json',
            method: 'put',
        },
        function(data, status, request) {
            console.log('response: ' + data);
        },
        function(error, status, request) {
            console.log('error: ' + error);
        }
    );
}


function actuate_func(cmd, ret) {
    return function() {
        actuate(cmd);
        return ret;
    };
}


function show_menu(sections) {
    var menu = new UI.Menu({
        sections: sections,
        backgroundColor: 'white',
        textColor: 'black',
        highlightBackgroundColor: 'orange',
        highlightTextColor: 'black',
    });
    menu.on('select', function(e) {
        if (e.item && e.item.callback) {
            if (e.item.callback(e))
                menu.hide();
        }
    });
    menu.show();
    return menu;
}


function show_menu_func(sections) {
    return function() { show_menu(sections); };
}


function show_controller(options) {
    var wind = new UI.Window({
        fullscreen: false,
        backgroundColor: 'white',
    });
    
    wind.add(new UI.Rect({
        position: new Vector2(0, 0),
        size: new Vector2(80, 168),
        backgroundColor: 'orange',
    }));
    
    wind.add(new UI.Text({
        position: new Vector2(10, 0),
        size: new Vector2(70, 168),
        font: 'gothic-28',
        text: options.title,
        textAlign: 'left',
        textOverflow: 'wrap',
        color: 'black',
        backgroundColor: 'clear',
    }));
    
    wind.add(new UI.Text({
        position: new Vector2(72, 0),
        size: new Vector2(60, 30),
        font: 'gothic-24',
        text: options.labels.up,
        textAlign: 'right',
        textOverflow: 'ellipsis',
        color: 'black',
        backgroundColor: 'clear',
    }));
    
    wind.add(new UI.Text({
        position: new Vector2(72, 50),
        size: new Vector2(60, 30),
        font: 'gothic-24',
        text: options.labels.select,
        textAlign: 'right',
        textOverflow: 'ellipsis',
        color: 'black',
        backgroundColor: 'clear',
    }));
    
    wind.add(new UI.Text({
        position: new Vector2(72, 100),
        size: new Vector2(60, 30),
        font: 'gothic-24',
        text: options.labels.down,
        textAlign: 'right',
        textOverflow: 'ellipsis',
        color: 'black',
        backgroundColor: 'clear',
    }));
    
    wind.on('click', 'up', function(e) {
        if (options.callbacks.up())
            wind.hide();
    });
    
    wind.on('click', 'select', function(e) {
        if (options.callbacks.select())
            wind.hide();
    });
    
    wind.on('click', 'down', function(e) {
        if (options.callbacks.down())
            wind.hide();
    });
    
    wind.show();
}


function show_controller_func(options) {
    return function() {show_controller(options);};
}


show_menu([
    {
        title: 'TV',
        items: [
            {title: "Power", callback: actuate_func("tv/power", false)},
            {title: "Source", callback: show_controller_func({
                title: "TV source",
                labels: {
                    up: "Up",
                    down: "Down",
                    select: "Select"
                },
                callbacks: {
                    up: actuate_func("tv/up", false),
                    down: actuate_func("tv/down", false),
                    select: actuate_func("tv/select", true),
                }
            })}
        ]
    },
    {
        title: 'Pre-amplifier',
        items: [
            {title: "Power on", callback: actuate_func("preamp/on", false)},
            {title: "Power off", callback: actuate_func("preamp/off", false)},
            {title: "Volume", callback: show_controller_func({
                title: "Pre-amp volume",
                labels: {
                    up: "Up",
                    down: "Down",
                    select: "Mute",
                },
                callbacks: {
                    up: actuate_func("preamp/up", false),
                    down: actuate_func("preamp/down", false),
                    select: actuate_func("preamp/mute", false),
                }
            })},
            {title: "Input", callback: show_menu_func([{
                title: "Pre-amplifier input",
                items: [
                    {title: "Opt 1: TV", callback: actuate_func("preamp/opt1", true)},
                    {title: "Opt 2: Chromecast", callback: actuate_func("preamp/opt2", true)},
                    {title: "USB: Computer", callback: actuate_func("preamp/usb", true)},
                    {title: "Coaxial 1", callback: actuate_func("preamp/coaxial1", true)},
                    {title: "Coaxial 2", callback: actuate_func("preamp/coaxial2", true)},
                    {title: "AES/EBU", callback: actuate_func("preamp/aes", true)}
                ]}])},
            {title: "SRC Bypass", callback: actuate_func("preamp/src", false)},
            {title: "Dim", callback: actuate_func("preamp/dim", false)}
        ]
    }
]);
