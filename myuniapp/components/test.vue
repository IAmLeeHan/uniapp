<template>
	<view>
		<text>{{title}}</text>
		<button type="primary" @click="click">event</button>
	</view>
</template>

<script>
	export default {
		props: ["title"],

		data() {
			return {

			};
		},
		methods: {
			click() {
				// this.$emit('postTestEvent', {
				// 	name: 'LeeHan'
				// })
				/** 
				 * uniapp 提供的事件总线
				 * */
				uni.$emit("testEmit",{
					name:"Lee"
				})
			}
		}
	}
</script>

<style>

</style>
