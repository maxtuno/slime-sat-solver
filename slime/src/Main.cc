/*****************************************************************************************[Main.cc]
SLIME SO -- Copyright (c) 2019, Oscar Riveros, oscar.riveros@peqnp.science, Santiago, Chile. https://maxtuno.github.io/slime-sat-solver

All technology of SLIME SO that make this software Self Optimized is property of Oscar Riveros, oscar.riveros@peqnp.science, Santiago, Chile,
It can be used for commercial or private purposes, as int as the condition of mentioning explicitly
"This project use technology property of Oscar Riveros Founder of www.PEQNP.science".

Any use that violates this clause is considered illegal.

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.
**************************************************************************************************/

#include <Dimacs.h>
#include <SimpSolver.h>
#include <SolverTypes.h>
#include <cfloat>
#include <cmath>
#include <iostream>

using namespace SLIME;

#if _WIN32 || _WIN64
void printHeader() {
    printf("c                                                 \n");
    printf("c SLIME SO+ SAT Solver by http://www.peqnp.science\n");
    printf("c                                                 \n");
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

lbool slime(int argc, char *argv[]) {
    SimpSolver S;

    if (argc > 3) {
        S.drup_file = fopen(argv[3], "wb");
    }

    FILE *in = fopen(argv[1], "r");
    if (in == NULL) {
        std::cout << "c ERROR! Could not open file: " << argv[1] << std::endl;
        return l_Undef;
    }
    parse_DIMACS(in, S);
    fclose(in);

    vec<Lit> assumptions;

    S.parsing = 0;
    S.eliminate(true);
    if (!S.okay()) {
        if (S.drup_file != NULL)
            fprintf(S.drup_file, "0\n"), fclose(S.drup_file);
        printf("s UNSATISFIABLE\n");
        exit(20);
    }

    double score = DBL_MAX, var_decay = 0, clause_decay = 0;
    int restart_first = 0, restart_inc = 0, weight = 0;
    lbool result;
next:
    S.log = false;
    for (;;) {
        S.complexity = 0;
        S.var_decay += 0.0001;
        result = S.solveLimited(assumptions, true);
        if (result != l_Undef) {
            break;
        }
        if (S.score < score) {
            score = S.score;
            var_decay = S.var_decay;
            clause_decay = S.clause_decay;
            restart_first = S.restart_first;
            restart_inc = S.restart_inc;
            printf("c %lf\n", score);
            weight++;
        } else if (S.score > score) {
            S.var_decay -= 0.0001;
        }

        S.complexity = 0;
        S.clause_decay += 0.0001;
        result = S.solveLimited(assumptions, true);
        if (result != l_Undef) {
            break;
        }
        if (S.score < score) {
            score = S.score;
            var_decay = S.var_decay;
            clause_decay = S.clause_decay;
            restart_first = S.restart_first;
            restart_inc = S.restart_inc;
            printf("c %lf\n", score);
            weight++;
        } else if (S.score > score) {
            S.clause_decay -= 0.0001;
        }

        S.complexity = 0;
        S.restart_first += 1;
        result = S.solveLimited(assumptions, true);
        if (result != l_Undef) {
            break;
        }
        if (S.score < score) {
            score = S.score;
            var_decay = S.var_decay;
            clause_decay = S.clause_decay;
            restart_first = S.restart_first;
            restart_inc = S.restart_inc;
            printf("c %lf\n", score);
            weight++;
        } else if (S.score > score) {
            S.restart_first -= 1;
        }

        S.complexity = 0;
        S.restart_inc += 1;
        result = S.solveLimited(assumptions, true);
        if (result != l_Undef) {
            break;
        }
        if (S.score < score) {
            score = S.score;
            var_decay = S.var_decay;
            clause_decay = S.clause_decay;
            restart_first = S.restart_first;
            restart_inc = S.restart_inc;
            printf("c %lf\n", score);
            weight++;
        } else if (S.score > score) {
            S.restart_inc -= 1;
        }
        S.lm++;
        if (S.lm > weight * (S.nClauses() / S.nVars())) {
            break;
        }
    }
    if (result == l_Undef) {
        S.log = true;
        S.lm = -1;
        S.global = 0;
        S.var_decay = var_decay;
        S.clause_decay = clause_decay;
        S.restart_first = restart_first;
        S.restart_inc = restart_inc;
        result = S.solveLimited(assumptions, true);
        if (result == l_Undef) {
            goto next;
        }
        printf("\n");
    }
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
        if (result == l_True) {
            FILE *model = fopen(argv[2], "w");
            fprintf(model, result == l_True ? "SAT\n" : result == l_False ? "UNSAT\n" : "UNKNOWN\n");
            for (long i = 0; i < S.nVars(); i++)
                if (S.model[i] != l_Undef) {
                    fprintf(model, "%s%s%ld", (i == 0) ? "" : " ", (S.model[i] == l_True) ? "" : "-", i + 1);
                }
            fprintf(model, " 0\n");
        }
    }
    return result;
}

int main(int argc, char *argv[]) {
    printHeader();
    lbool result = slime(argc, argv);
    exit(result == l_True ? 10 : result == l_False ? 20 : 0);
}
