export interface IMenuLinkPath {
  name?: string | undefined
  path?: string | undefined
  [key: string]: string | undefined
}
export default interface IMenuLink {
  title: string
  icon: string
  path: IMenuLinkPath,
  [key: string]: IMenuLinkPath | string
}
