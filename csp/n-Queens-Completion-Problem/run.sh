python3 generator.py ${1} ${2} > problem_${1}_${2}.csp
slime-sugar problem_${1}_${2}.csp > solution_${1}_${2}.txt
python3 render.py solution_${1}_${2}.txt > render_${1}_${2}.txt