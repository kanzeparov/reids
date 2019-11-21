
var SerialPort = require('serialport')
var _ = require('lodash')

const TTY = process.env.TTY || '/dev/ttyAMA0'
const rd = '0303'
const wr = '0310'

var port = new SerialPort(TTY, {
    baudRate: 115200,
    parity: 'none',
    dataBits: 8,
    stopBits: 1
})

function readUntil(port, eol, next) {
    var buffer = Buffer.from('')
    function onData() {
        var chunk = port.read()
        if (chunk) {
		console.log('response:', chunk)
            	buffer = Buffer.concat([ buffer, chunk], buffer.length + chunk.length)

            	var EOL = eol(buffer)
            	if (EOL) {
                	port.removeAllListeners("readable")
console.log('fully received', buffer)
                	next(buffer)
            	}
        }
    }
    port.on('readable', onData)
}

async function doRead(port) {
	var turn1 = Buffer.from(rd+'00010001'+'d428', 'hex') //читаем напряжение на фазе а, Ua
//	var turn = Buffer.from(rd+'00020001'+'2428', 'hex') //читаем напряжение на фазе б, Ub
//	var turn = Buffer.from(rd+'00030001'+'75e8', 'hex') //читаем напряжение на фазе с, Uc

//	var turn2 = Buffer.from(rd+'00040001'+'c429', 'hex') //читаем показания датчика силы тока 1,  I1
	var turn2 = Buffer.from(rd+'0004000A'+'85EE', 'hex') //читаем показания всех датчиков силы тока, Ix
//	var turn3 = Buffer.from(rd+'00180001'+'05ef', 'hex') //читаем рассчетуную полную мощность, S1
//	var turn3 = Buffer.from(rd+'0018000a'+'4428', 'hex') //читаем рассчетуную полную мощность всех датчиков тока, Sx
//	var turn4 = Buffer.from(rd+'000e0001'+'e42b', 'hex') //читаем рассчетуную активную мощность P1
//
	var turn3 = Buffer.from(wr+'00010001020001'+'7f21', 'hex') //write I1Ua
//	var turn = Buffer.from(wr+'00010001020002'+'3f20', 'hex') //write I1Ub

	var turn4 = Buffer.from(wr+'000E0001020001'+'7fde', 'hex') //write diode on
//	var turn = Buffer.from(wr+'000E0001020000'+'be1e', 'hex') //write diode off

	var turn1result = await turn1F()
	console.log('response 1', turn1result)
	var turn2result = await turn2F()
	console.log('response 2', turn2result)
	var turn3result = await turn3F()
	console.log('response 3', turn3result)
	var turn4result = await turn4F()
	console.log('response 4', turn4result)
//	await turn2F()
//	await turn3F()
//	await turn4F()

async function turn1F () {
	var message1 = turn1
	return new Promise(function (resolve, reject) {
		setTimeout(function() {
			port.write(message1, function () {
				console.log('query:', Buffer.from(message1))
					var eolCondition = function (buffer) {
						var length = Number(buffer[2])
						console.log('expected length', length)
						return buffer.length == length + 5
						}
					readUntil(port, eolCondition, function (buf) {
						resolve(buf)
				})
			 })
			 }, 200)
	})
}
	 
async function turn2F () {
	return new Promise(function (resolve, reject) {
		var message2 = turn2
		setTimeout(function() {
		  port.write(message2, function () {
			  console.log('query:', Buffer.from(message2))
					var eolCondition = function (buffer) {
						var length = Number(buffer[2])
						console.log('expected length', length)
						return buffer.length == length + 5
						}
				  readUntil(port, eolCondition, function (buf) {
					  resolve(buf)
			  })
		   })
		   }, 200)
	})
}

async function turn3F () {
	return new Promise(function (resolve, reject) {
		var message3 = turn3
		setTimeout(function() {
		  port.write(message3, function () {
			  console.log('query:', Buffer.from(message3))
				  var eolCondition = function (buffer) {
						var length = Number(buffer[2])
						console.log('expected length', length)
						return buffer.length == length + 5
						}
					  readUntil(port, eolCondition, function (buf) {
					  resolve(buf)
			  })
		   })
		   }, 200)
	})
}

async function turn4F () {
	return new Promise(function (resolve, reject) {
		var message4 = turn4
		setTimeout(function() {
		  port.write(message4, function () {
			  console.log('query', Buffer.from(message4))
				  var eolCondition = function (buffer) {
						  return true
					  }
				  readUntil(port, eolCondition, function (buf) {
					  resolve(buf)
			  })
		   })
		   }, 200)
	})
}

}


port.once('open', function (err) {
    if (err) {
        console.log('Error: ', err.message);
    } else {
	console.log('open')
        doRead(port).then(function(){port.close(console.log('close') ) }).catch(function(){})
        // setInterval(function () {
        //     readCurrentPower(port, function (value) {
        //         console.log('POWER', value)
        //     })
        // }, 3000)

    }
})
