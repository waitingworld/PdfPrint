<template>
  <div>
    <div>
      <div style="display: flex;flex-direction: row;justify-content: center;">
        <input id="file-input" type="file" multiple/>
        <div style="text-align: center;display: inline-block;">
          当前pdf文件:
          <el-select v-model="src" placeholder="请选择">
            <el-option
              v-for="(file,index) in fileList"
              :key="index"
              :label="file.name"
              :value="file.value">
            </el-option>
          </el-select>
        </div>
        <div style="text-align: right;display: inline-block;padding-left: 100px;">
          <div style="display: flex;">
            <div style="">
              <el-form inline style="">
                <el-form-item label="打印开始页">
                  <el-input v-model="startPage" type="number"></el-input>
                </el-form-item>
                <el-form-item label="打印结束页">
                  <el-input v-model="endPage" type="number"></el-input>
                </el-form-item>
              </el-form>
            </div>
            <div>
              <el-button round type="primary" id="page1" @click="doublePrint('1')">双面打印1</el-button>
              <el-button round type="primary" id="page2" @click="doublePrint('2')">双面打印2</el-button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <el-progress style="padding: 10px;width: calc(108px * 5.5);margin: 0 auto;" :text-inside="true"
                     :stroke-width="26"
                     :percentage="loadedRatio*100"></el-progress>
        <el-card shadow="always" style="width: calc(108px * 5);height: calc(152px * 5);margin: 0 auto;">
          <pdf ref="pdf"
               :src="src"
               :page="page"
               @progress="loadedRatio = $event"
               @password="password"
               @error="error"
               @num-pages="numPages = $event"
               @link-clicked="page = $event"/>
        </el-card>
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page="page"
          :page-size="1"
          layout="total,  prev, pager, next, jumper"
          :total="numPages">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import pdf from 'vue-pdf'
import {pdfToBase64} from 'pdf-to-base64'
import CMapReaderFactory from 'vue-pdf/src/CMapReaderFactory.js'

export default {
  name: 'PdfPrint',
  components: {pdf},
  data() {
    return {
      startPage: 0,
      endPage: 0,
      fileList: [],
      src: '',
      loadedRatio: 0,
      page: 1,
      numPages: 0
    }
  },
  mounted() {
    const input = document.querySelector('input[type=file]')
    input.addEventListener('change', () => {
      this.fileListChange(input.files)
    }, false)
  },
  watch: {
    src: {
      handler() {
        if (!this.src) {
          return
        }
        var loadingTask = pdf.createLoadingTask({url: this.src, CMapReaderFactory});
        loadingTask.promise.then(pdf => {
          this.numPages = pdf.numPages;
          this.startPage = 1
          this.endPage = parseInt(pdf.numPages)
        });
      }
    }
  },
  methods: {
    fileListChange(fileTmpList) {
      debugger
      let self = this
      let fileTmp = fileTmpList[0]
      let reader = new FileReader();
      reader.readAsDataURL(fileTmp);
      reader.onload = () => {
        self.fileList.push(self.creatFileItem(fileTmp.name, reader.result))
      }
    },
    creatFileItem(name, value) {
      return {
        name: name,
        value: value
      }
    },
    handleCurrentChange(val) {
      this.page = val
    },
    async doublePrint(type) {
      let page1 = []
      let page2 = []
      debugger
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
        this.$refs.pdf.print(100, page1)
      } else if (type === '2') {
        console.log(page2)
        alert('偶数页打印结束后,且短边翻转后点击确定')
        this.$refs.pdf.print(100, page2)
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
