import IRoom from '../IRoom'

export default class RoomStorage {
  private static instance: RoomStorage
  private rooms: Array <IRoom> = []

  private constructor () {

  }

  public static getInstance (): RoomStorage {
    if (!RoomStorage.instance) {
      RoomStorage.instance = new RoomStorage()
    }
    return RoomStorage.instance
  }

  addRoom (room: IRoom) {
    this.rooms.push(room)
  }

  getAllRooms (): Array<IRoom> {
    return this.rooms
  }

  removeRoom (room: IRoom) {
    const index = this.rooms.indexOf(room)
    if (index === -1) {
      return
    }
    this.rooms.splice(index, 1)
  }
}
