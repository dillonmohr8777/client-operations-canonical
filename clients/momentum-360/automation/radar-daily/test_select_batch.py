import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import select_batch as selector

class HistoricalSelectionTests(unittest.TestCase):
    def test_old_name_domain_and_route_are_excluded(self):
        rows=[{'n':'The Acme Plumbing Co.','w':'https://alias.example','d':'alias.example','l':'queued_build','ra':1,'le':{},'p':99},
              {'n':'New Trading Name','w':'https://www.old.example','d':'old.example','l':'queued_build','ra':1,'le':{},'p':98},
              {'n':'Past Page','w':'https://renamed.example','d':'renamed.example','l':'queued_build','ra':1,'le':{},'p':97},
              {'n':'Fresh Workshop','w':'https://fresh.example','d':'fresh.example','l':'queued_build','ra':1,'le':{},'p':80}]
        history={'schema':1,'entries':[{'name':'Acme Plumbing','website':'https://old.example','slug':'past-page'}]}
        with tempfile.TemporaryDirectory() as td:
            p=Path(td)/'history.json';p.write_text(json.dumps(history))
            with patch.object(selector,'PRIOR_BUILDS',str(p)),patch.object(selector,'fetch_records',return_value=rows),patch.object(selector,'load_registry',return_value={'built':{}}),patch.object(selector,'logo_decisions',return_value=[{'eligible':True}]*4):
                result=selector.select(20)
        self.assertEqual([x['name'] for x in result['batch']],['Fresh Workshop'])
        self.assertEqual(len(result['excluded']),3)

    def test_missing_full_history_fails_closed(self):
        with tempfile.TemporaryDirectory() as td:
            with patch.object(selector,'PRIOR_BUILDS',str(Path(td)/'missing.json')),patch.object(selector,'fetch_records',return_value=[]),patch.object(selector,'load_registry',return_value={'built':{}}),patch.object(selector,'logo_decisions',return_value=[]):
                with self.assertRaises(FileNotFoundError):selector.select(20)

if __name__=='__main__':unittest.main()
