import { readonly } from '../reactive'

describe('readonly', () => {
	test('happy path', () => {
		const original = { foo: 1, bar: { baz: 2 } }
		const wrapped = readonly(original)
		expect(wrapped).not.toBe(original)
		expect(wrapped.foo).toBe(1)
	})
})
