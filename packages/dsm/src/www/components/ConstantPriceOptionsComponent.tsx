import * as React from 'react'

export interface ConstantPriceOptionsComponentProps {
  json: any
  onJSONChanged: (json: any) => void
}

export class ConstantPriceOptionsComponent extends React.Component<ConstantPriceOptionsComponentProps> {
  constructor (props: ConstantPriceOptionsComponentProps) {
    super(props)
  }

  render () {
    return (
      <div>
        <label
          htmlFor={'price'}>Price:
        </label>
        <input type={'text'} name={'price'}
               onChange={e => this.props.onJSONChanged({ ...this.props.json, price: e.target.value })}
               defaultValue={this.props.json.price}
        /><br />
      </div>
    )
  }
}
