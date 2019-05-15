/*****************************************************************************************[Main.cc]
SLIME -- Copyright (c) 2019, Oscar Riveros, oscar.riveros@peqnp.science, Santiago, Chile.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**************************************************************************************************/

#include <iostream>
#include <zlib.h>
#include <Dimacs.h>
#include <SimpSolver.h>
#include <SolverTypes.h>

// for UNSAT proof https://www.cs.utexas.edu/~marijn/drat-trim/
// #define DRAT

using namespace SLIME;

void printHeader() {
    printf("c                                         \n");
    printf("c   ██████  ██▓     ██▓ ███▄ ▄███▓▓█████  \n");
    printf("c ▒██    ▒ ▓██▒    ▓██▒▓██▒▀█▀ ██▒▓█   ▀  \n");
    printf("c ░ ▓██▄   ▒██░    ▒██▒▓██    ▓██░▒███    \n");
    printf("c   ▒   ██▒▒██░    ░██░▒██    ▒██ ▒▓█  ▄  \n");
    printf("c ▒██████▒▒░██████▒░██░▒██▒   ░██▒░▒████▒ \n");
    printf("c ▒ ▒▓▒ ▒ ░░ ▒░▓  ░░▓  ░ ▒░   ░  ░░░ ▒░ ░ \n");
    printf("c ░ ░▒  ░ ░░ ░ ▒  ░ ▒ ░░  ░      ░ ░ ░  ░ \n");
    printf("c ░  ░  ░    ░ ░    ▒ ░░      ░      ░    \n");
    printf("c       ░      ░  ░ ░         ░      ░  ░ \n");
    printf("c                                         \n");
    printf("c        http://www.peqnp.science         \n");
    printf("c                                         \n");
}

int main(int argc, char *argv[]) {

    printHeader();

    SimpSolver S;

#ifdef DRAT
    S.drup_file = fopen("proof.out", "wb");
#endif

    gzFile in = gzopen(argv[1], "rb");
    if (in == nullptr) {
        std::cout << "c ERROR! Could not open file: " << argv[1] << std::endl;
        return EXIT_FAILURE;
    }

    parse_DIMACS(in, S);
    gzclose(in);

    vec<Lit> assumptions;
    auto result = S.solveLimited(assumptions);

    if (result == l_True) {
        std::cout << "SAT" << std::endl;
        for (auto i = 0; i < S.nVars(); i++) {
            if (S.model[i] != l_Undef) {
                if (S.model[i] == l_True) {
                    std::cout << +(i + 1) << " ";
                } else {
                    std::cout << -(i + 1) << " ";
                }
            }
        }
        std::cout << " 0" << std::endl;
    } else {
        std::cout << "UNSAT" << std::endl;
#ifdef DRAT
        fputc('a', S.drup_file);
        fputc(0, S.drup_file);
        fclose(S.drup_file);
#endif
    }

    return EXIT_SUCCESS;
}