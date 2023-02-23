import {loadLocalJson} from './local-service'
import {choiceEffectiveValue, copySpecifyAttribute, getEffectiveValue} from './objects'
import axios from "axios";

// 配置键名称
const configNameList = [
    'responseConfig', 'host', 'port', 'basePath', 'timeout', 'withCredentials', 'headers'
];

// 默认网络配置
const default_net_service_config = {
    // 响应数据
    responseConfig: {
        // 是否成功标识名称
        flagName: 'suc',
        // 代码名称
        codeName: 'code',
        // 消息名称
        messageName: 'message',
        // 数据名称
        dataName: 'data',
        // 成功代码列表
        successCodeList: [0, 200],
    },
    host: "http://127.0.0.1",
    port: 8080,
    basePath: "/",
    timeout: 1000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    // axiosInstance: {}
}
// 加载配置并与默认配置合并
const net_service_config = copySpecifyAttribute(configNameList, default_net_service_config, loadLocalJson('/net-service-config.json'));

/**
 * 获取axios实例相关配置
 * @param axiosInstanceName axios实例名
 * @returns {{}}
 */
function getConfig(axiosInstanceName) {
    //加载全局配置
    let config = copySpecifyAttribute(configNameList, net_service_config, {});
    let axiosInstanceConfig;
    if (net_service_config.hasOwnProperty('axiosInstance') &&
        (axiosInstanceConfig = net_service_config.axiosInstance[axiosInstanceName]) != null) {
        //加载每个axios实例配置
        config = copySpecifyAttribute(configNameList, axiosInstanceConfig, config);
    }
    return config;
}

/**
 * 网络服务，包含多个axios
 */
class NetService {
    constructor(serviceMap, exiosMap) {
        this.dataConfig = serviceMap;
        this.exiosMap = exiosMap;
    }

    /**
     * 获取Axios服务实例
     * @param axiosInstanceName
     * @returns {AxiosService}
     */
    getAxiosService(axiosInstanceName) {
        if (this.exiosMap.hasOwnProperty(axiosInstanceName)) {
            return new AxiosService(this.dataConfig[axiosInstanceName], this.exiosMap[axiosInstanceName]);
        }
        throw new Error(`Error to get ${axiosInstanceName} axios instance beause this is not exists`);
    }
}


/**
 *  处理 axios返回值
 * @param p {Promise<?>}
 * @returns {Promise<?>}
 */
function handleAxiosServiceResult(p) {
    return p.then(res => {
        const responce = res;
        let isSuccess = false;

        // 判断有成功标识
        if (responce.hasOwnProperty(this.axiosInstanceConfig.flagName)) {
            isSuccess = !!responce[this.axiosInstanceConfig.flagName];
        }
        // 判断有成功代码
        else if (responce.hasOwnProperty(this.axiosInstanceConfig.codeName)) {
            const code = responce[this.axiosInstanceConfig.codeName];
            if (this.axiosInstanceConfig.successCodeList
                && this.axiosInstanceConfig.successCodeList.includes(code)) {
                isSuccess = true;
            }
        }

        // 成功
        if (isSuccess) {
            const message = getEffectiveValue(responce, this.axiosInstanceConfig.messageName, 'SUCCESS')
            const data = getEffectiveValue(responce, this.axiosInstanceConfig.dataName, null)

            return data;
        }
        //失败
        const message = getEffectiveValue(responce, this.axiosInstanceConfig.messageName, 'FAILURE')

        return null;
    }).catch(rej => {
        console.log(rej);
        return null;
    });
}

/**
 * Axios服务
 */
class AxiosService {
    constructor(axiosInstanceConfig, axiosInstance) {
        this.axiosInstanceConfig = axiosInstanceConfig;
        this.axiosInstance = axiosInstance;
    }

    get(path, config) {
        return handleAxiosServiceResult.call(this, this.axiosInstance.get(path, config));
    }

    post(path, data, config) {
        return handleAxiosServiceResult.call(this, this.axiosInstance.post(path, data, config));
    }

    put(path, data, config) {
        return handleAxiosServiceResult.call(this, this.axiosInstance.put(path, data, config));
    }

    patch(path, data, config) {
        return handleAxiosServiceResult.call(this, this.axiosInstance.patch(path, data, config));
    }

    delete(path, config) {
        return handleAxiosServiceResult.call(this, this.axiosInstance.delete(path, config));
    }

    head(path, config) {
        return handleAxiosServiceResult.call(this, this.axiosInstance.head(path, config));
    }

    options(path, config) {
        return handleAxiosServiceResult.call(this, this.axiosInstance.options(path, config));
    }

    postForm(path, data, config) {
        return handleAxiosServiceResult.call(this, this.axiosInstance.postForm(path, data, config));
    }

    putForm(path, data, config) {
        return handleAxiosServiceResult.call(this, this.axiosInstance.putForm(path, data, config));
    }

    patchForm(path, data, config) {
        return handleAxiosServiceResult.call(this, this.axiosInstance.patchForm(path, data, config));
    }
}

// 配置案例
const demo_config = {
    request: {
        successHandler: function (value) {

        },
        errorHandler: function (value) {

        },
        options: {}
    },
    response: {
        successHandler: function (value) {

        },
        errorHandler: function (value) {

        },
        options: {}
    },
    services: {
        main: {
            // 响应数据
            responseConfig: {
                // 是否成功标识名称
                flagName: 'suc',
                // 代码名称
                codeName: 'code',
                // 消息名称
                messageName: 'message',
                // 数据名称
                dataName: 'data',
                // 成功代码列表
                successCodeList: [0, 200],
            },
            host: "http://127.0.0.1",
            port: 8080,
            basePath: "/",
            timeout: 1000,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            request: {
                successHandler: function (value) {

                },
                errorHandler: function (value) {

                },
                options: {}
            },
            response: {
                successHandler: function (value) {

                },
                errorHandler: function (value) {

                },
                options: {}
            }
        }
    }
};

/**
 *
 * 创建网络服务，里面包括多个
 * @param config {demo_config}
 * @returns {NetService}
 */
function createNetService(config) {
    const serviceMap = {};
    const exiosMap = {};
    if (config.hasOwnProperty('services')) {
        for (const name in config.services) {
            const serviceConfig = config.services[name];
            // 处理配置
            const serviceOption = copySpecifyAttribute(configNameList, serviceConfig, getConfig(name));

            const exiosInstance = axios.create(serviceOption)

            //设置拦截器
            if (serviceConfig.request) {
                const successHandler = choiceEffectiveValue(serviceConfig.request.successHandler, config.request.successHandler, 'function')
                const errorHandler = choiceEffectiveValue(serviceConfig.request.errorHandler, config.request.errorHandler, 'function')
                const options = choiceEffectiveValue(serviceConfig.request.options, config.request.options, 'object')
                exiosInstance.interceptors.request.use(successHandler, errorHandler, options);
            }
            //设置拦截器
            if (serviceConfig.response) {
                const successHandler = choiceEffectiveValue(serviceConfig.response.successHandler, config.response.successHandler, 'function')
                const errorHandler = choiceEffectiveValue(serviceConfig.response.errorHandler, config.response.errorHandler, 'function')
                const options = choiceEffectiveValue(serviceConfig.response.options, config.response.options, 'object')
                exiosInstance.interceptors.response.use(successHandler, errorHandler, options);
            }
            serviceMap[name] = serviceOption;
            exiosMap[name] = exiosInstance;
            //不可修改
            Object.defineProperty(exiosInstance, name, {
                writable: false,
                configurable: false
            });
        }
    }
    return new NetService(serviceMap, exiosMap);
}

export {
    createNetService
}
