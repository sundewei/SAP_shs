function getJSONExample() {
    $.getJSON(listHdfsUrl, {hdfsFolder: nowFolder}, function(json){
        $("table#currentFolderName").html(getCurrentFolderHtml());
        $("table#hdfsFiles").hide();
        $("table#hdfsFiles").html(getHdfsTableContent(json, nowFolder, !sameFolder(nowFolder, hdfsPersonFolder)));
        $("table#hdfsFiles").fadeIn(2000);
    });
}

function deleteFile(filename) {
    if(confirm("Delete " + hdfsPersonFolder + filename + "?")) {
        $.post(deleteFileUrl, {"hdfsFolder": nowFolder, "filenameToDelete": filename, "action": "delete"},
            function(){
                refreshFileBrowser();
            }, "text");
    }
}
