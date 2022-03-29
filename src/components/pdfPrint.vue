<template>
  <div>
    <div class="pdfClass">
      <div style="display: flex;flex-direction: row;justify-content: center;">
        <div>
          <input id="choosePdfId" type="file" multiple accept="application/pdf" style="display: none"/>
          <el-button type="primary" @click="choosePdfFile">选择pdf</el-button>
        </div>
      </div>
      <el-tabs :tab-position="'left'" type="border-card" v-show="fileList.length>0"
               style="width: fit-content;margin-left: 20px;">
        <el-tab-pane v-for="(file,index) in fileList" :key="index" :label="file.name">
          <pdf-item :file="file.value"/>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import PdfItem from "./pdfItem";

export default {
  name: 'PdfPrint',
  components: {PdfItem},
  data() {
    return {
      fileList: [],
    }
  },
  mounted() {
    const input = document.querySelector('input[type=file]')
    input.addEventListener('change', () => {
      this.fileListChange(input.files)
    }, false)
  },
  methods: {
    choosePdfFile() {
      let btn = document.querySelector('#choosePdfId')
      btn.click()
    },
    fileListChange(fileTmpList) {
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
    }
  }
}
</script>
<style scoped>
.pdfClass {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  align-content: center;
  flex-wrap: wrap;
  flex-direction: row;
}
</style>
