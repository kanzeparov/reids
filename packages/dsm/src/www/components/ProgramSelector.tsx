import * as React from 'react'
import { Client } from './Client'

export interface ProgramSelectorProps {
  client: Client
  onSelectProgram: (program: string) => void
  selected: string
}

export interface ProgramSelectorState {
  programs: string[]
}

export class ProgramSelector extends React.Component<ProgramSelectorProps, ProgramSelectorState> {
  client: Client

  constructor (props: ProgramSelectorProps) {
    super(props)
    this.client = props.client

    this.state = {
      programs: []
    }
  }

  async componentDidMount () {
    const json = await this.client.programsList()
    this.setState({ programs: json.value })
  }

  render () {
    return (
      <div>
        <label htmlFor={'programs'}>DSM Program:</label>
        <select name={'programs'} onChange={(e) => this.props.onSelectProgram(e.target.value)} value={this.props.selected}>
          {
            this.state.programs.map(value => {
              return <option key={value} value={value}>{value}</option>
            })
          }
        </select>
      </div>
    )
  }
}
