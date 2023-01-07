import math


n = []
for i in range(2, 100):
    for j in range(2, math.ceil(i/2) + 1):  # for every number that is less that half of the number being tested
        if i % j == 0:  # check if it is a factor of the original number
            break
    else:
        n.append(i)  # if no factors then prime, add to list
        

with open("simple_system/prime.json", "w") as f:
    f.write(str(n))
