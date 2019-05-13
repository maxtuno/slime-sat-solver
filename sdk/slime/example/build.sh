#!/usr/bin/env bash
rm -r build
mkdir build
cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
make
cd ../bin
./mini_slime hard-3SAT-04.cnf