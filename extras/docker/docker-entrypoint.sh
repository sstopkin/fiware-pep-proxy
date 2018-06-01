#!/bin/bash

source entrypoint-common.sh

check_url "http://${IDM_URL:-idm}:3000" ".*"
check_url "http://${AUTHZFORCE_URL:-authzforce}:8080" ".*"
check_url "http://${SERVICE_URL}:${SERVICE_PORT}" ".*"

node server.js
