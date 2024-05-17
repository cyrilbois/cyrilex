#!/usr/bin/python

import re
import json
import sys

print ("Content-type: application/json\n\n")

input = json.loads(sys.stdin.read())

# input = json.loads("{\"pattern\":\"(XP[a-z]th)|(JSONPath)\",\"subject\":\"Online XPath xPath tester!\",\"flags\":\"gusx\",\"substitution\":\"Regular expression\"}")

flags = 0

if "i" in input['flags']:
    flags = flags | re.IGNORECASE

if "m" in input['flags']:
    flags = flags | re.MULTILINE

if "u" in input['flags']:
    flags = flags | re.UNICODE

if "s" in input['flags']:
    flags = flags | re.DOTALL

if "l" in input['flags']:
    flags = flags | re.LOCALE

if "x" in input['flags']:
    flags = flags | re.VERBOSE

p = re.compile(input['pattern'], flags)

response = {
    "infinity": False,
    "matchArray": [],
    "substitution": None
}

count = 1
if "g" in input['flags']:
    count = 0

response['substitution'] = re.sub(
    input['pattern'], input['substitution'], input['subject'], count, flags)

if "g" in input['flags']:
    for m in p.finditer(input['subject']):
        m = {
                "index": m.start(),
                "m": m.group()
            }
        response['matchArray'].append(m)
else:
    m = re.search(input['pattern'], input['subject'], flags)
    if m:
        m = {
                "index": m.start(),
                "m": m.group()
            }
        response['matchArray'].append(m)

resp = json.dumps(response)

print (resp)
