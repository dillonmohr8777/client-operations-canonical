/* Generated from verified pilot receipts. Do not hand-edit. */
window.MOMENTUM_FORECAST = {
  "meta": {
    "title": "Momentum 360 Forecast Specialist Pilot",
    "account": "Jason Fallon / Momentum 360",
    "experimentId": "EXP-JASON-HUBSPOT-CHRONOS-20260901",
    "generatedAt": "2026-09-01T21:15:56.107Z",
    "reviewedAt": "2026-09-01",
    "evidenceWindow": "2026-06-08 to 2026-08-24",
    "targetLabel": "HubSpot contacts created per week",
    "targetBoundary": "CRM creation activity, not verified leads, qualified leads, conversions, deals, demand, or revenue."
  },
  "verdict": {
    "headline": "The system worked. The model did not earn promotion.",
    "state": "RETAIN / EVIDENCE ONLY",
    "summary": "Chronos-2 completed the governed forecast path, produced nine quantile bands, and beat the trailing-four-week mean. It finished slightly behind persistence and its uncertainty band was under-calibrated.",
    "decision": "Improve the target data and run rolling-origin tests before any planning or automation proposal."
  },
  "metrics": {
    "chronos": {
      "mae": 29.9136,
      "rmse": 35.6629,
      "wapePercent": 25.75,
      "smapePercent": 24.94
    },
    "persistence": {
      "mae": 29.1667,
      "rmse": 35.107,
      "wapePercent": 25.11,
      "smapePercent": 24.4
    },
    "trailingMean": {
      "mae": 37.5833,
      "rmse": 44.5487,
      "wapePercent": 32.35,
      "smapePercent": 29.91
    },
    "persistenceValue": 140,
    "trailingMeanValue": 152.5,
    "coverageObserved": 58.33,
    "coverageIntended": 80,
    "meanBandWidth": 311.2217,
    "p50AboveActualSteps": 9
  },
  "holdout": {
    "dates": [
      "2026-06-08",
      "2026-06-15",
      "2026-06-22",
      "2026-06-29",
      "2026-07-06",
      "2026-07-13",
      "2026-07-20",
      "2026-07-27",
      "2026-08-03",
      "2026-08-10",
      "2026-08-17",
      "2026-08-24"
    ],
    "actual": [
      149,
      160,
      143,
      89,
      91,
      94,
      115,
      133,
      87,
      107,
      137,
      89
    ],
    "point": [
      131.74404907226562,
      137.20758056640625,
      137.57992553710938,
      139.872314453125,
      141.90750122070312,
      139.43878173828125,
      135.18179321289062,
      138.53445434570312,
      140.1990966796875,
      140.60733032226562,
      138.09918212890625,
      141.65399169921875
    ],
    "persistence": [
      140,
      140,
      140,
      140,
      140,
      140,
      140,
      140,
      140,
      140,
      140,
      140
    ],
    "quantiles": {
      "p10": [
        95.33261108398438,
        93.47308349609375,
        92.24267578125,
        93.52386474609375,
        95.49703979492188,
        98.02783203125,
        91.16061401367188,
        91.74819946289062,
        94.39767456054688,
        93.95712280273438,
        90.32891845703125,
        89.89468383789062
      ],
      "p20": [
        106.90060424804688,
        108.10223388671875,
        106.76177978515625,
        107.56906127929688,
        108.315673828125,
        109.3790283203125,
        101.80084228515625,
        106.51422119140625,
        107.42074584960938,
        108.4224853515625,
        104.66519165039062,
        104.26666259765625
      ],
      "p30": [
        116.19573974609375,
        118.52511596679688,
        117.95635986328125,
        119.31646728515625,
        118.79925537109375,
        119.132080078125,
        112.3349609375,
        118.603515625,
        117.65866088867188,
        118.96917724609375,
        116.53750610351562,
        116.26943969726562
      ],
      "p40": [
        124.32403564453125,
        128.62802124023438,
        127.85861206054688,
        130.18218994140625,
        130.00088500976562,
        129.52606201171875,
        123.72216796875,
        128.42047119140625,
        128.144775390625,
        130.09515380859375,
        127.17208862304688,
        129.13479614257812
      ],
      "p50": [
        131.74404907226562,
        137.20758056640625,
        137.57992553710938,
        139.872314453125,
        141.90750122070312,
        139.43878173828125,
        135.18179321289062,
        138.53445434570312,
        140.1990966796875,
        140.60733032226562,
        138.09918212890625,
        141.65399169921875
      ],
      "p60": [
        139.24603271484375,
        144.94393920898438,
        146.44818115234375,
        149.04034423828125,
        153.40786743164062,
        148.11538696289062,
        146.8712158203125,
        146.50784301757812,
        148.64288330078125,
        150.95684814453125,
        150.08154296875,
        152.24917602539062
      ],
      "p70": [
        148.3831787109375,
        154.62225341796875,
        155.59909057617188,
        157.70831298828125,
        164.50392150878906,
        155.2626953125,
        158.4466552734375,
        156.0379638671875,
        156.98382568359375,
        162.65164184570312,
        160.967529296875,
        162.53396606445312
      ],
      "p80": [
        168.59693908691406,
        172.14895629882812,
        172.7495574951172,
        179.0440216064453,
        189.28578186035156,
        176.6453094482422,
        186.47830200195312,
        186.45953369140625,
        179.8290557861328,
        195.84671020507812,
        190.23480224609375,
        187.0382080078125
      ],
      "p90": [
        293.9898986816406,
        300.8810729980469,
        312.1512756347656,
        360.69140625,
        438.2392883300781,
        458.064453125,
        464.51763916015625,
        462.2373046875,
        432.5130310058594,
        459.095458984375,
        437.67340087890625,
        434.190673828125
      ]
    }
  },
  "history": {
    "dates": [
      "2025-10-27",
      "2025-11-03",
      "2025-11-10",
      "2025-11-17",
      "2025-11-24",
      "2025-12-01",
      "2025-12-08",
      "2025-12-15",
      "2025-12-22",
      "2025-12-29",
      "2026-01-05",
      "2026-01-12",
      "2026-01-19",
      "2026-01-26",
      "2026-02-02",
      "2026-02-09",
      "2026-02-16",
      "2026-02-23",
      "2026-03-02",
      "2026-03-09",
      "2026-03-16",
      "2026-03-23",
      "2026-03-30",
      "2026-04-06",
      "2026-04-13",
      "2026-04-20",
      "2026-04-27",
      "2026-05-04",
      "2026-05-11",
      "2026-05-18",
      "2026-05-25",
      "2026-06-01",
      "2026-06-08",
      "2026-06-15",
      "2026-06-22",
      "2026-06-29",
      "2026-07-06",
      "2026-07-13",
      "2026-07-20",
      "2026-07-27",
      "2026-08-03",
      "2026-08-10",
      "2026-08-17",
      "2026-08-24"
    ],
    "values": [
      0,
      0,
      0,
      5177,
      20,
      26,
      28,
      30,
      7,
      18,
      41,
      22,
      30,
      37,
      5718,
      119,
      90,
      114,
      79,
      164,
      181,
      134,
      112,
      138,
      134,
      190,
      119,
      114,
      158,
      184,
      128,
      140,
      149,
      160,
      143,
      89,
      91,
      94,
      115,
      133,
      87,
      107,
      137,
      89
    ],
    "contextSteps": 32,
    "holdoutSteps": 12,
    "extremeWeeks": {
      "2025-11-17": 5177,
      "2026-02-02": 5718
    }
  },
  "dataQuality": {
    "status": "MATERIAL WARNING",
    "shareInTwoWeeks": 73.39,
    "recordsInTwoWeeks": 10895,
    "completeWindowRecords": 14846,
    "completeWeeks": 44,
    "missingWeeks": 0,
    "invalidCreatedates": 0,
    "interpretation": "Likely import, migration, or backfill concentration until independently explained; do not treat as organic demand history."
  },
  "access": [
    [
      "Contacts",
      14897
    ],
    [
      "Companies",
      6885
    ],
    [
      "Deals",
      1675
    ],
    [
      "Calls",
      3457
    ],
    [
      "Meetings",
      260
    ],
    [
      "Tasks",
      2960
    ],
    [
      "Owners",
      9
    ],
    [
      "Forms",
      17
    ],
    [
      "Deal pipelines",
      5
    ]
  ],
  "coverage": {
    "channelMappingPercent": 22.19
  },
  "nextExperiment": [
    [
      "Explain the two spikes",
      "Use HubSpot import and audit history to classify the 2025-11-17 and 2026-02-02 concentrations."
    ],
    [
      "Define an organic target",
      "Exclude test, spam, duplicate, and imported records without rewriting raw evidence."
    ],
    [
      "Capture historical transitions",
      "Preserve immutable source and lifecycle events before channel or qualified-lead forecasting."
    ],
    [
      "Add approved future facts",
      "Use scheduled webinars, promotions, holidays, and fixed budget calendars only when documented."
    ],
    [
      "Run rolling-origin tests",
      "Require Chronos to beat persistence and a suitable seasonal baseline across several windows."
    ],
    [
      "Recalibrate uncertainty",
      "Require observed p10-p90 coverage near the intended 80% before promotion."
    ]
  ],
  "safety": [
    "No CRM writes or HubSpot configuration changes",
    "No spend, send, publish, or conversion authority",
    "No scheduled automation or production promotion",
    "TimesFM-3 received no Momentum 360 data",
    "Conversion reporting is pending validation"
  ],
  "provenance": {
    "model": "amazon/chronos-2",
    "runtime": "chronos-forecasting==2.3.1;torch==2.6.0+cpu",
    "license": "apache-2.0",
    "dataClass": "sanitized-aggregate",
    "sources": [
      "Momentum 360 HubSpot aggregate read-only evidence",
      "Chronos-2 forecast run receipt",
      "Held-out scoring receipt"
    ]
  }
};
