<template>
  <div>
    <el-container>
      <el-aside width="400px">
        <el-header height="auto">
          <el-upload class="upload-demo" :auto-upload="true" drag action="/upload" multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </el-upload>
        </el-header>
        <el-container>
          <div class="local">
            <h2>
              <span>local</span>
              <el-button class="fr" type="text" @click="analyze">analyze</el-button>
              <el-button class="ml5" type="text" @click="handleCheckAll">全选</el-button>
              <el-button class="ml5" type="text" @click="clear">清空</el-button>
            </h2>
            <el-checkbox-group v-model="checkedArray">
              <el-checkbox v-for="(item,index) in arr1" :label="item" :key="index">{{item}}</el-checkbox>
            </el-checkbox-group>
          </div>
          <div class="ex"></div>
        </el-container>
      </el-aside>
      <el-main>
        <div class="depend">
          <h2>
            <span>dep</span>
            <el-button class="fr" type="text" @click="product">product</el-button>
          </h2>
          <el-input v-for="(item, index) in arr2" :key="index" v-model="arr2[index]"></el-input>
        </div>
        <div class="result">
          <h2>
            <span>result</span>
            <el-button class="fr" type="text" @click="reset">reset</el-button>
          </h2>
          <div class="result">
            <span class="step" v-for="(item, index) in rstArray" :key="index">
              <el-button type="success">{{item}}</el-button>
              <i class="el-icon-more"></i>
            </span>
            <el-button v-if="loading" type="primary" :loading="true">生成中</el-button>
          </div>
        </div>
      </el-main>
    </el-container>

  </div>
</template>

<script>

export default {
  name: 'Analyze',
  props: {
  },
  data () {
    return {
      checkAll: false,
      checkedArray: [],
      loading: false,
      arr1: ['labname1', 'labname2', 'labname3', 'labname4', 'labname5', 'labname6', 'labname7'],
      arr2: ['labname1', 'labname2', 'labname3', 'labname4', 'labname5', 'labname6', 'labname7'],
      rstArray: []
    }
  },
  mounted () {
  },
  methods: {
    handleCheckAll () {
      this.checkedArray = this.arr1
    },
    clear () {
      this.checkedArray = []
    },
    analyze () {
      this.arr2 = this.checkedArray
    },
    async product () {
      this.loading = true
      this.rstArray = []
      let req = function () {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(Date.now())
          }, 2000)
        })
      }
      for (let i = 0; i < this.arr2.length; i++) {
        let rst = await req()
        this.rstArray.push(rst)
        if (i + 1 >= this.arr2.length) {
          this.loading = false
        }
      }
    },
    reset () {
      this.arr1 = []
      this.arr2 = []
      this.checkedArray = []
      this.rstArray = []
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.el-container {
  padding: 20px;
}
.el-aside {
  padding: 20px;
}
.upload-demo {
  width: 300px;
}
.el-upload-dragger {
  width: 300px !important;
}
.el-header {
  padding: 20px !important;
  border-bottom: 1px solid #ccc;
}
.fr {
  float: right;
}
.local {
  width: 100%;
}
.el-checkbox-group {
  .el-checkbox {
    display: block !important;
  }
  .el-checkbox + .el-checkbox {
    margin-left: 0 !important;
  }
}
.el-input {
  width: auto !important;
  margin-bottom: 10px;
  margin-right: 10px;
}
.result {
  padding-top: 20px;
}
.step {
  display: inline-block;
  margin-bottom: 10px;
}
.depend {
  min-height: 203px;
}
.result span:last-child i {
  display: none;
}
</style>
