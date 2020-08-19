<template>
	<view class="container">
		<test>我是首页</test>
		{{"abc"}}
		<view>{{title}}</view>
		<view>{{title + "按不出"}}</view>
		<view>{{"Lee".indexOf("el")!==-1?"YES":"NO"}}</view>
		<view>{{"Lee".slice(0,1)}}</view>
	</view>
</template>

<script>
	import test from "../../components/test.vue"
	export default {
		components: {
			test
		},
		data() {
			return {
				title: 'hello uniapp',
				img:''
			}
		},
		onLoad() {
			uni.$on("testEmit",(rel)=>{
				console.log("我是uni传过来的：", rel)
			})
		},
		methods: {
			testEvent(msg) {
				console.log("我是传过来的：", msg)
			},
		},
		beforeDestroy() {
			uni.$off("testEmit")
		}
	}
</script>

<style>
	.container {
		padding: 20px;
		font-size: 14px;
		line-height: 24px;
	}
</style>
