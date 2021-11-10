'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var createNode = function (type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children
    };
    return vnode;
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
    // Todo
    // initProps
    // initSlots
    setupStatefulComponent(instance);
};
var setupStatefulComponent = function (instance) {
    var Component = instance.type;
    // ctx
    instance.proxy = new Proxy({}, {
        get: function (target, key) {
            console.log(key, 'key');
            // setupState 里面去获取值
            var setupState = instance.setupState;
            if (key in setupState) {
                return setupState[key];
            }
        }
    });
    var setup = Component.setup;
    // 如果用户写了 setup
    if (setup) {
        // function 或者 object
        var setupResult = setup();
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
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (typeof vnode.type === 'object') {
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
    var type = vnode.type, children = vnode.children, props = vnode.props;
    var el = document.createElement(type);
    // 内容 string 或者 array
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    // 处理 props
    for (var key in props) {
        var val = props[key];
        if ((key === 'class' || key === 'id') && Array.isArray(props[key])) {
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
    setupRenderEffect(instance, container);
};
var setupRenderEffect = function (instance, container) {
    var proxy = instance.proxy;
    console.log(instance, 'instance');
    // 虚拟节点树
    var subTree = instance.render.call(proxy);
    // vnode -> patch
    patch(subTree, container);
};

var createApp = function (rootComponent) {
    return {
        mount: function (rootContainer) {
            // 先 转换成 VNode
            // component --> vNode
            // 所有逻辑操作 都会基于 VNode 做操作
            var vnode = createNode(rootComponent);
            // 渲染
            render(vnode, rootContainer);
        }
    };
};

var h = function (type, props, children) {
    var vnode = createNode(type, props, children);
    return vnode;
};

exports.createApp = createApp;
exports.h = h;
