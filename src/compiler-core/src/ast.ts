import { CREATE_ELEMENT_VNODE } from './runtimeHelpers'

const enum NodeTypes {
  INTERPOLATION,
  SIMPLE_EXPRESSION,
  ELEMENT,
  TEXT,
  ROOT,
  COMPOUND_EXPRESSION
}

const createVNodeCall = (context, tag, props, children) => {
  context.helper(CREATE_ELEMENT_VNODE)
  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children
  }
}

export {
	NodeTypes,
  createVNodeCall
}
