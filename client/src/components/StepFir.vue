<template>
  <div class="tac">
    <el-upload ref="upload" class="upload-demo" :auto-upload="true" drag action="http://localhost:7001/upload"
      :on-success="onSuccess" :limit="1">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <div>
      <el-button style="margin-top: 12px;" @click="next">下一步</el-button>

    </div>
  </div>
</template>

<script>
export default {
  methods: {
    next () {
      this.$emit('next', 1)
    },
    onSuccess (response, file, fileList) {
      if (response.url) {
        this.$http.get('/parser').then(res => {
          this.$emit('fileSuccess', res.data)
          this.next()
        })
      }
    }
  }
}
</script>

<style>
.el-upload-list {
  width: 360px;
  margin: 0 auto !important;
}
</style>
