"Thanks to the support of www.starexec.org SLIME is today the most advanced SAT Solver on the planet."
"Thank you very much to the SLIME Team and to all who participate in this colossal task of breaking the hand to Intractability."
"The greatest triumph of the human mind will be when against all theory we lived in a world where all NP-Complete problems can be solved regardless of whether P = NP." - Oscar Riveros

SLIME CLI & SLIME CLOUD 
Currently the best sat solver, several light years around.
https://github.com/maxtuno/slime-sat-solver/tree/master/SLIME_CLI/

SLIME 5 Cloud: A Free Massive World Class High Performance SAT Solver.
https://maxtuno.github.io/slime-sat-solver/
https://github.com/maxtuno/slime-sat-solver/tree/master/SLIME5-binary

Mathematical Solver
https://www.peqnp.com

SLIME 4 win 3rd place on Cloud Track from SAT Competition 2020 
https://satcompetition.github.io/2020/index.html.

SLIME SOLVED (Status) UNKNOWN INSTANCES
https://github.com/maxtuno/SLIME_SOLVED_UNKNOWN_INSTANCES

NOTE: This repository is the development version, for official releases go to https://github.com/maxtuno/slime-sat-solver/releases

SLIME 3.1.1
- Maintenance Update.
- SLIME vs The Winners of the SAT Race 2019. (https://maxtuno.github.io/slime-sat-solver)
solver 				config 		SAT-VERIFIED 		UNKNOWN 		UNSAT
CaDiCaL 			default 	80 / 34762.8330 	95 / 171003.8300 	25 / 14057.7858
SLIME 3.1.1 			default 	82 / 43255.9017 	91 / 163804.3300 	27 / 16173.2391
MapleLCMDiscChronoBT-DL-v3 	default 	80 / 39363.0743 	91 / 163804.0300 	29 / 16442.0995

SLIME 3.1
- Support long term executions without overflow on counters and variables.
- The State of The Art Performance.

SLIME 3.0
- Implementation of Alternating Dual BOOST Heuristic
- The State of The Art Performance.

----------------------------------------------------------------------------------------------------

NOTE: Use SLIME 2.0 for Full Performance (https://github.com/maxtuno/slime-sat-solver/releases)

SLIME 2.2:

- Windows support - include a precompiled executable
- 2.0 performance 
- usage: slime_cli <cnf-file> [<sat-model-file>] [<unsat-proof-file>]

SLIME 2.1:

- Extreme Simplification of Unecesarily Components
- Remove ZLIB dependency now full "-ansi" C++ code.
- 2.0 Performance
- Full Raspbian Compatibility

build on macOS and Linux:
sh build.sh

build on windows with MinGW-w64:
cd slime
x86_64-w64-mingw32-g++ -std=c++11 -O3 -I./include -I./ src/*.cc -o bin/slime_cli-w64 -D __STDC_LIMIT_MACROS -D __STDC_FORMAT_MACROS -D LOG -static
(slime_cli-w64.exe.zip contains an windows executable compiled on macOS with MinGW-w64 and tested with Wine)

----------------------------------------------------------------------------------------------------

SLIME 2.0: A Free World Class High Performance SAT Solver

SAT Race 2015

v1.0 PAR-2 605079.2646
v2.0 PAR-2 591812.0663

(The solvers will ranked using the PAR-2 scheme: The score of a solver is defined as the sum of all runtimes for solved instances + 2*timeout for unsolved instances, lowest score wins.) 

https://maxtuno.github.io/slime-sat-solver

----------------------------------------------------------------------------------------------------

SLIME: A Minimal Heuristic to Boost SAT Solving (PEQNP - http://www.peqnp.science) https://github.com/maxtuno/slime-sat-solver

On CDCL Based SAT Solvers the trail size is strictly related to progress or to the total conflicts on the current assignment,
such that if the trail size is the same that the number of variables, then current assignment is valid.

On the other hand, in the selection of the current variable it is necessary to assign a predetermined polarity to the resulting literal, which in most implementations is a predefined value.

SLIME implement a simple heuristic with minimal complexity, that correlated the trail size and the polarity of the current variable to assign.

The selection of variable is not related to trail size, this decouple the both concepts.
