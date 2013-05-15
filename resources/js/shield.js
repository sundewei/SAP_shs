function displaySwitchs() {
	$('#oilSensorSwitch').attr('value', 'Start All');
	$('#windmillSensorSwitch').attr('value', 'Start All');
	$('#oilSensorSwitchOff').attr('value', 'Stop All');
	$('#windmillSensorSwitchOff').attr('value', 'Stop All');
	$('#oilSensorSwitchOff').attr("disabled", "disabled");
	$('#windmillSensorSwitchOff').attr("disabled", "disabled");
}

function startOil() {
	var url = "/shs/js/sssss?type=oil&threadMapName=" + threadMapName;
    $.get( url,
            {},
            function(data){
				getSensorSignalCounts();
            },
            "text");
    $('#oilSensorSwitch').attr('value', 'Sending...');
    $('#oilSensorSwitch').attr("disabled", "disabled");
	$('#oilSensorSwitchOff').removeAttr("disabled");
}

function stopOil() {
	var url = "/shs/jspv/stopSensors.jsp?sensorFilename=" + escape("/data/shield/oilSensors/oil.csv");
    $.get( url,
            {},
            function(data){
				$('#oilSensorSwitch').attr('value', 'Start All');
				$('#oilSensorSwitchOff').attr("disabled", "disabled");
				$('#oilSensorSwitch').removeAttr("disabled");
            },
            "text");
}

function startWindmill() {
	var url = "/shs/js/sssss?type=windmill&threadMapName=" + threadMapName;
	$.get( url,
            {},
            function(data){
				getSensorSignalCounts();
            },
            "text");
    $('#windmillSensorSwitch').attr('value', 'Running...');
    $('#windmillSensorSwitch').attr("disabled", "disabled");
	$('#windmillSensorSwitchOff').removeAttr("disabled");
}

function stopWindmill() {
	var url = "/shs/jspv/stopSensors.jsp?sensorFilename=" + escape("/data/shield/windmillSensors/windmills.csv");
    $.get( url,
            {},
            function(data){
				$('#windmillSensorSwitch').attr('value', 'Start All');
				$('#windmillSensorSwitchOff').attr("disabled", "disabled");
				$('#windmillSensorSwitch').removeAttr("disabled");
            },
            "text");
}

function getSensorSignalCounts() {
	for (var i = 0; i < oilSids.length; i ++) {
		getSensorSignalCount(oilSids[i]);
	}
	for (var i = 0; i < windmillSids.length; i ++) {
		getSensorSignalCount(windmillSids[i]);
	}
}

function getSensorSignalCount(sid) {
    var url = "/shs/js/sssssi?";
    var param = "threadMapName=" + threadMapName + "&sid="+sid;
    url = url + param;
    $.ajax({
        url: url,
        success: function (data) {
			$("span#" + sid).html("&nbsp;&nbsp;&nbsp;<img src='/shs/resources/gfx/icon-whitearrowright.png' />&nbsp;&nbsp;&nbsp;" + data);
        }
    });

}

function getLogSenderContent(jsonObj, folder, showFolderUp) {
    var count = 0;
    var content = "";
    content += "<tr><td class='headline' style='min-width:400px;'>File(s)</td><td class='headline'>File Size</td><td class='headline'>Modification Time</td></tr>";
    while (true) {
        var fileName = eval("jsonObj.fileName"+count);
        var fileLen = eval("jsonObj.fileLen"+count);
        var fileModificationTime = eval("jsonObj.fileModificationTime"+count);
        var isDir = eval("jsonObj.isDir"+count);
        if (count == 0 && showFolderUp) {
            content += "<tr><td class='field'>&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:changeFolder(\"..\")' title='Back to parent folder'>&nbsp;<img width=16 length=16 src='/shs/resources/gfx/folder.jpg' />&nbsp;..</a></div></td><td class='field'>-</td><td class='field'>-</td></tr>";
        }
        if (!fileName) {
            break;
        } else {
            var displayFilename = fileName.substring(fileName.indexOf(folder));
            var shortenName = getShortenName(displayFilename, 65);
            var hpLink = downloadFileUrl + "?hdfsFilename=" + escape(displayFilename);
            var icon = "/shs/resources/gfx/document.png";
            if (isDir == '0') {
                icon = "/shs/resources/gfx/folder.jpg";
                hpLink = "javascript:changeFolder(\""+escape(fileName)+"\")";
            }

            if (contains(fileName, runningFiles)) {
                content += "<tr><td class='field'><span title='"+fileName+"'><span id='ff_" + count + "'><a href='javascript:sendFile(\"" + fileName + "\", \"" + restUrl + "\", \"" + threadMapName + "\", \"ff_" + count + "\")'><img src='/shs/resources/gfx/moving-blue-arrow.GIF'></a></span>&nbsp;&nbsp;<a href='" + hpLink + "' title='" + displayFilename + "'>&nbsp;<img width=16 length=16 src='"+icon+"' />&nbsp;" + shortenName + "</a></span><span id='cc_" + count + "' /></td><td class='field'>" + fileLen + "</td><td class='field'>" + fileModificationTime + "</td></tr>";
            } else {
                content += "<tr><td class='field'><span title='"+fileName+"'><span id='ff_" + count + "'><a href='javascript:sendFile(\"" + fileName + "\", \"" + restUrl + "\", \"" + threadMapName + "\", \"ff_" + count + "\")'>Send</a></span>&nbsp;&nbsp;<a href='" + hpLink + "' title='" + displayFilename + "'>&nbsp;<img width=16 length=16 src='"+icon+"' />&nbsp;" + shortenName + "</a></span><span id='cc_" + count + "' /></td><td class='field'>" + fileLen + "</td><td class='field'>" + fileModificationTime + "</td></tr>";
            }
            fileSpans.put(fileName, 'cc_' + count);
            actionSpans.put(fileName, 'ff_' + count);
        }
        count++;
    }

    if (count == 0) {
        content += "<tr><td class='field'>No file found!</td><td class='field'>&nbsp;</td><td class='field'>&nbsp;</td></tr>";
    }
    return content;
}

function refreshCounts() {
    for (var i = 0; i < clickedFiles.length; i ++) {
        var spanName = fileSpans.get(clickedFiles[i]);
        getCount(spanName, clickedFiles[i], threadMapName);
    }
}

function getCount(spanName, filename, mapName) {
    var url = "/shs/js/si?";
    var param = "filename=" + encodeURI(filename) + "&threadMapName=" + mapName;
    url = url + param;
    $.ajax({
        url: url,
        success: function (data) {
            if (data >= 0) {
                $("span#" + spanName).html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Sent:&nbsp;<b>" + data + "</b>&nbsp; lines...");
            } else if (data < 0) {
                $('span#' + actionSpans.get(filename)).html("<b>Done</b>");
            }
        }
    });

}

function sendFile(fileName, restUrl, mapName, spanId) {
    var url = "/shs/js/ss?";
    var param = "hdfsSourceFile=" + encodeURI(fileName) + "&restUrl=" + encodeURI(restUrl) + "&threadMapName=" + mapName;
    url = url + param;
    $.ajax({
        url: url,
        success: function (data) {
            $('span#' + spanId).html("<img src='/shs/resources/gfx/moving-blue-arrow.GIF'>");
            clickedFiles[clickedFiles.length] = fileName;
        },
        error: function(data) {
            alert("error: " + data);
        }
    });
}

function switchEditing() {
    if (disableEditQuery) {
        $("#queryXml").attr("disabled", !disableEditQuery);
        disableEditQuery = false;
        $("#editLabel").text("Save Change");
        $("#reminder").text(reminderText2);
    } else {
        $("#queryXml").attr("disabled", !disableEditQuery);
        disableEditQuery = true;
        $("#editLabel").text("Edit Query ");
        $("#reminder").text(reminderText1);
        saveHdfsFile();
    }
}

function getTableSchema() {
    $("span#tableStatus").html("Table Not Found!");
    $("span#tableStatus").addClass("important");
    $("tr#columnNameTr").html("");
    $("tr#columnTypeTr").html("");

    $("span#tableStatusQ").html("Table Not Found!");
    $("span#tableStatusQ").addClass("important");
    $("tr#columnNameTrQ").html("");
    $("tr#columnTypeTrQ").html("");
	
    demoTableExist = false;
    $.get( tableSchemaUrl,
            {},
            function(data){
                var nameTrHtml = "<td class=\"centerText headline\">Column Name</td>";
                var typeTrHtml = "<td class=\"centerText headline\">Data Type</td>";
                var csvArrays = $.csv.toArrays(data);
                for (var i = 1; i < csvArrays.length; i++) {
                    for (var j = 0; j < csvArrays[i].length; j++) {
                        if (j == 1) {
                            var columnName = csvArrays[i][j];
                            nameTrHtml += "<td class=\"centerField\">" + columnName + "</td>";
                        }
                        if (j == 2) {
                            var columnType = csvArrays[i][j];
                            typeTrHtml += "<td class=\"centerField lower\">" + columnType + "</td>";
                        }
                    }
                }
                $("tr#columnNameTr").html(nameTrHtml);
                $("tr#columnTypeTr").html(typeTrHtml);
                $("span#tableStatus").html("Schema Retrieved");

                $("tr#columnNameTrQ").html(nameTrHtml);
                $("tr#columnTypeTrQ").html(typeTrHtml);
                $("span#tableStatusQ").html("Schema Retrieved");
				
                demoTableExist = true;
                displayButtons();
            },
            "text");
    displayButtons();
}

function displayButtons() {
    if (demoTableExist) {
        $("#createDemoTableBtn").hide();
        $("#deleteDemoTableBtn").show();
        $("#updateDemoTableBtn").show();
    } else {
        $("#createDemoTableBtn").show();
        $("#deleteDemoTableBtn").hide();
        $("#updateDemoTableBtn").hide();
    }
}

function saveHdfsFile() {
    $.post(writeHdfsUrl, { hdfsFilename: "/data/shield/requests/queryTable.xml", content: $("textarea#queryXml").val() });
}

function createDemoTable() {
    var url = "/shs/js/sps?";
    var param = "targetUrl=" + encodeURI("http://LLBPAL36:8080/shs/rest/") + "&xmlDataPath=" + encodeURI("/data/shield/requests/createTableReq.xml");
    url = url + param;
    $.ajax({
        url: url,
        success: function (data) {
            var htmlContent = $('#responseStatus').html();
            if (htmlContent == null) {
                htmlContent = "";
            }
            htmlContent = "<span class='messageBox' id='sss_" + statusCount + "'>" + getDisplayTime() + ", table created with id: " + data + "</span>" + htmlContent;

            $('#responseStatus').html(htmlContent);			
            statusCount++;
            hideOldStatus(statusCountLimit);
            highlightStatus();
			fadeoutStatus();
            $("#createDemoTableBtn").hide();
            $("#deleteDemoTableBtn").show();
            getTableSchema();
            displayButtons();
        },
        error: function(data) {
            alert("error: " + data);
            $('span#responseDiv').text(data);
            $('span#responseDiv').fadeIn('slow');
            getTableSchema();
            displayButtons();
        }
    });
}

function getDisplayTime() {
    var date = new Date();
    return getPaddedText(date.getHours(), '0', 2) + ":" + getPaddedText(date.getMinutes(), '0', 2) + ":" + getPaddedText(date.getSeconds(), '0', 2);
}

function getPaddedText(input, padded, len) {
    var text = input.toString();
    while (text.length < len) {
        text = padded + input;
    }
    return text;
}

function hideOldStatus(keepN) {
    for (var i = (statusCount - keepN - 1); i >= 0; i --) {
        if ($('#sss_' + i).length) {
            //$('#sss_' + i).fadeOut(6000);
			$('#sss_' + i).hide();
        }
    }
}

function highlightStatus() {
    for (var i = 0; i < statusCount - 1; i ++) {
        if ($('#sss_' + i).length) {
            //$('#sss_' + i).removeClass('success').addClass('info');
        }
    }
}

function fadeoutStatus() {
	$('#sss_' + (statusCount - 1)).fadeOut(8000, "swing");
}


function updateDemoTable() {
    var url = "/shs/js/sps?";
    var param = "method=put&targetUrl=" + encodeURI("http://LLBPAL36:8080/shs/rest/table/22") + "&xmlDataPath=" + encodeURI("/data/shield/requests/updateTableReq.xml");
    url = url + param;
    $.ajax({
        url: url,
        success: function (data) {
            var htmlContent = $('#responseStatus').html();
            if (htmlContent == null) {
                htmlContent = "";
            }
            htmlContent = "<span class='messageBox' id='sss_" + statusCount + "'>" + getDisplayTime() + ", table updated..." + data + "</span>" + htmlContent;
            $('#responseStatus').html(htmlContent);						
            statusCount++;
            hideOldStatus(statusCountLimit);
            highlightStatus();
			fadeoutStatus();
            getTableSchema();
        },
        error: function(data) {
            alert("error: " + data);
            $('div#responseDiv').text(data);
            $('div#responseDiv').fadeIn('slow');
            getTableSchema();
            displayButtons();
        }
    });
}

function deleteDemoTable() {
    var url = "/shs/js/sps?";
    var param = "method=delete&targetUrl=" + encodeURI("http://LLBPAL36:8080/shs/rest/table/22");
    url = url + param;
    $.ajax({
        url: url,
        success: function (data) {
            var htmlContent = $('#responseStatus').html();
            if (htmlContent == null) {
                htmlContent = "";
            }
            htmlContent = "<span class='messageBox' id='sss_" + statusCount + "'>" + getDisplayTime() + ", table deleted (id=22)..." + data + "</span>" + htmlContent;
            $('#responseStatus').html(htmlContent);						
            statusCount++;
            hideOldStatus(statusCountLimit);
            highlightStatus();
			fadeoutStatus();
            $("#createDemoTableBtn").show();
            $("#deleteDemoTableBtn").hide();
            getTableSchema();
            displayButtons();
        },
        error: function(data) {
            alert("error: " + data);
            $('div#responseDiv').text(data);
            $('div#responseDiv').fadeIn(2000);
            getTableSchema();
            displayButtons();
        }
    });
}


function getFiles(listHdfsUrl, openFolder) {
    $("div#originalLogFiles").fadeOut(2000);
    $.getJSON(listHdfsUrl, {hdfsFolder: openFolder}, function(json){
        $("div#originalLogFiles").html(getLogSenderContent(json, openFolder, false));
        $("div#originalLogFiles").fadeIn(2000);
    });
}

function queryNoHh() {
    var xmlDataPath = "/data/shield/requests/queryTable.xml";
    $('.example4demo').popupWindow({
        windowURL:'http://code.google.com/p/swip/',
        windowName:'swip'
    });


}