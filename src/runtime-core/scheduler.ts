const queue: any = []

let isFlushPending = false

const queueJobs = (job: any) => {
	// 如果队列中没有 该 任务
	if (!queue.includes(job)) {
		queue.push(job)
	}
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
	isFlushPending = false
	let job
	while (job = queue.shift()) {
		job && job()
	}
}

const p = Promise.resolve()

const nextTick = (fn) => {
	return fn ? p.then(fn) : p
}

export {
	queueJobs,
	nextTick
}
