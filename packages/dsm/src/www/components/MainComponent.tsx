import * as React from 'react'
import { ConstantPriceOptionsComponent } from './ConstantPriceOptionsComponent'
import { PeakBalancingOptionsComponent } from './PeakBalancingOptionsComponent'
import { ProgramSelector } from './ProgramSelector'
import { Client } from './Client'

export interface MainComponentState {
  currentProgram: string
  json: any
  dirty: boolean
}

export interface Props {
  client: Client
}

export class MainComponent extends React.Component<Props, MainComponentState> {
  client: Client

  constructor (props: Props) {
    super(props)
    this.client = this.props.client
    this.state = {
      currentProgram: '',
      json: {},
      dirty: false
    }
  }

  onSelectProgram (program: string) {
    this.setState({ currentProgram: program, dirty: true })
  }

  onDataLoaded (data: any) {
    this.setState({ json: data })
  }

  onJSONChanged (data: any) {
    this.setState({ json: data, dirty: true })
  }

  renderProgramOptions () {
    if (this.state.currentProgram === 'constant-price') {
      return <ConstantPriceOptionsComponent onJSONChanged={this.onJSONChanged.bind(this)} json={this.state.json} />
    } else {
      return <PeakBalancingOptionsComponent onJSONChanged={this.onJSONChanged.bind(this)} json={this.state.json} />
    }
  }

  async onUpdateButtonClick () {
    await this.client.postProgram(this.state.currentProgram, this.state.json)
    this.setState({ dirty: false })
  }

  async componentDidMount () {
    const currentProgram = await this.client.currentProgram()
    const json = await this.client.currentProgramOptions()
    this.onSelectProgram(currentProgram.value)
    this.onDataLoaded(json.value)
    this.setState({ dirty: false })
  }

  render () {
    return (
      <div className={'row'}>
        <div className={'offset1'}>
          <h2>DSM Configuration GUI</h2>
          <ProgramSelector
            client={this.client}
            onSelectProgram={this.onSelectProgram.bind(this)}
            selected={this.state.currentProgram}
          />
          { this.renderProgramOptions() }
          <br />
          <button
            className={`btn ${this.state.dirty ? 'btn-danger' : 'btn-primary'}`}
            onClick={this.onUpdateButtonClick.bind(this)}>Update</button>
        </div>
      </div>
    )
  }
}
