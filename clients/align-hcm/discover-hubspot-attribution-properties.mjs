const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
if (!token) throw new Error('HUBSPOT_PRIVATE_APP_TOKEN is required');

async function get(path) {
  const response = await fetch(`https://api.hubapi.com${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json();
  if (!response.ok) throw new Error(`HubSpot ${response.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

for (const object of ['contacts', 'deals']) {
  const data = await get(`/crm/v3/properties/${object}`);
  const terms = /(source|analytics|referr|conversion|campaign|utm|revenue|amount|pipeline|stage|createdate|closedate|traffic|social|website|page|url)/i;
  const rows = data.results
    .filter((p) => terms.test(`${p.name} ${p.label} ${p.description || ''}`))
    .map((p) => ({ name: p.name, label: p.label, type: p.type, fieldType: p.fieldType, groupName: p.groupName }))
    .sort((a, b) => a.name.localeCompare(b.name));
  console.log(JSON.stringify({ object, rows }, null, 2));
}
