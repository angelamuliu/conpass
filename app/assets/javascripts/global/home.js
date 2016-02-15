


// The typing effect on the index page
$(document).ready(function() {

    var flashLineListener;
    var words = ["conventions", "festivals", "fairs", "conferences"];
    var currWord = 0;

    if ($("#introBanner .introContainer h1").size() > 0) {
        flashLineListener = setInterval(flashLine, 600);
        changeWord();
    }

    // Flashes the line located at the end of the H1 intro
    function flashLine() {
        var line = $("#introBanner .introContainer em");
        if (line.css("opacity") == 0) {
            line.css("opacity", 1);
        } else { line.css("opacity", 0); }
    }

    function changeWord() {
        clearInterval(flashLineListener);
        $("#introBanner .introContainer em").css("opacity", 1);
        if ($("#introBanner .introContainer h1").text().length > 0) {
            deleteWord();
        } else {
            addWord();
        }
    }

    // Adds a word and then pauses
    function addWord() {
        var wordEl = $("#introBanner .introContainer h1");
        if (wordEl.text().length < words[currWord].length) {
            wordEl.text(words[currWord].slice(0, wordEl.text().length+1));
            setTimeout(addWord, 100);
        } else {
            currWord = (currWord + 1) % words.length;
            flashLineListener = setInterval(flashLine, 600);
            setTimeout(changeWord, 3000);
        }
    }

    // Removes a word and once word removed, starts add
    function deleteWord() {
        var wordEl = $("#introBanner .introContainer h1");
        if (wordEl.text().length > 0) {
            wordEl.text(wordEl.text().slice(0, wordEl.text().length-1));
            setTimeout(deleteWord, 100);
        } else {
            setTimeout(addWord, 100);
        }
    }



})