const http = require('http');
const sinon = require('sinon');

module.exports = function getMockRequest() {
  return sinon.createStubInstance(http.ClientRequest);
};
