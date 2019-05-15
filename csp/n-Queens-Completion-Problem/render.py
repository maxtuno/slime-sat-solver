def validator(position):
    if len(set(position)) != len(position):
        return False
    for _ in range(2):
        for i in range(len(position)):
            k = 1
            for j in range(i + k, len(position)):
                if position[i] == (position[j] + k):
                    print(position[i], position[j] + k)
                    return False
                k += 1
        position.reverse()
    return True


if __name__ == '__main__':

    import math
    import sys

    matrix = {}
    with open(sys.argv[1]) as sol:
        lines = sol.readlines()
        for line in lines:
            if line.startswith('a q_'):
                x, y, b = map(int, line.replace('a q_', '').replace('\t', ' ').strip('\n').replace('_', ' ').split(' '))
                matrix[x, y] = b

    position = []
    solution = ''
    for i in range(1, int(math.sqrt(len(matrix.values()))) + 1):
        for j in range(1, int(math.sqrt(len(matrix.values()))) + 1):
            if matrix[i, j]:
                solution += 'Q '
                position.append(j)
            else:
                solution += '. '
        solution += '\n'

    if validator(position):
        print(solution)
    else:
        print('Invalid Solution.')
