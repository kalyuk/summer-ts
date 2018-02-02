export class BaseEvent {
  private events: Map<string, Function[]> = new Map<string, Function[]>();

  public on(event, callback: Function, priority = 99999999) {
    if (this.events.has(event)) {
      this.events.get(event).push([callback, priority]);
      this.events.get(event).sort((a, b) => a[1] - b[1]);
    } else {
      this.events.set(event, [[callback, priority]]);
    }
  }

  public async emit(event, ...params) {
    if (this.events.has(event)) {
      for (const [callback] of this.events.get(event)) {
        await callback(...params);
      }
    }
  }

}