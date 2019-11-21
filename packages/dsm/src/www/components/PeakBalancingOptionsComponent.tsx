import * as React from 'react'

export interface PeakBalancingOptionsComponentProps {
  json: any
  onJSONChanged: (json: any) => void
}

export class PeakBalancingOptionsComponent extends React.Component<PeakBalancingOptionsComponentProps> {
  constructor (props: PeakBalancingOptionsComponentProps) {
    super(props)
  }

  render () {
    return (
      <div>
        <label htmlFor={'wmax'}>Wmax:</label>
        <input
          type={'wmax'}
          name={'wmax'}
          defaultValue={this.props.json.Wmax}
          onChange={e => this.props.onJSONChanged({ ...this.props.json, Wmax: e.target.value })}
        /><br />
        <label htmlFor={'peakTime'}>peakTime:</label>
        <textarea
          rows={4}
          cols={70}
          name={'peakTime'}
          onChange={e => this.props.onJSONChanged({ ...this.props.json, peakTime: JSON.parse(e.target.value) })}
          value={JSON.stringify(this.props.json.peakTime)}
        /><br />
        <label htmlFor={'midPeakTime'}>midPeakTime:</label>
        <textarea
          rows={4}
          cols={70}
          name={'midPeakTime'}
          onChange={e => this.props.onJSONChanged({ ...this.props.json, semiPeakTime: JSON.parse(e.target.value) })}
          value={JSON.stringify(this.props.json.semiPeakTime)}
        /><br />
        <label htmlFor={'offPeakTime'}>offPeakTime:</label>
        <textarea
          rows={4}
          cols={70}
          name={'offPeakTime'}
          onChange={e => this.props.onJSONChanged({ ...this.props.json, nightTime: JSON.parse(e.target.value) })}
          value={JSON.stringify(this.props.json.nightTime)}
        /><br />
      </div>
    )
  }
}
