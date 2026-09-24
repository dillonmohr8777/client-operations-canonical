**Five material defects and exact corrections**

1. **First-month output overpromises relative to onboarding capacity.**  
   The plan says the first month should produce “three paid, referenceable implementations,” but the cohort requires 39 setup hours, Dillon has only 10 delivery/review hours/week protected, and the 30-day checkpoint only requires one completed pilot.  
   **Correction:** Replace “It should not depend on building a proprietary foundation model, purchasing hardware, or offering unlimited agents. Referenceability requires the client’s permission and actual outcome evidence.” with:  
   **“The first month should produce three signed paid pilots, with at most one completed and referenceable implementation by day 30. Referenceability requires client permission, an accepted pilot, and measured outcome evidence. Do not promise three completed or referenceable implementations in week one.”**

2. **Setup and recurring commitments are not reconciled into one capacity model.**  
   The plan says three setups need roughly four weeks of the 10-hour delivery allocation “even before recurring service begins,” but the offer table simultaneously assumes 6 recurring delivery hours/month for each of the three offers. If all three start in the first month, setup and recurring work could exceed the protected 10 hours/week before demand ramps.  
   **Correction:** Replace “Start at most one new setup per week and never exceed two active builds.” with:  
   **“Start at most one new setup per week, never exceed two active builds, and calculate weekly capacity as setup hours plus recurring 6-hour-per-client budgets plus support/review. If projected weekly load exceeds 10 delivery/review hours, delay the next setup or reduce the recurring budget in writing.”**

3. **Contribution table is not reproducible from stated allowances.**  
   The assumptions list “per-offer tool allowances,” but the table does not state tool allowance values. The implied deduction is $325/month for the three-client scenario, $650 for six, and $1,300 for twelve, which is not supported by visible text.  
   **Correction:** Add a column or assumption line before the scenario table:  
   **“Tool allowances: $325/month for the three-client cohort, $650/month for six clients, and $1,300/month for twelve clients. Contribution = monthly revenue − delivery labor at $75/hour − 10% sales allowance − $500 fixed operating allowance − tool allowances.”**  
   If tool costs are not yet known, replace the contributions with unreconciled values: $1,975 / $4,450 / $9,400 / $625 / $1,075 and mark the table “not final.”

4. **Acceptance criteria mix test coverage with operational success, leaving “done” vague.**  
   The Lead Operations acceptance line says “30 named test cases including duplicates, missing inputs, timeout and retry; no cross-account writes; destination readback; owner runs 5 supervised cases,” but does not define pass thresholds, who signs acceptance, or when the client is considered onboarded.  
   **Correction:** Replace “Acceptance and support” for Lead Operations with:  
   **“Acceptance is met only when 30 named test cases are executed, with at least 95% passing, all failures documented with owner remediation plan, destination readback succeeds for 100% of accepted test records, no unresolved cross-account write failures remain, and the named operator successfully completes 5 supervised cases. Mac or the named account owner signs the acceptance scorecard before recurring support begins.”**

5. **Acquisition assumptions are still activity targets, not a customer plan.**  
   The plan says Mac/Jesse will nominate five relationship-approved accounts and conduct discovery, but the 30-day gate still assumes paid pilots without defining conversion, pricing approval, or client commitment milestones.  
   **Correction:** Replace “Aim for one completed and two scheduled/active paid pilots.” with:  
   **“Aim for one signed paid pilot in acceptance, two signed paid pilots scheduled, and a third signed or in written proposal. Count a pilot as signed only after proposal acceptance, access approval, first invoice or deposit, and a named operator. Do not count discovery calls or qualified demos as paid pilots.”**

**Acceptance verdict:** Conditionally accepted for the decision meeting, but not for launch execution until the five corrections are inserted. The strategy and scope discipline are sound; the remaining blockers are capacity realism, contribution transparency, acceptance definition, and acquisition labeling.
