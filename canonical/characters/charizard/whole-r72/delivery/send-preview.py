import os,sys,json
from pathlib import Path
os.environ['HERMES_HOME']='/workspace/hermes-home/profiles/chiefstaff'
sys.path.insert(0,'/home/kvn/.hermes/hermes-agent')
from agent.secret_scope import build_profile_secret_scope,set_secret_scope
set_secret_scope(build_profile_secret_scope(Path(os.environ['HERMES_HOME'])))
from tools.send_message_tool import send_message_tool,prepare_send_message_platforms
prepare_send_message_platforms()
root=Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r72/delivery')
with (root/'attempt.json').open('x') as stream:json.dump({'status':'attempting','target':'telegram:1083429746'},stream)
result=send_message_tool({'target':'telegram:1083429746','message':(root/'message.txt').read_text()})
if isinstance(result,str):result=json.loads(result)
(root/'result.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
assert result.get('success') is True
