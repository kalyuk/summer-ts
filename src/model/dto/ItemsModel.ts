export class ItemsModel<T> {
  constructor(public items: T, public total: number = 0, public page: number) {

  }
}