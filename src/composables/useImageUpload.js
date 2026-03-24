import { ref } from "vue";
import { ElMessage } from "element-plus";
import { uploadImage } from "../api/dish";

export function useImageUpload() {
  const uploading = ref(false);

  const upload = async (file) => {
    // 1. 校验文件格式和大小
    const isImage = ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(file.type);
    const isLt10M = file.size / 1024 / 1024 < 10;

    if (!isImage) {
      ElMessage.error("上传图片只能是 JPG/PNG/GIF 格式!");
      return null;
    }
    if (!isLt10M) {
      ElMessage.error("上传图片大小不能超过 10MB!");
      return null;
    }

    uploading.value = true;
    try {
      const res = await uploadImage(file);
      if (res.code === 200) {
        ElMessage.success("图片上传成功");
        return res.data; // 返回图片 URL
      } else {
        ElMessage.error(res.message || "图片上传失败");
        return null;
      }
    } catch (err) {
      console.error("图片上传异常：", err);
      ElMessage.error("图片上传请求异常，请重试");
      return null;
    } finally {
      uploading.value = false;
    }
  };

  return {
    uploadImage: upload,
    uploading
  };
}
