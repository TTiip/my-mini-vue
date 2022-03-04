import { reactive, isReactive, readonly, isProxy } from '../reactive'

describe('reactive', () => {
	it('happy path', () => {
		const original = { foo: 1 }
		const observed = reactive(original)
		const readonlyObj = readonly(original)

		expect(original).not.toBe(observed)
		expect(original.foo).toBe(1)
		expect(observed.foo).toBe(1)

    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)
    expect(isReactive(readonlyObj)).toBe(true)

    expect(isProxy(original)).toBe(false)
    expect(isProxy(observed)).toBe(true)
	})

	test('nested reactives', () => {
    const original = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    }
    const observed = reactive(original)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  });
})