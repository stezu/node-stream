var http = require('http');
var sinon = require('sinon');

module.exports = function getMockRequest() {
  return sinon.createStubInstance(http.ClientRequest);
};
