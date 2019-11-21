import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { MainComponent } from './MainComponent'
import { Client } from './Client'

const DSM_URL = process.env.DSM_URL && process.env.DSM_URL !== 'undefined' ? process.env.DSM_URL : 'http://localhost:8090'

const client = new Client(DSM_URL)

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <MainComponent client={client} />,
    document.getElementById('mount')
  )
})
