export interface IDictionary {
  [key: string]: string
}

export interface IListItem {
  label: string
  value: string
}

export default class Dictionary {
  private dictionary: IDictionary
  private list: IListItem[]
  constructor (dictionary: IDictionary) {
    this.dictionary = dictionary
    this.list = this.createList()
  }
  createList (): IListItem[] {
    return Object.keys(this.dictionary).map(value => ({
      label: this.dictionary[value],
      value
    }))
  }
  getList () {
    return this.list
  }
  getFirstValue (): string {
    if (this.list.length > 0) {
      return this.list[0].value
    }
    return ''
  }
}
