#!/usr/bin/env bash
echo
echo "Welcome to compilation and local installation of SLIME SAT Solver and SLIME SDK by http://www.peqnp.science"
echo
echo "(in some UNIX Based Systems need sudo)"
echo
read -p "Press any key to continue"
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
cp bin/slime_cli /usr/local/bin/slime
rm -r ../sdk
mkdir sdk
mkdir sdk/slime
cp -r include sdk/slime/include
cp -r mtl sdk/slime/include/mtl
cp -r example sdk/slime/example
mkdir sdk/slime/lib
cp lib/libslime.a sdk/slime/lib/libslime.a
mv sdk ../sdk
echo
echo "Testing..."
echo
time slime ../test/test.cnf
time slime ../test/unsat.cnf -drup-file=proof.out
echo
echo "SLIME Help:"
echo "usage: slime <cnf-file> [-drup-file=<unsat-proof-file>] (> [<sat-model-file>])"
echo
echo "DONE..."
echo
echo "Have Fun!"