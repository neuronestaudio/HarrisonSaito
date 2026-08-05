"""
Repair a file that was round-tripped through Windows-1252 by mistake.

Windows PowerShell 5.1's Get-Content reads with the system ANSI codepage, not
UTF-8, so a UTF-8 file read and rewritten that way ends up as the UTF-8
encoding of its own mojibake. That is losslessly reversible: decode the file as
UTF-8, encode the resulting string back to cp1252, then decode THAT as UTF-8.
"""
import sys

path = sys.argv[1]

with open(path, 'rb') as f:
    raw = f.read()

# PowerShell's `-Encoding utf8` also prepends a BOM, which is not part of the
# mojibake and must come off before the round-trip is reversed.
text = raw.decode('utf-8-sig')

def to_cp1252_bytes(s: str) -> bytes:
    """
    cp1252 leaves 0x81/0x8D/0x8F/0x90/0x9D undefined, but .NET decodes those
    bytes to the matching C1 control characters. Python's codec refuses to
    encode them, so fall back to the raw byte for anything under U+0100.
    """
    out = bytearray()
    for ch in s:
        try:
            out += ch.encode('cp1252')
        except UnicodeEncodeError:
            if ord(ch) < 0x100:
                out.append(ord(ch))
            else:
                raise
    return bytes(out)


try:
    repaired = to_cp1252_bytes(text).decode('utf-8')
except (UnicodeEncodeError, UnicodeDecodeError) as e:
    print(f'Cannot repair cleanly: {e}')
    sys.exit(1)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(repaired)

# Report a few known markers so the fix is verifiable at a glance.
for probe in ['守', '破', '離', '·', '—', '仮面', '継承']:
    print(f'  {probe}  {"OK" if probe in repaired else "MISSING"}')
print(f'\nRepaired {path} ({len(raw)} -> {len(repaired.encode("utf-8"))} bytes)')
