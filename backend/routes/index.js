const express = require("express");
const cookieParser = require("cookie-parser");
const router = express.Router();
const bodyParser = require("body-parser");
const FoxPay = require("../config/foxPay");

const app = express();

const fs = require("fs");

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/pay", (req, res) => {
  const body = req.body;
  let toSignature = {
    merchant_id_code: "s-e.lt",
    amount: body.amount, //
    currency: "EUR",
    transaction: body.transaction, //
    encoding: "UTF-8",
    lang: "lt_LT",
    immediate_return: "0",
    // payment_method_id_code: "seb", include this param if you want to skip bank page
    snd_email: body.snd_email, //
    version: "002",
  };

  let foxPay = new FoxPay();
  foxPay.ValidateFormFields(toSignature);
  let encode = foxPay.getSignString(toSignature);
  let signature = foxPay.privateSignature(encode);

  let params = {
    merchant_id_code: "s-e.lt",
    amount: body.amount,
    currency: "EUR",
    transaction: body.transaction, // unique up to 15 symbols
    encoding: "UTF-8",
    lang: "lt_LT",
    immediate_return: "0",
    //lang:'en_US',
    //lang:'lv_LV',
    //lang:'ru_RU',
    // payment_method_id_code: "seb", // provide this param if you want to skip bank page
    snd_email: body.snd_email,
    version: "002",
    signature: `${signature}`,
    // msg : "test message",
    // reference" : "1001",
    // encoding : "UTF-8",
    // payment_report : 0,
    // status : 0,
  };

  let generatedForm = foxPay.generateForm(params);

  res.status(200);
  res.contentType("application/json");
  res.send({ params });

  // const qrRequest = "https://p.foxpay.lt/transaction/qr-receive?"; // GET
  // const postRequest = "https://p.foxpay.lt/transaction/choose-payment-method";
  // const testSuccess = "https://p.foxpay.lt/transaction/test/report-payment-success";
  // const testCanceled = "https://p.foxpay.lt/transaction/test/report-payment-canceled";
  // const testAccept = "https://p.foxpay.lt/transaction/test/customer-return-payment-success";
  // const testFail = "https://p.foxpay.lt/transaction/test/customer-return-payment-canceled";
});

router.post("/callback", (req, res) => {
  const callback = req.body;
  const signature = req.body.signature;
  let foxPay = new FoxPay();
  let key = "signature";
  delete callback[key];
  let encode = foxPay.getSignString(callback);
  let publicSignature = foxPay.publicSignature(encode, signature);
  if (publicSignature) {
    res.send({ status: "success" });
  } else {
    res.send({ status: "failed", error: "Something went wrong" });
  }
});

router.post("/accept", (req, res) => {
  res.redirect("https://ecsavitarna.swarm.testavimui.eu/accept");
});

router.post("/cancel", (req, res) => {
  res.redirect("https://ecsavitarna.swarm.testavimui.eu/cancel");
});

module.exports = router;
