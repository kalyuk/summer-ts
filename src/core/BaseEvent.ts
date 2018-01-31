export class BaseEvent {
  private events: Map<string, Function[]> = new Map<string, Function[]>();

  public on(event, callback: Function) {
    if (this.events.has(event)) {
      this.events.get(event).push(callback);
    } else {
      this.events.set(event, [callback]);
    }
  }

  public async emit(event, ...params) {
    if (this.events.has(event)) {
      for (const callback of this.events.get(event)) {
        await callback(...params);
      }
    }
  }

}