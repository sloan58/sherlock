#!/usr/bin/env python3

from pprint import pprint

from netmiko import ConnectHandler

# IOS
device = {"host": "10.134.11.54", "username": "idceng", "password": "1dc3ng", "device_type": "cisco_ios"}
# NXOS
# device = {"host": "10.134.17.26", "username": "idceng", "password": "1dc3ng", "device_type": "cisco_nxos"}

command = "show mac address-table"
use_textfsm = True

with ConnectHandler(**device) as net_connect:
    output = net_connect.send_command(command, use_textfsm=use_textfsm, read_timeout=60)
    pprint(output)
