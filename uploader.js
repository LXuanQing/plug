// 图片上传
//实例化一个plupload上传对象
var uploader = new plupload.Uploader({
    browse_button : '_browse', //触发文件选择对话框的按钮，为那个元素id
    url : '/alimanage/web/fileApi/ossUpload.json', //服务器端的上传页面地址
    multi_selection: false, // 是否可以在文件浏览对话框中选择多个文件
    filters: { // 不是图片的文件不能选中
        mime_types: [ //只允许上传图片文件
          { title: "图片文件", extensions: "jpg,gif,png" }
        ]
    }
});
//在实例对象上调用init()方法进行初始化
uploader.init();

uploader.setOption("multipart_params", {  is_private: true }); //上传时的附加参数，以键/值对的形式传入，以post方式传过去

// 当文件添加到上传队列后触发监听函数
uploader.bind('FilesAdded',function(up,file){
    previewImage(file[0],function(imgsrc) {
        $('#logo .logo_img').attr("src",imgsrc)
        $('#_start_upload').css("display","inline-block"); // 显示开始上传按钮
    })
})

// 当队列中的某一个文件正要开始上传前触发监听函数
uploader.bind('BeforeUpload', function(up, file) {
    var file_length = up.files.length
    var fileId = up.files[file_length-1].name + "(" + up.files[file_length-1].origSize + ")";
    $.ajax({
        type:"POST",
        async: false,
        url: "/alimanage/web/fileApi/getFileUploadInfo.json",
        data: {fileId:fileId},
        success: function(result) {
            if(result.data.finished) {
                up.stop();
            } else {
                var form_data = $.extend({}, up.getOption("multipart_params"));
                form_data.fileId = fileId;
                form_data.file = up.files[file_length-1];
                form_data.uploadId = result.data.uploadId;
                up.setOption("multipart_params", form_data);
            }
        }
    })
})

// 上传进度
uploader.bind("uploadProgress",function(file,percentage) {
    let pro = percentage.percent+"%"
    $(".logo_img_progress").css("width",pro) // 显示进度条
})
// 当队列中的某一个文件上传完成后触发监听函数
uploader.bind('FileUploaded', function(up, file, result) {
   
})
// 当发生错误时触发监听函数
uploader.bind('Error',function(up,error){
   
})

//最后给"开始上传"按钮注册事件
document.getElementById('_start_upload').onclick = function(){
    uploader.start(); //调用实例对象的start()方法开始上传文件，当然你也可以在其他地方调用该方法
}







// 文件上传
    
//实例化一个plupload上传对象
var file_uploader = new plupload.Uploader({
    browse_button : 'file_browse', //触发文件选择对话框的按钮，为那个元素id
    url : '/alimanage/web/fileApi/ossUpload.json', //服务器端的上传页面地址
    chunk_size: '4mb', // 使用分片上传，每片文件被切割成的大小，会传给文件上传接口两个字段 chunk第几次 chunks 需要的总次数，会自动计算出
    multi_selection: false,
});
file_uploader.setOption("multipart_params", { is_private: true }); //上传时的附加参数，以键/值对的形式传入，以post方式传过去
    
//在实例对象上调用init()方法进行初始化
file_uploader.init();

file_uploader.bind('FilesAdded',function(up,file){
    if(/image\//.test(file[0].type)) {
        // 不能上传图片
        return
    }
    $(".pakage_close").click(function(){
        file_uploader.splice(); // 取消上传时清空队列
    })
   
    let file_size = plupload.formatSize(file[0].size) // 用这个计算文件大小
})

file_uploader.bind('BeforeUpload', function(up, file) {
    
    var file_length = up.files.length
    var size = up.files[file_length-1].origSize
    var fileId = up.files[file_length-1].name + "(" + size + ")";
    $.ajax({
        type:"POST",
        async: false,
        url: "/alimanage/web/fileApi/getFileUploadInfo.json",
        data: {fileId:fileId},
        success: function(result) {
            if(result.data.finished) {
                up.stop();
            } else {
                var form_data = $.extend({}, up.getOption("multipart_params"));
                form_data.fileId = fileId;
                form_data.file = up.files[file_length-1];
                form_data.uploadId = result.data.uploadId;
                up.setOption("multipart_params", form_data);
            }
        }
    })
})

file_uploader.bind('FileUploaded', function(up, file, result) {
   
})

file_uploader.bind('Error',function(up,error){
    
})
// 当使用文件小片上传功能时，每一个小片上传完成后触发监听函数
file_uploader.bind('ChunkUploaded',function(up){
    
})

// 上传进度
file_uploader.bind("uploadProgress",function(file,percentage) {
    let pro = percentage.percent+"%"
    $(".bai_progress").html("&nbsp;&nbsp;&nbsp;&nbsp;"+pro)
    $("#pakage .pakage_progress").css("width",pro)
})
document.getElementById('file_start_upload').onclick = function(){
    file_uploader.start(); //调用实例对象的start()方法开始上传文件，当然你也可以在其他地方调用该方法
}


// 图片预览
function previewImage(file, callback) { //file为plupload事件监听函数参数中的file对象,callback为预览图片准备完成的回调函数
    if (!file || !/image\//.test(file.type)) return;

    if (file.type == 'image/gif') { //gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
        var fr = new mOxie.FileReader(); // plupload中提供了mOxie对象
        fr.onload = function() {
            callback(fr.result);
            fr.destroy();
            fr = null;
        }
        fr.readAsDataURL(file.getSource());
    } else {
        var preloader = new mOxie.Image();
        preloader.onload = function() {
            preloader.downsize(70, 70); //先压缩一下要预览的图片,宽70，高70
            var imgsrc = preloader.type == 'image/jpeg' ? preloader.getAsDataURL('image/jpeg', 80) : preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
            callback && callback(imgsrc); //callback传入的参数为预览图片的url
            preloader.destroy();
            preloader = null;
        };
        preloader.load(file.getSource());
    }
}