#!/usr/bin/env python

import sys
from flask import Flask


HTTP_PORT = 5000
SERIAL_PORT = '/dev/ttyACM0'


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

    mode = MODES[component]
    code = CODES[component][cmd]

    f = open(SERIAL_PORT, 'wb')
    f.write('{}\n{}\n'.format(mode, code))
    answer = ''
    for line in f:
        if line.strip() == 'end':
            break
        answer += line + '\n'
    f.close()
    return answer


app = Flask(__name__)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def handle_command(path):
    command = path.lstrip('/')
    return send(command)


def main():
    app.run(host='0.0.0.0', debug=True)


MODES = {
    'tv':     'samsuung',
    'preamp': 'rc5',
}


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
