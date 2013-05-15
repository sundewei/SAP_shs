function runMovieRecommenderJob() {
    if (typeof userRatingHashtable == 'undefined' || userRatingHashtable.size() == 0) {
        alert('You did not rate any movie, cannot run movie recommendation.');
    } else {
//var email = prompt("Please enter your email for receiving the recommendations")
        $("div#movieRecommendationContent").hide();
        var queryString = "";
        var keys = userRatingHashtable.keys();
        for (var i = 0; i < keys.length; i++) {
            queryString += "m" + keys[i] + "=" + userRatingHashtable.get(keys[i]) + "&";
        }
//queryString += "userEmail=" + email;
        queryString = "?" + queryString;
//alert("queryString="+queryString);
        $("div#movieRecommendationNotification").html(getWaitingHtml());
        $("div#movieRecommendationNotification").fadeIn(2000);

        $.getJSON(movieRecommenderUrl + queryString, {},  function(json){
            $("div#movieRecommendationNotification").html(getReadyHtml());
            $("div#movieRecommendationNotification").fadeIn(2000);
            $("div#movieRecommendationContent").html(getRecommendedMovieDetails(json));
        });
    }
}

function toggleMovieList() {
    $("div#movieRecommendationContent").toggle();
}

function getWaitingHtml() {
    var content = "";
    content += "Processing...";
    return content;
}

function getReadyHtml() {
    var content = "";
    content += "New Recommendations!";
    return content;
}

function getRecommendedMovieDetails(jsonObj) {
    var content = "";
    var count = 0;
    var evenDivClass = "recommendedMovieEvenRow";
    var oddDivClass = "recommendedMovieOddRow";
    var divClass = evenDivClass;
    while (true) {
        var movieId = eval("jsonObj.movie_" + count);
//alert("movieId="+movieId)
        if(!movieId) {
            break;
        }
        if (count % 2 == 0) {
            divClass = evenDivClass;
        } else {
            divClass = oddDivClass;
        }
        content += "<div onclick='previewMovie(" + movieId + ")' class=" + divClass + ">" + movieIdNameHashtable.get(movieId) + "</div>"
        count++;
    }
    content += "Process time: " + (jsonObj.duration / 1000) + " seconds.";
    return content;
}

function previewMovie(movieId) {
    $("option:selected").attr("selected", false);
    $("option#movieOption" + movieId).attr('selected', 'selected');
    populateMoviePreviewAndRating();
}

function populateMoviePreviewAndRating() {
    $("div#moviePreview").html(getMoviePreview());
    //$("div#movieRating").html(getMovieRatingForm());
    updateMovieRatingForm();
}

function updateMovieRatingForm() {
    if (typeof userRatingHashtable == 'undefined') {
        userRatingHashtable = new Hashtable();
    }
    var movieId = $("select#movieSelector option:selected").val();
    var score = userRatingHashtable.get(movieId);
    var unknownValue = userRatingHashtable.get('unknownValue');

    if (score == 1) {
        $('.star').rating('select', '1 star');
    } else if(score == 2) {
        $('.star').rating('select', '2 star');
    } else if(score == 3) {
        $('.star').rating('select', '3 star');
    } else if(score == 4) {
        $('.star').rating('select', '4 star');
    } else if(score == 5) {
        $('.star').rating('select', '5 star');
    } else {
        $('.star').rating('drain');
    }
}

function setScore(score) {
//alert("in setScore()");
    var movieId = $("select#movieSelector option:selected").val();
    if (typeof userRatingHashtable == 'undefined') {
        userRatingHashtable = new Hashtable();
    }
//alert("about to set " + score + " stars to movie: " + movieId);
    userRatingHashtable.put(movieId, score);
//alert("Getting the score from userRatingHashtable : " + userRatingHashtable.get(movieId));
    $("option#movieOption" + movieId).addClass('ratedMovie');
}


function getMoviePreview() {
    var content = "";
    var movieId = $("select#movieSelector option:selected").val();
    content += "<iframe id='previewFrame' class='moviePreviewFrame' src='" + movieHtmlUrl + "?movieId=" + movieId + "'></iframe>";
    return content;
}


function populateThemeForm() {
    $("span#mahoutThemeForm").html(getThemesSelection());
}

function getThemesSelection() {
    var content = "";
    var selectedMahoutClassName = $("select#themeSelector option:selected").val();
    if ("org.apache.mahout.cf.taste.hadoop.item.RecommenderJob" == selectedMahoutClassName) {
        content += "<table>";
        content += "<tr>";
        content += "    <td>";
        content += "        <span class='text'>Preference CSV:</span>";
        content += "    </td>";
        content += "    <td>";
        content += "        <input id='mapredInputDir' type='text' size='90' value='/user/hadoop/taskForceData/amazonMovieDemo/ratings.csv'>";
        content += "    </td>";
        content += "</tr>";
        content += "<tr>";
        content += "    <td>";
        content += "        <span class='text'>Output Folder:</span>";
        content += "    </td>";
        content += "    <td>";
        content += "        <input id='mapredOutputDir' type='text' size='90' value='/user/hadoop/taskForceData/amazonMovieDemo/output'>";
        content += "    </td>";
        content += "</tr>";
        content += "<tr>";
        content += "    <td>";
        content += "        <span class='text'>User List File:</span>";
        content += "    </td>";
        content += "    <td>";
        content += "        <input id='usersFile' type='text' size='90' value='/user/hadoop/taskForceData/amazonMovieDemo/users.txt'>";
        content += "    </td>";
        content += "</tr>";
        content += "<tr>";
        content += "    <td>";
        content += "        <span class='text'>Recommendations:</span>";
        content += "    </td>";
        content += "    <td>";
        content += "        <select id='numRecommendations'>";
        for (var i = 1 ; i<= 15; i++) {
            var spacer = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            var displayText = spacer + getPaddedString(i, "0", 2) + spacer;
            if (i == 5) {
                content += "<option selected value='" + i + "'>" + displayText + "</option>";
            } else {
                content += "<option value='" + i + "'>" + displayText + "</option>";
            }
        }
        content += "        </select>";
        content += "    </td>";
        content += "</tr>";
        content += "<tr><td colspan=2 align=right><input id='runTask' type='button' value='Run Task' onclick='javascript:runRecommenderJob()'></td></tr>";
        content += "</table>";
    }
    return content;
}

function getPaddedString(input, paddStr, length) {
    var strInput = input + "";
    while (strInput.length < length) {
        strInput = paddStr + strInput;
    }
    return strInput;
}

function runRecommenderJob() {
    var csvPath = $("input#mapredInputDir").val();
    var outputPath = $("input#mapredOutputDir").val();
    var className = $("select#themeSelector option:selected").val();
    var usersFile = $("input#usersFile").val();
    var numRecommendations = $("select#numRecommendations option:selected").val();

    if (csvPath == null || csvPath.length == 0) {
        alert("Rating CSV path can not be empty.");
    }

    if (outputPath == null || outputPath.length == 0) {
        alert("Output folder can not be empty.");
    }

//alert("csvPath="+csvPath);
//alert("outputPath="+outputPath);
//alert("usersFile="+usersFile);
//alert("numRecommendations="+numRecommendations);
//alert("className="+className);
}

function getProcedureSelection() {
    var content = "<span class='text'>Procedure:</span> <select name='className' id='procedureFunction'>";
    content += "<option value='com.sap.plugin.ApacheAccessLogParser'>ApacheAccessLogParser</option>";
    content += "</select>";

    content += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    content += "<span class='text'>Log folder:</span> <input id='inputPath' type='text'>";
    content += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    content += "<span class='text'>Output folder:</span> <input id='outputPath' type='text'>";
    content += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    content += "<input type=button id='run_ApacheAccessLogParser' value='Run Procedure' onclick='javascript:runPlugin()'>";
    return content;
}

function runPlugin() {
    var inputPath = $("input#inputPath").val();
    var outputPath = $("input#outputPath").val();
    var className = $("select#procedureFunction option:selected").val();
    if (inputPath == null || inputPath.length == 0) {
        alert("Log folder can not be empty.");
    }
    if (inputPath == null || outputPath.length == 0) {
        alert("Out folder can not be empty.");
    }
    if (inputPath == outputPath) {
        alert("Log folder and output folder are the same.");
    }

    $.getJSON(submitPluginUrl, {"inputPath": inputPath, "outputPath" : outputPath, "className": className},
        function(json) {
            if(!json.succeed) {
                alert(json.reason);
            } else {
                alert("json.succeed="+json.succeed);
            }
        }
    );

}

function getJobHistoryContent(jsonObj) {
    var count = 0;
    var content = "";
    while (true) {
        var jobid = eval("jsonObj.jobid"+count);
        if (!jobid) {
            break;
        } else {
            content += "<tr><td class='field' text-align='center'><a name='" + jobid + "' onClick='loadJobDetail(\"" + jobid + "\")'><span>" + jobid + "</span></a></td></tr>";
        }
        count++;
    }

    return content;
}

function loadJobDetail(jobid) {
    // show loading image
    $("table#jobDetail").html("<tr><td><img src='../resources/gfx/spinner.gif'></td></tr>");

    $.getJSON(jobStatusUrl, {"jobid": jobid},  function(json){
        $("table#jobDetail").html(getHistoryJobDetail(json));
        $("table#jobDetail").fadeIn(2000);
    });
}

function getHistoryJobDetail(jsonObj) {
    var content = "";
    // Additional info
    if (jsonObj.jobname) {
        content += "<tr class='important'><td>Job ID</td><td>" + jsonObj.jobid + "</td></tr>";
        content += "<tr><td>Job Name</td><td>" + jsonObj.jobname + "</td></tr>";
        if (jsonObj.job_status) {
            content += "<tr class='alert'><td>State</td><td>" + jsonObj.job_status + "</td></tr>";
        }
        if (jsonObj.tracking_url) {
            content += "<tr><td>Tracking URL</td><td><a href='" + jsonObj.tracking_url + "' target='_new'>" + jsonObj.tracking_url + "</a></td></tr>";
        }
        if (jsonObj.setup_progress) {
            content += "<tr><td>Setup Progress</td><td>" + jsonObj.setup_progress + "</td></tr>";
        }
        if (jsonObj.map_progress) {
            content += "<tr><td>Map Progress</td><td>" + jsonObj.map_progress + "</td></tr>";
        }
        if (jsonObj.reduce_progress) {
            content += "<tr><td>Reduce Progress</td><td>" + jsonObj.reduce_progress + "</td></tr>";
        }
        if (jsonObj.cleanup_progress) {
            content += "<tr><td>CleanUp Progress</td><td>" + jsonObj.cleanup_progress + "</td></tr>";
        }
        if (jsonObj.is_completed) {
            content += "<tr><td>Completed</td><td>" + jsonObj.is_completed + "</td></tr>";
        }
        if (jsonObj.is_successful) {
            content += "<tr><td>Successful</td><td>" + jsonObj.is_successful + "</td></tr>";
        }
        if (jsonObj.job_priority) {
            content += "<tr><td>job_priority</td><td>" + jsonObj.job_priority + "</td></tr>";
        }
        if (jsonObj.total_maps) {
            content += "<tr><td>total_maps</td><td>" + jsonObj.total_maps + "</td></tr>";
        }
        if (jsonObj.total_reduces) {
            content += "<tr><td>total_reduces</td><td>" + jsonObj.total_reduces + "</td></tr>";
        }
        if (jsonObj.finished_maps) {
            content += "<tr><td>finished_maps</td><td>" + jsonObj.finished_maps + "</td></tr>";
        }
        if (jsonObj.finished_reduces) {
            content += "<tr><td>finished_reduces</td><td>" + jsonObj.finished_reduces + "</td></tr>";
        }
        if (jsonObj.launch_time) {
            content += "<tr><td>launch_time</td><td>" + jsonObj.launch_time + "</td></tr>";
        }
        if (jsonObj.submit_time) {
            content += "<tr><td>submit_time</td><td>" + jsonObj.submit_time + "</td></tr>";
        }
        if (jsonObj.finish_time) {
            content += "<tr><td>finish_time</td><td>" + jsonObj.finish_time + "</td></tr>";
        }
        if (jsonObj.duration) {
            content += "<tr><td>duration</td><td>" + jsonObj.duration + "</td></tr>";
        }
    }
    return content;
}

function hideOldContent() {
    $("div#fileExtError").hide();
    $("div#selectorError").hide();
    $("table#currentJobStatus").hide();
}

function getLoadingImage() {
    var content = "<tr><td width='300px' height='200px'><img src='../resources/gfx/spinner.gif'></td></tr>";
    return content;
}

function getCurrentJobStatusTableContent(jsonObj) {
    var count = 0;
    var content = "";
    if (jsonObj.jobid && !jsonObj.job_status) {
        getJobStatus(jsonObj.jobid);
        return;
    }
    if (jsonObj.error_msg) {
        content += "<tr><td>Error</td><td>" + jsonObj.error_msg + "</td></tr>";
    }

    // Additional info
    if (jsonObj.jobname) {
        content += "<tr><td>Job ID</td><td>" + jsonObj.jobid + "</td></tr>";
        content += "<tr><td>Job Name</td><td>" + jsonObj.jobname + "</td></tr>";
        if (jsonObj.job_status) {
            content += "<tr><td>State</td><td>" + jsonObj.job_status + "</td></tr>";
        }
        if (jsonObj.tracking_url) {
            content += "<tr><td>Tracking URL</td><td><a href='" + jsonObj.tracking_url + "' target='_new'>" + jsonObj.tracking_url + "</a></td></tr>";
        }
        if (jsonObj.setup_progress) {
            content += "<tr><td>Setup Progress</td><td>" + jsonObj.setup_progress + "</td></tr>";
        }
        if (jsonObj.map_progress) {
            content += "<tr><td>Map Progress</td><td>" + jsonObj.map_progress + "</td></tr>";
        }
        if (jsonObj.reduce_progress) {
            content += "<tr><td>Reduce Progress</td><td>" + jsonObj.reduce_progress + "</td></tr>";
        }
        if (jsonObj.cleanup_progress) {
            content += "<tr><td>CleanUp Progress</td><td>" + jsonObj.cleanup_progress + "</td></tr>";
        }
        if (jsonObj.is_completed) {
            content += "<tr><td>Completed</td><td>" + jsonObj.is_completed + "</td></tr>";
        }
        if (jsonObj.is_successful) {
            content += "<tr><td>Successful</td><td>" + jsonObj.is_successful + "</td></tr>";
        }
        if (jsonObj.job_priority) {
            content += "<tr><td>job_priority</td><td>" + jsonObj.job_priority + "</td></tr>";
        }
        if (jsonObj.total_maps) {
            content += "<tr><td>total_maps</td><td>" + jsonObj.total_maps + "</td></tr>";
        }
        if (jsonObj.total_reduces) {
            content += "<tr><td>total_reduces</td><td>" + jsonObj.total_reduces + "</td></tr>";
        }
        if (jsonObj.finished_maps) {
            content += "<tr><td>finished_maps</td><td>" + jsonObj.finished_maps + "</td></tr>";
        }
        if (jsonObj.finished_reduces) {
            content += "<tr><td>finished_reduces</td><td>" + jsonObj.finished_reduces + "</td></tr>";
        }
        if (jsonObj.launch_time) {
            content += "<tr><td>launch_time</td><td>" + jsonObj.launch_time + "</td></tr>";
        }
        if (jsonObj.submit_time) {
            content += "<tr><td>submit_time</td><td>" + jsonObj.submit_time + "</td></tr>";
        }
        if (jsonObj.finish_time) {
            content += "<tr><td>finish_time</td><td>" + jsonObj.finish_time + "</td></tr>";
        }
        if (jsonObj.duration) {
            content += "<tr><td>duration</td><td>" + jsonObj.duration + "</td></tr>";
        }
        content += "<tr><td><a class='sapButton' id='refreshJobStatus' onClick='getJobStatus(\"" + jsonObj.jobid + "\")'><span>Refresh Status</span></a></td><td>&nbsp;</td></tr>";
        //content += "<tr><td span='2'>&nbsp;</td></tr>";
        //content += "<tr><td colspan='2'><table class='emailAlert'><tr><td><input id='alertEmail' type='text' size='40' value='Your email here'/>&nbsp;&nbsp;<a id='alertButton' onClick='saveAlertEmail(\"" + jsonObj.jobid + "\")'><span>Add Email Alert</span></a></td></tr></table></td></tr>";
    }
    // Reload the job history table
    $.getJSON(jobHistoryUrl, {}, function(json){
      $("#jobHistory").html(getJobHistoryContent(json));
    });
    return content;
}

function getJobStatus(jobid) {
    $("table#currentJobStatus").html(getLoadingImage());

    if (!jobid) {
        var jobid = $("a#refreshJobStatus").attr("name");
    }

    $.getJSON(jobStatusUrl, {"jobid": jobid}, function(json){
            $("table#currentJobStatus").html(getCurrentJobStatusTableContent(json));
            $("table#currentJobStatus").show();
        }
    );
}

function getHdfsTableContent(jsonObj, folder, showFolderUp) {
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
            content += "<tr><td class='field'><div id='deleteFile" + count + "' title='"+fileName+"'><a href='javascript:deleteFile(\"" + fileName + "\")'>X</a>&nbsp;&nbsp;<a href='" + hpLink + "' title='" + displayFilename + "'>&nbsp;<img width=16 length=16 src='"+icon+"' />&nbsp;" + shortenName + "</a></div></td><td class='field'>" + fileLen + "</td><td class='field'>" + fileModificationTime + "</td></tr>";
        }
        count++;
    }

    if (count == 0) {
        content += "<tr><td class='field'>No file found!</td><td class='field'>&nbsp;</td><td class='field'>&nbsp;</td></tr>";
    }
    return content;
}

function sameFolder(folder1, folder2) {
    if (folder1 == folder2) {
        return true;
    } else {
        if (folder1.charAt(folder1.length -1) != '/') {
            folder1 = folder1 + "/";
        }
        if (folder2.charAt(folder2.length -1) != '/') {
            folder2 = folder2 + "/";
        }

        if(folder1 == folder2) {
            return true;
        } else {
            return false;
        }
    }

}

function changeFolder(anotherFolder) {
    if (anotherFolder == '..') {
        nowFolder = nowFolder.substring(0, nowFolder.lastIndexOf("/"));
    } else {
        nowFolder = anotherFolder;
    }
    $("input#nowFolder").val(nowFolder);
    refreshFileBrowser();
}

function getCurrentFolderHtml() {
    if(sameFolder(nowFolder, hdfsPersonFolder)) {
		return "<tr><td class='leftText'>Current Directory:&nbsp;&nbsp;<font color='#0015B3'>" + nowFolder + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</font><font color='green'>(Root Directory!)</font></td><td class='rightText'>&nbsp;</td><td class='rightText'><a href='javascript:createDirectory()'>New Directory</a></td></td>";
    } else {
	    return "<tr><td class='leftText'>Current Directory:&nbsp;&nbsp;<font color='#0015B3'>" + nowFolder + "</font></td><td class='rightText'><a href='javascript:changeFolder(\"" + escape(hdfsPersonFolder) + "\")'>Back to Root!</a></td><td class='rightText'><a href='javascript:createDirectory()'>New Directory</a></td></td>";
    }
}

function createDirectory() {
    var newFolderName = prompt("Please enter the new directory name: ");
    // Only letters and underscore
    var folderNameRegExp = "^\\w+$";
    var regExp = new RegExp(folderNameRegExp, 'g');
    //alert("newFolderName = -->"+newFolderName + "<--, -->regExp.test(newFolderName):"+regExp.test(newFolderName));
    if (!regExp.test(newFolderName)) {
        alert("New directory name is not valid, only alphanumerical and underscore characters are acceptable (No space character, too)!");
        return;
    }

    $.post(createFolderUrl, {"hdfsFolder": nowFolder, "folderName": newFolderName},
            function(){
                refreshFileBrowser();
            }, "text");
}

function getShortenName(text, len) {
    var lastSlashIndex = text.lastIndexOf("/");

    text = text.substring(lastSlashIndex + 1, text.length);

    if(text.length > len) {
        return text.substring(0, len-3) + "...";
    } else {
        return text;
    }

}

function getJarClassTableContent(jsonObj, filename) {
    var count = 0;
    var content = "";
    content += "<tr><td colspan=2 class='headline'>Steps</td></tr>";
    content += "<tr><td class='field'>1. Upload a Jar File</td><td class='field'>"+filename+"<input type=hidden id='uploadedJarFilename' value='" + filename + "'></td></tr>";
    content += "<tr><td class='field'>2. MapReduce Class</td><td class='field'><select id='classSelector'>";
    content += "<option value=''> Please select... </option>";
    while (true) {
        var className = eval("jsonObj.class"+count);
        if (!className) {
            break;
        } else {
            content += "<option value='" + className + "'>" + className + "</option>";
        }
        count++;
    }
    content += "</select></td></tr>";
    content += "<tr><td class='field'>3. Addnl. Params</td><td class='field'><input id='extraParams' type='text' size='90'></td></tr>";
    content += "<tr><td colspan=2 class='field'><a id='submitTask' class='sapButton'><span>Submit Task</span></a></td></tr>";
    return content;
}

function refreshFileBrowser() {
    $.getJSON(listHdfsUrl, {hdfsFolder: nowFolder}, function(json){
        $("table#currentFolderName").html(getCurrentFolderHtml());
        $("table#hdfsFiles").hide();
        $("table#hdfsFiles").html(getHdfsTableContent(json, nowFolder, !sameFolder(nowFolder, hdfsPersonFolder)));
        $("table#hdfsFiles").fadeIn(2000);
    });
}

function deleteFile(filename) {
    if(confirm("Delete " + filename + " ?")) {
        $.post(deleteFileUrl, {"hdfsFolder": nowFolder, "filenameToDelete": filename, "action": "delete"},
            function(){
                refreshFileBrowser();
            }, "text");
    }
}
