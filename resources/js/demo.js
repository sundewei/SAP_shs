function runMovieRecommenderJob() {
    var content = $("div#movieRecommendationNotification").get(0).innerHTML;
    if (typeof userRatingHashtable == 'undefined' || userRatingHashtable.size() == 0) {
        alert('You did not rate any movie, cannot run movie recommendation.');
    } else if (typeof content != 'undefined' && content.indexOf("approximate") >= 0) {
        alert('A recommendation is running, please wait for it to finish.');
    } else {
        $("div#movieRecommendationContent").hide();
        var queryString = "";
        var keys = userRatingHashtable.keys();
        for (var i = 0; i < keys.length; i++) {
            queryString += "m" + keys[i] + "=" + userRatingHashtable.get(keys[i]) + "&";
        }
        queryString = "?" + queryString;

        $("div#movieRecommendationNotification").html("<span id='minimal'></span>");
        var secondsLater = new Date();
        secondsLater = new Date(secondsLater.getTime() + 150 * 1000);
        $("span#minimal").countdown({until: secondsLater, compact: true, format: 'S', description: '&nbsp;seconds&nbsp;<br> (approximate processing time)'});
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
        content += "<div onmouseover='previewMovie(" + movieId + ")' onclick='previewMovie(" + movieId + ")' class=" + divClass + ">" + movieIdNameHashtable.get(movieId) + "</div>"
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
    if (userRatingHashtable.size() < 10) {
        $("span#askToRate").html("Please rate 10 movies: <span class='alert'>" + userRatingHashtable.size() + "/10</span>");
    } else {
        $("span#askToRate").html("Please rate 10 movies: <span class='important'>" + userRatingHashtable.size() + "/10</span>");
    }
}


function getMoviePreview() {
    var content = "";
    var movieId = $("select#movieSelector option:selected").val();
    content += "<iframe id='previewFrame' class='moviePreviewFrame' src='" + movieHtmlUrl + "?movieId=" + movieId + "'></iframe>";
    return content;
}