"""Validate, or --apply to create one PAUSED Nexla governance RSA. Never enables ads."""
import csv
import json
import sys
from datetime import datetime, timezone
from apply_negatives import HERE, CID, transport

GROUP = f'customers/{CID}/adGroups/195300844695'
URL = 'https://nexla.com/lp/mcp-servers/'
QUERY = "SELECT ad_group_ad.resource_name, ad_group_ad.status, ad_group_ad.ad.final_urls, ad_group_ad.ad.responsive_search_ad.headlines, ad_group_ad.ad.responsive_search_ad.descriptions FROM ad_group_ad WHERE ad_group.id = 195300844695 AND ad_group_ad.status != 'REMOVED'"
BUDGET_QUERY = "SELECT campaign.id, campaign.status, campaign_budget.amount_micros FROM campaign WHERE campaign.status = 'ENABLED'"


def signature(ad):
    rsa = ad.get('responsiveSearchAd', {})
    return (tuple(ad.get('finalUrls', [])), tuple(x['text'] for x in rsa.get('headlines', [])), tuple(x['text'] for x in rsa.get('descriptions', [])))


def draft():
    with (HERE / 'search-ad-drafts.csv').open(newline='', encoding='utf-8-sig') as source:
        rows = [r for r in csv.DictReader(source) if r['angle'] == 'Governance']
    headlines = [r['text'] for r in rows if r['type'] == 'headline']
    descriptions = [r['text'] for r in rows if r['type'] == 'description']
    if not (3 <= len(headlines) <= 15 and 2 <= len(descriptions) <= 4):
        raise ValueError('Invalid asset counts')
    if any(not t or len(t) > 30 for t in headlines) or any(not t or len(t) > 90 for t in descriptions):
        raise ValueError('Invalid asset length')
    return {'adGroup': GROUP, 'status': 'PAUSED', 'ad': {'finalUrls': [URL], 'responsiveSearchAd': {
        'headlines': [{'text': t} for t in headlines], 'descriptions': [{'text': t} for t in descriptions]}}}


def main():
    candidate = draft()
    if '--self-test' in sys.argv:
        assert candidate['status'] == 'PAUSED' and candidate['adGroup'] == GROUP
        assert len(signature(candidate['ad'])[1]) == 6
        assert signature(candidate['ad']) == signature(json.loads(json.dumps(candidate['ad'])))
        changed = json.loads(json.dumps(candidate['ad']))
        changed['responsiveSearchAd']['headlines'][0]['text'] = 'Changed'
        assert signature(changed) != signature(candidate['ad'])
        print('PASS: paused-only payload, limits and exact content comparison')
        return
    s = transport.session()
    identity = transport.gaql(s, 'SELECT customer.id, customer.descriptive_name FROM customer')
    if len(identity) != 1 or identity[0]['customer']['id'] != CID or identity[0]['customer']['descriptiveName'] != 'Nexla':
        raise RuntimeError('Wrong account')
    group = transport.gaql(s, "SELECT campaign.id, ad_group.id, ad_group.status FROM ad_group WHERE ad_group.id = 195300844695")
    if len(group) != 1 or group[0]['campaign']['id'] != '23705317332' or group[0]['adGroup']['status'] != 'ENABLED':
        raise RuntimeError('Ad group changed')
    before_budgets = transport.gaql(s, BUDGET_QUERY)
    amounts = lambda rows: {r['campaign']['id']: int(r['campaignBudget']['amountMicros']) for r in rows}
    if amounts(before_budgets) != {'22038365681': 25000000, '23705317332': 40750000}:
        raise RuntimeError('Campaign/budget baseline changed')
    before = transport.gaql(s, QUERY)
    matches = [r for r in before if signature(r['adGroupAd']['ad']) == signature(candidate['ad'])]
    if matches:
        print('Already exists; no mutation: ' + ', '.join(r['adGroupAd']['resourceName'] for r in matches))
        return
    apply = '--apply' in sys.argv
    receipt = {'at': datetime.now(timezone.utc).isoformat(), 'apply': apply, 'candidate': candidate, 'before': before, 'before_budgets': before_budgets}
    path = HERE / (datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ') + '-stage-ad.json')
    save = lambda: path.write_text(json.dumps(receipt, indent=2), encoding='utf-8')
    save()
    receipt['response'] = transport.post(s, 'adGroupAds:mutate', {'operations': [{'create': candidate}], 'validateOnly': not apply, 'partialFailure': False})
    save()
    receipt['after'] = transport.gaql(s, QUERY)
    receipt['after_budgets'] = transport.gaql(s, BUDGET_QUERY)
    receipt['rollback_operations'] = [{'remove': r['resourceName']} for r in receipt['response'].get('results', [])] if apply else []
    save()
    if amounts(receipt['after_budgets']) != amounts(before_budgets):
        raise RuntimeError('Budget changed; inspect receipt')
    after_by_id = {r['adGroupAd']['resourceName']: r for r in receipt['after']}
    if any(after_by_id.get(r['adGroupAd']['resourceName']) != r for r in before):
        raise RuntimeError('Existing ad changed; inspect receipt')
    if apply:
        matches = [r for r in receipt['after'] if signature(r['adGroupAd']['ad']) == signature(candidate['ad'])]
        if len(matches) != 1 or matches[0]['adGroupAd']['status'] != 'PAUSED':
            raise RuntimeError('Paused draft readback failed; inspect before retrying')
    print(f"{'STAGED PAUSED AND VERIFIED' if apply else 'VALIDATED ONLY'}: {path.name}")


if __name__ == '__main__':
    main()
