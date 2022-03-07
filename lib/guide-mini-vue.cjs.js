'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; }
};
var publickInstanceProxyhandlers = {
    get: function (_a, key) {
        var instance = _a._;
        // setupState
        // 这里必须要在这里 获取 setupState
        // 因为 只有在初始化组件 的时候 获取 setupState
        var setupState = instance.setupState; instance.vnode;
        if (key in setupState) {
            // setupState 里面获取值
            return setupState[key];
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
        setupState: {}
    };
    return component;
};
var setupComponent = function (instance) {
    // TODO initProps
    // TODO initSlot
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
        var setupResult = setup();
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

// Component
var processComponent = function (vnode, container) {
    mountComponent(vnode, container);
};
var mountComponent = function (initinalVNode, container) {
    var instance = createComponentInstance(initinalVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initinalVNode, container);
};
var mountChildren = function (children, container) {
    // 便利children 拿到节点 再次调用patch
    children.map(function (childrenItem) {
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
        mountChildren(children, el);
    }
    // props
    for (var key in props) {
        console.log(key, 'key');
        var val = void 0;
        if (Array.isArray(props[key])) {
            val = props[key].join(' ');
        }
        else {
            val = props[key];
        }
        // 注册 emit 事件
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
var render = function (vnode, container) {
    // patch
    patch(vnode, container);
};
var patch = function (vnode, container) {
    // 判断一下 vnode 类型
    // 调用对应的方法去处理
    var shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
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

var getShapeFlag = function (type) {
    return typeof type === 'string'
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
};

var createVNode = function (type, props, children) {
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

var h = function (type, props, children) {
    return createVNode(type, props, children);
};

exports.createApp = createApp;
exports.h = h;
