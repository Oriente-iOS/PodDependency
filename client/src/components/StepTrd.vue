<template>
  <div>
    <div class="wrap">
      <ul>
        <li v-for="(item, index) in tableData" :key="index">
          {{item.pod}}
        </li>
      </ul>
    </div>
    <el-button style="margin-top: 12px;" @click="prev">上一步</el-button>
    <el-button style="margin-top: 12px;" @click="next">重新开始</el-button>
  </div>
</template>

<script>
export default {
  props: ['seqArr'],
  computed: {

    tableData () {
      return this.seqArr.map(item => {
        return { pod: `pod  '${item.podName}', '${item.vc !== '=' ? item.vc + ' ' : ''}${item.version}'` }
      })
    }
  },
  methods: {
    next () {
      this.$emit('next', 3)
    },
    prev () {
      this.$emit('prev')
    }
  }
}
</script>

<style>
.wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
ul {
  padding: 0;
}
li {
  list-style: none;
  text-align: left;
}
</style>
