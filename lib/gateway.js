'use strict';

var braintree = require('braintree');
var environment, gateway;

require('dotenv').load();
// environment = process.env.BT_ENVIRONMENT.charAt(0).toUpperCase() + process.env.BT_ENVIRONMENT.slice(1);
environment = process.env.BT_ENVIRONMENT;

gateway = braintree.connect({
  environment: braintree.Environment[environment],
  merchantId: process.env.BT_MERCHANT_ID,
  publicKey: process.env.BT_PUBLIC_KEY,
  privateKey: process.env.BT_PRIVATE_KEY
});

var TRANSACTION_SUCCESS_STATUSES = [
  braintree.Transaction.Status.Authorizing,
  braintree.Transaction.Status.Authorized,
  braintree.Transaction.Status.Settled,
  braintree.Transaction.Status.Settling,
  braintree.Transaction.Status.SettlementConfirmed,
  braintree.Transaction.Status.SettlementPending,
  braintree.Transaction.Status.SubmittedForSettlement
];

module.exports = {
  gateway: gateway,
  TRANSACTION_SUCCESS_STATUSES: TRANSACTION_SUCCESS_STATUSES,
};
