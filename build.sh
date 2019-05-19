#!/usr/bin/env bash
echo
echo "Welcome to compilation and local installation of SLIME SAT Solver and SLIME SDK by http://www.peqnp.science"
echo
echo "(in some UNIX Based Systems need sudo)"
echo
echo "Building..."
echo
cd slime
sh starexec_clean
sh starexec_build
sh starexec_clean
echo
echo "Installing..."
rm /usr/local/bin/slime
cp bin/slime_cli /usr/local/bin/slime
echo
echo "Testing..."
echo
time slime ../test/test.cnf
time slime ../test/unsat.cnf -drup-file=../test/proof.out
echo
echo "SLIME Help:"
echo "usage: slime <cnf-file> [-drup-file=<unsat-proof-file>] (> [<sat-model-file>])"
echo
echo "DONE..."
echo
echo "Have Fun!"