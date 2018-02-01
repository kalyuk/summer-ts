export function Behavior(...behaviors: Function[]) {
  return (target, property: string, descriptor: PropertyDescriptor) => {
    if (property) {
      descriptor.value = wrap(descriptor.value, behaviors);
    } else {
      Object.entries(Object.getOwnPropertyDescriptors(target.prototype))
        .forEach(([name, _descriptor]) => {
          if (name !== 'constructor') {
            target.prototype[name] = wrap(_descriptor.value, behaviors);
          }
        });
    }
  };
}

function wrap(action, behaviors) {
  return async function (...args) {
    for (const behavior of behaviors) {
      await behavior.apply(this, args);
    }
    return action.apply(this, args);
  };
}