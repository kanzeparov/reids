import ky from 'ky'

export class Client {
  constructor (readonly url: string) {
    // Do Nothing
  }

  currentProgram (): Promise<any> {
    return ky.get(`${this.url}/program`).json()
  }

  programsList (): Promise<any> {
    return ky.get(`${this.url}/program/list`).json()
  }

  currentProgramOptions (): Promise<any> {
    return ky.get(`${this.url}/program/options`).json()
  }

  postProgram (name: string, options: any): Promise<any> {
    return ky.post(`${this.url}/program`, { json: {
      program:  name,
      programOptions: options
    }})
  }
}
