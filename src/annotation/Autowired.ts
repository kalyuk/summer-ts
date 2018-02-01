export function Autowired() {
  return (target, property: string): any => {
    const type = Reflect.getMetadata('design:type', target, property);
    return {
      get: function () {
        return this.getAppContext().getBean(type);
      }
    };
  };
}