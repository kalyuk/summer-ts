export class ItemModel<T> {
  public get item(): T {
    return this._item;
  }

  public set item(value: T) {
    this._item = value;
  }

  private _item: T;

  constructor(item: T) {
    this.item = item;
  }
}