<template>
  <div>
    <div class="content">
      <div class="left tal">
        <div class="main" v-if="podArr.length">
          <el-input v-model="search" size="mini" prefix-icon="el-icon-search" placeholder="请输入内容"></el-input>
          <div class="check-wrap">
            <vue-scroll>
              <el-checkbox-group v-model="pod" @change="checkChange">
                <div v-for="(item, index) in searchField" :key="index">
                  <el-checkbox v-model="searchField[index]" :label="item" border></el-checkbox>
                </div>
              </el-checkbox-group>
            </vue-scroll>

          </div>
          <div class="btn-group">
            <el-button @click="allSel()">全选</el-button>
            <el-button @click="cancelSel()">清除</el-button>
          </div>
        </div>
      </div>
      <div class="center">
        <transition name="slide-fade">
          <p v-if="pod.length"><i @click="send" class="el-icon-d-arrow-right" style="font-size:50px;marign-top:-150px"></i></p>
        </transition>
      </div>
      <div class="right">
        <vue-scroll>
          <el-collapse-transition>
            <div v-show="show">
              <div class="step_wrap">
                <el-steps direction="vertical" :active="active" space="80px" finish-status="success">
                  <el-step v-for="(item, index) in fullPod" :key="index" :status="item.status">
                    <template slot="title">
                      <el-popover placement="right" width="300" trigger="click" :disabled="!item.able" v-model="item.visiable">
                        <el-form el-popover="right" label-position="left" :inline="true" label-width="100px" class="popform">
                          <h2>pod</h2>
                          <el-form-item :label="item.podName">
                            <el-input v-model="item.oldVersion" disabled></el-input>--
                            <el-input v-model="item.version" :placeholder="item.oldVersion"></el-input>
                          </el-form-item>
                          <h2>dep</h2>
                          <el-form-item v-for="(value, key,index) in item.dependencies" :key="index" :label="value.podName">
                            <el-input :value="value.oldVersion" disabled></el-input>--
                            <el-input v-model="value.version" :placeholder="value.version"></el-input>
                          </el-form-item>
                          <el-form-item style="margin:20px 100px">
                            <el-button type="primary" @click="updatePod(item)">提交</el-button>
                          </el-form-item>
                        </el-form>
                        <el-button slot="reference" :loading="item.loading">{{item.podName}}</el-button>
                      </el-popover>
                    </template>
                  </el-step>
                </el-steps>
              </div>
            </div>
          </el-collapse-transition>
        </vue-scroll>

      </div>
    </div>
    <div>
      <el-button style="margin-top: 12px;" @click="prev">上一步</el-button>
      <el-button style="margin-top: 12px;" @click="next">下一步</el-button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['podArr'],
  data () {
    return {
      fullPod: [{}],
      pod: [],
      newVersion: '',
      show: false,
      search: '',
      node: null,
      seq: [],
      active: 0,
      status: ''
    }
  },
  computed: {
    searchField () {
      return this.podArr.filter(item => {
        if (item.toLowerCase().includes(this.search.toLowerCase())) { return item }
      })
    }
  },
  sockets: {
    connect: function () {
      console.log('socket connected')
    },
    updated: function (data) {
      this.fullPod = this.fullPod.map((item, index) => {
        if (item.podName === this.node.podName) {
          item.loading = false
        }
        return item
      })
      if (data === 'Success') {
        this.$http.post('/next', { node: this.node, seq: this.seq }).then(res => {
          if (!res.data) {
            let that = this
            this.$emit('seq', that.seq)
            this.$message({
              message: '更新成功',
              type: 'success',
              duration: '1500',
              onClose: function (msg) {
                that.next()
              }
            })
            return
          }
          let ableNode = res.data.next.podName
          this.fullPod = res.data.seq.map((item, index) => {
            if (item.podName === ableNode) {
              item.able = true
              item.oldVersion = item.version
              this.active = index
              for (let key in item.dependencies) {
                item.dependencies[key].oldVersion = item.dependencies[key].version
              }
            }
            return item
          })
        })
      } else {
        var that = this
        this.fullPod = this.fullPod.map((item, index) => {
          if (item.podName === that.node.podName) {
            item.able = true
            item.version = that.node.version
            item.oldVersion = that.node.oldVersion
            item.status = 'error'
          }
          return item
        })
      }
    }
  },
  methods: {
    next () {
      this.$emit('next', 2)
    },
    prev () {
      this.$emit('prev')
    },
    cancelSel (val) {
      this.pod = []
    },
    allSel () {
      this.pod = this.podArr
    },
    async send () {
      let res = await this.$http.post(`/dependency`, { selectedArr: this.pod })
      res.data && res.data.length && (this.seq = res.data)
      this.show = true
      let nextRes = await this.$http.post('/next', { node: this.node, seq: this.seq })
      if (!nextRes.data) {
        let that = this
        this.$emit('seq', that.seq)
        this.$message({
          message: '更新成功',
          type: 'success',
          duration: '1500',
          onClose: function (msg) {
            that.next()
          }
        })
        return
      }
      let ableNode = nextRes.data.next.podName
      this.fullPod = nextRes.data.seq.map((item, index) => {
        if (item.podName === ableNode) {
          item.oldVersion = item.version
          item.able = true
          this.active = index
          for (let key in item.dependencies) {
            item.dependencies[key].oldVersion = item.dependencies[key].version
          }
        }
        return item
      })
    },
    async updatePod (item) {
      item.visiable = false
      delete item.able
      delete item.visiable
      this.node = item
      item.loading = true
      this.seq = this.seq.map(item => {
        if (item.podName === this.node.podName) {
          return this.node
        } else {
          return item
        }
      })

      this.$socket.emit('upgrade', { node: this.node, oldVersion: this.oldVersion })
    },
    checkChange () {
      this.show = false
      this.fullPod = []
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  .center {
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .left {
    flex: 1;
    position: relative;
    .main {
      padding-left: 30%;
    }
    .el-input {
      width: 180px;
      margin-bottom: 10px;
    }
  }
  .right {
    flex: 1;
    height: 500px;
  }
}
.el-popover {
  .el-input {
    width: 120px;
  }
  .el-form-item {
    margin-bottom: 0;
  }
}
.popform label {
  text-align: left;
}
.check-wrap {
  height: 400px;
  overflow-y: auto;
}

.step_wrap {
  width: 300px;
  margin: 0 auto;
}
.popform .el-form-item__content {
  margin-left: 100px;
}
.btn-group {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateX(-20px);
  opacity: 0;
}

.el-checkbox {
  min-width: 200px;
  margin: 2px 0;
}
</style>
