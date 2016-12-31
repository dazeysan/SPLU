var SPLU_queue = [];
var SPLU_queue_finished = [];
var SPLU_queue_processing = [];

var SPLU_play_data = {};
var SPLU_play_data_tmp = [];

  function RunQueue() {
    console.log("RunQueue()");
    if (SPLU_queue.length <= 0){
      console.log("RunQueue() - SPLU_queue empty, returning");
      return;
    }
    if (SPLU_queue_processing.length > 0) {
      //There is still something processing, we shouldn't start the queue again...
      console.log("RunQueue() - SPLU_queue_processing not empty, returning");
      return;
    }
    SPLU_queue_processing[0] = SPLU_queue.shift();
    SPLU_queue_processing[0].status = "unsent";
    ProcessQueueItem();
  }

  function ProcessQueueItem() {
    //console.log("ProcessQueueItem()");
    if (SPLU_queue_processing[0].status == "unsent") {
      //We haven't sent the request yet, send the appropriate type
      console.log("ProcessQueueItem() - unsent");
      if (SPLU_queue_processing[0].type == "fetchpage") {
        FetchPlaysPage(SPLU_queue_processing[0].userid, SPLU_queue_processing[0].pageid, SPLU_queue_processing[0].gameid);
        SPLU_queue_processing[0].status = "sent"
        window.setTimeout(function(){ProcessQueueItem();},500);
        return;
      }
    }

    if (SPLU_queue_processing[0].status == "sent") {
      //We already sent the request, wait a little longer
      console.log("ProcessQueueItem() - sent");
      window.setTimeout(function(){ProcessQueueItem();},500);
      return;
    }

    if (SPLU_queue_processing[0].status == "error") {
      console.log("ProcessQueueItem() - error");
      //Do error things
      return;
    }
    
    if (SPLU_queue_processing[0].status == "success") {
      console.log("ProcessQueueItem() - success");
      SPLU_queue_finished.push(SPLU_queue_processing.shift());
      window.setTimeout(function(){RunQueue();},2000);
      return;
    }
  }
  
  function FetchPlaysPage(userid, pageid, gameid) {
    var requestURL = "https://boardgamegeek.com/geekplay.php?action=getplays&ajax=1&objecttype=thing";

    if (userid == "" || userid == "0"){
      //An invalid userid was specified, fall back to current user
      //Replace with code to get current userid
      userid="153077";
    }
    requestURL += "&userid="+userid;

    if (pageid == ""){
      //No pageid was specified, assume page 1
      pageid="1";
    }
    requestURL += "&pageID="+pageid;

    if (gameid != "" && gameid != "0"){
      //A "valid" gameid was specified so add it to the URL
      requestURL += "&objectid="+gameid;
    }

    console.log(requestURL);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      //Add code to process the 0-4 states
      console.log(this.readyState+"|"+this.status+"|"+this.responseText);
      if (this.readyState == "4"){
        SPLU_play_data_tmp = SPLU_play_data_tmp.concat(JSON.parse(this.responseText)["plays"]);
        SPLU_queue_processing[0].status = "success";
        ProcessPlayData();
      }
    };
    xhr.timeout = 5000;
    xhr.ontimeout = function (e) {
      //Timed out, check last state received, maybe error and offer to retry
      console.log("xhr.ontimeout");
      SPLU_queue_processing[0].status = "error";
    };
    xhr.open("GET", requestURL, true);
    xhr.send();
  }

  function FetchCurrentUser() {
    
  }
  
  function ProcessPlayData() {
    console.log("ProcessPlayData()");
    while (SPLU_play_data_tmp.length > 0) {
      if (SPLU_play_data[SPLU_play_data_tmp[0].userid] === undefined) {
        SPLU_play_data[SPLU_play_data_tmp[0].userid] = {};
        console.log("ProcessPlayData() - Adding user "+SPLU_play_data_tmp[0].userid);
      }
      SPLU_play_data[SPLU_play_data_tmp[0].userid][SPLU_play_data_tmp[0].playid]=SPLU_play_data_tmp.shift();
    }
  }
  

//Test Code
SPLU_queue.push({type:"fetchpage", userid:"153077", pageid:"1", gameid:""});
SPLU_queue.push({type:"fetchpage", userid:"153077", pageid:"2", gameid:""});