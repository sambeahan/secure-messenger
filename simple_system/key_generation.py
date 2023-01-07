import json
import random
import pprint

import os 
# os.system('cls')

def gcd(a, b):  # Euclinean algorithm
    while b != 0:
        t = b
        b = a % b
        a = t
    return a

def generate_keys():
    f = open("simple_system/prime.json", "r")
    primes = json.load(f)
    p = random.choice(primes)
    q = p
    while q == p:
        q = random.choice(primes)
       
    n = p * q
    phi = (p - 1) * (q - 1)

    e_candidates = []
    print(f"p: {p}, q: {q}, phi {phi}")
    for i in range(2, phi):
        if gcd(i, phi) == 1 and gcd(i, n) == 1:
            e_candidates.append(i)
    e = random.choice(e_candidates)
    public_key = [e, n]

    d_candidates = []
    i = 2
    while len(d_candidates) < 5:
        d_cand_mod = (i * phi + 1) % e
        if d_cand_mod == 0:
            d_candidates.append((i * phi + 1) // e)
        i += 1
    if e in d_candidates:
        d_candidates.remove(e)
    d = random.choice(d_candidates)
    private_key = [d, n]
    '''
    print('\n Problem:')
    if n != p * q:
        print('n=p.q')
    elif phi != (q-1) * (p-1):
        print('phi=(p-1)(q-1)')
    elif e >= n:
        print('e<n')
    elif gcd(e,phi) != 1:
        print('e coprime with phi')
    elif gcd(e,n) != 1:
        print('e coprime with n')
    elif (e*d) % phi != 1:
        print('e.d mod(phi) = 1')
    else:
        print('No problem\n')
    '''

    return {'public key': public_key, 'private key': private_key}

with open("simple_system/keys.json", "w") as f:
    keys = generate_keys()
    print(keys)
    json.dump(keys, f)