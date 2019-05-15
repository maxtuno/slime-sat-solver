#!/usr/bin/perl
##
## This program is a part of Sugar software package (a SAT-based Constraint Solver).
## http;//bach.istc.kobe-u.ac.jp/sugar/
## (C) Naoyuki Tamura, Tomoya Tanjo, and Mutsunori Banbara
##
use Getopt::Long;
use FileHandle;
use IPC::Open2;
use strict;
$| = 1;

my $version = "v2-3-4";
my $java = "java -Xms8g -Xmx8g";
my $jar = "/usr/local/bin/sugar-v2-3-4.jar";
my $solver0 = "/usr/local/bin/slime";
my $solver0_inc = "";
my $tmp = "$$";

my ($showversion, $help, $debug, $verbose, $veryverbose, $option);
my ($no_solve, $translate, $output, $prolog, $pb, $hybrid, $conversionHooks, $outputHook);
my ($java_opt1, $java_opt2, $solver, $competition, $keep, $incremental, $prof);
my ($max_csp, $weighted_csp, $csp_file, $map_file, $sat_file, $out_file);
my ($memlimit, $timelimit, $solverlimit);
&GetOptions(
    'version'           => \$showversion,
    'h|help'            => \$help,
    'debug=i'           => \$debug,
    'v|verbose'         => \$verbose,
    'vv|veryverbose'    => \$veryverbose,
    'c|competition'     => \$competition,
    'i|incremental'     => \$incremental,
    'o|option=s'        => \$option,
    'n|no_solve'        => \$no_solve,
    'prolog'            => \$prolog,
    'translate=s'       => \$translate,
    'conversionHooks=s' => \$conversionHooks,
    'output=s'          => \$output,
    'outputHook=s'      => \$outputHook,
    'max'               => \$max_csp,
    'weighted'          => \$weighted_csp,
    'pb'                => \$pb,
    'hybrid'            => \$hybrid,
    'tmp=s'             => \$tmp,
    'csp=s'             => \$csp_file,
    'map=s'             => \$map_file,
    'sat=s'             => \$sat_file,
    'out=s'             => \$out_file,
    'jar=s'             => \$jar,
    'java=s'            => \$java,
    'jopt1=s'           => \$java_opt1,
    'jopt2=s'           => \$java_opt2,
    'prof=s'            => \$prof,
    'solver=s'          => \$solver,
    'keep'              => \$keep,
    'memlimit=i'        => \$memlimit,
    'timelimit=i'       => \$timelimit,
);
$verbose = $verbose || $veryverbose;
if (!$solver) {
    $solver = $incremental ? $solver0_inc : $solver0;
}
if (!$java_opt1) {
    if ($memlimit > 200) {
        $java_opt1 = sprintf("-Xmx%dM", $memlimit - 200);
    }
}
if (!$java_opt2) {
    if ($incremental) {
        $java_opt2 = "-Xmx50M";
        $solverlimit = $memlimit - 200 - 50 if $memlimit > 250;
    }
    else {
        if ($memlimit > 200) {
            $java_opt2 = sprintf("-Xmx%dM", $memlimit - 200);
        }
    }
}

if ($showversion) {
    print "Sugar $version + $solver\n";
    exit(1);
}
if (@ARGV != 1 || $help) {
    &usage();
}

my @tmp = ();
my $xml_file;

&setup(@ARGV);

my ($java_pid, $solver_pid, $result, $objective_value);
my ($objective, $objective_var, $objective_code, @objective_values);

my $time0 = time;

# $ENV{'LANG'} = "C";
setpgrp($$, $$);

&main();
exit 0;

sub usage {
    print "Usage: $0 [options] csp_file\n";
    print "\t-h -help          : show help\n";
    print "\t-v -verbose       : verbose output\n";
    print "\t-vv -veryverbose  : very verbose output\n";
    print "\t-c -competition   : CSP Solver Competition mode\n";
    #    print "\t-i -incremental   : use incremental search (you need a patched SAT solver)\n";
    print "\t-o -option o1,... : set options\n";
    print "\t-n -no_solve      : only generate SAT instance\n";
    print "\t-prolog           : Prolog style input\n";
    print "\t-max              : Max-CSP mode\n";
    print "\t-weighted         : Weighted-CSP mode (experimental)\n";
    print "\t-translate format : translate CSP by format (csp, prolog, asp, smt) (experimental)\n";
    print "\t-conversionHooks class1,... : set conversion hooks (experimental)\n";
    print "\t-output file      : output file name of the translation (experimental)\n";
    print "\t-outputHook class : set output hook (experimental)\n";
    print "\t-pb               : Encode to PB (experimental)\n";
    print "\t-tmp prefix       : path and prefix of temporay files\n";
    print "\t-csp file         : output CSP file name for XCSP input\n";
    print "\t-sat file         : SAT instance file name\n";
    print "\t-map file         : mapping file name\n";
    print "\t-out file         : SAT solver output file name\n";
    print "\t-java command     : java command (default: $java)\n";
    print "\t-jopt1 option     : java option for encoding/translation\n";
    print "\t-jopt2 option     : java option for decoding\n";
    print "\t-jar file         : jar file name to be used (default: $jar)\n";
    print "\t-prof file        : java CPU profiling\n";
    print "\t-solver command   : SAT solver command (default: $solver0)\n";
    print "\t-keep             : do not erase temporary files\n";
    print "\t-memlimit MiB     : memory limit in MiB (for CSP solver competition)\n";
    #    print "\t-timelimit sec   : time limit in seconds (reserved for CSP solver competition)\n";
    print "\t-debug level      : debug option\n";
    exit(1);
}

sub setup {
    my ($in) = @_;
    if (!-e $in) {
        die "$0: no input file $in";
    }
    if ($in =~ /\.xml(\.gz)?$/) {
        $xml_file = $in;
    }
    else {
        $csp_file = $in;
    }
    if (!$csp_file) {
        $csp_file = "$tmp.csp";
        push(@tmp, $csp_file);
    }
    if (!$map_file) {
        $map_file = "$tmp.map";
        push(@tmp, $map_file);
    }
    if (!$sat_file) {
        $sat_file = "$tmp.cnf";
        push(@tmp, $sat_file);
    }
    if (!$out_file) {
        $out_file = "$tmp.mod";
        push(@tmp, $out_file);
    }
}

sub log {
    $_ = join(" ", @_);
    if (/ERROR/i || $verbose) {
        my $time = time - $time0;
        print "c $time\t", $_, "\n";
    }
}

sub print {
    $_ = join(" ", @_);
    if (/^c (.*)$/) {
        $_ = $1;
        if (/ERROR/i || $veryverbose) {
            &log($_);
        }
    }
    elsif (/^s (.*)$/) {
        if ($1 ne "UNKNOWN") {
            $result = $1;
            print $_, "\n";
        }
    }
    elsif (/^o (.*)$/) {
        # TODO for multiple objectives
        $objective_value = $1;
        print $_, "\n";
    }
    elsif (/^\w\b/) {
        print $_, "\n";
    }
    else {
        &log($_);
    }
}

sub error {
    print "c ERROR ", @_, "\n";
}

sub warn {
    print "c WARN ", @_, "\n";
}

sub handler {
    &error("INTERRUPTED");
    $SIG{'INT'} = 'IGNORE';
    $SIG{'TERM'} = 'IGNORE';
    kill(-2, $$);
    $SIG{'INT'} = 'DEFAULT';
    $SIG{'TERM'} = 'DEFAULT';
    if ($java_pid) {
        kill(2, $java_pid);
        $java_pid = undef;
        while (<JAVA>) {
            chomp;
            if ($verbose) {
                &print($_);
            }
        }
        close(JAVA);
    }
    if ($solver_pid) {
        kill(2, $solver_pid);
        if ($incremental) {
            &send("exit");
            close(Writer);
            while (<Reader>) {
                chomp;
                if ($verbose) {
                    &print($_);
                }
            }
            close(Reader);
        }
        else {
            while (<SOLVER>) {
                chomp;
                if ($verbose) {
                    &print($_);
                }
            }
            close(SOLVER);
        }
        $solver_pid = undef;
    }
    die;
}

sub java {
    my ($opt, $class, $args, $prof) = @_;
    my $cmd = "$java $opt";
    if ($prof) {
        $cmd .= " -agentlib:hprof=cpu=samples,depth=8,file=$prof";
    }
    $cmd .= " -cp '$jar' $class";
    if ($verbose) {
        $cmd .= " -v";
    }
    if ($veryverbose) {
        $cmd .= " -v";
    }
    if ($pb) {
        $cmd .= " -pb";
    }
    if ($hybrid) {
        $cmd .= " -hybrid";
    }
    if ($option) {
        $cmd .= " -option $option";
    }
    if ($debug) {
        $cmd .= " -debug $debug";
    }
    $cmd .= " $args";
    if ($veryverbose) {
        &log("CMD $cmd");
    }
    $java_pid = open(JAVA, "$cmd 2>&1 |") || die;
    while (<JAVA>) {
        chomp;
        &print($_);
    }
    close(JAVA);
    $java_pid = undef;
}

################################################################
# Main
################################################################
sub main {
    unlink $csp_file if $xml_file;
    unlink $map_file, $sat_file, $out_file;

    $SIG{'INT'} = \&handler;
    $SIG{'TERM'} = \&handler;
    eval {
        $result = "";
        &log("Sugar $version + $solver");
        &log("BEGIN", scalar(localtime));
        if ($veryverbose) {
            &log("PID", $$);
            chomp($_ = `hostname`);
            &log("HOST", $_);
        }
        if ($xml_file) {
            &convert($xml_file, $csp_file);
            if ($result) {
                die;
            }
        }
        if (-e $csp_file) {
            if ($translate) {
                &translate($translate, $csp_file, $output);
                $result = "DONE";
            }
            else {
                &encode($csp_file, $sat_file, $map_file);
                if ($no_solve) {
                    $result = "DONE";
                }
                elsif (!$result) {
                    &solve($sat_file, $out_file, $map_file);
                }
            }
        }
        else {
            &error("$csp_file not found");
        }
    };
    $SIG{'INT'} = \&handler;
    $SIG{'TERM'} = \&handler;
    eval {
        if (!$result) {
            &print("s UNKNOWN");
        }
        wait;
        my @t = times;
        #	my $cpu = $t[0] + $t[2];
        my $cpu = $t[0] + $t[1] + $t[2] + $t[3];
        $_ = "(" . join(" ", @t) . ")";
        &log("CPU", $cpu, $_);
        &log("END", scalar(localtime));
        if (!$keep) {
            foreach my $file (@tmp) {
                unlink $file;
            }
        }
    };
}

sub convert {
    my ($xml_file, $csp_file) = @_;
    &log("CONVERTING $xml_file TO $csp_file");
    if (!-e $xml_file) {
        &error("no XML file $xml_file");
    }
    else {
        my $class = "jp.kobe_u.sugar.XML2CSP";
        &java($java_opt1, $class, "'$xml_file' '$csp_file'");
    }
}

sub translate {
    my ($format, $csp_file, $output_file) = @_;
    my @t0 = times;
    &log("TRANSLATE $csp_file TO $output_file by $format");
    if (!-e $csp_file) {
        &error("no CSP file $csp_file");
    }
    else {
        my $class = "jp.kobe_u.sugar.SugarMain";
        my $arg = $competition ? "-competition" : "";
        if ($max_csp) {
            $arg .= " -max";
        }
        elsif ($weighted_csp) {
            $arg .= " -weighted";
        }
        $arg .= " -prolog" if $prolog;
        $arg .= " -conversionHooks '$conversionHooks'" if $conversionHooks;
        $arg .= " -outputHook '$outputHook'" if $outputHook;
        if ($output_file) {
            $arg .= " -to $format '$output_file' '$csp_file'";
        }
        else {
            $arg .= " -to $format - '$csp_file'";
        }
        &java($java_opt1, $class, $arg, $prof);
    }
    my @t = times;
    @t = ($t[0] - $t0[0], $t[1] - $t0[1], $t[2] - $t0[2], $t[3] - $t0[3]);
    my $cpu = $t[0] + $t[1] + $t[2] + $t[3];
    $_ = "(" . join(" ", @t) . ")";
    &log("TRANSLATE CPU", $cpu, $_);
}

sub encode {
    my ($csp_file, $sat_file, $map_file) = @_;
    my @t0 = times;
    &log("ENCODING $csp_file TO $sat_file");
    if (!-e $csp_file) {
        &error("no CSP file $csp_file");
    }
    else {
        my $class = "jp.kobe_u.sugar.SugarMain";
        my $arg = $competition ? "-competition" : "";
        if ($max_csp) {
            $arg .= " -max";
        }
        elsif ($weighted_csp) {
            $arg .= " -weighted";
        }
        $arg .= " -prolog" if $prolog;
        $arg .= " -conversionHooks '$conversionHooks'" if $conversionHooks;
        $arg .= " -incremental" if $incremental;
        $arg .= " -encode '$csp_file' '$sat_file' '$map_file'";
        &java($java_opt1, $class, $arg, $prof);
    }
    my @t = times;
    @t = ($t[0] - $t0[0], $t[1] - $t0[1], $t[2] - $t0[2], $t[3] - $t0[3]);
    my $cpu = $t[0] + $t[1] + $t[2] + $t[3];
    $_ = "(" . join(" ", @t) . ")";
    &log("ENCODING CPU", $cpu, $_);
}

sub decode {
    my ($out_file, $map_file) = @_;
    my @t0 = times;
    &log("DECODING $out_file WITH $map_file");
    if (!-e $out_file || -z $out_file) {
        &error("no output file $out_file");
        return;
    }
    if (!-e $map_file) {
        &error("no map file $map_file");
        return;
    }
    my $class = "jp.kobe_u.sugar.SugarMain";
    my $arg = "";
    $arg .= " -competition" if $competition;
    $arg .= " -decode '$out_file' '$map_file'";
    &java($java_opt2, $class, $arg);
    my @t = times;
    @t = ($t[0] - $t0[0], $t[1] - $t0[1], $t[2] - $t0[2], $t[3] - $t0[3]);
    my $cpu = $t[0] + $t[1] + $t[2] + $t[3];
    $_ = "(" . join(" ", @t) . ")";
    &log("DECODING CPU", $cpu, $_);
}

sub solve {
    my ($sat_file, $out_file, $map_file) = @_;
    my @t0 = times;
    &log("SOLVING $sat_file WITH $map_file");
    if (!-e $sat_file) {
        &error("no SAT file $sat_file");
        return;
    }
    &load_map($map_file);
    if (!$pb && !$hybrid && $objective eq "minimize") {
        if ($incremental) {
            die "Incremental solving is not supported in this version";
            # &minimize_inc($sat_file, $out_file, $map_file);
        }
        else {
            &minimize($sat_file, $out_file, $map_file);
        }
    }
    elsif (!$pb && !$hybrid && $objective eq "maximize") {
        if ($incremental) {
            die "Incremental solving is not supported in this version";
            # &maximize_inc($sat_file, $out_file, $map_file);
        }
        else {
            &maximize($sat_file, $out_file, $map_file);
        }
    }
    else {
        &find($sat_file, $out_file, $map_file);
    }
    my @t = times;
    @t = ($t[0] - $t0[0], $t[1] - $t0[1], $t[2] - $t0[2], $t[3] - $t0[3]);
    my $cpu = $t[0] + $t[1] + $t[2] + $t[3];
    $_ = "(" . join(" ", @t) . ")";
    &log("SOLVING CPU", $cpu, $_);
}

sub load_map {
    my ($map_file) = @_;
    if (!-e $map_file) {
        &error("no MAP file $map_file");
        return;
    }
    $objective = undef;
    $objective_var = undef;
    $objective_code = undef;
    @objective_values = ();
    open(MAP, "<$map_file") || die;
    while (<MAP>) {
        chomp;
        if (/^objective/) {
            @_ = split;
            ($objective, $objective_var) = ($_[1], $_[2]);
        }
        elsif ($objective && /^int/) {
            @_ = split;
            if ($objective_var eq $_[1]) {
                shift(@_);
                shift(@_);
                $objective_code = shift(@_);
                foreach (@_) {
                    my ($a0, $a1) = ($_, $_);
                    if (/^(-?\d+)\.\.(-?\d+)$/) {
                        ($a0, $a1) = ($1, $2);
                    }
                    foreach my $a ($a0 .. $a1) {
                        push(@objective_values, $a);
                    }
                }
                &log("OBJECTIVE $objective $objective_var");
            }
        }
    }
    chomp($_ = <MAP>);
    close(MAP);
}

sub find {
    my ($sat_file, $out_file, $map_file) = @_;
    &sat($sat_file, $out_file);
    &decode($out_file, $map_file);
}

sub minimize {
    my ($sat_file, $out_file, $map_file) = @_;
    my $sat_size = (stat($sat_file))[7];
    my ($sat_variables, $sat_clauses) = &read_sat_header($sat_file);
    my $found = 0;
    my $i0 = 0;
    my $i1 = scalar(@objective_values);
    while ($i0 < $i1) {
        my $i = int(($i0 + $i1) / 2);
        my $value = $objective_values[$i];
        my $code = $objective_code + $i;
        my @clauses = ();
        if ($i < @objective_values - 1) {
            @clauses = ("$code");
        }
        &append_clauses($sat_file, $sat_variables, $sat_clauses, $sat_size, @clauses);
        &log("OBJECTIVE BOUND:",
            $objective_values[$i0], "<=", $objective_var,
            "<=", $objective_values[$i1]);
        &log("SEARCHING: $objective_var <= $value");
        &sat($sat_file, $out_file);
        open(IN, "<$out_file") || die;
        $_ = undef;
        while (!eof(IN)) {
            chomp($_ = <IN>);
            last if /^s\s/ || /^(UN)?SAT/;
            next if /^c/ || /^v/ || /^\s*$/;
            &error("unknown output $_ in $out_file");
        }
        close(IN);
        if (/^(s\s+)?SAT/) {
            &log("FOUND: $objective_var <= $value");
            if (!$found) {
                &print("s SATISFIABLE");
            }
            $found = 1;
            $i1 = $i;
            &decode($out_file, $map_file);
            while ($i1 > 0 && $objective_value < $value) {
                $i1--;
                $value = $objective_values[$i1];
            }
        }
        elsif (/^(s\s+)?UNSAT/) {
            &log("NOT FOUND: $objective_var <= $value");
            $i0 = $i + 1;
        }
        else {
            &error("unknown output $_ in $out_file");
            return;
        }
    }
    if ($found) {
        &log("OBJECTIVE $objective_var $objective_value");
        &print("s OPTIMUM FOUND");
    }
    else {
        &print("s UNSATISFIABLE");
    }
}

sub maximize {
    my ($sat_file, $out_file, $map_file) = @_;
    my $sat_size = (stat($sat_file))[7];
    my ($sat_variables, $sat_clauses) = &read_sat_header($sat_file);
    my $found = 0;
    my $i0 = -1;
    my $i1 = scalar(@objective_values) - 1;
    while ($i0 < $i1) {
        my $i = int(($i0 + $i1) / 2);
        my $value = $objective_values[$i];
        my $code = $objective_code + $i;
        my @clauses = ();
        if ($i >= 0) {
            @clauses = ("-$code");
        }
        &append_clauses($sat_file, $sat_variables, $sat_clauses, $sat_size, @clauses);
        &log("OBJECTIVE BOUND:",
            $objective_values[$i0], "<=", $objective_var,
            "<=", $objective_values[$i1]);
        &log("SEARCHING: $objective_var > $value");
        &sat($sat_file, $out_file);
        open(IN, "<$out_file") || die;
        $_ = undef;
        while (!eof(IN)) {
            chomp($_ = <IN>);
            last if /^s\s/ || /^(UN)?SAT/;
            next if /^c/ || /^v/ || /^\s*$/;
            &error("unknown output $_ in $out_file");
        }
        close(IN);
        if (/^(s\s+)?SAT/) {
            &log("FOUND: $objective_var > $value");
            if (!$found) {
                &print("s SATISFIABLE");
            }
            $found = 1;
            $i0 = $i;
            &decode($out_file, $map_file);
            while ($i0 < @objective_values && $objective_value > $value) {
                $i0++;
                $value = $objective_values[$i0];
            }
        }
        elsif (/^(s\s+)?UNSAT/) {
            &log("NOT FOUND: $objective_var > $value");
            $i1 = $i;
        }
        else {
            &error("unknown output $_ in $out_file");
            return;
        }
    }
    if ($found) {
        &log("OBJECTIVE $objective_var $objective_value");
        &print("s OPTIMUM FOUND");
    }
    else {
        &print("s UNSATISFIABLE");
    }
}

sub read_sat_header {
    my ($sat_file) = @_;
    open(SAT, "<", $sat_file) || die;
    chomp($_ = <SAT>);
    @_ = split;
    my ($sat_variables, $sat_clauses) = ($_[2], $_[3]);
    return($sat_variables, $sat_clauses);
}

sub append_clauses {
    my ($sat_file, $sat_variables, $sat_clauses, $sat_size, @clauses) = @_;
    open(SAT, "+<", $sat_file) || die;
    $sat_clauses += scalar(@clauses);
    $_ = "p cnf $sat_variables $sat_clauses";
    print SAT substr($_ . " " x 63, 0, 63) . "\n";
    seek(SAT, $sat_size, 0);
    foreach my $c (@clauses) {
        print SAT "$c 0\n";
    }
    truncate(SAT, tell(SAT));
    close(SAT);
}

sub sat {
    my ($sat_file, $out_file) = @_;
    &log("SAT SOLVING $sat_file");
    if (!-e $sat_file) {
        &error("no SAT file $sat_file");
        return;
    }
    unlink $out_file;
    my $cmd;
    if ($solver =~ /%s/) {
        $cmd = $solver;
        $cmd =~ s/%s/'$sat_file'/g;
        if ($cmd =~ s/%o/'$out_file'/g) {
            $out_file = undef;
        }
    }
    else {
        $cmd = "$solver '$sat_file'";
        if ($solver =~ /\b(slime|glucose|gluehess|sucrose)/) {
            $cmd = "$solver '$sat_file' '$out_file'";
            $out_file = undef;
        }
        elsif ($solver =~ /\b(picosat|precosat)/) {
            my $opt = $veryverbose ? "-v" : "";
            $cmd = "$solver $opt '$sat_file'";
        }
        elsif ($solver =~ /\b(lingeling|plingeling)/) {
            my $opt = $veryverbose ? "-v" : "";
            $cmd = "$solver $opt '$sat_file'";
        }
        elsif ($solver =~ /\b(clasp)/) {
            my $opt = $veryverbose ? "--stats" : "";
            $cmd = "$solver $opt '$sat_file'";
        }
        elsif ($solver =~ /\b(rsat)/) {
            $cmd = "$solver '$sat_file' -r '$out_file'";
            $out_file = undef;
        }
    }
    if ($veryverbose) {
        &log("CMD $cmd");
    }
    $solver_pid = open(SOLVER, "$cmd 2>&1 |") || die;
    if ($out_file) {
        open(OUT, ">$out_file") || die;
        while (<SOLVER>) {
            chomp;
            print OUT "$_\n";
            if ($veryverbose && !/^v/) {
                &log($_);
            }
        }
        close(OUT);
    }
    else {
        while (<SOLVER>) {
            chomp;
            if ($veryverbose && !/^v/) {
                &log($_);
            }
        }
    }
    close(SOLVER);
    $solver_pid = undef;
}

# sub minimize_inc {
#     my ($sat_file, $out_file, $map_file) = @_;
#     my $i0 = 0;
#     my $i1 = scalar(@objective_values);
#     my $found = 0;
#     &sat_inc_open($sat_file, $out_file);
#     while ($i0 < $i1) {
# 	my $i = int(($i0+$i1) / 2);
# 	my $value = $objective_values[$i];
# 	my $code = $objective_code + $i;
# 	&log("OBJECTIVE BOUND:",
# 	     $objective_values[$i0], "<=", $objective_var,
# 	     "<=", $objective_values[$i1]);
# 	&log("SEARCHING: $objective_var <= $value");
# 	unlink $out_file;
# 	if ($i < @objective_values - 1) {
# 	    &send("solve $code 0");
# 	} else {
# 	    &send("solve 0");
# 	}
# 	&recv();
# 	open(IN, "<$out_file") || die;
# 	chomp($_ = <IN>);
# 	close(IN);
# 	if (/^(s\s+)?SAT/) {
# 	    &log("FOUND: $objective_var <= $value");
# 	    if (! $found) {
# 		&print("s SATISFIABLE");
# 	    }
# 	    $found = 1;
# 	    $i1 = $i;
# 	    &decode($out_file, $map_file);
# 	    while ($i1 > 0 && $objective_value < $value) {
# 		$i1--;
# 		$value = $objective_values[$i1];
# 	    }
# 	    $code = $objective_code+$i1;
# 	    &send("add $code 0");
# 	    &recv();
# 	} elsif (/^(s\s+)?UNSAT/) {
# 	    &log("NOT FOUND: $objective_var <= $value");
# 	    &send("add -$code 0");
# 	    &recv();
# 	    $i0 = $i + 1;
# 	} else {
# 	    &error("unknown output $_ in $out_file");
# 	    &send("exit");
# 	    &sat_inc_close();
# 	    return;
# 	}
#     }
#     &send("exit");
#     &sat_inc_close();
#     if ($found) {
# 	&log("OBJECTIVE $objective_var $objective_value");
# 	&print("s OPTIMUM FOUND");
#     } else {
# 	&print("s UNSATISFIABLE");
#     }
# }

# sub maximize_inc {
#     my ($sat_file, $out_file, $map_file) = @_;
#     my $i0 = -1;
#     my $i1 = scalar(@objective_values) - 1;
#     my $found = 0;
#     &sat_inc_open($sat_file, $out_file);
#     while ($i0 < $i1) {
# 	my $i = int(($i0+$i1) / 2);
# 	my $value = $objective_values[$i];
# 	my $code = $objective_code + $i;
# 	&log("OBJECTIVE BOUND:",
# 	     $objective_values[$i0], "<=", $objective_var,
# 	     "<=", $objective_values[$i1]);
# 	&log("SEARCHING: $objective_var > $value");
# 	unlink $out_file;
# 	if ($i >= 0) {
# 	    &send("solve -$code 0");
# 	} else {
# 	    &send("solve 0");
# 	}
# 	&recv();
# 	open(IN, "<$out_file") || die;
# 	chomp($_ = <IN>);
# 	close(IN);
# 	if (/^(s\s+)?SAT/) {
# 	    &log("FOUND: $objective_var > $value");
# 	    if (! $found) {
# 		&print("s SATISFIABLE");
# 	    }
# 	    $found = 1;
# 	    $i0 = $i;
# 	    &decode($out_file, $map_file);
# 	    while ($i0 < @objective_values && $objective_value > $value) {
# 		$i0++;
# 		$value = $objective_values[$i0];
# 	    }
# 	    $code = $objective_code+$i1;
# 	    &send("add -$code 0");
# 	    &recv();
# 	} elsif (/^(s\s+)?UNSAT/) {
# 	    &log("NOT FOUND: $objective_var > $value");
# 	    &send("add $code 0");
# 	    &recv();
# 	    $i1 = $i;
# 	} else {
# 	    &error("unknown output $_ in $out_file");
# 	    &send("exit");
# 	    &sat_inc_close();
# 	    return;
# 	}
#     }
#     &send("exit");
#     &sat_inc_close();
#     if ($found) {
# 	&log("OBJECTIVE $objective_var $objective_value");
# 	&print("s OPTIMUM FOUND");
#     } else {
# 	&print("s UNSATISFIABLE");
#     }
# }

# sub sat_inc_open {
#     my ($sat_file, $out_file) = @_;
#     &log("SOLVING $sat_file");
#     if (! -e $sat_file) {
# 	&error("no SAT file $sat_file");
# 	return;
#     }
#     my $cmd = $solver;
#     if ($solverlimit) {
# 	$cmd .= sprintf(" -mem-limit=%d", $solverlimit);
#     }
#     $cmd .= " -incremental '$sat_file' '$out_file'";
#     if ($veryverbose) {
# 	&log("CMD $cmd");
#     }
#     $solver_pid = open2(*Reader, *Writer, "$cmd 2>&1") || die;
#     my $old = select; select(Writer); $| = 1; select($old);
#     &recv();
# }

# sub sat_inc_close {
#     close(Reader);
#     close(Writer);
#     $solver_pid = undef;
# }

# sub send {
#     my ($msg) = @_;
#     print Writer $msg."\n";
# }

# sub recv {
#     while (<Reader>) {
# 	chomp;
# 	if ($_ eq "OK") {
# 	    return;
# 	}
# 	&log($_);
#     }
#     die;
# }
