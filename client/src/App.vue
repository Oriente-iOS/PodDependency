<template>
  <div id="app">
    <el-steps :active="step" align-center>
      <el-step title="步骤1"></el-step>
      <el-step title="步骤2"></el-step>
      <el-step title="步骤3"></el-step>
    </el-steps>
    <div class="container tac">
      <el-carousel ref="carousel" height="600px" :autoplay="false" indicator-position="none" arrow="never"
        setActiveItem="setActiveItem">
        <el-carousel-item>
          <step-fir @next="next" @fileSuccess="fileSuccess"></step-fir>
        </el-carousel-item>
        <el-carousel-item>
          <step-sec @next="next" @prev="prev" @seq="seq" :podArr="podArr"></step-sec>
        </el-carousel-item>
        <el-carousel-item>
          <step-trd @next="next" @prev="prev" :seqArr="seqArr"></step-trd>
        </el-carousel-item>

      </el-carousel>
    </div>
  </div>
</template>

<script>
import StepFir from './components/StepFir'
import StepSec from './components/StepSec'
import StepTrd from './components/StepTrd'

export default {
  name: 'app',
  components: {
    StepFir, StepSec, StepTrd
  },
  data () {
    return {
      step: 0,
      index: 0,
      podArr: [],
      seqArr: []
    }
  },
  methods: {
    next (index) {
      this.step++
      this.$refs.carousel.next()
      if (index === 3) {
        window.location.reload()
      }
    },
    prev () {
      this.step--
      this.$refs.carousel.prev()
    },
    fileSuccess (json) {
      this.podArr = Object.keys(json)
    },
    seq (data) {
      this.seqArr = data
    }
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding-top: 50px;
}
.container {
  margin-top: 50px;
}
</style>
