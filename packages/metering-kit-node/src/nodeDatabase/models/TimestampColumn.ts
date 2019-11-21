import * as sequelize from 'sequelize'

const TimestampColumn = sequelize.DECIMAL({ precision: 64, scale: 0 })

export default TimestampColumn
