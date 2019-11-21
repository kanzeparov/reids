// import chai from 'chai'
// const expect = require('chai').expect
// import chaiHttp from 'chai-http'
// import BigNumber from 'bignumber.js'
// import { ResponseStatus } from '@onder/interfaces'
// import { default as MeterTransport, END_POINT_METER_CONFIGURATION } from '../MeterTransport'
// import Core from '../../Core'
// import METER_CONFIGURATION from '../../Configuration/METER_CONFIGURATION'
//
// const meterConfiguration = new METER_CONFIGURATION('123', '123', '123', new BigNumber(0))
// const core = Core.getInstanceCore()
// const transport = new MeterTransport(core)
// transport.start(meterConfiguration)
// const server = transport.getServer()
//
// chai.use(chaiHttp)
//
// describe('Meter Transport', async function () {
//   it('Send configuration success', function (done) {
//     chai.request(server)
//       .post(END_POINT_METER_CONFIGURATION)
//       .send({
//         'key': 'key',
//         'connection': '',
//         'faultValue': 0
//       })
//       .end((err, res) => {
//         expect(err).to.be.null
//         expect(res).to.have.status(200)
//         expect(res.body.status).to.equal(ResponseStatus.Success)
//         done()
//       })
//   })
// })
