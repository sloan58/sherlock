#!/usr/bin/env python3

import sys
import json
import logging
from manuf import manuf
import os

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(__file__), 'logs', 'mac_lookup_debug.log')),
        logging.StreamHandler(sys.stderr)
    ]
)

def main():
    try:
        # Read JSON input from stdin
        raw_input = sys.stdin.read()
        logging.debug(f"Raw input received: {raw_input}")

        input_data = json.loads(raw_input)
        logging.debug(f"Parsed input data: {json.dumps(input_data, indent=2)}")

        # Initialize MAC parser
        parser = manuf.MacParser()

        # Get MAC address from input
        mac_address = input_data.get('mac_address')
        if not mac_address:
            raise ValueError("MAC address is required")

        logging.debug(f"Looking up MAC address: {mac_address}")

        # Get manufacturer info
        vendor = parser.get_all(mac_address)

        # Prepare response
        response = {
            'manufacturer': vendor.manuf if vendor else None,
            'comment': vendor.comment if vendor else None
        }

        logging.debug(f"Lookup result: {json.dumps(response, indent=2)}")

        # Convert to JSON and print to stdout
        print(json.dumps(response))

    except json.JSONDecodeError as e:
        logging.error(f"JSON decode error: {str(e)}")
        print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
        sys.exit(1)
    except ValueError as e:
        logging.error(f"Validation error: {str(e)}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    # Ensure logs directory exists
    os.makedirs(os.path.join(os.path.dirname(__file__), 'logs'), exist_ok=True)
    main()
