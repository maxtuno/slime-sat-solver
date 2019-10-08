/*****************************************************************************************[Main.cc]
SLIME SO -- Copyright (c) 2019, Oscar Riveros, oscar.riveros@peqnp.science, Santiago, Chile. https://maxtuno.github.io/slime-sat-solver

All technology of SLIME SO that make this software Self Optimized is property of Oscar Riveros, oscar.riveros@peqnp.science, Santiago, Chile,
It can be used for commercial or private purposes, as long as the condition of mentioning explicitly
"This project use technology property of Oscar Riveros Founder and CEO of www.PEQNP.science".

Any use that violates this clause is considered illegal.

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.
**************************************************************************************************/

#include <Dimacs.h>
#include <SimpSolver.h>
#include <SolverTypes.h>
#include <iostream>
#include <vector>
#include <cmath>
#include <ctime>

#define DRAT // Generate unsat proof.

using namespace SLIME;

#if _WIN32 || _WIN64
void printHeader() {
    printf("c                                                \n");
    printf("c SLIME SO SAT Solver by http://www.peqnp.science\n");
    printf("c                                                \n");
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

    if (argc > 3) {
        S.drup_file = fopen(argv[3], "wb");
    }

    FILE *in = fopen(argv[1], "r");
    if (in == NULL) {
        std::cout << "c ERROR! Could not open file: " << argv[1] << std::endl;
        return EXIT_FAILURE;
    }
    parse_DIMACS(in, S);
    fclose(in);

    vec<Lit> assumptions;

    S.eliminate();

    lbool result;
    double global = INT64_MAX;
    clock_t before = clock();
    double var_decay = 0, clause_decay = 0, opt_step_size = 0, opt_step_size_dec = 0, opt_min_step_size = 0, opt_restart_inc = 0;
    long opt_chrono = 0, chrono_backtrack = 0, opt_restart_first = 0, trigger = 0; // , opt_grow = 0;
    /*****************************************************************************************[Main.cc]
    SLIME SO -- Copyright (c) 2019, Oscar Riveros, oscar.riveros@peqnp.science, Santiago, Chile. https://maxtuno.github.io/slime-sat-solver

    All technology of SLIME SO that make this software Self Optimized is property of Oscar Riveros, oscar.riveros@peqnp.science, Santiago, Chile,
    It can be used for commercial or private purposes, as long as the condition of mentioning explicitly
    "This project use technology property of Oscar Riveros Founder and CEO of www.PEQNP.science".

    Any use that violates this clause is considered illegal.

    The above copyright notice and this permission notice shall be included
    in all copies or substantial portions of the Software.
    **************************************************************************************************/
    S.trigger = 0;
    for (;;) {
        S.complexity = 0;
        S.opt_step_size += 0.0001;
        result = S.solveLimited(assumptions, true);
        if (result != l_Undef) {
            break;
        }
        if (S.score < global) {
            global = S.score;
            printf("\nc score = %lf\n", global);
            trigger = S.trigger;
            // S.grow = opt_grow;
            opt_step_size = S.opt_step_size;
            opt_step_size_dec = S.opt_step_size_dec;
            opt_min_step_size = S.opt_min_step_size;
            var_decay = S.var_decay;
            clause_decay = S.clause_decay;
            opt_chrono = S.opt_chrono;
            chrono_backtrack = S.chrono_backtrack;
            opt_restart_first = S.opt_restart_first;
            opt_restart_inc = S.opt_restart_inc;
            if (S.score == 0) {
                break;
            }
            S.lm = 0;
            before = clock();
        } else if (S.score > global) {
            S.opt_step_size -= 0.0001;
        }

        S.complexity = 0;
        S.opt_step_size_dec += 0.0001;
        result = S.solveLimited(assumptions, true);
        if (result != l_Undef) {
            break;
        }
        if (S.score < global) {
            global = S.score;
            printf("\nc score = %lf\n", global);
            trigger = S.trigger;
            // S.grow = opt_grow;
            opt_step_size = S.opt_step_size;
            opt_step_size_dec = S.opt_step_size_dec;
            opt_min_step_size = S.opt_min_step_size;
            var_decay = S.var_decay;
            clause_decay = S.clause_decay;
            opt_chrono = S.opt_chrono;
            chrono_backtrack = S.chrono_backtrack;
            opt_restart_first = S.opt_restart_first;
            opt_restart_inc = S.opt_restart_inc;
            if (S.score == 0) {
                break;
            }
            S.lm = 0;
            before = clock();
        } else if (S.score > global) {
            S.opt_step_size_dec -= 0.0001;
        }

        S.complexity = 0;
        S.opt_min_step_size += 0.0001;
        result = S.solveLimited(assumptions, true);
        if (result != l_Undef) {
            break;
        }
        if (S.score < global) {
            global = S.score;
            printf("\nc score = %lf\n", global);
            trigger = S.trigger;
            // S.grow = opt_grow;
            opt_step_size = S.opt_step_size;
            opt_step_size_dec = S.opt_step_size_dec;
            opt_min_step_size = S.opt_min_step_size;
            var_decay = S.var_decay;
            clause_decay = S.clause_decay;
            opt_chrono = S.opt_chrono;
            chrono_backtrack = S.chrono_backtrack;
            opt_restart_first = S.opt_restart_first;
            opt_restart_inc = S.opt_restart_inc;
            if (S.score == 0) {
                break;
            }
            S.lm = 0;
            before = clock();
        } else if (S.score > global) {
            S.opt_min_step_size -= 0.0001;
        }

        S.complexity = 0;
        S.var_decay += 0.0001;
        result = S.solveLimited(assumptions, true);
        if (result != l_Undef) {
            break;
        }
        if (S.score < global) {
            global = S.score;
            printf("\nc score = %lf\n", global);
            trigger = S.trigger;
            // S.grow = opt_grow;
            opt_step_size = S.opt_step_size;
            opt_step_size_dec = S.opt_step_size_dec;
            opt_min_step_size = S.opt_min_step_size;
            var_decay = S.var_decay;
            clause_decay = S.clause_decay;
            opt_chrono = S.opt_chrono;
            chrono_backtrack = S.chrono_backtrack;
            opt_restart_first = S.opt_restart_first;
            opt_restart_inc = S.opt_restart_inc;
            if (S.score == 0) {
                break;
            }
            S.lm = 0;
            before = clock();
        } else if (S.score > global) {
            S.var_decay -= 0.0001;
        }

        S.complexity = 0;
        S.clause_decay += 0.0001;
        result = S.solveLimited(assumptions, true);
        if (result != l_Undef) {
            break;
        }
        if (S.score < global) {
            global = S.score;
            printf("\nc score = %lf\n", global);
            trigger = S.trigger;
            // S.grow = opt_grow;
            opt_step_size = S.opt_step_size;
            opt_step_size_dec = S.opt_step_size_dec;
            opt_min_step_size = S.opt_min_step_size;
            var_decay = S.var_decay;
            clause_decay = S.clause_decay;
            opt_chrono = S.opt_chrono;
            chrono_backtrack = S.chrono_backtrack;
            opt_restart_first = S.opt_restart_first;
            opt_restart_inc = S.opt_restart_inc;
            if (S.score == 0) {
                break;
            }
            S.lm = 0;
            before = clock();
        } else if (S.score > global) {
            S.clause_decay -= 0.0001;
        }

        S.complexity = 0;
        S.opt_chrono += 1;
        result = S.solveLimited(assumptions, true);
        if (result != l_Undef) {
            break;
        }
        if (S.score < global) {
            global = S.score;
            printf("\nc score = %lf\n", global);
            trigger = S.trigger;
            // S.grow = opt_grow;
            opt_step_size = S.opt_step_size;
            opt_step_size_dec = S.opt_step_size_dec;
            opt_min_step_size = S.opt_min_step_size;
            var_decay = S.var_decay;
            clause_decay = S.clause_decay;
            opt_chrono = S.opt_chrono;
            chrono_backtrack = S.chrono_backtrack;
            opt_restart_first = S.opt_restart_first;
            opt_restart_inc = S.opt_restart_inc;
            if (S.score == 0) {
                break;
            }
            S.lm = 0;
            before = clock();
        } else if (S.score > global) {
            S.opt_chrono -= 1;
        }

        S.complexity = 0;
        S.chrono_backtrack += 1;
        result = S.solveLimited(assumptions, true);
        if (result != l_Undef) {
            break;
        }
        if (S.score < global) {
            global = S.score;
            printf("\nc score = %lf\n", global);
            trigger = S.trigger;
            // S.grow = opt_grow;
            opt_step_size = S.opt_step_size;
            opt_step_size_dec = S.opt_step_size_dec;
            opt_min_step_size = S.opt_min_step_size;
            var_decay = S.var_decay;
            clause_decay = S.clause_decay;
            opt_chrono = S.opt_chrono;
            chrono_backtrack = S.chrono_backtrack;
            opt_restart_first = S.opt_restart_first;
            opt_restart_inc = S.opt_restart_inc;
            if (S.score == 0) {
                break;
            }
            S.lm = 0;
            before = clock();
        } else if (S.score > global) {
            S.chrono_backtrack -= 1;
        }

        S.complexity = 0;
        S.opt_restart_inc += 1;
        result = S.solveLimited(assumptions, true);
        if (result != l_Undef) {
            break;
        }
        if (S.score < global) {
            global = S.score;
            printf("\nc score = %lf\n", global);
            trigger = S.trigger;
            // S.grow = opt_grow;
            opt_step_size = S.opt_step_size;
            opt_step_size_dec = S.opt_step_size_dec;
            opt_min_step_size = S.opt_min_step_size;
            var_decay = S.var_decay;
            clause_decay = S.clause_decay;
            opt_chrono = S.opt_chrono;
            chrono_backtrack = S.chrono_backtrack;
            opt_restart_first = S.opt_restart_first;
            opt_restart_inc = S.opt_restart_inc;
            if (S.score == 0) {
                break;
            }
            S.lm = 0;
            before = clock();
        } else if (S.score > global) {
            S.opt_restart_inc -= 1;
        }

        S.complexity = 0;
        S.opt_restart_first += 1;
        result = S.solveLimited(assumptions, true);
        if (result != l_Undef) {
            break;
        }
        if (S.score < global) {
            global = S.score;
            printf("\nc score = %lf\n", global);
            trigger = S.trigger;
            // S.grow = opt_grow;
            opt_step_size = S.opt_step_size;
            opt_step_size_dec = S.opt_step_size_dec;
            opt_min_step_size = S.opt_min_step_size;
            var_decay = S.var_decay;
            clause_decay = S.clause_decay;
            opt_chrono = S.opt_chrono;
            chrono_backtrack = S.chrono_backtrack;
            opt_restart_first = S.opt_restart_first;
            opt_restart_inc = S.opt_restart_inc;
            if (S.score == 0) {
                break;
            }
            S.lm = 0;
            before = clock();
        } else if (S.score > global) {
            S.opt_restart_first -= 1;
        }

        S.complexity = 0;
        S.grow += 1;
        result = S.solveLimited(assumptions, true);
        if (result != l_Undef) {
            break;
        }
        if (S.score < global) {
            global = S.score;
            printf("\nc score = %lf\n", global);
            trigger = S.trigger;
            // S.grow = opt_grow;
            opt_step_size = S.opt_step_size;
            opt_step_size_dec = S.opt_step_size_dec;
            opt_min_step_size = S.opt_min_step_size;
            var_decay = S.var_decay;
            clause_decay = S.clause_decay;
            opt_chrono = S.opt_chrono;
            chrono_backtrack = S.chrono_backtrack;
            opt_restart_first = S.opt_restart_first;
            opt_restart_inc = S.opt_restart_inc;
            if (S.score == 0) {
                break;
            }
            S.lm = 0;
            before = clock();
        } else if (S.score > global) {
            S.grow -= 1;
        }

        S.lm++;
        S.trigger++;
        clock_t difference = clock() - before;
        if (difference * 1000 / CLOCKS_PER_SEC > 10000) {
            break;
        }
    }
    printf("\nc go!\n");
    S.trigger = trigger;
    // S.grow = opt_grow;
    S.opt_step_size = opt_step_size;
    S.opt_step_size_dec = opt_step_size_dec;
    S.opt_min_step_size = opt_min_step_size;
    S.var_decay = var_decay;
    S.clause_decay = clause_decay;
    S.opt_chrono = opt_chrono;
    S.chrono_backtrack = chrono_backtrack;
    S.opt_restart_first = opt_restart_first;
    S.opt_restart_inc = opt_restart_inc;
    S.lm = -1;
    if (result == l_Undef) {
        result = S.solveLimited(assumptions, true);
    }
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
    exit(result == l_True ? 10 : result == l_False ? 20 : 0);
}

