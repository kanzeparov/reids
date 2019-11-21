module.exports = {
  copyPackages: ['openzeppelin-solidity'],
  testCommand: 'truffle test dist/*.test.js',
  skipFiles: ['DERToken.sol']
}
