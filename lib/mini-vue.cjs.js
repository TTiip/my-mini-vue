'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var createNode = function (type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    return vnode;
};
var getShapeFlag = function (type) {
    return typeof type === 'string' ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
};

var extend = Object.assign;
var isObject = function (val) {
    return val !== null && typeof val === 'object';
};
var hasOwn = function (val, key) { return Object.prototype.hasOwnProperty.call(val, key); };

var publicPropertiesMap = {
    $el: function (instance) { return instance.vnode.el; }
};
var PublicInstanceProxyhandle = {
    get: function (_a, key) {
        var instance = _a._;
        // setupState 部分
        // setupState 里面去获取值
        var setupState = instance.setupState, props = instance.props;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // 如果去找你对应的 key 则表示存在对应的属性 直接调用方法获取值
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

var initProps = function (instance, rawProps) {
    if (rawProps === void 0) { rawProps = {}; }
    instance.props = rawProps;
};

var triggerEffects = function (dep) {
    for (var _i = 0, dep_1 = dep; _i < dep_1.length; _i++) {
        var effect_1 = dep_1[_i];
        if (effect_1.scheduler) {
            effect_1.scheduler();
        }
        else {
            effect_1.run();
        }
    }
};
var targetMap = new Map();
var trigger = function (target, key) {
    // 取出对应的dep循环调用
    var depsMap = targetMap.get(target);
    var dep = depsMap.get(key);
    triggerEffects(dep);
};

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
})(ReactiveFlags || (ReactiveFlags = {}));

var CreteGetter = function (isReadonly, shallow) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (shallow === void 0) { shallow = false; }
    var get = function (target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            // 通过 isReactive 处理以后的对象或者值 会存在 ReactiveFlags.IS_REACTIVE
            // 存在 isReactive 即为 true
            return true;
        }
        else if (key === ReactiveFlags.IS_READONLY) {
            // 通过 isReadonly 处理以后的对象或者值 会存在 ReactiveFlags.IS_READONLY
            // 存在 isReadonly 即为 true
            return true;
        }
        var res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 判断是不是对象 是的话 再次转化成reactive对象
        // 如果是 readonly 的话 则调用readonly转化
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
    return get;
};
var CreteSetter = function () {
    var set = function (target, key, value) {
        var res = Reflect.set(target, key, value);
        trigger(target, key);
        // 触发依赖
        return res;
    };
    return set;
};
// 初始化 优化性能,避免每次都调用
var get = CreteGetter();
var set = CreteSetter();
var readonlyGet = CreteGetter(true);
var shallowReadonlyGet = CreteGetter(true, true);
var mutableHandlers = {
    get: get,
    set: set
};
var readOnlyHandlers = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn("key: " + key + " set \u5931\u8D25 \u56E0\u4E3A target \u662F readonly!", target);
        return true;
    }
};
var shallowReadonlyHandlers = extend({}, readOnlyHandlers, {
    get: shallowReadonlyGet
});

var createReactiveObject = function (target, baseHandles) {
    if (!isObject(target)) {
        console.warn("target " + target + " \u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61");
        return target;
    }
    return new Proxy(target, baseHandles);
};
var reactive = function (raw) {
    return createReactiveObject(raw, mutableHandlers);
};
var readonly = function (raw) {
    return createReactiveObject(raw, readOnlyHandlers);
};
// 外层是 readonly 内层不是
var shallowReadonly = function (raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
};

var createComponentInstance = function (vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {}
    };
    return component;
};
var setupComponent = function (instance) {
    // Todo
    initProps(instance, instance.vnode.props);
    // initSlots
    setupStatefulComponent(instance);
};
var setupStatefulComponent = function (instance) {
    var Component = instance.type;
    // 封装暴露 ctx
    // 方便 后续调用获取值，通过代理去 返回值
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyhandle);
    // 此处是 调用用户写的 setup 函数
    var setup = Component.setup;
    // 如果用户写了 setup
    if (setup) {
        // function 或者 object
        var setupResult = setup(shallowReadonly(instance.props));
        handleSetupResult(instance, setupResult);
    }
};
var handleSetupResult = function (instance, setupResult) {
    // Todo function
    if (typeof setupResult === 'object') {
        // 如果是对象则直接赋值
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
};
var finishComponentSetup = function (instance) {
    // 先判断 组件上有没有render
    var Component = instance.type;
    instance.render = Component.render;
    // if (Component.render) {
    // 	instance.render = Component.render
    // }
};

var render = function (vnode, container) {
    //  patch -> 方便数据的处理
    patch(vnode, container);
};
var patch = function (vnode, container) {
    // 去处理组件
    // 判断 是不是 element
    // 如果是 element 那么应该处理 element
    // 如果是 component 就处理 component
    var shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
};
var processElement = function (vnode, container) {
    mountElemnt(vnode, container);
};
var processComponent = function (vnode, container) {
    mountComponent(vnode, container);
};
var mountElemnt = function (vnode, container) {
    var type = vnode.type, children = vnode.children, props = vnode.props, shapeFlag = vnode.shapeFlag;
    // 此处的 虚拟节点 是数据 element 类型
    var el = (vnode.el = document.createElement(type));
    // 内容 string 或者 array
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    // 处理 props
    for (var key in props) {
        var val = props[key];
        // 事件 onClick --> 具体 --> 通用
        // on + event name
        // 匹配是否是事件
        var isOn = function (key) { return /^on[A-Z]/.test(key); };
        if (isOn(key)) {
            // 去掉 事件名前面的 on
            var event_1 = key.slice(2).toLowerCase();
            el.addEventListener(event_1, props[key]);
        }
        else if ((key === 'class' || key === 'id') && Array.isArray(props[key])) {
            // 如果是 calss、id 且是一个 class、id 数组 则循环调用 添加class
            el.setAttribute(key, val.join(' '));
        }
        else {
            // 除去 class 和 id 且都是数据的情况 其他属性 直接赋值。
            el.setAttribute(key, val);
        }
    }
    container.append(el);
};
var mountChildren = function (vnode, container) {
    vnode.children.map(function (item) {
        patch(item, container);
    });
};
var mountComponent = function (vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
};
var setupRenderEffect = function (instance, vnode, container) {
    var proxy = instance.proxy;
    // 虚拟节点树
    // 通过call方法 改变this指向为proxy，在使用代理获取对应的值
    var subTree = instance.render.call(proxy);
    // vnode -> patch
    patch(subTree, container);
    // element --> mount
    // 在 element 子节点 全部处理完成以后
    vnode.el = subTree.el;
};

var createApp = function (rootComponent) {
    return {
        mount: function (rootContainer) {
            // 先 转换成 VNode
            // component --> vNode
            // 所有逻辑操作 都会基于 VNode 做操作
            var vnode = createNode(rootComponent);
            // 渲染
            if (getShapeFlag(rootContainer) & 1 /* ELEMENT */) {
                console.log('string');
                var renderContain = document.querySelector(rootContainer);
                render(vnode, renderContain);
            }
            else if (getShapeFlag(rootContainer) & 2 /* STATEFUL_COMPONENT */) {
                console.log('Object');
                render(vnode, rootContainer);
            }
        }
    };
};

var h = function (type, props, children) {
    var vnode = createNode(type, props, children);
    return vnode;
};

exports.createApp = createApp;
exports.h = h;
