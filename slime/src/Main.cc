/*****************************************************************************************[Main.cc]
SLIME -- Copyright (c) 2019, Oscar Riveros, oscar.riveros@peqnp.science, Santiago, Chile.

https://maxtuno.github.io/slime-sat-solver

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

#include <Dimacs.h>
#include <SimpSolver.h>
#include <SolverTypes.h>
#include <iostream>

#define DRAT // Generate unsat proof.

using namespace SLIME;

#if _WIN32 || _WIN64
void printHeader() {
    printf("c                                             \n");
    printf("c SLIME SAT Solver by http://www.peqnp.science\n");
    printf("c                                             \n");
}
#else
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
#endif

int main(int argc, char *argv[]) {
    printHeader();

    SimpSolver S;

#ifdef DRAT
    if (argc > 3) {
        S.drup_file = fopen(argv[3], "wb");
    }
#endif

    FILE *in = fopen(argv[1], "r");
    if (in == NULL) {
        std::cout << "c ERROR! Could not open file: " << argv[1] << std::endl;
        return EXIT_FAILURE;
    }
    parse_DIMACS(in, S);
    fclose(in);

    S.eliminate();

    vec<Lit> assumptions;
    lbool result = S.solveLimited(assumptions);

    printf("\n");

    printf(result == l_True ? "s SATISFIABLE\nv " : result == l_False ? "s UNSATISFIABLE\n" : "s UNKNOWN\n");
    if (result == l_True) {
        for (long i = 0; i < S.nVars(); i++)
            if (S.model[i] != l_Undef) {
                printf("%s%s%ld", (i == 0) ? "" : " ", (S.model[i] == l_True) ? "" : "-", i + 1);
            }
        printf(" 0\n");
    } else {
#ifdef DRAT
        if (argc > 3) {
            fputc('a', S.drup_file);
            fputc(0, S.drup_file);
            fclose(S.drup_file);
        }
#endif
    }

    if (argc > 2) {
        FILE *model = fopen(argv[2], "w");
        fprintf(model, result == l_True ? "SAT\n" : result == l_False ? "UNSAT\n" : "UNKNOWN\n");
        if (result == l_True) {        
            for (long i = 0; i < S.nVars(); i++)
                if (S.model[i] != l_Undef) {
                    fprintf(model, "%s%s%ld", (i == 0) ? "" : " ", (S.model[i] == l_True) ? "" : "-", i + 1);
                }
            fprintf(model, " 0\n");
        }
    }

    exit(result == l_True ? 10 : result == l_False ? 20 : 0);
}
