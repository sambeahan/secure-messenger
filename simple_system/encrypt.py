from num_to_let import ALPHABET
import json

def encrypt(msg, key):
    plaintext = list(msg)
    ciphertext = []
    for char in plaintext:
        char = char.lower()
        char_n = ord(char)
        ct_n = (char_n ** key[0]) % key[1]
        ciphertext.append(ct_n)
    return ciphertext

def decrypt(cipher, key):
    plaintext = []
    for c_num in cipher:
        pt_n = (c_num ** key[0]) % key[1]
        pt_n %= 128
        pt = chr(pt_n)
        plaintext.append(pt)
    return ''.join(plaintext)


with open('simple_system/keys.json', 'r') as f:
    keys = json.load(f)

# keys = {'public key': [5,14], 'private key': [11,14]}

import time
start = time.time()
message = input('message: ')
ct = encrypt(message, keys['public key'])
print(time.time() - start)
pt = decrypt(ct, keys['private key'])
print(time.time() - start)
print(message, ct, pt)