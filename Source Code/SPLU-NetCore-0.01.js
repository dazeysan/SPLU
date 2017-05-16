var SPLU_queue = [];
var SPLU_queue_finished = [];
var SPLU_queue_running = false;
var SPLU_queue_processing = [];
var SPLU_queue_wait_fetch = 2000;
var SPLU_queue_wait_process = 500;
var SPLU_queue_length = 0;
var SPLU_queue_timeout = "";

var SPLU_play_data = {};
var SPLU_play_data_tmp = [];
var SPLU_user_data = { CurrentUser:"SPLU-NotFetched"};
var SPLU_user_data_tmp = [];

  function RunQueue() {
    console.log("RunQueue()");
    if (SPLU_queue.length <= 0){
      console.log("RunQueue() - SPLU_queue empty, returning");
      SPLU_queue_running = false;
      return;
    }
    if (SPLU_queue_processing.length > 0) {
      //There is still something processing, we shouldn't start the queue again...
      console.log("RunQueue() - SPLU_queue_processing not empty, returning");
      return;
    }
    if (!SPLU_queue_running){
      SPLU_queue_length=SPLU_queue.length;
    }
    SPLU_queue_running = true;
    SPLU_queue_processing[0] = SPLU_queue.shift();
    SPLU_queue_processing[0].status = "unsent";
    ProcessQueueItem();
  }

  function ProcessQueueItem() {
    //console.log("ProcessQueueItem()");
    if (SPLU_queue_processing[0].status == "unsent") {
      //We haven't sent the request yet, send the appropriate type
      console.log("ProcessQueueItem() - unsent");
      window[SPLU_queue_processing[0].type](SPLU_queue_processing[0].data);
      SPLU_queue_processing[0].status = "sent"
      SPLU_queue_timeout = window.setTimeout(function(){ProcessQueueItem();},SPLU_queue_wait_process);
      return;
    }

    if (SPLU_queue_processing[0].status == "sent") {
      //We already sent the request, wait a little longer
      console.log("ProcessQueueItem() - sent");
      SPLU_queue_timeout = window.setTimeout(function(){ProcessQueueItem();},SPLU_queue_wait_process);
      return;
    }

    if (SPLU_queue_processing[0].status == "timeout") {
      console.log("ProcessQueueItem() - timeout");
      window[SPLU_queue_processing[0].action]({result:"timeout"});
      return;
    }

    if (SPLU_queue_processing[0].status == "error") {
      console.log("ProcessQueueItem() - error");
      //Do error things
      window[SPLU_queue_processing[0].action]({result:"error"});
      return;
    }
    
    if (SPLU_queue_processing[0].status == "success") {
      console.log("ProcessQueueItem() - success");
      SPLU_queue_finished.push(SPLU_queue_processing.shift());
      SPLU_queue_timeout = window.setTimeout(function(){RunQueue();},SPLU_queue_wait_fetch);
      UpdateStatus({div:"SPLUstatus", text:"success", progress:"4"});
      return;
    }
  }
  
  function FetchPlaysPage(data) {
    var requestURL = "https://boardgamegeek.com/geekplay.php?action=getplays&ajax=1&objecttype=thing";
    var userid = data["userid"];
    var pageid = data["pageid"];
    var gameid = data["gameid"];
    if (userid == "" || userid == "0"){
      //An invalid userid was specified, fall back to current user
      if(SPLU_user_data["CurrentUser"] == "SPLU-NotFetched") {
        //CurrentUser not specified, how to handle?
        //For now fall back to my userid
        userid="153077";
      } else {
        userid = SPLU_user_data["CurrentUser"];
      }
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

    SendRequest(requestURL, "application/json, text/plain, */*");
  }

  function FetchCurrentUser(data) {
    console.log("FetchCurrentUser()");
    var requestURL = "https://boardgamegeek.com/api/users/current";
    SendRequest(requestURL, "application/json, text/plain, */*");
  }
  
  function SendRequest(requestURL, accept) {
    console.log("SendRequest(): "+requestURL);
    
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      //Add code to process the 0-4 states
      UpdateStatus({div:"SPLUstatus", text:this.readyState, progress:this.readyState});
      console.log(this.readyState+"|"+this.status+"|"+this.responseText);
      if (this.readyState == "4" && this.status=="200"){
        SPLU_queue_processing[0].status = "success";
        clearTimeout(SPLU_queue_timeout);
        window[SPLU_queue_processing[0].action]({result:"success", response:this.responseText});
        window.setTimeout(function(){ProcessQueueItem();},10);
      }
    };
    xhr.timeout = 5000;
    xhr.ontimeout = function (e) {
      //Timed out, check last state received, maybe error and offer to retry
      console.log("xhr.ontimeout");
      SPLU_queue_processing[0].status = "timeout";
    };
    xhr.open("GET", requestURL, true);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.setRequestHeader("Accept",accept);
    xhr.send();
  }
  
  function ProcessPlayData(data) {
    console.log("ProcessPlayData()");
    window.tmpvar=data;
    var tmp = JSON.parse(data["response"]);
    while (tmp["plays"].length > 0) {
      if (SPLU_play_data[tmp["plays"][0].userid] === undefined) {
        SPLU_play_data[tmp["plays"][0].userid] = {};
        console.log("ProcessPlayData() - Adding userid "+tmp["plays"][0].userid);
      }
      SPLU_play_data[tmp["plays"][0].userid][tmp["plays"][0].playid]=tmp["plays"].shift();
    }
  }
  
  function DispUserName(data) {
    console.log("DispUserName()");
    console.log(data);
    window.tmpvar=data;
    var tmp = JSON.parse(data["response"]);
    SPLU_user_data["CurrentUser"]=tmp["username"];
    SPLU_user_data[tmp["username"]] = JSON.parse(data["response"]);
  }
  
  function UpdateStatus(data){
    console.log("UpdateStatus()");
    console.log("SPLU_queue_length: "+SPLU_queue_length);
    console.log("SPLU_queue.length: "+SPLU_queue.length);
    console.log("SPLU_queue_processing.length: "+SPLU_queue_processing.length);
    document.getElementById(data["div"]).innerHTML=data["text"];
    document.getElementById("SPLUprogress").value=data["progress"];
    document.getElementById("SPLUprogress2").max=SPLU_queue_length;
    document.getElementById("SPLUprogress2").value=SPLU_queue_length-SPLU_queue.length-SPLU_queue_processing.length;
  }

//Test Code
SPLU_queue.push({type:"FetchCurrentUser", action:"DispUserName", data:{}});
SPLU_queue.push({type:"FetchPlaysPage", action:"ProcessPlayData", data:{userid:"153077", pageid:"37", gameid:""}});
SPLU_queue.push({type:"FetchPlaysPage", action:"ProcessPlayData", data:{userid:"153077", pageid:"38", gameid:""}});
SPLU_queue.push({type:"FetchPlaysPage", action:"ProcessPlayData", data:{userid:"153077", pageid:"39", gameid:""}});
SPLU_queue.push({type:"FetchPlaysPage", action:"ProcessPlayData", data:{userid:"153077", pageid:"40", gameid:""}});

tmpSPLU=document.createElement('div');
tmpSPLU.id="SPLUmain";
tmpSPLU.style.zIndex="555";
tmpSPLU.style.position="absolute";
tmpSPLU.style.backgroundColor="white";
tmpSPLU.style.padding="3px";
tmpSPLU.style.top="50px";
tmpSPLU.style.left="50px";
tmpSPLU.style.width="200px";
tmpSPLU.style.height="100px";
document.body.appendChild(tmpSPLU);
tmpSPLU=document.createElement('div');
tmpSPLU.id="SPLUstatus";
document.getElementById("SPLUmain").appendChild(tmpSPLU);
tmpSPLU=document.createElement('progress');
tmpSPLU.id="SPLUprogress";
tmpSPLU.max="4";
tmpSPLU.value="0";
document.getElementById("SPLUmain").appendChild(tmpSPLU);
tmpSPLU=document.createElement('progress');
tmpSPLU.id="SPLUprogress2";
tmpSPLU.max="1";
tmpSPLU.value="0";
document.getElementById("SPLUmain").appendChild(tmpSPLU);
