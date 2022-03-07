'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var extend = Object.assign;
var isObject = function (value) {
    return value !== null && typeof value === 'object';
};
var getShapeFlag = function (type) {
    return typeof type === 'string'
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
};
var hasOwn = function (val, key) {
    if (val === void 0) { val = {}; }
    return Object.prototype.hasOwnProperty.call(val, key);
};
var capitalize = function (str) { return str.charAt(0).toUpperCase() + str.slice(1); };
var camelize = function (str) {
    // ex: add-foo
    // _ 代表匹配到的值规则（-f）
    // targetValue 代表匹配到的值（f）
    return str.replace(/-(\w)/g, function (_, targetValue) {
        return targetValue ? targetValue.toUpperCase() : '';
    });
};
// add --> onAdd
var toHandlerKey = function (str) { return str ? camelize('on' + capitalize(str)) : ''; };

var targetMap = new Map();
var triggerEffects = function (dep) {
    // 循环调用 dep 的 run 方法 触发每一个 dep 的 _fn
    for (var _i = 0, dep_1 = dep; _i < dep_1.length; _i++) {
        var effect_1 = dep_1[_i];
        if (effect_1._scheduler) {
            effect_1._scheduler();
        }
        else {
            effect_1.run();
        }
    }
};
var trigger = function (target, key) {
    // 取出 target 对应的 depsMap
    var depsMap = targetMap.get(target);
    // 取出 key 对应的 dep
    var dep = depsMap.get(key);
    triggerEffects(dep);
};

var get;
var readOnlyGet;
var shallowReadonlyGet;
var set;
var createGetter = function (isReadOnly, shallow) {
    if (isReadOnly === void 0) { isReadOnly = false; }
    if (shallow === void 0) { shallow = false; }
    var get = function (target, key) {
        // target: { foo: 1 }
        // key: foo
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            // 通过 isReadOnly 来判断是不是 reactive 对象
            // return !isReadOnly
            // ？？？
            // 这里是不是可以直接指定为true，因为调用 getter 函数 肯定是 proxy 对象，所以一定是 reactive
            return true;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadOnly;
        }
        var res = Reflect.get(target, key);
        // 如果是 shallow 类型(即外层是响应是对象，里面的不是 且设计成只读模式)
        if (shallow) {
            return res;
        }
        // 看看 res 是不是 object
        if (isObject(res)) {
            return isReadOnly ? readonly(res) : reactive(res);
        }
        return res;
    };
    return get;
};
var createSetter = function () {
    var get = function (target, key, value) {
        var res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
    return get;
};
get = createGetter();
readOnlyGet = createGetter(true);
shallowReadonlyGet = createGetter(true, true);
set = createSetter();
var mutableHandlers = {
    get: get,
    set: set
};
var readonlyHandlers = {
    get: readOnlyGet,
    set: function (target, key, value) {
        console.warn("key: ".concat(key, " set \u5931\u8D25, \u56E0\u4E3A target:"), target, "\u662F readonly\u72B6\u6001!");
        return true;
    }
};
var shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

var createActiveObject = function (raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn("target: ".concat(raw, " \u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61\uFF01"));
    }
    else {
        return new Proxy(raw, baseHandlers);
    }
};
var reactive = function (raw) {
    return createActiveObject(raw, mutableHandlers);
};
var readonly = function (raw) {
    return createActiveObject(raw, readonlyHandlers);
};
var shallowReadonly = function (raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
};

var emit = function (instance, eventName) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var props = instance.props;
    var handlerName = toHandlerKey(eventName);
    var handler = props[handlerName];
    handler && handler.apply(void 0, args);
};

var initProps = function (instance, rawProps) {
    if (rawProps === void 0) { rawProps = {}; }
    instance.props = rawProps;
};

var initSlots = function (instance, children) {
    var vnode = instance.vnode;
    // 如果是 slot 类型 再进行处理
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(instance.slots, children);
    }
};
var normalizeObjectSlots = function (slots, children) {
    var _loop_1 = function (key) {
        var slotVal = children[key];
        // 将设计的 props 传入对应的 slot
        slots[key] = function (props) { return normalizeSlotValue(slotVal(props)); };
    };
    for (var key in children) {
        _loop_1(key);
    }
    slots = slots;
};
var normalizeSlotValue = function (value) {
    // 传入的 children（slots） 是不是数组，不是数组转换一下
    return Array.isArray(value) ? value : [value];
};

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
    $slots: function (i) { return i.slots; }
};
var publickInstanceProxyhandlers = {
    get: function (_a, key) {
        var instance = _a._;
        // setupState
        // 这里必须要在这里 获取 setupState
        // 因为 只有在初始化组件 的时候 获取 setupState
        var setupState = instance.setupState, props = instance.props;
        if (hasOwn(setupState, key)) {
            // setupState 里面获取值
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // $el
        // if (key === '$el') {
        // 	// key --> $el
        // 	// 如果是 this.$el 则 key 值就是 $el
        // 	return vnode.el
        // }
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

var createComponentInstance = function (vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        props: {},
        emit: {},
        slots: {},
        setupState: {}
    };
    component.emit = emit.bind(null, component);
    return component;
};
var setupComponent = function (instance) {
    // initProps
    initProps(instance, instance.vnode.props);
    // initSlot
    initSlots(instance, instance.vnode.children);
    // initComponent
    setupStatefulComponent(instance);
};
var setupStatefulComponent = function (instance) {
    var Component = instance.type;
    var setup = Component.setup;
    // ctx
    instance.proxy = new Proxy({
        _: instance
    }, publickInstanceProxyhandlers);
    // 用户可能不会写 setup 函数
    if (setup) {
        // 可以返回一个 fn 也可能是一个 object
        var setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        handleSetupResult(instance, setupResult);
    }
};
var handleSetupResult = function (instance, setupResult) {
    // function or object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    // 初始化 render 函数
    finishCompentSetup(instance);
};
var finishCompentSetup = function (instance) {
    var Component = instance.type;
    var render = Component.render;
    // render 存在时赋值
    if (render) {
        instance.render = render;
    }
};

var Fragment = Symbol('Fragment');
var Text = Symbol('Text');
var createVNode = function (type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    if (typeof children === 'string') {
        // 元素节点
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        // 组件节点
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    // 判断是否需要 slots 处理
    // 首先是必须是一个组件类型，其次 children 必须是一个对象
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
};
var createTextVNode = function (text) {
    return createVNode(Text, {}, text);
};

// Component
var processComponent = function (vnode, container) {
    mountComponent(vnode, container);
};
var mountComponent = function (initinalVNode, container) {
    var instance = createComponentInstance(initinalVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initinalVNode, container);
};
var mountChildren = function (vnode, container) {
    // 遍历 children 拿到节点 再次调用patch
    vnode.children.map(function (childrenItem) {
        patch(childrenItem, container);
    });
};
// Element
var processElement = function (vnode, container) {
    mountElement(vnode, container);
};
var mountElement = function (vnode, container) {
    // vnode --> element 类型的 --> div
    var el = vnode.el = document.createElement(vnode.type);
    // children 可能是 string  array
    var children = vnode.children, props = vnode.props, shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        // children
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    // props
    for (var key in props) {
        var val = void 0;
        if (Array.isArray(props[key])) {
            val = props[key].join(' ');
        }
        else {
            val = props[key];
        }
        // 实现注册 事件
        var isOn = function (key) { return /^on[A-Z]/.test(key); };
        if (isOn(key)) {
            var eventName = key.slice(2).toLowerCase();
            el.addEventListener(eventName, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    // 挂载在页面上
    container.append(el);
};
//  Fragment
var processFragment = function (vnode, container) {
    mountChildren(vnode, container);
};
// Text
var processText = function (vnode, container) {
    var children = vnode.children;
    var textNode = vnode.el = document.createTextNode(children);
    container.append(textNode);
};
var render = function (vnode, container) {
    patch(vnode, container);
};
var patch = function (vnode, container) {
    // 判断一下 vnode 类型
    // 调用对应的方法去处理
    var type = vnode.type, shapeFlag = vnode.shapeFlag;
    switch (type) {
        case Fragment:
            processFragment(vnode, container);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (shapeFlag & 1 /* ELEMENT */) {
                processElement(vnode, container);
            }
            else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                processComponent(vnode, container);
            }
            break;
    }
};
var setupRenderEffect = function (instance, initinalVNode, container) {
    var proxy = instance.proxy;
    var subTree = instance.render.call(proxy);
    // vnode --> patch
    // vnode --> element --> mount
    patch(subTree, container);
    initinalVNode.el = subTree.el;
};

var createApp = function (rootComponent) {
    return {
        mount: function (rootContainer) {
            // 先转换成虚拟节点
            // component --> vnode
            // 后续所有的逻辑操作 都会基于 vnode 去操作
            var vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
};

var renderSlots = function (slots, slotName, props) {
    var slot = slots[slotName];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
};

var h = function (type, props, children) {
    return createVNode(type, props, children);
};

exports.Fragment = Fragment;
exports.Text = Text;
exports.createApp = createApp;
exports.createTextVNode = createTextVNode;
exports.createVNode = createVNode;
exports.h = h;
exports.renderSlots = renderSlots;
