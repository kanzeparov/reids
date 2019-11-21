import { IOperatorDatabaseRequests } from './'

export default interface IOperatorDatabase {

  /**
   * Start create tables for IOperatorDatabase
   */
  createTables (): Promise<void>

  requests: IOperatorDatabaseRequests

}
