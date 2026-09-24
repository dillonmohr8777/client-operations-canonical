from pathlib import Path
import json, zipfile, hashlib

base = Path(__file__).parent
verification = json.loads((base/'review/MP4-VERIFICATION.json').read_text())
manifest = json.loads((base/'five-direction-manifest.json').read_text())
assert manifest['completeForLocalReview'] and verification['count'] == 26
target = base.parent/'ORIGINAL-FIVE-REVIEW-MP4S.zip'
files = [Path(r['output']) for r in verification['renders']]
files += [base.parent/'TODAY-CLAUDE-DESIGN-COMPLETION-RECEIPT.md', base/'review/MP4-VERIFICATION.json', base/'five-direction-manifest.json']
files += sorted((base/'review').glob('RENDERED-*.jpg'))
with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_STORED) as archive:
    for path in files:
        archive.write(path, path.name)
with zipfile.ZipFile(target) as archive:
    assert archive.testzip() is None
    assert sum(n.endswith('.mp4') for n in archive.namelist()) == 26
receipt = {'path': str(target), 'bytes': target.stat().st_size, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'mp4Count': 26, 'crcCheck': 'PASS'}
(base/'review-package-verification.json').write_text(json.dumps(receipt, indent=2))
print(json.dumps(receipt))
