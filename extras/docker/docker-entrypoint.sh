#!/bin/bash

source entrypoint-common.sh

check_url "http://idm:3000" ".*"
check_url "http://authzforce:8080" ".*"
check_url "http://orion:1026" ".*"

node server.js
