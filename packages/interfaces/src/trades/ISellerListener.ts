import { ILightPayment } from './'

export default interface ISellerListener {
  onSell (payment: ILightPayment): Promise<void>
}
