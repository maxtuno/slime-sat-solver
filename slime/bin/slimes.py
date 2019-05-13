import os
import sys
import shutil
import subprocess
import multiprocessing

if __name__ == '__main__':

    if len(sys.argv) < 2:
        print('c usage: python slimes.py <input.cnf> <proof_file>')
        sys.exit(0)

    print('\nRun {} Parallel SLIME Instances...\n'.format(multiprocessing.cpu_count()))

    input_file = sys.argv[1]
    tmp_proof_z = sys.argv[2]
    num_cores = multiprocessing.cpu_count()
    path_proof = tmp_proof_z[tmp_proof_z.find('drup-file=') + 10:]

    pids = set()
    pid_id = set()

    tmp_base = os.path.basename(input_file)

    for i in range(0, num_cores):
        tmp_file = tmp_base + '.' + str(i)
        tmp_proof = tmp_proof_z + '.' + str(i)
        slime_call_command = 'slime -rnd-init -rinc={} -rfirst={} -rnd-seed={} -drup-file={} {}'.format(i + 2, 100 * (i + 1), i + 1, tmp_proof, input_file)
        args = slime_call_command.split()
        slime_process = subprocess.Popen(
            args,
            stdout=open(tmp_file, 'w'),
            preexec_fn=os.setpgrp)
        pid_id.add((slime_process.pid, i))
        pids.add(slime_process.pid)

    winner_id = -1
    winner = ''
    winner_code = 0
    while pids:
        pid, ret_val = os.wait()
        pids.remove(pid)
        signal = ret_val & 255
        exit_code = (ret_val >> 8) & 255
        winner_id = -1
        if signal == 0 and (exit_code == 10 or exit_code == 20):
            winner_code = exit_code
            for i in range(num_cores):
                proc = pid_id.pop()
                if proc[0] == pid:
                    winner_id = proc[1]
                    break
        if winner_id != -1:
            break

    if winner_code != 0:
        tmp_file = tmp_base + '.' + str(winner_id)
        tmp_proof = tmp_proof_z + '.' + str(winner_id)
        os.system('cp ' + tmp_proof + ' ' + tmp_proof_z)
        f = open(tmp_file, 'r')
        if f:
            shutil.copyfileobj(f, sys.stdout)
    else:
        print('s UNKNOWN')

    for p in pids:
        try:
            os.kill(p, 15)
        except:
            pass

    for i in range(num_cores):
        tmp_file = tmp_base + '.' + str(i)
        if os.path.exists(tmp_file):
            os.unlink(tmp_file)
        tmp_proof = tmp_proof_z + '.' + str(i)
        if os.path.exists(tmp_proof):
            os.unlink(tmp_proof)

    sys.exit(winner_code)
