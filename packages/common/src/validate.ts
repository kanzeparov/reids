import validate from 'validate.js'
import * as moment from 'moment'

validate.validators.isDuration = function (value: string) {
  const recovered = moment.duration(value).toISOString()
  const isDuration = recovered === value
  if (!isDuration) {
    return `should be ISO8601 duration, got "${value}"`
  } else {
    return undefined
  }
}

validate.validators.containsAccount = function (value: Array<any>) {
  const isEmpty = value.some(v => validate.isEmpty(v.account))
  if (isEmpty) {
    return `should contain account, got only "${JSON.stringify(value)}"`
  } else {
    return undefined
  }
}

export default validate
