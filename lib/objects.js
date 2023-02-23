/**
 * 是否是值对象
 * @param fromData
 * @returns {boolean}
 */
export function isValueObject(fromData) {
    return fromData === undefined
        || fromData === null
        || typeof fromData === 'number'
        || typeof fromData === 'string'
        || typeof fromData === 'boolean'
        || typeof fromData === 'function'
        || typeof fromData === 'undefined';
}

/**
 * 复制指定属性
 * @param names
 * @param from
 * @param to
 * @returns {{}}
 */
export function copySpecifyAttribute(names = [], from = {}, to = {}) {
    for (let name of names) {
        if (from.hasOwnProperty(name)) {
            const fromData = from[name]
            if (fromData) {
                if (isValueObject(fromData)) {
                    to[name] = fromData;
                } else if (Array.isArray(fromData)) {
                    if (Array.isArray(to[name])) {
                        let arr = [];
                        arr.push(...to[name]);
                        arr.push(...fromData);
                        to[name] = arr;
                    } else if (isValueObject(to[name])) {
                        let arr = [];
                        arr.push(to[name])
                        arr.push(...fromData);
                        to[name] = arr;
                    } else {
                        let arr = [];
                        arr.push(...fromData);
                        to[name] = arr;
                    }
                } else if (typeof fromData == 'object') {
                    if (isValueObject(to[name])) {
                        to[name] = copySpecifyAttribute(Object.keys(fromData), fromData, {});
                    } else {
                        to[name] = copySpecifyAttribute(Object.keys(to[name]), to[name], {});
                        to[name] = copySpecifyAttribute(Object.keys(fromData), fromData, to[name]);
                    }
                } else {
                    // no support
                }
            }
        }
    }
    return to;
}

/**
 * 选择有效值
 * @param value
 * @param defaultValue
 * @param requireType
 * @returns {null|*}
 */
export function choiceEffectiveValue(value, defaultValue, requireType = 'object') {
    if (typeof value === requireType) {
        return value;
    }
    if (typeof defaultValue === requireType) {
        return defaultValue;
    }
    return null;
}

/**
 * 获取有效值
 * @param object
 * @param name
 * @param defaultValue
 * @returns {*}
 */
export function getEffectiveValue(object, name, defaultValue) {
    if (object && object.hasOwnProperty(name)) {
        return object[name];
    }
    return defaultValue;
}
