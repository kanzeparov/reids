export default class InvalidConfigError extends Error {
  validations: Array<string>

  constructor (validations: Array<string>) {
    super('Incorrect config file')
    this.validations = validations
  }
}
