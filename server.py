#!/usr/bin/env python

import subprocess
import sys
import time
from flask import Flask


IR_PIN = 13
HTTP_PORT = 5000


def set_led(color):
    subprocess.call(['/usr/bin/expled', color])


def fast_gpio(*args):
    subprocess.call(['/usr/sbin/fast-gpio'] + list(map(str, args)))


def pulse(seconds):
    fast_gpio('pwm', 37900, IR_PIN)
    time.sleep(seconds)
    fast_gpio('set', IR_PIN, 0)


def send_nec(code):
    # based on http://techdocs.altium.com/display/FPGA/NEC+Infrared+Transmission+Protocol

    print 'sending', code

    pulse(0.009)  # 9ms leading burst
    time.sleep(0.0054)  # 4.5ms space

    for bit in '{:020b}'.format(int(code, 16)):
        if bit == '0':
            pulse(0.0005625)
            time.sleep(0.0005625)
        else:
            pulse(0.0005625)
            time.sleep(0.0016875)

    pulse(0.0005625)  # 562.5us end of transmission


def send_samsung(code):
    # based on http://rusticengineering.com/2011/02/09/infrared-room-control-with-samsung-ir-protocol/

    print 'sending', code

    pulse(0.0045)  # 4.5ms on
    time.sleep(0.0045)  # 4.5ms off

    for bit in '{:020b}'.format(int(code, 16)):
        if bit == '0':
            pulse(0.000590)
            time.sleep(0.000590)
        else:
            pulse(0.000590)
            time.sleep(0.00169)

    pulse(0.000590)
    time.sleep(0.000590)


def send(command):
    print 'sending:', command
    parts = command.split('/')
    if len(parts) != 2:
        return 'invalid command: ' + command

    component, cmd = parts
    if component not in CODES:
        return 'unknown component: ' + component

    if cmd not in CODES[component]:
        return 'unknown command: ' + cmd

    code = CODES[component][cmd]
    CALLBACKS[component](code)
    return 'OK'


app = Flask(__name__)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def handle_command(path):
    command = path.lstrip('/')
    return send(command)


def main():
    set_led('0x00ff00')
    fast_gpio('set-output', IR_PIN)
    app.run(host='0.0.0.0', debug=False)


CALLBACKS = dict(tv=send_samsung, preamp=send_nec)


CODES = {
    # Samsung UN32EH5300
    'tv': {
        'power':   'E0E040BF',
        'up':      'E0E006F9',
        'down':    'E0E08679',
        'select':  'E0E016E9',
        'source':  'E0E0807F',
        'left':    'E0E0A659',
        'right':   'E0E046B9',
        'return':  'E0E01AE5',
        'exit':    'E0E0B44B',
        'tools':   'E0E0D22D',
        'menu':    'E0E058A7',
        'smart':   'E0E09E61',
        'volup':   'E0E0E01F',
        'voldown': 'E0E0D02F',
        'mute':    'E0E0F00F',
        'chup':    'E0E048B7',
        'chdown':  'E0E008F7',
    },

    # Emotiva XDA-2
    'preamp': {
        'on':       '60FF11EE',
        'off':      '60FF916E',
        'mute':     '60FFA15E',
        'dim':      '60FF21DE',
        'up':       '60FF936C',
        'down':     '60FFA35C',
        'usb':      '60FF13EC',
        'aes':      '60FF619E',
        'opt1':     '60FF51AE',
        'opt2':     '60FFD12E',
        'coaxial1': '60FF23DC',
        'coaxial2': '60FFE11E',
        'src':      '60FF639C',
    },
}


if __name__ == '__main__':
    main()
