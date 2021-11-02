import { readonly, isReadonly } from '../reactive'

describe('readonly', () => {
	test('happy path', () => {
		const original = { foo: 1, bar: { baz: 2 } }
		const wrapped = readonly(original)
		expect(wrapped).not.toBe(original)
		expect(wrapped.foo).toBe(1)
		expect(isReadonly(wrapped)).toBe(true)
		expect(isReadonly(original)).toBe(false)
	})

	test('warn then call set', () => {
		// console.wran 是全局方法，如果用自己写的 需要引入一下 判断是不是调用了
		console.warn = jest.fn()
		const user = readonly({
			age: 10
		})
		user.age = 11

		expect(console.warn).toBeCalled()
	})
})
