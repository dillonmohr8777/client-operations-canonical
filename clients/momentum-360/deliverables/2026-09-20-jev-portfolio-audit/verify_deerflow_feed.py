"""Read persisted project context and every byte through native DeerFlow tools."""
import asyncio, hashlib, json, sqlite3, sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from deerflow.persistence.projects import ProjectRepository, ProjectDocumentRepository
from deerflow.persistence.thread_meta.sql import ThreadMetaRepository
from deerflow.projects.context import resolve_project_context
from deerflow.projects.tools import _list_project_documents_impl, _read_project_document_impl
from deerflow.runtime.context_keys import PROJECT_CONTEXT_KEY
from deerflow.runtime.user_context import set_current_user, reset_current_user

ROOT = Path('/tmp/momentum_slack_feed')
DB = '/app/backend/.deer-flow/data/deerflow.db'

async def main():
    receipt = json.loads((ROOT / 'ingestion-receipt.json').read_text())
    owner, pid = receipt['owner_user_id'], receipt['project_id']
    engine = create_async_engine('sqlite+aiosqlite:///file:' + DB + '?mode=ro&uri=true')
    sf = async_sessionmaker(engine, expire_on_commit=False)
    token = set_current_user(SimpleNamespace(id=owner))
    checked = []
    try:
        snapshot = await resolve_project_context(ThreadMetaRepository(sf), ProjectRepository(sf), receipt['thread_id'], ProjectDocumentRepository(sf))
        assert snapshot and snapshot['project_id'] == pid and snapshot['shelf']['total'] == 47
        runtime = SimpleNamespace(context={PROJECT_CONTEXT_KEY: snapshot, 'user_id': owner})
        # Dependency binding points at the real production DB in read-only mode.
        # The native consumer logic and document bytes are not stubbed.
        with patch('deerflow.persistence.get_session_factory', return_value=sf):
            listing = json.loads(await _list_project_documents_impl(runtime, offset=0, limit=200))
            assert listing['total'] == 47 and len(listing['documents']) == 47
            for document in receipt['documents']:
                chunks, offset = [], 0
                while True:
                    result = json.loads(await _read_project_document_impl(runtime, document_id=document['id'], offset=offset, limit=20000))
                    assert 'error' not in result, (document['name'], result.get('error'))
                    chunks.append(result['content'])
                    offset += result['returned_chars']
                    if not result['truncated']:
                        break
                    assert result['returned_chars'] > 0
                full = ''.join(chunks)
                assert hashlib.sha256(full.encode('utf-8')).hexdigest() == document['sha256'], document['name']
                checked.append({'name': document['name'], 'id': document['id'], 'native_tool_pages': len(chunks), 'chars': len(full), 'sha256_match': True})
            foreign = SimpleNamespace(context={PROJECT_CONTEXT_KEY: snapshot, 'user_id': 'a14d5d6f-5345-4f31-9b6b-3cf3f379895e'})
            denied = json.loads(await _read_project_document_impl(foreign, document_id=receipt['documents'][0]['id'], offset=0, limit=100))
            assert 'error' in denied and 'content' not in denied
        with sqlite3.connect('file:' + DB + '?mode=ro', uri=True) as connection:
            row = connection.execute('SELECT user_id, organization_id FROM projects WHERE id=?', (pid,)).fetchone()
            assert row and row[0] == owner and row[1]
            lineage = {'owner_user_id': row[0], 'organization_id': row[1]}
        verification = {'state': 'PASS', 'project_id': pid, 'thread_id': receipt['thread_id'], 'project_context_resolved': True, 'native_tool_documents_verified': len(checked), 'native_tool_pages': sum(x['native_tool_pages'] for x in checked), 'native_tool_foreign_owner_denied': True, 'lineage': lineage, 'documents': checked, 'scope': 'Native project context and full-text consumer integration, without an LLM run or external model call.'}
        (ROOT / 'native-retrieval-verification.json').write_text(json.dumps(verification, indent=2))
        print(json.dumps({k: v for k, v in verification.items() if k != 'documents'}, indent=2))
    finally:
        reset_current_user(token)
        await engine.dispose()

if __name__ == '__main__':
    asyncio.run(main())
