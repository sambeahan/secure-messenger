from num_to_let import ALPHABET
import json

def encrypt(msg, key):
    plaintext = list(msg)
    ciphertext = []
    for char in plaintext:
        char = char.lower()
        char_n = ord(char)
        ct_n = (char_n ** key[0]) % key[1]
        '''
        ct_n %= 26
        ct = ALPHABET[ct_n]
        '''
        ciphertext.append(ct_n)
    return ciphertext

def decrypt(cipher, key):
    # ciphertext = list(ct)
    plaintext = []
    for c_num in cipher:
        '''
        char = char.lower()
        char_n = ALPHABET.index(char)
        '''
        pt_n = (c_num ** key[0]) % key[1]
        pt_n %= 128
        pt = chr(pt_n)
        plaintext.append(pt)
    return ''.join(plaintext)


keys = [[49, 247], [97, 247]]
import time
start = time.time()
message = input('message: ')
ct = encrypt(message, keys[1])
print(time.time() - start)
pt = decrypt(ct, keys[0])
print(time.time() - start)
print(message, ct, pt)