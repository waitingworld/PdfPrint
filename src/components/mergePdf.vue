<template>
  <div>
    <el-dialog :title="'合并PDF'" :visible.sync="show" append-to-body :before-close="()=>{$emit('close')}"
               @close="$emit('close')">
      <el-button type="primary" @click="loadPDF('newPdf')">合并</el-button>
      <el-table :data="tableData" border stripe>
        <el-table-column align="center" label="文件名" prop="name"></el-table-column>
        <el-table-column align="center" label="开始页" prop="startPage">
          <template v-slot="scope">
            <el-input-number size="small" :step="1" :min="1" :max="scope.row.total"
                             v-model="scope.row.startPage"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column align="center" label="结束页" prop="endPage">
          <template v-slot="scope">
            <el-input-number size="small" :step="1" :min="1" :max="scope.row.total"
                             v-model="scope.row.endPage"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="80">
          <template v-slot="scope">
            <el-button size="small" type="danger" @click="deletePdf(scope.row.name)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div id="pop" style="display: none;"></div>
    </el-dialog>
  </div>
</template>

<script>
import {jsPDF} from "jspdf"

export default {
  name: "mergePdf",
  props: {
    show: {type: Boolean},
    fileList: {type: Array}
  },
  data() {
    return {
      tableData: [],
      pageNum_all: 0,
      pageNum_compelted: 0
    }
  },
  watch: {
    pageNum_compelted: {
      handler() {
        if (this.pageNum_all !== 0 && this.pageNum_all == this.pageNum_compelted) {
          this.createPDF()
        }
      }
    },
    fileList: {
      handler() {
        let tmp = []
        this.fileList.forEach((file, index) => {
          tmp.push({
            name: file.name,
            file: file.value,
            startPage: 0,
            endPage: file.pdf ? parseInt(file.pdf.numPages) : 0,
            total: file.pdf ? parseInt(file.pdf.numPages) : 0,
            pdf: file.pdf
          })
        })
        this.tableData = tmp
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    deletePdf(name) {
      let deleteIndex = -1
      this.tableData.forEach((item, index) => {
        if (item.name === name) {
          deleteIndex = index
        }
      })
      if (deleteIndex > 0) {
        this.tableData.splice(deleteIndex, 1);
      }
    },
    ///id:只是为了将canvas做个标记(一个pdf分解成多张canvas图片,canvasid="id-页码")，区分不同pdf,后面可以根据id找到对应的pdf,
    loadPDF(id) {
      this.loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.tableData.forEach((file, index) => {
        //用 promise 获取页面
        let canvasid = '';
        let idTemplate = 'pdf_' + id + '-'+index;
        let pageNum = file.endPage - file.startPage + 1;
        this.pageNum_all += pageNum;
        for (let i = file.startPage; i <= file.endPage; i++) {
          canvasid = idTemplate + i;
          //根据页码创建画布
          this.createPdfContainer(canvasid, 'pdfClass');
          //将pdf渲染到画布上去
          this.renderPDF(file.pdf, i, canvasid);
        }
      })
    },
    //创建
    createPdfContainer(id, className) {
      let pdfContainer = document.getElementById('pop');
      let canvasNew = document.createElement('canvas');
      canvasNew.id = id;
      canvasNew.className = className;
      pdfContainer.appendChild(canvasNew);
    },
    //渲染pdf
    //建议给定pdf宽度
    renderPDF(pdf, i, id) {
      pdf.getPage(i).then((page) => {
        let scale = 1;
        let viewport = page.getViewport({scale: scale,});
        //  准备用于渲染的 canvas 元素
        let wrapper = document.getElementById("pop");
        var outputScale = window.devicePixelRatio || 1;
        let canvas = document.getElementById(id);
        let context = canvas.getContext('2d');
        canvas.width = viewport.viewBox[2] * outputScale;
        canvas.height = viewport.viewBox[3] * outputScale;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        wrapper.style.width = Math.floor(canvas.width / scale) + 'pt';
        wrapper.style.height = Math.floor(canvas.height / scale) + 'pt';
        wrapper.style.backgroundColor = 'black';
        // 将 PDF 页面渲染到 canvas 上下文中
        let transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;//变换矩阵
        let renderContext = {
          canvasContext: context,
          transform: transform,
          viewport: viewport
        };
        let pageRendering = page.render(renderContext);
        //步骤：钩入pdf渲染完成事件
        let completeCallback = pageRendering._internalRenderTask.callback;
        pageRendering._internalRenderTask.callback = (error) => {
          //第二步：调用完成方法之前要做的事情
          completeCallback.call(this, error);
          //第3步：做一些更多的东西
          this.pageNum_compelted++;
        }
      })
    },
    createPDF() {
      let pop = document.querySelectorAll("#pop>canvas")
      if (pop.length <= 0) {
        alert("请选择打印文档！");
        return;
      }
      if (this.pageNum_all != this.pageNum_compelted || this.pageNum_all == 0) {
        alert("请等待文档合并完成！");
        return;
      }
      let doc = new jsPDF('', 'pt', 'a4');
      pop.forEach((canvas, index) => {
        if (index > 0) {
          doc.addPage();//添加页
        }
        //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
        let contentWidth = canvas.width;
        let contentHeight = canvas.height;
        let imgWidth = 595.28;
        let imgHeight = 592.28 / contentWidth * contentHeight;
        let canvas_1Url = canvas.toDataURL("image/JPEG");
        doc.addImage(canvas_1Url, 'JPEG', 0, 0, imgWidth, imgHeight);
      })
      doc.save('合并后的文件.pdf');
      this.loading.close();
      this.$emit('close')
    }
  }
}
</script>

<style scoped>

</style>
