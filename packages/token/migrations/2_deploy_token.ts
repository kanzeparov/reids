import * as Deployer from 'truffle-deployer'

const Token = artifacts.require('./Token.sol')

module.exports = function (deployer: Deployer) {
  return deployer.deploy(Token)
}
