export function keyToString(object, value){
    for (let objKey in object) {
        if (object[objKey] === value) {
            return objKey;
        }
    }
    return false;
}