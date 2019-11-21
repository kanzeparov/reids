import * as sequelize from 'sequelize'

const BigNumberColumn = sequelize.DECIMAL({ precision: 78, scale: 0 })

export default BigNumberColumn
