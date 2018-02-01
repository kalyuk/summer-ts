export function Value(key: string, defaultValue: any) {
  return (target, property): any => {
    return {
      get: function () {
        return this.getAppContext().getConfig(key) || defaultValue;
      }
    };
  };
}