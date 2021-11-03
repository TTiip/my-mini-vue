
import { effect } from '../effect'
import { ref, isRef, unRef, proxyRefs } from '../ref'
import { reactive } from '../reactive'

describe('ref', () => {
  test('happy path', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
  })

  test('should be reactive', () => {
    const a = ref(1)
    let dummy
    let calls = 0
    effect(() => {
      calls++
      dummy = a.value
    })
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
    // same value should not trigger
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })

  test('should make nested properties reactive', () => {
    const a = ref({
      count: 1,
    })
    let dummy
    effect(() => {
      dummy = a.value.count
    })
    expect(dummy).toBe(1)
    a.value.count = 2
    expect(dummy).toBe(2)
  })

  test('isRef', () => {
    const a = ref(1)
    const user = reactive({
      age: 18
    })
    expect(isRef(a)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(user)).toBe(false)
  })

  test('unRef', () => {
    const a = ref(1)
    const b = 2
    expect(unRef(a)).toBe(1)
    expect(unRef(b)).toBe(2)
  })

  // 一般 用在 template 解析中
  test('proxyRefs', () => {
    const user = {
      age: ref(18),
      name: 'aphelios'
    }
    // get -> age (ref) 给他返回 age.value
    // get -> age (not ref) 给他返回 age

    const proxyUser = proxyRefs(user)
    expect(user.age.value).toBe(18)
    expect(user.name).toBe('aphelios')
    expect(proxyUser.age).toBe(18)
    expect(proxyUser.name).toBe('aphelios')

    // set -> age (ref) 修改他的 age.value
    // set -> age (not ref) 修改他的 age 直接使用 值 替换

    proxyUser.age = 20
    expect(user.age.value).toBe(20)
    expect(proxyUser.age).toBe(20)


    proxyUser.age = 10
    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
  })

})