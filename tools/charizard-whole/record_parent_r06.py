"""Add the missing r05 source checkpoint to the two existing r06 records."""
import fcntl
import hashlib
import json
import os
import tempfile
from pathlib import Path

lane = Path(__file__).resolve().parents[2]
workspace = lane.parents[1]
receipt_dir = lane/'canonical/characters/charizard/whole-r06'
private = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r05')
source = private/'charizard-whole-r05-mouth-jaw-study.blend'
digest = hashlib.sha256(source.read_bytes()).hexdigest()
assert digest == '746f0988ac4d5095bccdcd7bd281a593aefb5e258cbb743aa9c2df58953d360e'
assert source.stat().st_size == 9926960
input_record = {'role':'Immediate source scene checkpoint · r05 mouth/jaw study','path':'assets/blender/charizard-whole-r05/'+source.name,'sha256':digest,'sourceKind':'blender_checkpoint','note':'Prepared from live r05 scene state, not a hash-guarded file replay. Frozen r06-start is the authoritative comparison intake.'}
registry = workspace/'devtools/experiments.json'
identifiers = ['charizard-whole-r06-intake', 'charizard-whole-r06']

def atomic_json(path, value):
    with tempfile.NamedTemporaryFile(mode='w', dir=path.parent, delete=False) as stream:
        stream.write(json.dumps(value, indent=2)+'\n')
        temporary = stream.name
    os.replace(temporary, path)

with registry.with_suffix('.json.lock').open('a') as lock:
    fcntl.flock(lock, fcntl.LOCK_EX)
    original = registry.read_bytes()
    document = json.loads(original)
    updates = []
    for identifier in identifiers:
        run = next(item for item in document['runs'] if item['id'] == identifier)
        assert run == json.loads((receipt_dir/(identifier+'-experiment.json')).read_text())
        assert run == json.loads((workspace/'experiments/runs'/(identifier+'.json')).read_text())
        existing = [item for item in run['inputs'] if item.get('sourceKind') == 'blender_checkpoint']
        assert not existing or existing == [input_record]
        if not existing:
            run['inputs'].append(input_record)
        updates.append(run)
    alias = workspace/'assets/blender/charizard-whole-r05'
    if not alias.exists():
        alias.symlink_to(private, target_is_directory=True)
    assert alias.resolve() == private
    assert registry.read_bytes() == original
    for run in updates:
        atomic_json(workspace/'experiments/runs'/(run['id']+'.json'), run)
        atomic_json(receipt_dir/(run['id']+'-experiment.json'), run)
    assert registry.read_bytes() == original
    atomic_json(registry, document)
receipt = {'source':str(source),'bytes':source.stat().st_size,'sha256':digest,'relationship':'Live r05 scene was the immediate authoring input; its frozen checkpoint is recorded here. Frozen r06-start is authoritative for the matched comparison.','registeredIn':identifiers,'humanReviewsChanged':False,'binaryAssetsChanged':False}
target = receipt_dir/'parent-input.json'
assert not target.exists() or json.loads(target.read_text()) == receipt
if not target.exists():
    with target.open('x') as stream:
        stream.write(json.dumps(receipt, indent=2)+'\n')
print(json.dumps(receipt))
