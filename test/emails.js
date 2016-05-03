var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var expect = chai.expect; // we are using the "expect" style of Chai
// var CartSummary = require('./../../src/part1/cart-summary');
const Q   = require("Q");
const config  = require(".custom/config");
const git     = require(".custom/touno-git").control;

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport(config.smtp);
const path = require('path');
const EmailTemplate = require('email-templates').EmailTemplate;

let options = {

}

let data = {

}

let req = {
  headers: [],
  repo: ''
}


describe('function email-templates()', function() {
  it('templates -- changeset-branch', function() {
    return git.email('changeset-branch', options, data, req).then(function(result){
      expect(result).to.equal(undefined);
    });
    // var cartSummary = new CartSummary([]);
  });

  it('templates -- changeset-email', function() {
    return git.email('changeset-email', options, data, req).then(function(result){
      expect(result).to.equal(undefined);
    });
    // var cartSummary = new CartSummary([]);
  });

  it('templates -- changeset-logs', function() {
    return git.email('changeset-logs', options, data, req).then(function(result){
      expect(result).to.equal(undefined);
    });
    // var cartSummary = new CartSummary([]);
  });

  it('templates -- forgot-password', function() {
    return git.email('forgot-password', options, data, req).then(function(result){
      expect(result).to.equal(undefined);
    });
    // var cartSummary = new CartSummary([]);
  });
});
