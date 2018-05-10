#!/bin/bash

source entrypoint-common.sh

check_host_port idm 3000
check_host_port authzforce 8080
check_host_port orion 1026

node server.js
