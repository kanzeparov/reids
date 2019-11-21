{
  "debug": "$DEBUG",
  "quantum": "PT3S",
  "defaultPrice": "1000000000",
  "upstreamAccount": "$UPSTREAM_ACCOUNT",
  "ethereumUrl": "$ETHEREUM_API",
  "isSeller": true,
  "resolver": {
    "kind": "Bonjour"
  },
  "databaseUrl": "sqlite://$DB_FILE_PATH",
  "webInterfacePort": $SELLER_WEB_INTERFACE_PORT,
  "webInterfaceHost": "0.0.0.0",
  "wallets": [
    {
      "account": "0xCB32de2b9d1f1Efb4abDE7d24131eBeD6c649ad7",
      "mnemonic": "into quote gas spatial course veteran fan sibling snow early rookie cinnamon banana happy way"
    }
  ],
  "meters": [
    {
      "kind": "http-server",
      "account": "0xCB32de2b9d1f1Efb4abDE7d24131eBeD6c649ad7",
      "port": $SELLER_WEB_INTERFACE_PORT
    }
  ],
  "tokenContract": "0xD4a2AcE348c122EdCA6e0e11AD1c6e21EeE36C5C"
}
