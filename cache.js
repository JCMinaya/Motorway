export const cache = new Map();
const MAX_AGE = 500;
let counter = 0;

export const cacheContainsKey = key => {
    if (!cache.has(key)) {
      return false;
    }

    console.log(counter++)
  
    const { timeStamp } = cache.get(key);
    const age = Date.now() - timeStamp; 
    if (age <= MAX_AGE) {
      return true;
    }
  
    console.log(`key ${key} age exceeds MAX_AGE: ${age}. Deleting key from cache.`);
    cache.delete(key);
    return false;
  };

export const addToCache = (key, val) => {
    cache.set(key, {
        timeStamp: Date.now(),
        val
    });
};
