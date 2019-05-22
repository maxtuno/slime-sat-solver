#!/usr/bin/env bash
echo
echo "c                                         "
echo "c   ██████  ██▓     ██▓ ███▄ ▄███▓▓█████  "
echo "c ▒██    ▒ ▓██▒    ▓██▒▓██▒▀█▀ ██▒▓█   ▀  "
echo "c ░ ▓██▄   ▒██░    ▒██▒▓██    ▓██░▒███    "
echo "c   ▒   ██▒▒██░    ░██░▒██    ▒██ ▒▓█  ▄  "
echo "c ▒██████▒▒░██████▒░██░▒██▒   ░██▒░▒████▒ "
echo "c ▒ ▒▓▒ ▒ ░░ ▒░▓  ░░▓  ░ ▒░   ░  ░░░ ▒░ ░ "
echo "c ░ ░▒  ░ ░░ ░ ▒  ░ ▒ ░░  ░      ░ ░ ░  ░ "
echo "c ░  ░  ░    ░ ░    ▒ ░░      ░      ░    "
echo "c       ░      ░  ░ ░         ░      ░  ░ "
echo "c                                         "
echo "c        http://www.peqnp.science         "
echo "c                                         "
echo
echo "Welcome to compilation of SLIME 2.2 SAT Solver"
echo
echo "Building..."
echo
cd slime
sh starexec_clean
sh starexec_build
sh starexec_clean
echo "Testing..."
echo
cd bin
./slime_cli test.cnf test.model test.proof
echo
echo "SLIME Help:"
echo "usage: slime_cli <cnf-file> [<sat-model-file>] [<unsat-proof-file>]"
echo
echo "DONE..."
echo
echo "Have Fun!"