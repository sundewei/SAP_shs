var listHdfsUrl = "/shs/js/hfl";
var parseJarUrl = "/shs/js/jjj";
var submitJobUrl = "/shs/js/sss";
var jobStatusUrl = "/shs/js/ggg";
var jobHistoryUrl = "/shs/js/hhh";
var deleteFileUrl = "/shs/js/ddd";
var downloadFileUrl = "/shs/js/dwn";
var createFolderUrl = "/shs/js/mkdirs";
var submitPluginUrl = "/shs/js/runPlugin";
var movieRecommenderUrl = "/shs/js/mr";
var movieHtmlUrl = "/shs/js/movie";

var XML_CHAR_MAP = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;'
};

function escapeXml (s) {
    return s.replace(/[<>&"']/g, function (ch) {
        return XML_CHAR_MAP[ch];
    });
}

var HTML_CHAR_MAP = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;'
};

function escapeHtml (s) {
    return s.replace(/[<>&"']/g, function (ch) {
        return HTML_CHAR_MAP[ch];
    });
}

function contains(value, array) {
    for (var i = 0; i < array.length; i ++) {
        if (value == array[i]) {
            return true;
        }
    }
    return false;
}