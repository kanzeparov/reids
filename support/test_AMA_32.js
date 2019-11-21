
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
                    //console.log('fully received', buffer)
                	next(buffer)
            	}
        }
    }
    port.on('readable', onData)
}

async function doRead(port) {
//	var turn1 = Buffer.from(rd+'00010001d428', 'hex') //read Ua
//	var turn1 = Buffer.from(rd+'000200012428', 'hex') //read Ub
//	var turn1 = Buffer.from(rd+'0003000175e8', 'hex') //read Uc
//  var turn1 = Buffer.from(rd+'00030003f429', 'hex') //read Uall
//	var turn2 = Buffer.from(rd+'00040001c429', 'hex') //read  I1
//  var turn2 = Buffer.from(rd+'0004000a85ee', 'hex') //read  Iall
//	var turn3 = Buffer.from(rd+'0018000105ef', 'hex') //read S1
//	var turn = Buffer.from(rd+'0018000a4428', 'hex') //read all Sx
//	var turn4 = Buffer.from(rd+'000e0001e42b', 'hex') //read P1
//
//  запись фаз напряжения для рассчетов мощности соответствующих токовым датчикам  
//	var turn = Buffer.from(wr+'000100010200017f21', 'hex') //write I1Ua
//	var turn = Buffer.from(wr+'000100010200023f20', 'hex') //write I1Ub
//	var turn = Buffer.from(wr+'00020001020002', 'hex') //write I2Ub
//	var turn = Buffer.from(wr+'00030001020002', 'hex') //write I3Ub
//	var turn = Buffer.from(wr+'00040001020002', 'hex') //write I4Ub
//	var turn = Buffer.from(wr+'00050001020002', 'hex') //write I5Ub
//	var turn = Buffer.from(wr+'00060001020002', 'hex') //write I6Ub
//	var turn = Buffer.from(wr+'00070001020002', 'hex') //write I7Ub
//	var turn = Buffer.from(wr+'00080001020003', 'hex') //write I8Uс
//	var turn = Buffer.from(wr+'00090001020003', 'hex') //write I9Uс
//	var turn = Buffer.from(wr+'000a0001020003', 'hex') //write I10Uс
//
//	var turn = Buffer.from(wr+'000E00010200017fde', 'hex') //запрос (к 03 усторйству на запись 10)=wr начиная с адреса (000E)h данных размером 02 байта и их значениями (00 01) + crc diode on
//	var turn = Buffer.from(wr+'000E0001020000be1e', 'hex') //write diode off
//
	var turn1 = Buffer.from(rd+'00010024'+'15f3', 'hex')//запрос к 03 устройству на чтение 03(=rd) всех значений с адреса 0001h по адрес 0024h+ crc 
	var turn1result = await turn1F()
	var turn2result = await turn2F()

	//console.log('response 1', turn1result)
//async function turn2F (){
//	var message2 = 
//}

async function turn1F () {
	var message1 = turn1
	return new Promise(function (resolve, reject) {
		setTimeout(function() {
			port.write(message1, function () {
				console.log('query:', Buffer.from(message1))
					var eolCondition = function (buffer) {
			var Ua=(Number('0x'+buffer.toString('hex',3,5),16)/100) // читаем в стринг значения буфера соответствуещего напряжению на фазе а
                        var Ub=(Number('0x'+buffer.toString('hex',5,7),16)/100) // читаем в стринг значения буфера соответствуещего напряжению на фазе b
                        var Uc=(Number('0x'+buffer.toString('hex',7,9),16)/100) // читаем в стринг значения буфера соответствуещего напряжению на фазе c
						console.log('Ua=', Ua,' Uc=', Uc,' Ub=', Ub)
						
                        var Ilog=''
                        for (var i = 0; i < 10; i++){ 
                        var I=(Number('0x'+buffer.toString('hex',(9+i*2),(11+i*2)),16)/100)
			Ilog=Ilog+(' I'+(i+1)+'='+ I)
//                        console.log((9+i*2),(10+i*2))
//			console.log(buffer.toString('hex',(9+i*2),(11+i*2)))
			}
                        console.log(Ilog)
                               
                        
                        var Plog=''
                        for (var i = 0; i < 10; i++){ 
                        var P=Number('0x'+buffer.toString('hex',(29+i*2),(31+i*2)),16);
                        Plog=Plog+(' P'+(i+1)+'='+ P)
//			console.log(buffer.toString('hex',(29+i*2),(31+i*2)))
                            }
                        console.log(Plog)
                        
                        var Slog=''
                        for (var i = 0; i < 10; i++){ 
                        var S=Number('0x'+buffer.toString('hex',(49+i*2),(51+i*2)),16);    
                        Slog=Slog+(' S'+(i+1)+'='+ S)
//			console.log(buffer.toString('hex',(49+i*2),(51+i*2)))
                            }
                        console.log(Slog)
                        var H=Number('0x'+buffer.toString('hex',69,71),16)
                        var S=Number('0x'+buffer.toString('hex',73,75),16)
                        var M=Number('0x'+buffer.toString('hex',71,73),16)
                        console.log('time: ',H,'H',M,'M',S,'S')
                        
                        
                        
                        
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
    
}


port.once('open', function (err) {
    if (err) {
        console.log('Error: ', err.message);
    } else {
	console.log('open')
        doRead(port).then(function(){port.close(console.log('close') ) }).catch(function(){})
    }
})
