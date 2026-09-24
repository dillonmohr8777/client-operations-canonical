from pathlib import Path
import json,shutil
base=Path(__file__).parent.resolve()
receipt=json.loads((base/'portrait-endcard-repair.json').read_text())
assert receipt['status']=='PASS' and len(receipt['results'])==5
rejected=base/'REJECTED-cropped-portrait-exports';rejected.mkdir(exist_ok=True)
for row in receipt['results']:
    name=row['id']+'-9x16'
    corrections=list((base/'corrected-endcards'/name).glob('frame_*.png'));assert len(corrections)==108
    backup=rejected/name;backup.mkdir(exist_ok=True)
    for p in corrections:
        target=base/'rgba-frames'/name/p.name
        assert target.resolve().is_relative_to(base)
        shutil.copy2(target,backup/p.name);shutil.copy2(p,target)
    for suffix in ['-opaque-navy-review.mp4','-mp4-contact.jpg']:
        p=base/'opaque-review-mp4'/(name+suffix)
        if p.exists():
            target=rejected/p.name
            assert p.resolve().is_relative_to(base) and target.resolve().is_relative_to(base)
            p.rename(target)
print('Applied five portrait endcard repairs; rejected exports and frames preserved separately.')
