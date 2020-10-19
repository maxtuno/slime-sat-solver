This is the current version of SLIME, tested vs Kissat (The Official state of the art 2020)

Results are in the images, and the bad news is that the SLIME binary used on test, is a debug binary... (human error) then the real power of SLIME, is not revelated but the binaries on this folder are optimized.

See the images, for details.


./slime_cli-osx --help
c                                         
c   ██████  ██▓     ██▓ ███▄ ▄███▓▓█████  
c ▒██    ▒ ▓██▒    ▓██▒▓██▒▀█▀ ██▒▓█   ▀  
c ░ ▓██▄   ▒██░    ▒██▒▓██    ▓██░▒███    
c   ▒   ██▒▒██░    ░██░▒██    ▒██ ▒▓█  ▄  
c ▒██████▒▒░██████▒░██░▒██▒   ░██▒░▒████▒ 
c ▒ ▒▓▒ ▒ ░░ ▒░▓  ░░▓  ░ ▒░   ░  ░░░ ▒░ ░ 
c ░ ░▒  ░ ░░ ░ ▒  ░ ▒ ░░  ░      ░ ░ ░  ░ 
c ░  ░  ░    ░ ░    ▒ ░░      ░      ░    
c       ░      ░  ░ ░         ░      ░  ░ 
c                                         
c           http://www.peqnp.com          
c                                         

BOOST OPTIONS:

  -boost, -no-boost                       (default: on)

CORE OPTIONS:

  -rnd-init, -no-rnd-init                 (default: off)

  -gc-frac      = <double> (   0 ..  inf) (default: 0.2)
  -rinc         = <double> (   1 ..  inf) (default: 2)
  -step-size    = <double> (   0 ..    1) (default: 0.4)
  -step-size-dec = <double> (   0 ..    1) (default: 1e-06)
  -min-step-size = <double> (   0 ..    1) (default: 0.06)
  -var-decay    = <double> (   0 ..    1) (default: 0.8)
  -cla-decay    = <double> (   0 ..    1) (default: 0.999)
  -rnd-freq     = <double> [   0 ..    1] (default: 0)
  -rnd-seed     = <double> (   0 ..  inf) (default: 9.16483e+07)

  -rfirst       = <int32>  [   1 .. imax] (default: 100)
  -confl-to-chrono = <int32>  [  -1 .. imax] (default: 4000)
  -chrono       = <int32>  [  -1 .. imax] (default: 100)
  -phase-saving = <int32>  [   0 ..    2] (default: 2)
  -ccmin-mode   = <int32>  [   0 ..    2] (default: 2)

DUP-LEARNTS OPTIONS:

  -VSIDS-lim    = <int32>  [   1 .. imax] (default: 30)
  -dupdb-init   = <int32>  [   1 .. imax] (default: 1000000)
  -min-dup-app  = <int32>  [   2 .. imax] (default: 2)
  -lbd-limit    = <int32>  [   0 .. imax] (default: 14)

HESS OPTIONS:

  -hess, -no-hess                         (default: off)

  -hess-order   = <int32>  [   1 ..    2] (default: 1)

LSIDS OPTIONS:

  -lsids-erase-weight = <double> [   0 ..    5] (default: 2)

MASSIVE OPTIONS:

  -massive, -no-massive                   (default: off)

SIMP OPTIONS:

  -asymm, -no-asymm                       (default: off)
  -elim, -no-elim                         (default: on)
  -rcheck, -no-rcheck                     (default: off)

  -simp-gc-frac = <double> (   0 ..  inf) (default: 0.5)

  -sub-lim      = <int32>  [  -1 .. imax] (default: 1000)
  -grow         = <int32>  [imin .. imax] (default: 0)
  -cl-lim       = <int32>  [  -1 .. imax] (default: 20)

HELP OPTIONS:

  --help        Print help message.
  --help-verb   Print verbose help message.

