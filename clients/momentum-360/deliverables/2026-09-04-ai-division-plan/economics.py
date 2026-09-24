"""Explicit planning scenarios, never actual division finances. Standard library only."""
import csv, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OFFERS = {
    'visibility': dict(setup=1500, monthly=1500, setup_hours=10, monthly_hours=6, setup_tools=75, monthly_tools=75),
    'lead_ops': dict(setup=3500, monthly=1500, setup_hours=24, monthly_hours=6, setup_tools=150, monthly_tools=150),
    'creative': dict(setup=750, monthly=1250, setup_hours=5, monthly_hours=6, setup_tools=50, monthly_tools=100),
}

def scenario(name, counts, hourly=75, sales_rate=.10, hours_multiplier=1, fixed_monthly=500):
    monthly=sum(OFFERS[k]['monthly']*n for k,n in counts.items())
    setup=sum(OFFERS[k]['setup']*n for k,n in counts.items())
    hours=sum(OFFERS[k]['monthly_hours']*n for k,n in counts.items())*hours_multiplier
    setup_hours=sum(OFFERS[k]['setup_hours']*n for k,n in counts.items())*hours_multiplier
    tools=sum(OFFERS[k]['monthly_tools']*n for k,n in counts.items())
    setup_tools=sum(OFFERS[k]['setup_tools']*n for k,n in counts.items())
    gross=monthly-hours*hourly-tools
    contribution=gross-monthly*sales_rate-fixed_monthly
    setup_contribution=setup-setup_hours*hourly-setup_tools-setup*sales_rate
    return dict(scenario=name,clients=sum(counts.values()),monthly_revenue=monthly,setup_bookings=setup,
                monthly_delivery_hours=hours,setup_delivery_hours=setup_hours,direct_monthly_labor=hours*hourly,
                direct_monthly_tools=tools,gross_profit_before_sales_overhead=gross,
                gross_margin_pct=round(100*gross/monthly,2),sales_allowance=monthly*sales_rate,
                fixed_monthly_allowance=fixed_monthly,monthly_contribution=contribution,
                setup_contribution_before_fixed_cost=setup_contribution)

def main():
    rows=[scenario('3-client cohort',dict(visibility=1,lead_ops=1,creative=1)),
          scenario('6-client gate',dict(visibility=2,lead_ops=2,creative=2)),
          scenario('12-client staffed scenario',dict(visibility=4,lead_ops=4,creative=4)),
          scenario('3-client double hours',dict(visibility=1,lead_ops=1,creative=1),hours_multiplier=2),
          scenario('3-client labor $125/hr',dict(visibility=1,lead_ops=1,creative=1),hourly=125)]
    assert rows[0]['monthly_revenue']==4250
    assert rows[0]['monthly_delivery_hours']==18
    assert rows[0]['monthly_contribution']==1650
    assert rows[3]['monthly_contribution']==300
    result=dict(state='ASSUMPTIONS_ONLY_NOT_FORECAST',currency='USD',offers=OFFERS,assumptions=dict(hourly_labor=75,sales_rate=.10,fixed_monthly=500,full_collection=True,tax_included=False,existing_revenue_included=False),scenarios=rows)
    (ROOT/'economics.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    with (ROOT/'economics.csv').open('w',newline='',encoding='utf-8') as out:
        writer=csv.DictWriter(out,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
    print(json.dumps(rows,indent=2))

if __name__=='__main__':main()
