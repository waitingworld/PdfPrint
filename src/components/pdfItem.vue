<template>
  <div
    style="display:flex;flex-direction: row;align-content: center;align-items: flex-start;justify-content: center;flex-wrap: nowrap;">
    <div
      style="display: flex;flex-direction: column;flex-wrap: nowrap;align-content: center;justify-content: flex-start;align-items: center;padding: 10px;">
      <el-progress style="padding: 10px;width: calc(108px * 4.5);margin: 0 auto;" :text-inside="true"
                   :stroke-width="26"
                   :percentage="loadedRatio*100"></el-progress>
      <el-card shadow="always" style="width: calc(108px * 5);height: calc(152px * 5);margin: 0 auto;">
        <pdf ref="pdf"
             :src="file"
             :page="currentPage"
             @progress="loadedRatio = $event"
             @password="password"
             @error="error"
             @num-pages="numPages = $event"
             @link-clicked="currentPage = $event"/>
      </el-card>
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="1"
        layout="total,  prev, pager, next, jumper"
        :total="numPages">
      </el-pagination>
    </div>
    <div style="padding: 10px;">
      <div style="">
        <div
          style="display: flex;flex-direction: column;align-content: flex-start;justify-content: flex-start;align-items: flex-start;">
          <div style="">
            <el-form style="">
              <el-form-item label="打印开始页">
                <el-input v-model="startPage" type="number"></el-input>
              </el-form-item>
              <el-form-item label="打印结束页">
                <el-input v-model="endPage" type="number"></el-input>
              </el-form-item>
            </el-form>
          </div>
          <div style="display: flex;">
            <el-button-group>
              <el-button round type="primary" id="page1" @click="doublePrint('1')">双面打印1</el-button>
              <el-button round type="success" id="page2" @click="doublePrint('2')" v-show="showSecondFlag">双面打印2
              </el-button>
            </el-button-group>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import pdf from "vue-pdf";
import CMapReaderFactory from "vue-pdf/src/CMapReaderFactory"

export default {
  name: "pdfItem",
  components: {pdf},
  props: {
    file: {
      type: String
    }
  },
  watch: {
    file: {
      handler() {
        if (!this.file) {
          return
        }
        this.showSecondFlag = false
        let loadingTask = pdf.createLoadingTask({url: this.file, CMapReaderFactory});
        loadingTask.promise.then(pdf => {
          this.pdfInfo = pdf;
          this.numPages = pdf.numPages;
          this.startPage = 1
          this.endPage = parseInt(pdf.numPages)
          this.$emit('setPdf', pdf)
        }).catch(err => {
          console.log(err)
        });
      },
      immediate: true,
      deep: true
    }
  },
  data() {
    return {
      showSecondFlag: false,
      pdfInfo: {},
      loadedRatio: 0,//进度
      startPage: 0,//打印开始页码
      endPage: 0,//打印结束页码
      currentPage: 1,//当前页码
      numPages: 0//总页码
    }
  },
  methods: {
    handleCurrentChange(val) {
      this.currentPage = val
    },
    async doublePrint(type) {
      let page1 = []
      let page2 = []
      for (let i = parseInt(this.startPage); i < parseInt(parseInt(this.endPage) + 1); i++) {
        if (i % 2 === 0) {
          page1.push(i)
        } else {
          page2.push(i)
        }
      }
      if (page2.length > page1.length && page2.length !== 1) {
        page1.push(0)
      }
      page1 = page1.reverse()

      if (type === '1') {
        console.log(page1)
        this.$refs.pdf.print(600, page1)
        this.showSecondFlag = true
      } else if (type === '2') {
        console.log(page2)
        alert('偶数页打印结束后,且短边翻转后点击确定')
        this.$refs.pdf.print(600, page2)
        this.showSecondFlag = false
      }

    },
    password(updatePassword, reason) {
      updatePassword(prompt('password is "test"'));
    },
    error(err) {
      console.log(err);
    }
  }
}
</script>

<style scoped>

</style>
