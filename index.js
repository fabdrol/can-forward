'use strict'

const HOME = process.env.HOME
const config = require(HOME + '/can-forward-config.json')
const can = require('socketcan')
const debug = require('debug')('can-forward')
let restartTimeout = null

function handleError (channel, err) {
	debug(`Got error on channel ${channel}: ${err.message}`)
}

function getPGNfromID (id) {
	let idString = id.toString(2)
 	const missingZeroes = 32 - idString.length
 	for (let i = 0; i < missingZeroes; i += 1) {
		idString = `0${idString}`
	}
	const DP = `0000000${idString[7]}`
	const PF = idString.slice(8, 16)
	const PS = idString.slice(16, 24)

	return (parseInt(DP, 2) << 16) + (parseInt(PF, 2) << 8) + (parseInt(PS, 2))
}

function main () {
	debug('CONFIG:' + JSON.stringify(config, null, 2))
	const canFrom = can.createRawChannel(config.from || 'can0', true);
	const canTo = can.createRawChannel(config.to || 'vcan0', true);

	canFrom.addListener('onMessage', (message) => {
		const PGN = getPGNfromID(message.id)
		let forward = false

		if (config.filter === false) {
			forward = true
		} else if (config.filter === 'include') {
			forward = config.include.includes(PGN)
		} else if (config.filter === 'exclude') {
			forward = true
			forward = !config.exclude.includes(PGN)
		}

		if (forward === false) {
			debug(`Not forwarding message: ${PGN} (filter = ${config.filter})`)
			return
		}

		debug(`Forwarding message: ${PGN} (filter = ${config.filter})`)
		canTo.send(message)
	})

	canFrom.addListener('onStopped', () => {
		console.error(`CAN-forward: ${config.from} stopped, aborting.`)
		process.exit(1)
	})

	canTo.addListener('onStopped', () => {
		console.error(`CAN-forward: ${config.to} stopped, aborting.`)
		process.exit(1)
        })

	canTo.start()
	canFrom.start()
}

// Execute main...
main()
