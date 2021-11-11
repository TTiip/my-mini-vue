// const ShapeFlags = {
// 	element: 0,
// 	stateful_component: 0,
// 	text_children: 0,
// 	arr_children: 0
// }

// 不高效

// vnode stateful_component -->
// 1.可以设置 修改
// ShapeFlags.stateful_component = 1
// ShapeFlags.arr_children = 1

// 2.查找是不是属于
// if (ShapeFlags.element) { xxxxx }
// if (ShapeFlags.stateful_component) { xxxxx }

// 高效（位运算）

// 0000
// 0001 --> element
// 0010 --> stateful_component
// 0100 --> text_children
// 1000 --> arr_children

// | (两位都为0，才为0) 修改用 |
// & (两位都为1，才为1) 判断或者取值的时候 用 &

const enum ShapeFlags {
	ELEMENT = 1, // 0001
  STATEFUL_COMPONENT = 1 << 1, // 0010
  TEXT_CHILDREN = 1 << 2, // 0100
  ARRAY_CHILDREN = 1 << 3 // 1000
}

export {
	ShapeFlags
}