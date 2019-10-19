#!/usr/bin/env bash
echo
echo "SLIME 3.1.1: A Free World Class High Performance SAT Solver by http://www.peqnp.science."
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
echo "usage: slime_cli <cnf-file> [<sat-model-file> [<unsat-proof-file>]]"
echo
echo "DONE..."
echo
echo "Thanks to the support of www.starexec.org SLIME is today the most advanced SAT Solver on the planet."
echo
echo "Have Fun!"
