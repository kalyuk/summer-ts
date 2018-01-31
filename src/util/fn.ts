export function isCyclic(target) {
  const seenObjects = [];

  function detect(obj) {
    if (obj && typeof obj === 'object') {
      if (seenObjects.indexOf(obj) !== -1) {
        return true;
      }
      seenObjects.push(obj);
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && detect(obj[key])) {
          // tslint:disable-next-line
          console.log(`${obj.name}, cycle at ${key}`);
          return true;
        }
      }
    }
    return false;
  }

  return detect(target);
}