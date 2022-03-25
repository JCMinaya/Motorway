import { cache, addToCache, cacheContainsKey } from "./cache"

const plates = {
    "ADV 687X":"$34,534",
    "LJZ 9143":"$22,000",
    "ALZ 422" :"$44,000"
}

const retrieveFromCache = async(numberPlate) => {
    console.log("Retrieving from Cache...");
    const price = await cache.get(numberPlate).val;
    return price;
};


const getExternalPrice = async (numberPlate) => {
    console.log("Calling getExternalPrice...");
    return new Promise((resolve, reject) => {
        const random = Math.floor(Math.random() * 10) + 1;
        setTimeout(() => {
            resolve(plates[numberPlate])
        }, random * 100);
    })
};

export const getPrice = async(numberPlate, skipCacheForRead = true) => {
    if(skipCacheForRead) {
        console.log("Skipping Cache!")
        return await getExternalPrice(numberPlate);
    }
    
    if (cacheContainsKey(numberPlate)) {
        const price = await retrieveFromCache(numberPlate);
        return price;
    }

    const pricePromise = getExternalPrice(numberPlate);
    addToCache(numberPlate, pricePromise);

    const price = await retrieveFromCache(numberPlate);
    return price;
};