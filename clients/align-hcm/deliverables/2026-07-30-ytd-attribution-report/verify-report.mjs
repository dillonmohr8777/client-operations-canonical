import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = path.join(root, 'align-hcm-july-2026-attribution-report.html');
const dataPath = path.join(root, 'ytd-company-attribution.json');
const csvPath = path.join(root, 'ytd-company-attribution.csv');
const html = fs.readFileSync(reportPath, 'utf8');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const failures = [];
const checks = [];

function check(name, condition, detail = '') {
  checks.push({ name, passed: Boolean(condition), detail });
  if (!condition) failures.push(`${name}${detail ? `: ${detail}` : ''}`);
}

function count(pattern) {
  return (html.match(pattern) || []).length;
}

check('report exists', fs.existsSync(reportPath));
check('company CSV exists', fs.existsSync(csvPath));
check('balanced sections', count(/<section\b/g) === count(/<\/section>/g), `${count(/<section\b/g)} open / ${count(/<\/section>/g)} close`);
check('balanced tables', count(/<table\b/g) === count(/<\/table>/g), `${count(/<table\b/g)} open / ${count(/<\/table>/g)} close`);
check('single YTD section', count(/id="ytd-attribution"/g) === 1);
check('single offline section', count(/id="offline-recovery"/g) === 1);
check('single measurement section', count(/id="measurement-stack"/g) === 1);
check('company row count', count(/<tr data-company-row\b/g) === data.companies.length, `${count(/<tr data-company-row\b/g)} HTML / ${data.companies.length} data`);
check('YTD contact count cross-foot', data.channelSummary.reduce((sum, row) => sum + row.contacts, 0) === data.totals.attributedContacts);
check('won amount present', html.includes('$54,000'));
check('open deal count present', html.includes('3 currently open deals'));
check('all company names present', data.companies.every((company) => html.includes(company.company)));
check('no individual email addresses', !/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(html));
check('no mojibake', !/Â|â[€–—™œž¦]/.test(html));
check('Search Console linked language present', html.includes('Search Console is linked to GA4'));
check('stale SEMrush placeholder removed', !html.includes('Awaiting SEMrush data'));
check('stale contact count removed', !html.includes('91 new contact records'));
check('report source links present', html.includes('https://knowledge.hubspot.com/social/analyze-social-reports'));
check('download link present', html.includes('href="ytd-company-attribution.csv"'));
check('accessible filter labels', html.includes('aria-label="Search the company ledger"') && html.includes('aria-label="Filter company ledger"'));

const scriptBlocks = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
let scriptSyntaxOk = true;
let scriptError = '';
for (const script of scriptBlocks) {
  try {
    new Function(script);
  } catch (error) {
    scriptSyntaxOk = false;
    scriptError = error.message;
    break;
  }
}
check('inline script syntax', scriptSyntaxOk, scriptError);

const csvLines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).filter(Boolean);
check('CSV row count', csvLines.length === data.companies.length + 1, `${csvLines.length} CSV lines`);

console.log(JSON.stringify({
  status: failures.length ? 'FAIL' : 'PASS',
  checks,
  totals: data.totals,
  failures,
}, null, 2));

if (failures.length) process.exitCode = 1;
