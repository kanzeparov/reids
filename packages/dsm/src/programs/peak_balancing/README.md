## Peak Balancing Plugin

pluginOptions in DSM's config.json:
```
{
  "pluginOptions" : {
    "Wmax": 100,    // Maximum consumption
    "minCost": 3.8, // Minimum energy cost
    "maxCost": 5.6, // Maximum energy cost
    "source": {
      "http: "http://52.183.35.245:9000/api/reports/consumption" // Backend Consumption reporting API
    },
    "peakTime": [   // Definition of special time ranges
      {
        "from": "18:00",
        "to": "23:00"
      }, {
        "from": "07:00",
        "to": "13:00"
      } // you can specify as many date ranges as you want
    ],
    "semiPeakTime": [
      {
        "from": "13:00",
        "to": "18:00"
      }
    ],
    "nightTime": [
      {
        "from": "23:00",
        "to": "24:00"
      },
      {
        "from": "00:00",
        "to": "07:00"
      }
    ]
}
```

BEWARE:
- The intervals in peakTime, semiPeakTime, nightTime should cover all of the 24 hours.
- End of the day is `24:00`, rather than `00:00`.
