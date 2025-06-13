#!/usr/bin/env python3

import sys
import json
import logging
import os
from CiscoInterfaceNameConverter import converter
from netmiko import ConnectHandler, NetmikoAuthenticationException, NetmikoTimeoutException

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(__file__), 'logs', 'netmiko_command_debug.log')),
        logging.StreamHandler(sys.stderr)
    ]
)

def main():
    try:
        raw_input = sys.stdin.read()
        logging.debug(f"Raw input received: {raw_input}")

        input_data = json.loads(raw_input)
        logging.debug(f"Parsed input data: {json.dumps(input_data, indent=2)}")

        # Extract device and command
        device = input_data.get('device')
        command = input_data.get('command')
        use_textfsm = input_data.get('use_textfsm', True)

        if not device or not command:
            raise ValueError("Both 'device' and 'command' fields are required.")

        logging.info(f"Connecting to {device.get('host')} and running: {command}")

        with ConnectHandler(**device) as net_connect:
            output = net_connect.send_command(command, use_textfsm=use_textfsm, read_timeout=60)
            if command == 'show interface':
                for key, interface in enumerate(output):
                    output[key]['interface_short'] = converter.convert_interface(
                    interface_name=interface['interface'],
                    return_short=True
                    )
            logging.debug(f"Command output: {json.dumps(output, indent=2)}")
            print(json.dumps(output))

    except NetmikoTimeoutException:
            logging.error("Connection timed out")
            print(json.dumps({"error": "Connection timed out"}))
            sys.exit(1)
    except NetmikoAuthenticationException:
        logging.error("Authentication failed")
        print(json.dumps({"error": "Authentication failed"}))
        sys.exit(1)
    except json.JSONDecodeError as e:
        logging.error(f"JSON decode error: {str(e)}")
        print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
        sys.exit(1)
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    # Ensure logs directory exists
    os.makedirs(os.path.join(os.path.dirname(__file__), 'logs'), exist_ok=True)
    main()
