"""Import the restricted document's replacement JWT without exposing its contents.

The replacement key is supplied through non-echoing stdin, never arguments or disk.
Only the replacement API key is stored in Windows Credential Manager.
"""
import ctypes as c
from ctypes import wintypes as w
import json
import getpass
import re
import sys

class Credential(c.Structure):
    _fields_ = [('Flags', w.DWORD), ('Type', w.DWORD), ('TargetName', w.LPWSTR),
                ('Comment', w.LPWSTR), ('LastWritten', w.FILETIME),
                ('CredentialBlobSize', w.DWORD), ('CredentialBlob', c.POINTER(c.c_ubyte)),
                ('Persist', w.DWORD), ('AttributeCount', w.DWORD),
                ('Attributes', c.c_void_p), ('TargetAlias', w.LPWSTR), ('UserName', w.LPWSTR)]

def main():
    body = getpass.getpass('Protected replacement key: ').strip()
    matches = list(set(re.findall(r'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+', body)))
    if len(matches) != 1:
        print(json.dumps({'status': 'not_imported', 'candidateCount': len(matches)}))
        return
    raw = matches[0].encode('utf-16-le')
    blob = (c.c_ubyte * len(raw)).from_buffer_copy(raw)
    target = 'Codex.ClientAccess.PutteryNYC.TockRoleAccount.Rotated20260908'
    cred = Credential(Type=1, TargetName=target,
        Comment='Replacement from restricted Tock vendor Google Doc on 2026-09-08',
        CredentialBlobSize=len(raw), CredentialBlob=blob, Persist=2,
        UserName='puttery-nyc')
    api = c.WinDLL('Advapi32.dll', use_last_error=True)
    api.CredWriteW.argtypes = [c.POINTER(Credential), w.DWORD]
    api.CredWriteW.restype = w.BOOL
    if not api.CredWriteW(c.byref(cred), 0):
        raise OSError('protected_store_failed')
    c.memset(blob, 0, len(raw))
    print(json.dumps({'status': 'stored', 'credentialRef': 'wincred://' + target,
                      'credentialExposed': False, 'documentPersisted': False}))

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(json.dumps({'status': 'failed', 'errorType': type(error).__name__}))
        sys.exit(1)
