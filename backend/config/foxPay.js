var crypto = require("crypto");
var fs = require("fs");
var path = require("path");
var sprintf = require("sprintf-js").sprintf;
const sign = crypto.createSign("SHA256");

function FoxPay(config) {
  this.defaultConfig = config || {};

  this.publicKey = fs.readFileSync(
    path.join(__dirname, "../syspublic.key"),
    "utf8"
  );
  this.privateKey = fs.readFileSync(
    path.join(__dirname, "../merchantprivate.key"),
    "utf8"
  );
}

FoxPay.prototype.getSignString = function (form) {
  const result = JSON.stringify(form).replace(/[\u0080-\u10FFFF]/g, "x").length;
  let signString = "";
  if (result > 0) {
    const entries = Object.entries(form);
    const nonEmpty = entries.filter(([key, val]) => val !== "");
    const output = Object.fromEntries(nonEmpty);
    Object.values(output).every(function (value) {
      const valueLength = value.length;
      signString += sprintf("%03d", valueLength) + value;
      return signString;
      // }
    });
    return signString;
  }
};

FoxPay.prototype.generateForm = function (form) {
  if (this.ValidateFormFields(form)) {
    var formData = "";
    Object.keys(form).forEach(function (k) {
      formData += `<input
    readOnly={true}
    style={{ display: "none"}}
    name="${k}"
    value="${form[k]}"
  />`;
    });
  }
  return formData;
};

FoxPay.prototype.ValidateFormFields = function (form) {
  const merchant_id_code = Object.prototype.hasOwnProperty.call(
    form,
    "merchant_id_code"
  );
  const amount = Object.prototype.hasOwnProperty.call(form, "amount");
  const currency = Object.prototype.hasOwnProperty.call(form, "currency");
  const transaction = Object.prototype.hasOwnProperty.call(form, "transaction");
  const encoding = Object.prototype.hasOwnProperty.call(form, "encoding");
  const lang = Object.prototype.hasOwnProperty.call(form, "lang");
  const snd_email = Object.prototype.hasOwnProperty.call(form, "snd_email");
  const version = Object.prototype.hasOwnProperty.call(form, "version");
  if (
    !merchant_id_code ||
    !amount ||
    !currency ||
    !transaction ||
    !encoding ||
    !lang ||
    !snd_email ||
    !version
  ) {
    return false;
  } else {
    return true;
  }
};

FoxPay.prototype.privateSignature = function (data) {
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(data)
    .sign(this.privateKey, "base64")
    .replace(/[\r|\n]/, "");
  return signature;
};

FoxPay.prototype.publicSignature = function (signedSignature, form) {
  const verify = crypto
    .createVerify("RSA-SHA256")
    .update(signedSignature)
    .verify(this.publicKey, form, "base64");
  return verify;
};

module.exports = FoxPay;
