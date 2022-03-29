<template>
  <div>
    <el-dialog :title="'合并PDF'" :visible.sync="show" append-to-body :before-close="()=>{$emit('close')}" @close="$emit('close')">
      <el-button type="primary">合并</el-button>
      <el-table :data="tableData" border stripe>
        <el-table-column align="center" label="文件名" prop="name"></el-table-column>
        <el-table-column align="center" label="开始页" prop="startPage">
          <template v-slot="scope">
            <el-input-number size="small" :step="1" :min="1" :max="scope.row.total" v-model="scope.row.startPage"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column align="center" label="结束页" prop="endPage">
          <template v-slot="scope">
            <el-input-number size="small" :step="1" :min="1" :max="scope.row.total" v-model="scope.row.endPage"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="80">
          <template v-slot="scope">
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "mergePdf",
  props: {
    show: {type: Boolean},
    fileList: {type: Array}
  },
  data() {
    return {
      tableData: []
    }
  },
  watch: {
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
        debugger
        this.tableData = tmp
      },
      immediate: true,
      deep: true
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
