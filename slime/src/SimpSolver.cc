/***********************************************************************************[SimpSolver.cc]
SLIME -- Copyright (c) 2019, Oscar Riveros, oscar.riveros@peqnp.science, Santiago, Chile. - Implementation of the The Booster Heuristic.

Copyright (c) 2003-2006, Niklas Een, Niklas Sorensson
Copyright (c) 2007,      Niklas Sorensson

Chanseok Oh's MiniSat Patch Series -- Copyright (c) 2015, Chanseok Oh

Maple_LCM, Based on MapleCOMSPS_DRUP -- Copyright (c) 2017, Mao Luo, Chu-Min LI, Fan Xiao: implementing a learnt clause minimisation approach
Reference: M. Luo, C.-M. Li, F. Xiao, F. Manya, and Z. L. , “An effective learnt clause minimization approach for cdcl sat solvers,” in IJCAI-2017, 2017, pp. to–appear.

Maple_LCM_Dist, Based on Maple_LCM -- Copyright (c) 2017, Fan Xiao, Chu-Min LI, Mao Luo: using a new branching heuristic called Distance at the beginning of search


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

#include <math.h>
#include <stdio.h>

#include "SimpSolver.h"
#include "mtl/Sort.h"

using namespace SLIME;

//=================================================================================================
// Options:

static const char *_cat = "SIMP";

static bool opt_use_asymm = false;
static bool opt_use_rcheck = false;
static bool opt_use_elim = true;
static long opt_grow = 0;
static long opt_clause_lim = -1;
static long opt_subsumption_lim = 1000;
static double opt_simp_garbage_frac = 0.5;

//=================================================================================================
// Constructor/Destructor:

SimpSolver::SimpSolver() : parsing(false), grow(opt_grow), clause_lim(opt_clause_lim), subsumption_lim(opt_subsumption_lim), simp_garbage_frac(opt_simp_garbage_frac), use_asymm(opt_use_asymm), use_rcheck(opt_use_rcheck), use_elim(opt_use_elim), merges(0), asymm_lits(0), eliminated_vars(0), elimorder(1), use_simplification(true), occurs(ClauseDeleted(ca)), elim_heap(ElimLt(n_occ)), bwdsub_assigns(0), n_touched(0) {
    vec<Lit> dummy(1, lit_Undef);
    ca.extra_clause_field = true; // NOTE: must happen before allocating the dummy clause below.
    bwdsub_tmpunit = ca.alloc(dummy);
    remove_satisfied = false;
}

SimpSolver::~SimpSolver() {}

Var SimpSolver::newVar(bool sign, bool dvar) {
    Var v = Solver::newVar(sign, dvar);

    frozen.push((char)false);
    eliminated.push((char)false);

    if (use_simplification) {
        n_occ.push(0);
        n_occ.push(0);
        occurs.init(v);
        touched.push(0);
        elim_heap.insert(v);
    }
    return v;
}

lbool SimpSolver::solve_(bool do_simp, bool turn_off_simp) {
    vec<Var> extra_frozen;
    lbool result = l_True;

    do_simp &= use_simplification;

    if (do_simp) {
        // Assumptions must be temporarily frozen to run variable elimination:
        for (long i = 0; i < assumptions.size(); i++) {
            Var v = var(assumptions[i]);

            // If an assumption has been eliminated, remember it.
            assert(!isEliminated(v));

            if (!frozen[v]) {
                // Freeze and store.
                setFrozen(v, true);
                extra_frozen.push(v);
            }
        }

        result = lbool(eliminate(turn_off_simp));
    }

    if (result == l_True)
        result = Solver::solve_();

    if (result == l_True)
        extendModel();

    if (do_simp)
        // Unfreeze the assumptions that were frozen:
        for (long i = 0; i < extra_frozen.size(); i++)
            setFrozen(extra_frozen[i], false);

    return result;
}

bool SimpSolver::addClause_(vec<Lit> &ps) {
#ifndef NDEBUG
    for (long i = 0; i < ps.size(); i++)
        assert(!isEliminated(var(ps[i])));
#endif

    long nclauses = clauses.size();

    if (use_rcheck && implied(ps))
        return true;

    if (!Solver::addClause_(ps))
        return false;

    if (!parsing && drup_file) {
#ifdef BIN_DRUP
        binDRUP('a', ps, drup_file);
#else
        for (long i = 0; i < ps.size(); i++)
            fprintf(drup_file, "%li ", (var(ps[i]) + 1) * (-2 * sign(ps[i]) + 1));
        fprintf(drup_file, "0\n");
#endif
    }

    if (use_simplification && clauses.size() == nclauses + 1) {
        CRef cr = clauses.last();
        const Clause &c = ca[cr];

        // NOTE: the clause is added to the queue immediately and then
        // again during 'gatherTouchedClauses()'. If nothing happens
        // in between, it will only be checked once. Otherwise, it may
        // be checked twice unnecessarily. This is an unfortunate
        // consequence of how backward subsumption is used to mimic
        // forward subsumption.
        subsumption_queue.insert(cr);
        for (long i = 0; i < c.size(); i++) {
            occurs[var(c[i])].push(cr);
            n_occ[toInt(c[i])]++;
            touched[var(c[i])] = 1;
            n_touched++;
            if (elim_heap.inHeap(var(c[i])))
                elim_heap.increase(var(c[i]));
        }
    }

    return true;
}

void SimpSolver::removeClause(CRef cr) {
    const Clause &c = ca[cr];

    if (use_simplification)
        for (long i = 0; i < c.size(); i++) {
            n_occ[toInt(c[i])]--;
            updateElimHeap(var(c[i]));
            occurs.smudge(var(c[i]));
        }

    Solver::removeClause(cr);
}

bool SimpSolver::strengthenClause(CRef cr, Lit l) {
    Clause &c = ca[cr];
    assert(decisionLevel() == 0);
    assert(use_simplification);

    // FIX: this is too inefficient but would be nice to have (properly implemented)
    subsumption_queue.insert(cr);

    if (drup_file) {
#ifdef BIN_DRUP
        binDRUP_strengthen(c, l, drup_file);
#else
        for (long i = 0; i < c.size(); i++)
            if (c[i] != l)
                fprintf(drup_file, "%li ", (var(c[i]) + 1) * (-2 * sign(c[i]) + 1));
        fprintf(drup_file, "0\n");
#endif
    }

    if (c.size() == 2) {
        removeClause(cr);
        c.strengthen(l);
    } else {
        if (drup_file) {
#ifdef BIN_DRUP
            binDRUP('d', c, drup_file);
#else
            fprintf(drup_file, "d ");
            for (long i = 0; i < c.size(); i++)
                fprintf(drup_file, "%li ", (var(c[i]) + 1) * (-2 * sign(c[i]) + 1));
            fprintf(drup_file, "0\n");
#endif
        }

        detachClause(cr, true);
        c.strengthen(l);
        attachClause(cr);
        remove(occurs[var(l)], cr);
        n_occ[toInt(l)]--;
        updateElimHeap(var(l));
    }

    return c.size() == 1 ? enqueue(c[0]) && propagate() == CRef_Undef : true;
}

// Returns FALSE if clause is always satisfied ('out_clause' should not be used).
bool SimpSolver::merge(const Clause &_ps, const Clause &_qs, Var v, vec<Lit> &out_clause) {
    merges++;
    out_clause.clear();

    bool ps_smallest = _ps.size() < _qs.size();
    const Clause &ps = ps_smallest ? _qs : _ps;
    const Clause &qs = ps_smallest ? _ps : _qs;

    for (long i = 0; i < qs.size(); i++) {
        if (var(qs[i]) != v) {
            for (long j = 0; j < ps.size(); j++)
                if (var(ps[j]) == var(qs[i])) {
                    if (ps[j] == ~qs[i]) {
                        return false;
                    } else {
                        goto next;
                    }
                }
            out_clause.push(qs[i]);
        }
    next:;
    }

    for (long i = 0; i < ps.size(); i++)
        if (var(ps[i]) != v)
            out_clause.push(ps[i]);

    return true;
}

// Returns FALSE if clause is always satisfied.
bool SimpSolver::merge(const Clause &_ps, const Clause &_qs, Var v, long &size) {
    merges++;

    bool ps_smallest = _ps.size() < _qs.size();
    const Clause &ps = ps_smallest ? _qs : _ps;
    const Clause &qs = ps_smallest ? _ps : _qs;
    const Lit *__ps = (const Lit *)ps;
    const Lit *__qs = (const Lit *)qs;

    size = ps.size() - 1;

    for (long i = 0; i < qs.size(); i++) {
        if (var(__qs[i]) != v) {
            for (long j = 0; j < ps.size(); j++)
                if (var(__ps[j]) == var(__qs[i])) {
                    if (__ps[j] == ~__qs[i]) {
                        return false;
                    } else {
                        goto next;
                    }
                }
            size++;
        }
    next:;
    }

    return true;
}

void SimpSolver::gatherTouchedClauses() {
    if (n_touched == 0)
        return;

    long i, j;
    for (i = j = 0; i < subsumption_queue.size(); i++)
        if (ca[subsumption_queue[i]].mark() == 0)
            ca[subsumption_queue[i]].mark(2);

    for (i = 0; i < touched.size(); i++)
        if (touched[i]) {
            const vec<CRef> &cs = occurs.lookup(i);
            for (j = 0; j < cs.size(); j++)
                if (ca[cs[j]].mark() == 0) {
                    subsumption_queue.insert(cs[j]);
                    ca[cs[j]].mark(2);
                }
            touched[i] = 0;
        }

    for (i = 0; i < subsumption_queue.size(); i++)
        if (ca[subsumption_queue[i]].mark() == 2)
            ca[subsumption_queue[i]].mark(0);

    n_touched = 0;
}

bool SimpSolver::implied(const vec<Lit> &c) {
    assert(decisionLevel() == 0);

    trail_lim.push(trail.size());
    for (long i = 0; i < c.size(); i++)
        if (value(c[i]) == l_True) {
            cancelUntil(0);
            return true;
        } else if (value(c[i]) != l_False) {
            assert(value(c[i]) == l_Undef);
            uncheckedEnqueue(~c[i]);
        }

    bool result = propagate() != CRef_Undef;
    cancelUntil(0);
    return result;
}

// Backward subsumption + backward subsumption resolution
bool SimpSolver::backwardSubsumptionCheck() {
    long cnt = 0;
    long subsumed = 0;
    long deleted_literals = 0;
    assert(decisionLevel() == 0);

    while (subsumption_queue.size() > 0 || bwdsub_assigns < trail.size()) {

        // Empty subsumption queue and return immediately on user-interrupt:
        if (asynch_interrupt) {
            subsumption_queue.clear();
            bwdsub_assigns = trail.size();
            break;
        }

        // Check top-level assignments by creating a dummy clause and placing it in the queue:
        if (subsumption_queue.size() == 0 && bwdsub_assigns < trail.size()) {
            Lit l = trail[bwdsub_assigns++];
            ca[bwdsub_tmpunit][0] = l;
            ca[bwdsub_tmpunit].calcAbstraction();
            subsumption_queue.insert(bwdsub_tmpunit);
        }

        CRef cr = subsumption_queue.peek();
        subsumption_queue.pop();
        Clause &c = ca[cr];

        if (c.mark())
            continue;

        assert(c.size() > 1 || value(c[0]) == l_True); // Unit-clauses should have been propagated before this point.

        // Find best variable to scan:
        Var best = var(c[0]);
        for (long i = 1; i < c.size(); i++)
            if (occurs[var(c[i])].size() < occurs[best].size())
                best = var(c[i]);

        // Search all candidates:
        vec<CRef> &_cs = occurs.lookup(best);
        CRef *cs = (CRef *)_cs;

        for (long j = 0; j < _cs.size(); j++)
            if (c.mark())
                break;
            else if (!ca[cs[j]].mark() && cs[j] != cr && (subsumption_lim == -1 || ca[cs[j]].size() < subsumption_lim)) {
                Lit l = c.subsumes(ca[cs[j]]);

                if (l == lit_Undef)
                    subsumed++, removeClause(cs[j]);
                else if (l != lit_Error) {
                    deleted_literals++;

                    if (!strengthenClause(cs[j], ~l))
                        return false;

                    // Did current candidate get deleted from cs? Then check candidate at index j again:
                    if (var(l) == best)
                        j--;
                }
            }
    }

    return true;
}

bool SimpSolver::asymm(Var v, CRef cr) {
    Clause &c = ca[cr];
    assert(decisionLevel() == 0);

    if (c.mark() || satisfied(c))
        return true;

    trail_lim.push(trail.size());
    Lit l = lit_Undef;
    for (long i = 0; i < c.size(); i++)
        if (var(c[i]) != v) {
            if (value(c[i]) != l_False)
                uncheckedEnqueue(~c[i]);
        } else
            l = c[i];

    if (propagate() != CRef_Undef) {
        cancelUntil(0);
        asymm_lits++;
        if (!strengthenClause(cr, l))
            return false;
    } else
        cancelUntil(0);

    return true;
}

bool SimpSolver::asymmVar(Var v) {
    assert(use_simplification);

    const vec<CRef> &cls = occurs.lookup(v);

    if (value(v) != l_Undef || cls.size() == 0)
        return true;

    for (long i = 0; i < cls.size(); i++)
        if (!asymm(v, cls[i]))
            return false;

    return backwardSubsumptionCheck();
}

static void mkElimClause(vec<uint32_t> &elimclauses, Lit x) {
    elimclauses.push(toInt(x));
    elimclauses.push(1);
}

static void mkElimClause(vec<uint32_t> &elimclauses, Var v, Clause &c) {
    long first = elimclauses.size();
    long v_pos = -1;

    // Copy clause to elimclauses-vector. Remember position where the
    // variable 'v' occurs:
    for (long i = 0; i < c.size(); i++) {
        elimclauses.push(toInt(c[i]));
        if (var(c[i]) == v)
            v_pos = i + first;
    }
    assert(v_pos != -1);

    // Swap the first literal with the 'v' literal, so that the literal
    // containing 'v' will occur first in the clause:
    uint32_t tmp = elimclauses[v_pos];
    elimclauses[v_pos] = elimclauses[first];
    elimclauses[first] = tmp;

    // Store the length of the clause last:
    elimclauses.push(c.size());
}

bool SimpSolver::eliminateVar(Var v) {
    assert(!frozen[v]);
    assert(!isEliminated(v));
    assert(value(v) == l_Undef);

    // Split the occurrences into positive and negative:
    //
    const vec<CRef> &cls = occurs.lookup(v);
    vec<CRef> pos, neg;
    for (long i = 0; i < cls.size(); i++)
        (find(ca[cls[i]], mkLit(v)) ? pos : neg).push(cls[i]);

    // Check wether the increase in number of clauses stays within the allowed ('grow'). Moreover, no
    // clause must exceed the limit on the maximal clause size (if it is set):
    //
    long cnt = 0;
    long clause_size = 0;

    for (long i = 0; i < pos.size(); i++)
        for (long j = 0; j < neg.size(); j++)
            if (merge(ca[pos[i]], ca[neg[j]], v, clause_size) && (++cnt > cls.size() + grow || (clause_lim != -1 && clause_size > clause_lim)))
                return true;

    // Delete and store old clauses:
    eliminated[v] = true;
    setDecisionVar(v, false);
    eliminated_vars++;

    if (pos.size() > neg.size()) {
        for (long i = 0; i < neg.size(); i++)
            mkElimClause(elimclauses, v, ca[neg[i]]);
        mkElimClause(elimclauses, mkLit(v));
    } else {
        for (long i = 0; i < pos.size(); i++)
            mkElimClause(elimclauses, v, ca[pos[i]]);
        mkElimClause(elimclauses, ~mkLit(v));
    }

    // Produce clauses in cross product:
    vec<Lit> &resolvent = add_tmp;
    for (long i = 0; i < pos.size(); i++)
        for (long j = 0; j < neg.size(); j++)
            if (merge(ca[pos[i]], ca[neg[j]], v, resolvent) && !addClause_(resolvent))
                return false;

    for (long i = 0; i < cls.size(); i++)
        removeClause(cls[i]);

    // Free occurs list for this variable:
    occurs[v].clear(true);

    // Free watchers lists for this variable, if possible:
    watches_bin[mkLit(v)].clear(true);
    watches_bin[~mkLit(v)].clear(true);
    watches[mkLit(v)].clear(true);
    watches[~mkLit(v)].clear(true);

    return backwardSubsumptionCheck();
}

bool SimpSolver::substitute(Var v, Lit x) {
    assert(!frozen[v]);
    assert(!isEliminated(v));
    assert(value(v) == l_Undef);

    if (!ok)
        return false;

    eliminated[v] = true;
    setDecisionVar(v, false);
    const vec<CRef> &cls = occurs.lookup(v);

    vec<Lit> &subst_clause = add_tmp;
    for (long i = 0; i < cls.size(); i++) {
        Clause &c = ca[cls[i]];

        subst_clause.clear();
        for (long j = 0; j < c.size(); j++) {
            Lit p = c[j];
            subst_clause.push(var(p) == v ? x ^ sign(p) : p);
        }

        if (!addClause_(subst_clause))
            return ok = false;

        removeClause(cls[i]);
    }

    return true;
}

void SimpSolver::extendModel() {
    long i, j;
    Lit x;

    for (i = elimclauses.size() - 1; i > 0; i -= j) {
        for (j = elimclauses[i--]; j > 1; j--, i--)
            if (modelValue(toLit(elimclauses[i])) != l_False)
                goto next;

        x = toLit(elimclauses[i]);
        model[var(x)] = lbool(!sign(x));
    next:;
    }
}

// Almost duplicate of Solver::removeSatisfied. Didn't want to make the base method 'virtual'.
void SimpSolver::removeSatisfied() {
    long i, j;
    for (i = j = 0; i < clauses.size(); i++) {
        const Clause &c = ca[clauses[i]];
        if (c.mark() == 0) {
            if (satisfied(c)) {
                removeClause(clauses[i]);
            } else {
                clauses[j++] = clauses[i];
            }
        }
    }
    clauses.shrink(i - j);
}

// The technique and code are by the courtesy of the GlueMiniSat team. Thank you!
// It helps solving certain types of huge problems tremendously.
bool SimpSolver::eliminate(bool turn_off_elim) {
    bool res = true;
    long iter = 0;
    long n_cls, n_cls_init, n_vars;

    if (nVars() == 0)
        goto cleanup; // User disabling preprocessing.

    res = eliminate_(); // The first, usual variable elimination of MiniSat.

    if (!res)
        goto cleanup;

    // Get an initial number of clauses (more accurately).
    if (trail.size() != 0)
        removeSatisfied();

    n_cls_init = nClauses();
    n_cls = nClauses();
    n_vars = nFreeVars();

    printf("c Reduced to %li vars, %li cls (grow=%li)\n", n_vars, n_cls, grow);

    if ((double)n_cls / n_vars >= 10 || n_vars < 1000 || trail.size() == 0) {
        printf("c No iterative elimination performed. (vars=%li, c/v ratio=%.1f)\n", n_vars, (double)n_cls / n_vars);
        goto cleanup;
    }

    grow = grow ? grow * 2 : 8;
    for (; grow < 1000; grow *= 2) {
        // Rebuild elimination variable heap.
        for (long i = 0; i < clauses.size(); i++) {
            const Clause &c = ca[clauses[i]];
            for (long j = 0; j < c.size(); j++)
                if (!elim_heap.inHeap(var(c[j])))
                    elim_heap.insert(var(c[j]));
                else
                    elim_heap.update(var(c[j]));
        }

        long n_cls_last = nClauses();
        long n_vars_last = nFreeVars();

        res = eliminate_();
        if (!res || n_vars_last == nFreeVars())
            break;
        iter++;

        long n_cls_now = nClauses();
        long n_vars_now = nFreeVars();

        double cl_inc_rate = (double)n_cls_now / n_cls_last;
        double var_dec_rate = (double)n_vars_last / n_vars_now;

        if (n_cls_now > n_cls_init || cl_inc_rate > var_dec_rate)
            break;
    }

cleanup:
    touched.clear(true);
    occurs.clear(true);
    n_occ.clear(true);
    elim_heap.clear(true);
    subsumption_queue.clear(true);

    use_simplification = false;
    remove_satisfied = true;
    ca.extra_clause_field = false;

    // Force full cleanup (this is safe and desirable since it only happens once):
    rebuildOrderHeap();
    garbageCollect();

    return res;
}

bool SimpSolver::eliminate_() {
    if (!simplify())
        return false;
    else if (!use_simplification)
        return true;

    long trail_size_last = trail.size();

    // Main simplification loop:
    //
    while (n_touched > 0 || bwdsub_assigns < trail.size() || elim_heap.size() > 0) {

        gatherTouchedClauses();
        // printf("  ## (time = %6.2f s) BWD-SUB: queue = %li, trail = %li\n", cpuTime(), subsumption_queue.size(), trail.size() - bwdsub_assigns);
        if ((subsumption_queue.size() > 0 || bwdsub_assigns < trail.size()) && !backwardSubsumptionCheck()) {
            ok = false;
            goto cleanup;
        }

        // Empty elim_heap and return immediately on user-interrupt:
        if (asynch_interrupt) {
            assert(bwdsub_assigns == trail.size());
            assert(subsumption_queue.size() == 0);
            assert(n_touched == 0);
            elim_heap.clear();
            goto cleanup;
        }

        // printf("  ## (time = %6.2f s) ELIM: vars = %li\n", cpuTime(), elim_heap.size());
        for (long cnt = 0; !elim_heap.empty(); cnt++) {
            Var elim = elim_heap.removeMin();

            if (asynch_interrupt)
                break;

            if (isEliminated(elim) || value(elim) != l_Undef)
                continue;

            if (use_asymm) {
                // Temporarily freeze variable. Otherwise, it would immediately end up on the queue again:
                bool was_frozen = frozen[elim];
                frozen[elim] = true;
                if (!asymmVar(elim)) {
                    ok = false;
                    goto cleanup;
                }
                frozen[elim] = was_frozen;
            }

            // At this point, the variable may have been set by assymetric branching, so check it
            // again. Also, don't eliminate frozen variables:
            if (use_elim && value(elim) == l_Undef && !frozen[elim] && !eliminateVar(elim)) {
                ok = false;
                goto cleanup;
            }

            checkGarbage(simp_garbage_frac);
        }

        assert(subsumption_queue.size() == 0);
    }
cleanup:
    // To get an accurate number of clauses.
    if (trail_size_last != trail.size())
        removeSatisfied();
    else {
        long i, j;
        for (i = j = 0; i < clauses.size(); i++)
            if (ca[clauses[i]].mark() == 0)
                clauses[j++] = clauses[i];
        clauses.shrink(i - j);
    }
    checkGarbage();

    return ok;
}

//=================================================================================================
// Garbage Collection methods:

void SimpSolver::relocAll(ClauseAllocator &to) {
    if (!use_simplification)
        return;

    // All occurs lists:
    //
    occurs.cleanAll();
    for (long i = 0; i < nVars(); i++) {
        vec<CRef> &cs = occurs[i];
        for (long j = 0; j < cs.size(); j++)
            ca.reloc(cs[j], to);
    }

    // Subsumption queue:
    //
    for (long i = 0; i < subsumption_queue.size(); i++)
        ca.reloc(subsumption_queue[i], to);

    // Temporary clause:
    //
    ca.reloc(bwdsub_tmpunit, to);
}

void SimpSolver::garbageCollect() {
    // Initialize the next region to a size corresponding to the estimated utilization degree. This
    // is not precise but should avoid some unnecessary reallocations for the new region:
    ClauseAllocator to(ca.size() - ca.wasted());

    to.extra_clause_field = ca.extra_clause_field; // NOTE: this is important to keep (or lose) the extra fields.
    relocAll(to);
    Solver::relocAll(to);
    to.moveTo(ca);
}
