"""Three approved exact negatives. Default validates only; --apply changes Nexla MCP."""
import importlib.util
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('nexla_transport', HERE.parent / '2026-09-10-ads-config/configure_nexla.py')
transport = importlib.util.module_from_spec(spec)
spec.loader.exec_module(transport)
CID = '7917802207'
CAMPAIGN = f'customers/{CID}/campaigns/23705317332'
TERMS = ('mcp', 'mcp server github example', 'mintlify mcp')


def operations(existing):
    return [{'create': {'campaign': CAMPAIGN, 'negative': True,
             'keyword': {'text': text, 'matchType': 'EXACT'}}}
            for text in TERMS if text not in existing]


def main():
    if '--self-test' in sys.argv:
        assert operations(set(TERMS)) == []
        ops = operations({'mcp'})
        assert len(ops) == 2 and all(o['create']['keyword']['matchType'] == 'EXACT' for o in ops)
        assert all(o['create']['campaign'] == CAMPAIGN and o['create']['negative'] for o in ops)
        print('PASS: exact-only payload and repeat-run deduplication')
        return
    session = transport.session()
    identity = transport.gaql(session, 'SELECT customer.id, customer.descriptive_name FROM customer')
    if len(identity) != 1 or identity[0]['customer']['id'] != CID or identity[0]['customer']['descriptiveName'] != 'Nexla':
        raise RuntimeError('Nexla identity mismatch')
    budget_query = "SELECT campaign.id, campaign.status, campaign_budget.amount_micros FROM campaign WHERE campaign.status = 'ENABLED'"
    before = transport.gaql(session, budget_query)
    actual = {r['campaign']['id']: int(r['campaignBudget']['amountMicros']) for r in before}
    if actual != {'22038365681': 25000000, '23705317332': 40750000}:
        raise RuntimeError('Enabled campaigns or budgets changed; review before applying')
    query = "SELECT campaign_criterion.resource_name, campaign_criterion.keyword.text, campaign_criterion.keyword.match_type FROM campaign_criterion WHERE campaign.id = 23705317332 AND campaign_criterion.negative = TRUE AND campaign_criterion.type = 'KEYWORD'"
    existing = transport.gaql(session, query)
    known = {r['campaignCriterion']['keyword']['text'].lower() for r in existing if r['campaignCriterion']['keyword']['matchType'] == 'EXACT'}
    ops = operations(known)
    apply = '--apply' in sys.argv
    receipt = {'observed_at': datetime.now(timezone.utc).isoformat(), 'apply': apply, 'identity': identity, 'before_budgets': before, 'before_negatives': existing, 'operations': ops}
    output = HERE / (datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ') + '-negatives.json')
    output.write_text(json.dumps(receipt, indent=2), encoding='utf-8')
    if ops:
        receipt['response'] = transport.post(session, 'campaignCriteria:mutate', {'operations': ops, 'validateOnly': not apply, 'partialFailure': False})
        output.write_text(json.dumps(receipt, indent=2), encoding='utf-8')
    after = transport.gaql(session, query)
    after_budgets = transport.gaql(session, budget_query)
    receipt['after_negatives'] = after
    receipt['after_budgets'] = after_budgets
    receipt['rollback_operations'] = [{'remove': r['resourceName']} for r in receipt.get('response', {}).get('results', [])] if apply else []
    output.write_text(json.dumps(receipt, indent=2), encoding='utf-8')
    if {r['campaign']['id']: int(r['campaignBudget']['amountMicros']) for r in after_budgets} != actual:
        raise RuntimeError('Budget readback changed; inspect receipt')
    if apply:
        found = {r['campaignCriterion']['keyword']['text'].lower() for r in after if r['campaignCriterion']['keyword']['matchType'] == 'EXACT'}
        if not set(TERMS) <= found:
            raise RuntimeError('Negative readback incomplete; inspect receipt before retry')
    print(f"{'APPLIED AND VERIFIED' if apply else 'VALIDATED ONLY'}: {len(ops)} operations; receipt {output.name}")


if __name__ == '__main__':
    main()
