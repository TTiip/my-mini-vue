module.exports = {
  presets: [
		// 使用当前node版本为基础进行转换
		["@babel/preset-env", { targets: { node: "current" } }],
		// 支持typescript
		'@babel/preset-typescript',
	]
}
