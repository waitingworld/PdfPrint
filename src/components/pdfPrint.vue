<template>
  <div>
    <merge-pdf :file-list="fileList" :show="showMergePdf" @close="showMergePdf=false"></merge-pdf>
    <div class="pdfClass">
      <div style="display: flex;flex-direction: column;justify-content: flex-start;align-items: center;">
        <div style="padding: 10px;">
          <input id="choosePdfId" type="file" accept="application/pdf" style="display: none"/>
          <el-button type="primary" @click="choosePdfFile">选择pdf</el-button>
        </div>
        <el-button type="primary" @click="showMergePdf=true">合并pdf</el-button>
      </div>
      <el-tabs :tab-position="'left'" type="border-card" v-show="fileList.length>0"
               style="width: fit-content;margin-left: 20px;" >
        <el-tab-pane v-for="(file,index) in fileList" :key="index" :label="file.name">
          <pdf-item :file="file.value" @setPdf="(pdf)=>{$set(fileList[index],'pdf',pdf)}"/>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import PdfItem from "./pdfItem";
import MergePdf from "./mergePdf";

export default {
  name: 'PdfPrint',
  components: {MergePdf, PdfItem},
  data() {
    return {
      fileList: [],
      showMergePdf: false
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
