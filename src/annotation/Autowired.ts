export function Autowired() {
  return (target, property: string, descriptor: PropertyDescriptor) => {
    const type = Reflect.getMetadata('design:type', target, property);
    return {
      get: function () {
        return this.getAppContext().getBean(type);
      }
    };
  };
}