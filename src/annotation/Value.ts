export function Value(key: string, defaultValue: any) {
  return () => {
    return {
      get: function () {
        return this.getAppContext().getConfig(key) || defaultValue;
      }
    };
  };
}