#!/usr/bin/env python3
"""Run the receiver's built-in local shadow checks."""

import json

import receiver


print(json.dumps(receiver.self_test()))
