DRAT-trim is a satisfiability proof checking and trimming utility designed to validate proofs for all known satisfiability solving and preprocessing techniques.
DRAT-trim can also emit trimmed formulas, optimized proofs, and TraceCheck+ dependency graphs. A system description can be found below.
https://www.cs.utexas.edu/~marijn/drat-trim

Example:

drat-trim unsat.cnf proof.out
c turning on binary mode checking
c parsing input formula with 53 variables and 116 clauses
c finished parsing, read 2051324 bytes from proof file
c detected empty clause; start verification via backward checking
c 116 of 116 clauses in core
c 75539 of 90109 lemmas in core using 1432525 resolution steps
c 0 RAT lemmas in core; 27058 redundant literals in core lemmas
s VERIFIED
c verification time: 4.150 seconds

GRAT -- Efficient Formally Verified SAT Solver Certification Toolchain
https://www21.in.tum.de/~lammich/grat/

Example:

gratchk sat test.cnf test.mod
c Reading cnf
c Reading proof
c Done
c Verifying sat
s VERIFIED SAT

