const queue: any = []

// 用来标识是否需要 执行 创建 promise
let isFlushPending = false

const queueJobs = (job: any) => {
	// 如果队列中没有 该 任务
	if (!queue.includes(job)) {
		queue.push(job)
	}
	// 创建一个 promise 去接收
	queueFlush()
}

const queueFlush = () => {
	if (isFlushPending) {
		return
	}
	isFlushPending = true
	nextTick(() => {
		flushJobs()
	})
}

const flushJobs =() => {
	// 执行完 微任务以后在将开关打开。
	isFlushPending = false
	let job
	while (job = queue.shift()) {
		job && job()
	}
}

const p = Promise.resolve()

const nextTick = (fn) => {
	// 如果用户传入 nextTick 的回调函数，则执行
	// 否则，执行 Promise.resolve 的回调函数
	return fn ? p.then(fn) : p
}

export {
	queueJobs,
	nextTick
}
