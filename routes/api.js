'use strict';

var express = require('express');
var braintree = require('braintree');
var router = express.Router(); // eslint-disable-line new-cap
var gateway = require('../lib/gateway').gateway;
var TRANSACTION_SUCCESS_STATUSES = require('../lib/gateway').TRANSACTION_SUCCESS_STATUSES;

var HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_ERROR: 500,
}

function formatErrors(errors) {
  var formattedErrors = '';

  for (var i in errors) { // eslint-disable-line no-inner-declarations, vars-on-top
    if (errors.hasOwnProperty(i)) {
      formattedErrors += 'Error: ' + errors[i].code + ': ' + errors[i].message + '\n';
    }
  }
  return formattedErrors;
}

function createResultObject(transaction) {
  var status = transaction.status;
  var result = {
    status,
    transaction,
    isSuccess: TRANSACTION_SUCCESS_STATUSES.indexOf(status) !== -1,
  };

  return result;
}

router.get('/checkouts/new', function (req, res) {
  gateway.clientToken.generate({}, function (err, response) {
    res.status(201) // CREATED
      .json({ token: response.clientToken });
  });
});

router.get('/checkouts/:id', function (req, res) {
  var result;
  var transactionId = req.params.id;

  gateway.transaction.find(transactionId, function (err, transaction) {
    res.status(200) // SUCCESS
      .json(createResultObject(transaction));
  });
});

router.post('/checkouts', function (req, res) {
  var transactionErrors;
  var amount = req.body.amount; // In production you should not take amounts directly from clients
  var nonce = req.body.payment_method_nonce;

  gateway.transaction.sale({
    amount: amount,
    paymentMethodNonce: nonce,
    options: {
      submitForSettlement: true
    }
  }, function (err, result) {
    if (result.success || result.transaction) {
      res.status(201) // CREATED
        .json(createResultObject(transaction));
    } else {
      transactionErrors = result.errors.deepErrors();
      res.status(422) // UNPROCESSABLE ENTITY
        .json(transactionErrors);
    }
  });
});

// error handlers
var errorHandler = function initApiErrorHandler(env) {
  var stacktraceIncluded = true;

  if (env && env === 'production') {
    stacktraceIncluded = false;
  }

  return function apiErrorHandler(err, req, res, next) {
    var errResult = { message: err.message };

    if (stacktraceIncluded) {
      errResult.error = err.stack
    }

    res.status(err.status || HTTP_STATUS.INTERNAL_ERROR)
      .json(errResult);
  };
}

module.exports = {
  router: router,
  errorHandler: errorHandler,
};
