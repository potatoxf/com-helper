import fs from 'fs';


/**
 * 加载本地json文件
 * @param path
 * @returns {any}
 */
export function loadLocalJson(path) {
    try {
        let data = fs.readFileSync(path, {
            encoding: 'UTF-8',
            flag: 'r'
        });
        return JSON.parse(data);
    } catch (e) {
    }
    return {};
}

