#!/usr/bin/env bash
mpirun -q -np 4 --allow-run-as-root ./slime_cloud_competitive "${1}" # "${2}"
pkill slime_cloud