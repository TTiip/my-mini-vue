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
        type: vnode.type
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
    patch(vnode);
};
var patch = function (vnode, container) {
    // 去处理组件
    // 判断 是不是 element
    processComponent(vnode);
};
var processComponent = function (vnode, container) {
    mountComponent(vnode);
};
var mountComponent = function (vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
};
var setupRenderEffect = function (instance, container) {
    // 虚拟节点树
    var subTree = instance.render();
    // vnode -> patch
    patch(subTree);
};

var createApp = function (rootComponent) {
    return {
        mount: function (rootContainer) {
            // 先 转换成 VNode
            // component --> vNode
            // 所有逻辑操作 都会基于 VNode 做操作
            var vnode = createNode(rootComponent);
            // 渲染
            render(vnode);
        }
    };
};

var h = function (type, props, children) {
    var vnode = createNode(type, props, children);
    return vnode;
};

exports.createApp = createApp;
exports.h = h;
