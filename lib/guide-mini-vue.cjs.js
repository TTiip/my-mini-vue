'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isObject = function (value) {
    return value !== null && typeof value === 'object';
};

var createComponentInstance = function (vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type
    };
    return component;
};
var setupComponent = function (instance) {
    // TODO initProps
    // TODO initSlot
    //
    setupStatefulComponent(instance);
};
var setupStatefulComponent = function (instance) {
    var Component = instance.type;
    var setup = Component.setup;
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
var mountComponent = function (vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
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
    var el = document.createElement(vnode.type);
    // children 可能是 string  array
    var children = vnode.children, props = vnode.props;
    if (typeof children === 'string') {
        // children
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(children, el);
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
        el.setAttribute(key, val);
    }
    // 挂载在页面上
    container.append(el);
};
var render = function (vnode, container) {
    // patch
    patch(vnode, container);
};
var patch = function (vnode, container) {
    // 去处理我们的组件
    // TODO 判断一下 vnode 是不是 element 类型
    // 调用对应的方法去处理对应的 方法
    // processElement()
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
};
var setupRenderEffect = function (instance, container) {
    var subTree = instance.render();
    // vnode --> patch
    // vnode --> element --> mount
    patch(subTree, container);
};

var createVNode = function (type, props, children) {
    return {
        type: type,
        props: props,
        children: children
    };
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
