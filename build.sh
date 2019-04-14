#!/usr/bin/env bash
echo
echo "Welcome to compilation and local installation of SLIME SAT Solver by http://www.peqnp.science"
echo
read -n 1 -s -r -p "Press any key to continue"
echo
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
cp bin/slime_static /usr/local/bin/slime
rm -r /tmp/test
cp -r ../test /tmp/test
echo
echo "Testing..."
echo
time slime /tmp/test/test.cnf
echo
echo "SLIME Help:"
echo "usage: slime <cnf-file> [-drup-file=<unsat-proof-file>] [<sat-model-file>]"
echo
echo "DONE..."
echo
echo "Have Fun!"