if __name__ == '__main__':

    import sys
    import random

    n = int(sys.argv[1])
    seq = list(range(1, n + 1))

    random.shuffle(seq)

    print('; Permutation : {}'.format(seq))
    print('; Mirrored    : {}'.format([n - seq[i] + 1 for i in range(n)]))
    print('; Differences : {}'.format([abs(seq[i] - seq[(i + 1) % n]) for i in range(n)]))

    print()

    for i in range(n):
        sys.stdout.write('(int x_{} 1 {})\n'.format(i, n))

    print()

    sys.stdout.write('(alldifferent ')
    for i in range(n):
        sys.stdout.write('x_{} '.format(i))
    sys.stdout.write(')\n')

    print()

    for i in range(n):
        sys.stdout.write('(eq (abs (sub x_{} x_{})) {})\n'.format(i, (i + 1) % n, abs(seq[i] - seq[(i + 1) % n])))