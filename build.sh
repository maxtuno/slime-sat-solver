#!/usr/bin/env bash
echo
echo "Welcome to compilation and local installation of SLIME 2.1 SAT Solver"
echo
echo "(in some UNIX Based Systems need sudo)"
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
time slime_cli ../test/test.cnf
time slime_cli ../test/unsat.cnf -drup-file=../test/proof.out
echo
echo "SLIME Help:"
echo "usage: slime_cli <cnf-file> [-drup-file=<unsat-proof-file>] (> [<sat-model-file>])"
echo
echo "DONE..."
echo
echo "Have Fun!"