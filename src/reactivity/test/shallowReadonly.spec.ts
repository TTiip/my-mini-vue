import { isReadonly, shallowReadonly } from "../reactive"

describe('shallowReadonly', () => {
	test('should not make ono-reactive propertier reactive', () => {
		const props = shallowReadonly({ n: { foo: 1 } })

		expect(isReadonly(props)).toBe(true)
		expect(isReadonly(props.n)).toBe(false)
	})

	test('should call console.warn when set', () => {
    console.warn = jest.fn();
    const user = shallowReadonly({
      age: 10,
			bar: {
				name: 'lee'
			}
    })

    user.age = 11
    user.bar.name = 'cc'
		// 只调用一次证明 里面的reactive是响应式
    expect(console.warn).toHaveBeenCalledTimes(1)
  });
})