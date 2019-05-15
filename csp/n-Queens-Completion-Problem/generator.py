import sys
import random


def completion(n, m, seed):
    """
    http://www.csplib.org/Problems/prob079/data/queens-gen-fast.py.html
    """
    random.seed(seed)

    d1 = [0 for _ in range(2 * n - 1)]
    d2 = [0 for _ in range(2 * n - 1)]

    valid_rows = [i for i in range(n)]
    valid_cols = [j for j in range(n)]

    def no_attack(r, c):
        return d1[r + c] == 0 and d2[r - c + n - 1] == 0

    placed_queens = []
    queens_left = n

    for attempt in range(n * n):
        i = random.randrange(queens_left)
        j = random.randrange(queens_left)
        r = valid_rows[i]
        c = valid_cols[j]
        if no_attack(r, c):
            placed_queens.append([r, c])
            d1[r + c] = 1
            d2[r - c + n - 1] = 1
            valid_rows[i] = valid_rows[queens_left - 1]
            valid_cols[j] = valid_cols[queens_left - 1]
            queens_left -= 1
            if len(placed_queens) == m:
                return [[x + 1, y + 1] for x, y in placed_queens]


if __name__ == '__main__':

    n = int(sys.argv[1])
    m = int(sys.argv[2])
    seed = random.randint(0, 2 ** 16 - 1)

    placed_queens = completion(n, m, seed)
    print('; Generate with n = {}, m = {}, seed = {}.'.format(n, m, seed))
    print('; {}'.format(placed_queens))
    print()
    table = ''
    for i in range(1, n + 1):
        table += '; '
        for j in range(1, n + 1):
            if [i, j] not in placed_queens:
                table += '. '
            else:
                table += 'Q '
        table += '\n'
    print(table)

    for i in range(1, n + 1):
        for j in range(1, n + 1):
            if [i, j] not in placed_queens:
                print('(int q_{}_{} 0 1)'.format(i, j))
            else:
                print('(int q_{}_{} 1)'.format(i, j))

    print()

    for i in range(1, n + 1):
        code = '(count 1 ('
        for j in range(1, n + 1):
            code += ' q_{}_{}'.format(i, j)
        code += ') eq 1)'
        print(code)

    for i in range(1, n + 1):
        code = '(count 1 ('
        for j in range(1, n + 1):
            code += ' q_{}_{}'.format(j, i)
        code += ') eq 1)'
        print(code)

    print()

    for j in range(n):
        code = '(count 1 ('
        for i in range(1, n + 1):
            if i + j <= n:
                code += ' q_{}_{}'.format(i, i + j)
        code += ') le 1)'
        if code.count('q') > 1:
            print(code)
    for j in range(n):
        code = '(count 1 ('
        for i in range(1, n + 1):
            if i + j != i and i + j <= n:
                code += ' q_{}_{}'.format(i + j, i)
        code += ') le 1)'
        if code.count('q') > 1:
            print(code)

    print()

    for j in range(n):
        code = '(count 1 ('
        for i in range(1, n + 1):
            if i + j <= n:
                code += ' q_{}_{}'.format(n + 1 - i, i + j)
        code += ') le 1)'
        if code.count('q') > 1:
            print(code)
    for j in range(n):
        code = '(count 1 ('
        for i in range(1, n + 1):
            if i + j != i and i + j <= n:
                code += ' q_{}_{}'.format(n + 1 - (i + j), i)
        code += ') le 1)'
        if code.count('q') > 1:
            print(code)

    completion(n, m, seed)
