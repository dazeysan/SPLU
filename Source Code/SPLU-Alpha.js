// SPLU 5.8.6 Alpha

    //Check if they aren't on a BGG site and alert them to that fact.
    if(window.location.host.slice(-17)!="boardgamegeek.com" &&  window.location.host.slice(-17)!="videogamegeek.com" && window.location.host.slice(-11)!="rpggeek.com" && window.location.host.slice(-6)!="bgg.cc" && window.location.host.slice(-10)!="geekdo.com"){
      alert("You must be on a BGG website to run SPLU.");
      throw new Error("You aren't on a BGG site.");
    }
    
    // var IncompatiblePage=false;
    // //Check if they are on a page that gives issues.  Specifically break on anything containing the polyfill script.
    // let tmpScripts = document.getElementsByTagName('script');
    // for (s=0; s<tmpScripts.length; s++) {
      // if(tmpScripts[s].src.includes("polyfill") || window.location.pathname.substr(0,11)=="/boardgame/") {
        // if (!confirm("SPLU probably doesn't function properly on this page.\r\n\r\nTry running from your Subscriptions page.\r\n\r\nClick OK to try running SPLU anyways.")){
          // throw new Error("Incompatible page.");
        // } else {
          // IncompatiblePage=true;
          // break;
        // }
      // }
    // }
    //Check if SPLU is already open, throw an error if not
    if(document.getElementById('SPLUwindow')){throw new Error("SPLU Already Running");}
    
    var LoggedInAs="";
    //var LoggedInAs = document.getElementsByClassName('menu_login')[0].childNodes[3].childNodes[1].innerHTML;
    //Check if the user is logged in to BGG, throw an error if not
    //if(LoggedInAs==""){alert("You aren't logged in.");throw new Error("You aren't logged in.");}
    var SPLUversion="5.8.6";

    var SPLU={};
    var SPLUplayId="";

    var NumOfPlayers=0;
    var PlayerCount=0;
    var LocationList=true;
    var PlayerList=true;
    
    tmp=new Date();
    var SPLUtodayDate=new Date(tmp.setMinutes(tmp.getMinutes()-tmp.getTimezoneOffset()));
    var SPLUtoday=SPLUtodayDate.toISOString().slice(0,10);
    var SPLUtodayDateZero=new Date(SPLUtoday);
    var SPLUgameID=0;
    var SPLUgameTitle="";
    var SPLUprevGameID=-1;
    var ExpansionsToLog=0;
    var SPLUwinners=[];
    var SPLUwinnersNoreenText="";
    var SPLUwinnersScores=[];
    var SPLUlocationCount=0;
    var SPLUcurrentFilter="All";
    var SPLUcurrentGroup="";
    var SPLUcalendar="";
    var SPLUfamilyList="";
    var SPLUfamilyID="-1";
    var SPLUexpansionsLoaded=false;
    var SPLUexpansionsFromFavorite=[];
    var SPLUfamilyLoaded=false;
    var SPLUplays={};
    var SPLUplay={};
    var SPLUobjecttype="";
    var SPLUplaysPage=1;
    var SPLUplayData={};
    var SPLUplayFetch={};
    var SPLUplayFetchFail=0;
    var SPLUplaysFiltersCount=0;
    var SPLUedit={};
    var SPLUlistOfPlays=[];
    var SPLUhistoryOpened=0;
    var SPLUlastGameSaved="";
    var SPLUcurrentPlayShown="";
    var SPLUdateToday="";
    var SPLUdateYesterday="";
    var SPLUdateDayBefore="";
    var SPLUcopyContinue=true;
    var SPLUcopyID="0";
    var SPLUcopySelectedAll=false;
    var SPLUcopyCopied=0;
    var SPLUcopyTotal=0;
    var SPLUtimeouts={};
    var SPLUwindowHeight=0;
    var SPLUplaysListTab="filters";
    var SPLUplayer={};
    // var SPLUdragDiv="";
    var SPLUdragSourceDiv = null;
    var SPLUfavoritesPlayers=[];
    var SPLUfavoritesEditing="";
    var SPLUzeroScoreStats=false;
    var SPLUstatLocationSort="location";
    var SPLUstatLuckSort="-count";
    var SPLUstatWinsSort="-wins";
    var SPLUstatWinsByGameSort="-average";
    var SPLUstatWinsByGamePlayer="";
    var SPLUstatGameList="game";
    var SPLUstatGameDaysSince="days";
    var SPLUstatGameDuration="high";
    var SPLUcopyMode=false;
    var SPLUcombine=false;  //Temp variable, see getStatsGameDetails
    var SPLUsearchResults={};
    var SPLUsearchResultsLength=20;
    var SPLUi18n={};
    var SPLUi18nList={};
    var SPLUimageData={};
    var SPLUrank="empty";

    let SPLUqueue = [];
    let SPLUqueueFails = [];
    let SPLUqueueRunning = false;
    let SPLUqueueSaveAfter = false;
    let SPLUqueueFetchImageCount = 0;
   
    //Insert FontAwesome CSS
    tmpLink=document.createElement('link');
    tmpLink.type="text/css";
    tmpLink.rel="stylesheet";
    tmpLink.href="https://dazeysan.github.io/SPLU/Source%20Code/font-awesome/css/font-awesome.min.577.css";
    document.getElementsByTagName("head")[0].appendChild(tmpLink);


  async function fetchDataJSON(url, options) {
    const response = await fetch(url, options);
    console.log("fetchDataJSON() - response: ", response);
    const data = await response.json();
    console.log("fetchDataJSON() - data: ", data);
    const tmpReturn = {"response":response, "data":data };
    return tmpReturn;
  }

  async function fetchDataCSV(url, options) {
    const response = await fetch(url, options);
    console.log("fetchDataCSV() - response: ", response);
    const data = await response.text();
    console.log("fetchDataCSV() - data: ", data);
    const tmpReturn = {"response":response, "data":data };
    return tmpReturn;
  }
  
  async function runQueue(){
    if (SPLUqueue.length == 0){
      //Queue is empty, return
      console.log("runQueue() - Queue is empty, return.");
      SPLUqueueRunning = false;
      if (SPLUqueueSaveAfter) {
        window.setTimeout(saveSettings(SPLUi18n.StatusFinished),5000);
        SPLUqueueSaveAfter=false;
      }
      return false;
    } else if (SPLUqueueRunning){
      //Queue is already running, return
      console.log("runQueue() - Queue is already running, return.");
      return false;
    } else {
      SPLUqueueRunning = true;
      console.log("runQueue() - Queue has "+SPLUqueue.length+" items in it, running.");
      let tmpQueue = SPLUqueue.shift();
      if (tmpQueue.attempt >= 2) {
        //Too many failed attempts, move queue item to SPLUqueueFails
        console.log("runQueue() - Too many failed attempts, moving to SPLUQueueFails");
        tmpQueue.finish(tmpQueue);
        SPLUqueueFails.push(tmpQueue);
        window.setTimeout(function(){SPLUqueueRunning=false;runQueue();}, 2000);
        return false;
      } else {
        tmpQueue.attempt++;
        console.log("runQueue() - Attempt: "+tmpQueue.attempt);
        const tmpReturn = await tmpQueue.action(tmpQueue.arguments);
        console.log("runQueue() - tmpReturn: ", tmpReturn);
        if (tmpReturn.response.status == "200") { 
          //return await tmpReturn.json()
          //return await tmpReturn;
          console.log("runQueue() - Success, removing from queue, do something");
          tmpQueue.response = tmpReturn.response;
          tmpQueue.data = tmpReturn.data;
          tmpQueue.finish(tmpQueue);
        } else {
        //Update to check for other status messages and handle properly, like 202 for queued/retry later
          console.log("runQueue() - Not a 200 status, moving to end of queue, do something");
          tmpQueue.response = tmpReturn.response;
          tmpQueue.data = tmpReturn.data;
          SPLUqueue.push(tmpQueue);
        }
      }
    }
    console.log("runQueue() - Run again in 2 seconds");
    window.setTimeout(function(){SPLUqueueRunning=false;runQueue();}, 2000);
  }

    
  function initSPLU(){
    NumOfPlayers=0;
    PlayerCount=0;
    SPLUhistoryOpened=0;
    tmpSPLU=document.createElement('div');
    tmpSPLU.id="SPLUmain";
    tmpSPLU.style.fontSize="0.75em";
    //document.body.appendChild(tmpSPLU);
    bggdiv=document.getElementsByClassName("global-body-content")[0];
    bggdiv.appendChild(tmpSPLU);
    tmpDiv=document.createElement('div');
    tmpDiv.id="SPLU.popText";
    tmpDiv.style.visibility="hidden";
    tmpDiv.style.zIndex="577";
    tmpDiv.style.position="absolute";
    tmpDiv.style.backgroundColor="#f2ffa3";
    tmpDiv.style.border="1px Solid Black";
    tmpDiv.style.padding="3px";
    document.getElementById("SPLUmain").appendChild(tmpDiv);

    //Insert code for SortableJS https://github.com/SortableJS/Sortable
    var sortscript=document.createElement('script');
    sortscript.type="text/javascript";
    sortscript.src='https://dazeysan.github.io/SPLU/Source%20Code/scripts/sortable.js';
    document.body.appendChild(sortscript);

    
    // if (!IncompatiblePage){
      // //Insert code for Pikaday calendar Copyright © 2014 David Bushell
      // var pikscript=document.createElement('script');
      // pikscript.type="text/javascript";
      // pikscript.src='https://dazeysan.github.io/SPLU/Source%20Code/scripts/pikaday.1.8.2.js';
      // document.body.appendChild(pikscript);
      // var pikstyle=document.createElement("link");
      // pikstyle.type="text/css";
      // pikstyle.rel="stylesheet";
      // pikstyle.href="https://dazeysan.github.io/SPLU/Source%20Code/scripts/pikaday.1.8.2.css";
      // document.getElementsByTagName('head')[0].appendChild(pikstyle);
    // }

    var style=document.createElement('style');
    style.type='text/css';
    style.id="BRstyle";
    style.innerHTML='.SPLUheader{height:32px; border:1px solid blue; padding:0px 5px;} .SPLUheaderClose{float:right; margin-right:-6px; margin-top:-4px;} .SPLUrows{vertical-align:bottom;} .BRbutn{border:1px dotted green;padding:0px 2px;} .BRcells{display:table-cell; padding-right:10px; padding-bottom:10px;} .SPLUplayerCells{display:table-cell;} .SPLUsettingAltRows{background-color: #80E086;} .SPLUbuttons{border:2px solid blue;padding:2px 4px;border-radius:5px;background-color:lightGrey;color:black;} .SPLUfavoritesGridItems{display:inline-block; width:100px; padding:3px; margin:5px;vertical-align:top;} .TH-cell{padding: 2px;} .TH-cell-1{background: #fbe421;} .TH-cell-2 {background: #79f56d;} .TH-cell-3 {background: #13dab9; color: #3e3128} .TH-cell-4 {background: #0ca5d8; color: white;} .TH-cell-5 {background: #0d2e94; color: white;}';
    document.getElementsByTagName('head')[0].appendChild(style);
    
    var BRlogMain=document.createElement('div');
    BRlogMain.id='BRlogMain';
    BRlogMain.setAttribute("style","display:table; position: absolute; z-index: 1565; border-radius:15px;");
    bggMB=document.getElementById("mainbody");
    BRlogMain.style.top=self.pageYOffset+"px";
    var BRlogRow=document.createElement('div');
    BRlogRow.id='BRlogRow';
    BRlogRow.setAttribute("style","display:table-row;");
      
    var BRlogDiv=document.createElement('div');
    BRlogDiv.id='SPLUwindow';
    BRlogDiv.setAttribute("style","display:table-cell; background-color: #A4DFF3; padding: 13px;border:2px solid blue;border-radius:15px; box-shadow:10px 10px 5px #888;position:relative;");
    
    tmpDiv=document.createElement('div');
    tmpHTML= '<div id="closeButton" style="position:absolute;top:-2px;right:0px;">'
              +'<a href="javascript:{void(0);}" onClick="javascript:{hidePopText();BRlogMain.parentNode.removeChild(BRlogMain);}" style="border-bottom:2px solid blue;border-left:2px solid blue;padding:0px 10px;border-bottom-left-radius:5px;border-top-right-radius:15px;background-color:lightGrey;font-size:large;font-weight:900;color:red;">X</a>'
            +'</div>'
            +'<div style="position:absolute;top:60px;right:5px;">'
              +'<a href="javascript:{void(0);}" onClick="javascript:{showSettingsPane(\'button\');}" id="BRshowHideBtn">'
                +'<i class="fa_SP fa_SP-cog fa_SP-2x" style="color: rgb(249, 138, 59);"></i>'
              +'</a>'
            +'</div>'
            +'<div style="position:absolute;top:150px;right:17px;">'
              +'<a href="javascript:{void(0);}" onClick="javascript:{showPlaysPane(\'button\');}" id="BRplaysBtn">'
                +'<span class="fa_SP-stack"><i class="fa_SP fa_SP-stack-2x fa_SP-logbook03" style="color: white; font-size: 3.2em; transform: translate(-1px, -6px);"></i><i style="color: black; font-size: 1.5em;" class="fa_SP fa_SP-stack-2x fa_SP-meeple-book"></i></span>'
              +'</a>'
            +'</div>';
    tmpDiv.innerHTML+=tmpHTML;
    BRlogDiv.appendChild(tmpDiv);

    var BRlogForm=document.createElement('form');
    BRlogForm.id='SPLUform';
    BRlogForm.name='SPLUform';
    BRlogDiv.appendChild(BRlogForm);
    
    tmp=new Date();
    SPLUtodayDate=new Date(tmp.setMinutes(tmp.getMinutes()-tmp.getTimezoneOffset()));
    SPLUtempDate=SPLUtodayDate;
    todayText=SPLUtempDate.toUTCString().slice(0,3);
    SPLUdateToday=SPLUtempDate.toISOString().slice(0,10);
    SPLUtempDate.setTime(SPLUtempDate.getTime()-86400000);
    yesterdayText=SPLUtempDate.toUTCString().slice(0,3);
    SPLUdateYesterday=SPLUtempDate.toISOString().slice(0,10);
    SPLUtempDate.setTime(SPLUtempDate.getTime()-86400000);
    daybeforeText=SPLUtempDate.toUTCString().slice(0,3);
    SPLUdateDayBefore=SPLUtempDate.toISOString().slice(0,10);
    
    todayText=SPLUi18n['Calendar'+todayText];
    yesterdayText=SPLUi18n['Calendar'+yesterdayText];
    daybeforeText=SPLUi18n['Calendar'+daybeforeText];
    
    var tmpDiv=document.createElement('div');
    var tmpHTML='<div style="display:table;">'
      +'<div style="display:table-row;">'
        +'<div id="SPLU.DateField" class="BRcells" style="width:auto;">'
          +'<div style="display:table;">'
            +'<div style="display:table-row;">'
              +'<div style="display:inline;">'
                +'<input id="playdate99" type="hidden" value="'+SPLUtoday+'" name="playdate"/>'
                +'<input id="SPLUplayDateInput" tabindex="10" type="date" oninput="highlightDayButton();" onchange="parseDate(this,document.getElementById(\'playdate99\'),document.getElementById(\'playdatestatus99\') );" value="'+SPLUtoday+'" autocomplete="off" name="dateinput"/>'
              +'</div>'
              +'<div id="playdatestatus99" class="sf" style="font-style:italic; font-size:0;display:inline;">'
                +'<span class="fa_SP-stack"><i style="color: white; font-size: 1em; transform: translate(0px, 2px);" class="fa_SP fa_SP-stack-2x fa_SP-square"></i><i style="color: rgb(13, 138, 13); font-size: 1.3em;" class="fa_SP fa_SP-stack-2x fa_SP-check-circle"></i></span>'+SPLUtoday
              +'</div>'
            +'</div>'
            +'<div style="display:table-row;">'
              +'<div style="display:table-cell;font-size:x-small;padding-top:7px;">'
                +'<a href="javascript:{void(0);}" id="SPLUbuttonDayBefore" onClick="javascript:{setDateField(\''+SPLUdateDayBefore+'\');}">'+daybeforeText+'</a>'
                +'|'
                +'<a href="javascript:{void(0);}" id="SPLUbuttonYesterday" onClick="javascript:{setDateField(\''+SPLUdateYesterday+'\');}">'+yesterdayText+'</a>'
                +'|'
                +'<a href="javascript:{void(0);}" id="SPLUbuttonToday" onClick="javascript:{setDateField(\''+SPLUdateToday+'\');}">'+todayText+'</a>'
              +'</div>'
            +'</div>'
          +'</div>'
        +'</div>'
        +'<div class="BRcells" style="padding-right:20px;">'
          +'<div id="SPLU.QuantityField" style="margin-bottom:5px;">'
            +'<span style="font-size:0.8em; font-weight: normal;">'+SPLUi18n.MainQuantity+': </span>'
            +'<input type="text" id="quickplay_quantity99" name="quantity" value="1" tabindex="30" style="width: 20px;"/>'
          +'</div>'
          +'<div id="SPLU.DurationField" style="">'
            +'<span style="font-size:0.8em; font-weight: normal;">'+SPLUi18n.MainDuration+': </span>'
            +'<input type="text" id="quickplay_duration99" name="length" value="" tabindex="40" style="width: 20px;"/>'
          +'</div>'
        +'</div>'
        +'<div class="BRcells" style="padding-right:20px;position:relative;width:90px;">'
          +'<div id="SPLU.IncompleteField" style="position:absolute;top:5px;right:0px;padding-right:10px;">'
            +'<label style="font-size:0.8em; font-weight: normal;">'+SPLUi18n.MainIncomplete+': '
              +'<input type="checkbox" id="incomplete" name="incomplete" value="1" tabindex="45" />'
            +'</label>'
          +'</div>'
          +'<div id="SPLU.NoWinStatsField" style="position:absolute;top:25px;right:0px;padding-right:10px;">'
            +'<label style="font-size:0.8em; font-weight: normal;">'+SPLUi18n.MainNoWinStats+': '
              +'<input type="checkbox" id="nowinstats" name="nowinstats" value="1" tabindex="47" />'
            +'</label>'
          +'</div>'
          +'<div id="SPLU.TwitterField" style="position:absolute;top:45px;right:0px;padding-right:10px;">'
            +'<label style="font-size:0.8em; font-weight: normal;">'+SPLUi18n.MainTweetThis+': '
              +'<input type="checkbox" id="twitter" name="twitter" value="1" tabindex="49" onClick="javascript:{setTwitterIcons();}"/>'
            +'</label>'
          +'</div>'
        +'</div>'
        +'<div class="BRcells">'
          +'<div id="SPLU.LocationField" style="width:275px;">'
            +'<div id="SPLU.fakeLocationBox" style="width:200px; display:inline-block; -moz-appearance:textfield; -webkit-appearance:textfield;">'
              +'<input type="text" placeholder="'+SPLUi18n.MainPlaceholderLocation+'" id="SPLU_PlayedAt" onFocus="javascript:{this.select();}" onblur="javascript:{window.setTimeout(function(){document.getElementById(\'SPLUsearchLocationsResultsDIV\').style.display=\'none\';},100);}" onkeydown="SPLUsearchLocationDelay(event);" tabindex="20" name="location" style="width: 175px; border:none;"/>'
              +'<a href="javascript:{void(0);}" onClick="javascript:{saveLocation();}" style="vertical-align:middle; position: absolute;" id="SPLU.SaveLocationButton"><span class="fa_SP-stack"><i class="fa_SP fa_SP-stack-2x fa_SP-floppy2" style="font-size: 1.3em; color: black; vertical-align: middle; transform: translate(0px, 2px);"></i></span></a>'
            +'</div>'
            +'<div id="SPLUsearchLocationsResultsDIV" style="background-color: rgb(255, 255, 255); position: absolute; padding: 5px; z-index: 1579; margin-right: 12px; min-width: 130px; display:none;"></div>'
            +'<a href="javascript:{void(0);}" onClick="javascript:{showHideLocations();}" id="BRlocsBtn" style="padding-left:1px; vertical-align:middle;"><span id="SPLU.LocationButtonIconCollapse" style="display:inline-block;"><i class="fa_SP fa_SP-caret-up display:block" style="color: black; font-size: 2em; transform: translate(1px, 4px);"></i></span><span id="SPLU.LocationButtonIconExpand" style="display:none;"><i class="fa_SP fa_SP-caret-down display:block" style="color: black; font-size: 2em; transform: translate(1px, 4px);"></i></span></a>'
            +'<div style="display:inline-block; position:absolute; padding-top:2px;padding-left:4px;">'
              +'<a href="javascript:{void(0);}" onClick="javascript:{showLocationsPane(\'button\');}" id="showLocationsPaneBtn">'
                +'<span class="fa_SP-stack">'
                  +'<i class="fa_SP fa_SP-bars fa_SP-stack-2x fa_SP-pull-right" style="color: rgb(110, 104, 104);font-size:1.5em;"></i>'
                  +'<i class="fa_SP fa_SP-stack-2x fa_SP-pull-left" style="color: rgb(164, 223, 243); text-shadow: -1px 5px rgb(164, 223, 243);font-size:1.5em;">&#xee09;</i>'
                  +'<i class="fa_SP fa_SP-map-marker fa_SP-stack-2x fa_SP-pull-left" style="color: rgb(211, 60, 199); text-shadow: 2px -1px rgb(164, 223, 243);font-size:1.5em;"></i>'
                +'</span>'
              +'</a>'
            +'</div>'
            +'<br/>'
            +'<div id="SPLU.LocationList" style="">'
              +'Loading...'
            +'</div>'
          +'</div>'
        +'</div>'
      +'</div>'
    +'</div>'
    +'<div style="display:table;">'
      +'<div style="display:table-row;">'
        +'<div class="BRcells">'
          +'<div id="SPLU.CommentsField">'
            +'<textarea id="quickplay_comments99" tabindex="50" style="width:314px; height:109px; font:99% arial,helvetica,clean,sans-serif" name="comments;" placeholder="'+SPLUi18n.MainPlaceholderComments+'";></textarea>'
          +'</div>'
        +'</div>'
        +'<div class="BRcells" style="margin-top:5px;vertical-align:top;">'
          +'<div id="SPLU.GameField">'
            +'<div id="SPLU.DomainButtons">'
              +'<a href="javascript:{void(0);}" onClick="javascript:{setObjectType(\'boardgame\');}" id="SPLU.SelectBGG" style="padding:0px 5px;border:1px solid black;">'+SPLUi18n.MainBGG+'</a>'
              +'<a href="javascript:{void(0);}" onClick="javascript:{setObjectType(\'videogame\');}" id="SPLU.SelectVGG" style="padding:0px 5px;border:1px solid black;">'+SPLUi18n.MainVGG+'</a>'
              +'<a href="javascript:{void(0);}" onClick="javascript:{setObjectType(\'rpg\');}" id="SPLU.SelectRPG" style="padding:0px 5px;border:1px solid black; border-right:1px dotted black;">'+SPLUi18n.MainRPG+'</a>'
              +'<a href="javascript:{void(0);}" onClick="javascript:{setObjectType(\'rpgitem\');}" id="SPLU.SelectRPGItem" style="padding:0px 5px;border:1px solid black; border-left:1px dotted black;">'+SPLUi18n.MainRPGItem+'</a>'
            +'</div>'
            +'<div style="margin-top: 2px;">'
              +'<input name="objectid" value="" id="objectid9999" type="hidden"/>'
              +'<input style="margin:3px 0px 0px;" autocomplete="off" class="geekinput_medium" name="geekitemname" id="q546e9ffd96dfc" tabindex="60" placeholder="'+SPLUi18n.MainPlaceholderBGG+'" onClick="this.select();" onkeydown="SPLUsearchDelay();" type="text">'
              +'<div id="SPLUsearchResultsDIV" style="display:none; background-color: rgb(255, 255, 255); position: absolute; padding: 5px; z-index: 1579; margin-right: 12px; min-width: 130px;"></div>'
              +'<div style="float: right; margin-top: 4px;">'
                +'<a href="javascript:{void(0);}" onClick="javascript:{showFavsPane(\'button\');}" id="favoritesGoTo" style="border:4px solid lightblue;border-radius:4px"><img src="https://dazeysan.github.io/SPLU/Images/choose_from_favorites.png"></a>'
              +'</div>'
            +'</div>'
            +'<div id="objectiddisp546e9ffd96dfc" style="display:none;">'
              +'ID:'
            +'</div>'
            +'<div id="objectname0"></div>'
            +'<input name="objecttype" id="objecttype9999" value="thing" type="hidden">'
          +'</div>'
          +'<input size="12" class="geekinput_medium" id="imageid9999" name="imageid" value="" type="hidden"></input>'
          +'<div style="display:table;">'
            +'<div style="display:table-row;">'
              +'<div style="display:table-cell;">'
                +'<div id="selimage9999" style=padding-top:7px;"></div>'
              +'</div>'
              +'<div style="display:table-cell; vertical-align:top;">'
                +'<div id="BRthumbButtons" style="display:none">'
                  +'<div style="padding-bottom:5px; padding-top:7px;">'
                    +'<a href="javascript:{void(0);}" onClick="javascript:{addFavorite(false);}" id="favoritesAddToList" style="padding:4px;"><img src="https://dazeysan.github.io/SPLU/Images/add_to_favorites.png" border="0"></a>'
                  +'</div>'
                  +'<div>'
                    +'<a javascript:{void(0);}" onClick="javascript:{SPLUgameID=document.getElementById(\'objectid9999\').value;showExpansionsPane(\'button\');}" id="expansionLoggingButton" style="padding:4px;"><img src="https://dazeysan.github.io/SPLU/Images/log_expansion.png" border="0"></a>'
                    +'<span id="SPLU_ExpansionsQuantity" style="padding-left: 3px;"></span>'
                  +'</div>'
                +'</div>'
              +'</div>'
              +'<div style="display:table-cell; vertical-align:top; padding-top:10px;" id="SPLU.GameStatus"></div>'
              +'</div>'
              +'<div style="display:table-row;">'
                +'<div id="SPLU.GameCountStatus" style="display:table-cell; vertical-align:top;"></div>'
              +'</div>'
            +'</div>'
          +'</div>'
        +'</div>'
      +'</div>'
      +'<div style="display:table;">'
        +'<div style="display:table-row;">'
          +'<div class="BRcells">'
            +SPLUi18n.MainPlayers+':<a href="javascript:{void(0);}" onClick="javascript:{showHidePlayers(false,\'reset\');}" id="SPLU.SavedNamesBtn" style="padding-left:1px;"><span id="SPLU.SavedNamesButtonIconCollapse" style="display:inline-block;"><i class="fa_SP fa_SP-caret-up display:block" style="color: black; font-size: 2em; transform: translate(1px, 6px);"></i></span><span id="SPLU.SavedNamesButtonIconExpand" style="display:none;"><i class="fa_SP fa_SP-caret-down display:block" style="color: black; font-size: 2em; transform: translate(1px, 6px);"></i></span></a>'
            +'<a href="javascript:{void(0);}" onClick="javascript:{showPlayersPane(\'button\');}" id="showPlayersPaneBtn" style="padding-right:5px;"><span class="fa_SP-stack"><i class="fa_SP fa_SP-bars fa_SP-stack-2x fa_SP-pull-right" style="color: rgb(132, 130, 130); font-size: 1.5em;"></i><i class="fa_SP fa_SP-user fa_SP-stack-2x fa_SP-pull-left" style="color: rgb(0, 0, 0); text-shadow: 1px -1px rgb(164, 223, 243); font-size: 1.5em;"></i><i class="fa_SP fa_SP-user fa_SP-stack-2x fa_SP-pull-left" style="color: rgb(0, 0, 0); font-size: 1.5em; text-shadow: -1px -1px rgb(164, 223, 243);"></i></span></a>'
            +'<div style="display:inline;" id="SPLU.PlayerFilters">'
              +'<select id="SPLU.SelectFilter" onChange="javascript:{setFilter(\'choose\');}"></select>'
            +'</div>'
            +'<div id="SPLU.PlayerList" style="padding-top:15px 0px 3px 0px; width:450px;">'
              +'Loading...'
            +'</div>'
          +'</div>'
        +'</div>'
      +'</div>'
      +'<div id="SPLUplayerRows" style="display:table; padding-bottom:15px;">'
        +'<div style="display:table-header-group;">'
          +'<div class="SPLUplayerCells" style="width:25px;text-align:center;vertical-align:bottom;" id="SPLUplayerDragHeader"></div>'
          +'<div class="SPLUplayerCells" style="width:25px;"></div>'
          +'<div class="SPLUplayerCells" id="SPLU.PlayerNameColumnHeader">'
            +'<div id="SPLU.PlayerNameColumn" class="SPLUheader">'
              +'<center>'+SPLUi18n.MainName+'</center>'
            +'</div>'
          +'</div>'
          +'<div class="SPLUplayerCells" id="SPLU.PlayerUsernameColumnHeader">'
            +'<div id="SPLU.PlayerUsernameColumn" class="SPLUheader">'
              +'<center>'+SPLUi18n.MainUsername+'</center>'
            +'</div>'
          +'</div>'
          +'<div class="SPLUplayerCells" id="SPLU.PlayerColorColumnHeader">'
            +'<div id="SPLU.PlayerColorColumn" class="SPLUheader">'
              +'<center>'+SPLUi18n.MainTeamColor+'</center>'
            +'</div>'
          +'</div>'
          +'<div class="SPLUplayerCells" id="SPLU.PlayerPositionColumnHeader">'
            +'<div id="SPLU.PlayerPositionColumn" class="SPLUheader">'
              +'<center>'+SPLUi18n.MainStartPosition+'</center>'
            +'</div>'
          +'</div>'
          +'<div class="SPLUplayerCells" id="SPLU.PlayerScoreColumnHeader">'
            +'<div id="SPLU.PlayerScoreColumn" class="SPLUheader">'
            +'<center>'+SPLUi18n.MainScore+'</center>'
          +'</div>'
        +'</div>'
        +'<div class="SPLUplayerCells" id="SPLU.PlayerRatingColumnHeader">'
          +'<div id="SPLU.PlayerRatingColumn" class="SPLUheader">'
            +'<center>'+SPLUi18n.MainRating+'</center>'
          +'</div>'
        +'</div>'
        +'<div class="SPLUplayerCells" id="SPLU.PlayerWinColumnHeader">'
          +'<div id="SPLU.PlayerWinColumn" class="SPLUheader">'
            +'<center>'+SPLUi18n.MainWin+'</center>'
          +'</div>'
        +'</div>'
          +'<div class="SPLUplayerCells" id="SPLU.PlayerNewColumnHeader">'
            +'<div id="SPLU.PlayerNewColumn" class="SPLUheader">'
            +'<center>'+SPLUi18n.MainNew+'</center>'
          +'</div>'
        +'</div>'
      +'</div>'
    +'</div>'
  +'</div>'
    +'<div style="display:table; margin-top:15px;">'
      +'<div style="display:table-row;">'
        +'<div class="BRcells">'
          +'<div>'
            +'<a href="javascript:{void(0);}" onClick="javascript:{saveGamePlay(\'none\');}" style="border:2px solid blue;padding:5px 4px;border-radius:5px;background-color:lightGrey; color:black;" id="SaveGamePlayBtn" onMouseOver="makeSentence();" onMouseOut="hideSentence();"><i class="fa_SP fa_SP-check display:block" style="color: rgb(33, 177, 45); vertical-align: middle; text-align: center; text-shadow: 1px 1px 1px rgb(20, 92, 6); font-style: italic; font-size: 1.65em; transform: translate(-3.5px, -1px) rotate(-13deg);"></i>'+SPLUi18n.MainButtonSubmit+'<i style="transform: translate(3px, 6px); font-size: 1.8em; text-align: center;" class="fa_SP fa_SP-twitter SPLUtwitterIcon"></i></a>'
          +'</div>'
        +'</div>'
        +'<div class="BRcells">'
          +'<div>'
            +'<a href="javascript:{void(0);}" onClick="javascript:{saveGamePlay(\'dupe\');}" style="border:2px solid blue;padding:5px 4px;border-radius:5px;background-color:lightGrey; color:black;" id="SaveGamePlayBtnDupe" onMouseOver="makeSentence();" onMouseOut="hideSentence();"><span style="" class="fa_SP-stack"><i class="fa_SP fa_SP-square fa_SP-stack-2x display:block" style="color: white; text-align: center; vertical-align: middle; font-size: 1.4em; text-shadow: 2px 1px rgb(255, 255, 255); transform: translate(0px, 4px);"></i><i class="fa_SP fa_SP-clipboard display:block fa_SP-stack-2x" style="font-size: 1.5em; vertical-align: middle; text-align: center; transform: translate(0px, 2px);"></i><i class="fa_SP fa_SP-check display:block" style="color: rgb(33, 177, 45); vertical-align: middle; text-align: center; text-shadow: 1px 1px 1px rgb(20, 92, 6); font-style: italic; font-size: 1.65em; opacity: 0.92; transform: rotate(-13deg) translate(-2px, 3px);"></i></span>'+SPLUi18n.MainButtonSubmitDuplicate+'<i style="transform: translate(3px, 6px); font-size: 1.8em; text-align: center;" class="fa_SP fa_SP-twitter SPLUtwitterIcon"></i></a>'
          +'</div>'
        +'</div>'
        +'<div class="BRcells" id="SPLUeditPlayDiv" style="display:none;">'
          +'<div>'
            +'<a href="javascript:{void(0);}" onClick="javascript:{saveGamePlay(\'edit\');}" style="border:2px solid blue;padding:5px 4px;border-radius:5px;background-color:lightGrey; color:black;" id="EditGamePlayBtn" onMouseOver="makeSentence();" onMouseOut="hideSentence();"><span style="" class="fa_SP-stack"><i class="fa_SP fa_SP-pencil display:block fa_SP-stack-2x fa_SP-flip-horizontal" style="font-size: 1.6em; text-align: center; text-shadow: 0px 0px 0px; transform: rotate(271deg); color: rgb(176, 115, 4);"></i><i class="fa_SP fa_SP-check display:block" style="color: rgb(33, 177, 45); vertical-align: middle; text-align: center; font-style: italic; font-size: 1.65em; opacity: 0.89; text-shadow: 1px 0px 0px rgb(20, 92, 6); transform: translate(-2.5px, 3px) rotate(-13deg);"></i></span>'+SPLUi18n.MainButtonSubmitEdits+'</a>'
          +'</div>'
        +'</div>'
        +'<div class="BRcells" id="SPLUdeletePlayDiv" style="display:none;">'
          +'<div>'
            +'<a href="javascript:{void(0);}" onClick="javascript:{deleteGamePlay();}" style="border:2px solid blue;padding:5px 5px;border-radius:5px;background-color:lightGrey; color:black;" id="DeleteGamePlayBtn";><i class="fa_SP fa_SP-trash display:block" style="text-align: center; font-size: 1.6em; vertical-align: middle; transform: translate(0px, -1px);"></i></a>'
          +'</div>'
        +'</div>'
        +'<div class="BRcells" id="SPLUresetFormDiv">'
          +'<div>'
            +'<a href="javascript:{void(0);}" onClick="javascript:{clearForm(\'reset\');clearSearchResult();}" style="border:2px solid blue;padding:5px 4px;border-radius:5px;background-color:lightGrey; color:black;" id="ResetFormBtn"><i class="fa_SP fa_SP-repeat display:block" style="color: red; vertical-align: middle; text-align: center; transform: translate(-3px, 0px) scaleX(-1); font-size: 1.5em; font-weight: bold;"></i></a>'
          +'</div>'
        +'</div>'
        +'<div class="BRcells">'
          +'<div id="BRresults"></div>'
        +'</div>'
        +'<div class="BRcells">'
          +'<div id="SPLUexpansionResults"></div>'
        +'</div>'
      +'</div>'
    +'</div>'
    +'<div style="display:table;">'
      +'<div style="display:table-row;">'
        +'<div class="BRcells">'
          +'<div id="SPLU.SummaryTextField" style="max-width:400px;">'
        +'</div>'
      +'</div>'
    +'</div>'
    +'</div>';  
    tmpDiv.innerHTML+=tmpHTML;
    BRlogForm.appendChild(tmpDiv);


    
    var BRlogSettings=document.createElement('div');
    BRlogSettings.id='BRlogSettings';
    BRlogSettings.setAttribute("style","display:none; background-color: #80FE86; padding: 13px;border:2px solid black;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:75px;position:relative;");
    var tmpDiv=document.createElement('div');
    var tmpHTML='<div id="hideSettingsButton" style="position: absolute; right: -2px; top: -3px;">'
      +'<a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogMain\').style.minWidth=\'\';document.getElementById(\'BRlogSettings\').style.display=\'none\';}" style="border:2px solid black;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;">'
      +'<img src="https://dazeysan.github.io/SPLU/Images/close_pane.png">'
      +'</a>'
      +'</div>'
      +'<span style="font-variant:small-caps; font-weight:bold; font-size:13px;">'
      +'<center>'+SPLUi18n.SettingsHeader+'</center>'
      +'</span>'
      +'<div style="display:table;">'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:left;"><b>'+SPLUi18n.SettingsArea+'</b></div>'
      +'<div style="display:table-cell; padding-left:10px; text-align:center;">'+SPLUi18n.SettingsVisible+'</div>'
      +'<div style="display:table-cell; padding-left: 10px; text-align:center;" id="ResetSettingsOption">'+SPLUi18n.SettingsReset+'</div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsDate+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.DateFieldCheck" onClick="javascript:{showHide(\'DateField\');}" ></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.DateFieldReset" onclick="javascript:{SPLU.Settings.DateField.Reset=document.getElementById(\'SPLU.DateFieldReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsLocation+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.LocationFieldCheck" onClick="javascript:{showHide(\'LocationField\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.LocationFieldReset" onclick="javascript:{SPLU.Settings.LocationField.Reset=document.getElementById(\'SPLU.LocationFieldReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsSavedLocationList+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.LocationListCheck" onClick="javascript:{showHideLocations(\'true\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.LocationListReset" onclick="javascript:{SPLU.Settings.LocationList.Reset=document.getElementById(\'SPLU.LocationListReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsQuantity+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.QuantityFieldCheck" onclick="javascript:{showHide(\'QuantityField\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.QuantityFieldReset" onclick="javascript:{SPLU.Settings.QuantityField.Reset=document.getElementById(\'SPLU.QuantityFieldReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsDuration+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.DurationFieldCheck" onclick="javascript:{showHide(\'DurationField\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.DurationFieldReset" onclick="javascript:{SPLU.Settings.DurationField.Reset=document.getElementById(\'SPLU.DurationFieldReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsIncomplete+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.IncompleteFieldCheck" onclick="javascript:{showHide(\'IncompleteField\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.IncompleteFieldReset" onclick="javascript:{SPLU.Settings.IncompleteField.Reset=document.getElementById(\'SPLU.IncompleteFieldReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsNoWinStats+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.NoWinStatsFieldCheck" onclick="javascript:{showHide(\'NoWinStatsField\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.NoWinStatsFieldReset" onclick="javascript:{SPLU.Settings.NoWinStatsField.Reset=document.getElementById(\'SPLU.NoWinStatsFieldReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsTweetThis+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.TwitterFieldCheck" onclick="javascript:{showHide(\'TwitterField\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.TwitterFieldReset" onclick="javascript:{SPLU.Settings.TwitterField.Reset=document.getElementById(\'SPLU.TwitterFieldReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsComments+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.CommentsFieldCheck" onclick="javascript:{showHide(\'CommentsField\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.CommentsFieldReset" onclick="javascript:{SPLU.Settings.CommentsField.Reset=document.getElementById(\'SPLU.CommentsFieldReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsGame+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.GameFieldCheck" onclick="javascript:{showHide(\'GameField\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsDomainButtons+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.DomainButtonsCheck" onclick="javascript:{showHide(\'DomainButtons\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsSavedPlayerNames+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerListCheck" onclick="javascript:{showHide(\'PlayerList\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsEnableFilters+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerFiltersCheck" onclick="javascript:{showHideFilters();}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsEnableGroups+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerGroupsCheck" onclick="javascript:{showHideGroups();}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsEnableShowPlayCount+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.FetchPlayCountCheck" onclick="javascript:{SPLU.Settings.FetchPlayCount.Enabled=document.getElementById(\'SPLU.FetchPlayCountCheck\').checked;}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:left; padding-top:10px;"><b>'+SPLUi18n.SettingsPlayerColumns+'</b></div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsName+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerNameColumnCheck" onclick="javascript:{hideColumn(\'PlayerNameColumn\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerNameColumnReset" onclick="javascript:{SPLU.Settings.PlayerNameColumn.Reset=document.getElementById(\'SPLU.PlayerNameColumnReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsUsername+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerUsernameColumnCheck" onclick="javascript:{hideColumn(\'PlayerUsernameColumn\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerUsernameColumnReset" onclick="javascript:{SPLU.Settings.PlayerUsernameColumn.Reset=document.getElementById(\'SPLU.PlayerUsernameColumnReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsTeamColor+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerColorColumnCheck" onclick="javascript:{hideColumn(\'PlayerColorColumn\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerColorColumnReset" onclick="javascript:{SPLU.Settings.PlayerColorColumn.Reset=document.getElementById(\'SPLU.PlayerColorColumnReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsStartPosition+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerPositionColumnCheck" onclick="javascript:{hideColumn(\'PlayerPositionColumn\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerPositionColumnReset" onclick="javascript:{SPLU.Settings.PlayerPositionColumn.Reset=document.getElementById(\'SPLU.PlayerPositionColumnReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsScore+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerScoreColumnCheck" onclick="javascript:{hideColumn(\'PlayerScoreColumn\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerScoreColumnReset" onclick="javascript:{SPLU.Settings.PlayerScoreColumn.Reset=document.getElementById(\'SPLU.PlayerScoreColumnReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsRating+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerRatingColumnCheck" onclick="javascript:{hideColumn(\'PlayerRatingColumn\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerRatingColumnReset" onclick="javascript:{SPLU.Settings.PlayerRatingColumn.Reset=document.getElementById(\'SPLU.PlayerRatingColumnReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsWin+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerWinColumnCheck" onclick="javascript:{hideColumn(\'PlayerWinColumn\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerWinColumnReset" onclick="javascript:{SPLU.Settings.PlayerWinColumn.Reset=document.getElementById(\'SPLU.PlayerWinColumnReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsNew+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerNewColumnCheck" onclick="javascript:{hideColumn(\'PlayerNewColumn\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PlayerNewColumnReset" onclick="javascript:{SPLU.Settings.PlayerNewColumn.Reset=document.getElementById(\'SPLU.PlayerNewColumnReset\').checked;}"></input>'
      +'</div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:left; padding-top:10px;"><b>'+SPLUi18n.SettingsOtherStuff+'</b></div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsPopUpText+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.PopUpTextCheck" onclick="javascript:{SPLU.Settings.PopUpText.Visible=document.getElementById(\'SPLU.PopUpTextCheck\').checked;}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsSummarySentence+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.SummaryTextFieldCheck" onclick="javascript:{showHide(\'SummaryTextField\');}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsNoreenWinComments+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.WinCommentsCheck" onclick="javascript:{SPLU.Settings.WinComments.Visible=document.getElementById(\'SPLU.WinCommentsCheck\').checked; if(SPLU.Settings.WinComments.Visible){NoreenWinComment();}}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsSortGroupsAlpha+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.SortGroupsAlphaCheck" onclick="javascript:{if(document.getElementById(\'SPLU.SortGroupsAlphaCheck\').checked){SPLU.Settings.SortGroups.Order=\'Alpha\';}else{SPLU.Settings.SortGroups.Order=\'None\';} loadPlayers();}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsExpansionsLogDetails+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.ExpansionDetailsCheck" onclick="javascript:{if(document.getElementById(\'SPLU.ExpansionDetailsCheck\').checked){SPLU.Settings.ExpansionDetails.Include=true;}else{SPLU.Settings.ExpansionDetails.Include=false;}}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsExpansionsListInComments+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.ExpansionCommentsCheck" onclick="javascript:{if(document.getElementById(\'SPLU.ExpansionCommentsCheck\').checked){SPLU.Settings.ExpansionComments.Visible=true;}else{SPLU.Settings.ExpansionComments.Visible=false;}}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsExpansionsNoWinStats+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.ExpansionWinStatsCheck" onclick="javascript:{if(document.getElementById(\'SPLU.ExpansionWinStatsCheck\').checked){SPLU.Settings.ExpansionWinStats.Enabled=true;}else{SPLU.Settings.ExpansionWinStats.Enabled=false;}}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsExpansionsLinkToParent+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.ExpansionLinkParentCheck" onclick="javascript:{if(document.getElementById(\'SPLU.ExpansionLinkParentCheck\').checked){SPLU.Settings.ExpansionLinkParent.Enabled=true;}else{SPLU.Settings.ExpansionLinkParent.Enabled=false;}}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsTweetingDefaultOn+'</div>'
      +'<div style="display:table-cell; text-align:center;">'
      +'<input type="checkbox" id="SPLU.TwitterEnabledCheck" onclick="javascript:{if(document.getElementById(\'SPLU.TwitterEnabledCheck\').checked){SPLU.Settings.TwitterField.Enabled=true;document.getElementById(\'twitter\').checked=true;}else{SPLU.Settings.TwitterField.Enabled=false;document.getElementById(\'twitter\').checked=false;};setTwitterIcons();}"></input>'
      +'</div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsDefaultPlayer+' <select id="SPLU.SelectDefaultPlayer" onChange="javascript:{SPLU.Settings.DefaultPlayer.Name=document.getElementById(\'SPLU.SelectDefaultPlayer\').value;}"></select></div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsDefaultLocation+' <select id="SPLU.SelectDefaultLocation" onChange="javascript:{SPLU.Settings.DefaultLocation.Name=document.getElementById(\'SPLU.SelectDefaultLocation\').value;}"></select></div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsLanguage+': <select id="SPLU.SelectLanguage" onChange="javascript:{SPLU.Settings.i18n=document.getElementById(\'SPLU.SelectLanguage\').value;}"></select></div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'
      +'<div style="display:table-row;" class="SPLUsettingAltRows">'
      +'<div style="display:table-cell; text-align:right;">'+SPLUi18n.SettingsFavoritesThumbSize+' <select id="SPLU.SelectFavoritesThumbSize" onChange="javascript:{SPLU.Settings.Favorites.ThumbSize=document.getElementById(\'SPLU.SelectFavoritesThumbSize\').value;}"></select></div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'<div style="display:table-cell; text-align:center;"></div>'
      +'</div>'

      +'</div>'
      +'<div style="display:table; padding-top:15px;">'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell; padding-right:10px;">'
      +'<a href="javascript:{void(0);}" onClick="javascript:{saveSettings(\''+SPLUi18n.StatusSaved+'\');}" class="BRbutn" style="border:2px solid black;padding:2px 4px;border-radius:5px;background-color:lightGrey; color:black;">'+SPLUi18n.SettingsSave+'</a>'
      +'</div>'
      +'<div style="display:table-cell;width:135px;" id="SPLU.SettingsStatus"></div>'
      +'<div style="display:table-cell;" id="SPLU.SettingsReset">'
        +'<a href="javascript:{void(0);}" onClick="javascript:{resetSettings();saveSettings(\'Settings Reset. Please close SPLU.\');}" style="color:red;">!</a>'
      +'</div>'
      +'<div style="display:table-cell;">'
        +'<span style="margin-left:20px;">'+SPLUversion+'</span>'
      +'</div>'
      +'</div>'
      +'</div>'
      +'</div>';
    tmpDiv.innerHTML+=tmpHTML;
    BRlogSettings.appendChild(tmpDiv);


    var BRlogFavs=document.createElement('div');
    BRlogFavs.id='BRlogFavs';
    BRlogFavs.setAttribute("style","display:none; background-color: #FFAEC5; font-style:initial; color:black; padding: 13px;border:2px solid #F30F27;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:100px;position:relative;");
    var tmpDiv=document.createElement('div');
    var tmpHTML='<div id="hideFavsButton" style="position: absolute; right: 0px; top: 2px;">'
        +'<a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogFavs\').style.display=\'none\';}" style="border:2px solid #F30F27;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"><img src="https://dazeysan.github.io/SPLU/Images/close_pane.png"></a>'
        +'</div>'
        +'<span style="font-variant:small-caps; font-weight:bold;">'
          +'<div style="float: left; padding-left: 20px; position: absolute;">'
            +'<a href="javascript:{void(0);}" onclick="javascript:{addCustomFavorite();}" id="favoritesCustomAddToList" style="padding:4px;"><span class="fa_SP-stack"><i style="color: white; transform: translate(-6px, -9px); font-size: 3.7em;" class="fa_SP fa_SP-stack-2x"></i><i style="color: red; font-size: 1.6em;" class="fa_SP fa_SP-stack-2x fa_SP-heart"></i><i class="fa_SP fa_SP-stack-2x fa_SP-gift" style="color: rgb(5, 167, 5); transform: scaleX(-1) translate(-4px, 6px); font-size: 1.2em; text-shadow: 1px -1px rgb(255, 255, 255), 1px 1px rgb(255, 255, 255), -1px -1px rgb(255, 255, 255);"></i></span></a>'
          +'</div>'
        +'<center>'+SPLUi18n.FavoritesHeader+'</center>'
        +'<br />'
        +'</span>'
        +'<div id="SPLU.FavoritesCustomNameDiv" style="display:none;"><input style="margin-bottom: 10px; margin-left: 23px;" id="SPLU.FavoritesCustomName" type="text"><div style="display: inline;"><a style="" href="javascript:{void(0);}" onclick="javascript:{addFavorite(true);}"><span style="transform: translate(-1px, 3px);" class="fa_SP-stack"><i style="color: white; transform: translate(0px, -3px); font-size: 1.4em;" class="fa_SP fa_SP-stack-2x fa_SP-square-sharp"></i><i style="font-size: 1.3em; color: black;" class="fa_SP fa_SP-stack-2x fa_SP-floppy2"></i></span></a></div></div>'
        +'<div id="SPLU.FavoritesStatus"></div>'
        +'<div id="SPLU.FavoritesList" style="overflow-y:auto; width:220px;"></div>'
          +'<div style="margin-top:10px;"><a href="javascript:{void(0);}" onClick="javascript:{saveFavoritesOrder();}" class="SPLUbuttons" style="margin-right:6px;color:black;border:2px solid #249631">'+SPLUi18n.FavoritesOrderButtonSave+'</a>'
          +'<div id="SPLU.FavoritesLowerStatus" style="display:inline;padding-left:5px;"></div>'
          +'</div>'
        +'</div>';

    tmpDiv.innerHTML+=tmpHTML;
    BRlogFavs.appendChild(tmpDiv);

    var BRlogExpansions=document.createElement('div');
    BRlogExpansions.id='BRlogExpansions';
    BRlogExpansions.setAttribute("style","display:none; background-color: #B269FB; font-style:initial; color:white; padding: 13px;border:2px solid blue;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:75px; max-width:250px;position:relative;");
    var tmpDiv=document.createElement('div');
    var tmpHTML='<div id="hideExpansionsButton" style="position: absolute; right: 0px; top: 2px;">'
        +'<a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogExpansions\').style.display=\'none\';}" style="border:2px solid blue;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"><img src="https://dazeysan.github.io/SPLU/Images/close_pane.png"></a>'
        +'</div>'
        +'<form name="BRexpLogForm">'
          +'<center><b>'+SPLUi18n.ExpansionsHeader+'</b></center>'
            +'<div style="display:table;width:250px;">'
              +'<div style="display:table-row;">'
                +'<div id="SPLU.ExpansionsHeading" style="display:table-cell;padding-bottom:5px;border-top:2px solid blue;border-top-left-radius:20px;border-top-right-radius:20px;">'
                  +'<center>'
                    +'<a href="javascript:{void(0);}" onClick="javascript:{showExpansionTab();}">'+SPLUi18n.ExpansionsTabExpansions+'</a>'
                  +'</center>'
                +'</div>'
                +'<div id="SPLU.FamilyHeading" style="display:table-cell;padding-bottom:5px;border-top-left-radius:20px;border-top-right-radius:20px;">'
                  +'<center>'
                    +'<a href="javascript:{void(0);}" onClick="javascript:{showFamilyTab();}">'+SPLUi18n.ExpansionsTabFamily+'</a>'
                  +'</center>'
                +'</div>'
              +'</div>'
            +'</div>'
            +'<div id="SPLU.ExpansionPane" style="overflow-y:auto;margin-top:10px;margin-bottom:10px;"></div>'
            +'<div id="SPLU.FamilyPane" style="overflow-y:auto;margin-top:10px;margin-bottom:10px;display:none;"></div>'
            +'<div id="SPLU.ExpansionPaneControls">'
              +'<div style="padding-top:10px;">'+SPLUi18n.ExpansionsQuantity+': '
                +'<div id="SPLU.fakeExpQtyBox" style="display:inline-block;padding:0px 2px; -moz-appearance:textfield; -webkit-appearance:textfield;">'
                  +'<input type="text" id="BRexpPlayQTY"/ value="0" style="width:40px;border:none;color:black;">'
                  +'<a href="javascript:{void(0);}" onClick="javascript:{saveExpansionQuantity();}" style="vertical-align:middle;" id="SPLU.SaveExpQtyButton"><img src="https://dazeysan.github.io/SPLU/Images/save.png"></a>'
                +'</div>'
                +'<div style="display:table; padding-top:10px;">'
                  +'<div style="display:table-row;">'
                    +'<div style="display:table-cell; padding-top:10px;">'
                      +'<a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogExpansions\').style.display=\'none\';}" style="border:2px solid blue;padding:2px 4px;border-radius:5px;background-color:lightGrey;margin-top:10px;">'+SPLUi18n.ExpansionsButtonOkay+'</a>'
                    +'</div>'
                    +'<div style="display:table-cell; padding-top:10px; padding-left:10px;">'
                      +'<a href="javascript:{void(0);}" onClick="javascript:{clearExpansions();}" style="border:2px solid blue;padding:2px 4px;border-radius:5px;background-color:lightGrey;margin-top:10px;">'+SPLUi18n.ExpansionsButtonClear+'</a>'
                    +'</div>'
                    +'<div id="SPLU.ExpansionsPaneStatus" style="display:table-cell; padding-top:10px; padding-left:10px;">'
                  +'</div>'
                +'</div>'
              +'</div>'
            +'</div>'
          +'</form>';
    tmpDiv.innerHTML+=tmpHTML;
    BRlogExpansions.appendChild(tmpDiv);
    
    var BRlogLocations=document.createElement('div');
    BRlogLocations.id='BRlogLocations';
    BRlogLocations.setAttribute("style","display:none; background-color: #F5C86C; padding: 13px;border:2px solid #249631;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:100px;position:relative;");
    var tmpDiv=document.createElement('div');
    var tmpHTML='<div id="hideLocationsButton" style="position: absolute; right: -2px; top: -3px;">'
        +'<a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogLocations\').style.display=\'none\';}" style="border:2px solid #249631;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"><img src="https://dazeysan.github.io/SPLU/Images/close_pane.png"></a>'
        +'</div>'
        +'<span style="font-variant:small-caps; font-weight:bold;">'
        +'<center>'+SPLUi18n.LocationsHeader+'</center>'
        +'<br/>'
        +'</span>'
        +'<div id="SPLU.LocationsList" style="overflow-y:auto;"></div>'
        +'<div style="padding-top:10px;display:inline;">'
        +'<a href="javascript:{void(0);}" onClick="javascript:{saveLocations();}" class="SPLUbuttons" style="margin-right:6px;color:black;border:2px solid #249631">'+SPLUi18n.LocationsButtonSave+'</a>'
        +'<a href="javascript:{void(0);}" onClick="javascript:{addLocation();}" class="SPLUbuttons" style="color:black; border:2px solid #249631">'+SPLUi18n.LocationsButtonNew+'</a>'
        +'</div>'
        +'<div id="SPLU.LocationsStatus" style="display:inline;padding-left:5px;"></div>';
    tmpDiv.innerHTML+=tmpHTML;
    BRlogLocations.appendChild(tmpDiv);

    var BRlogPlayers=document.createElement('div');
    BRlogPlayers.id='BRlogPlayers';
    BRlogPlayers.setAttribute("style","display:none; background-color: #F7FB6F; padding: 13px;border:2px solid #00F; border-radius:15px; box-shadow:10px 10px 5px #888; min-width:275px;position:relative;");
    var tmpDiv=document.createElement('div');
    var tmpHTML='<div id="hidePlayersButton" style="position: absolute; right: -2px; top: -3px;">'
        +'<a href="javascript:{void(0);}" onClick="javascript:{hidePopText();showPlayersTab();document.getElementById(\'BRlogPlayers\').style.display=\'none\';}" style="border:2px solid #00F;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"><img src="https://dazeysan.github.io/SPLU/Images/close_pane.png"></a>'
        +'</div>'
        +'<span style="font-variant:small-caps; font-weight:bold;">'
        +'<center>'+SPLUi18n.PlayersHeader+'</center>'
        +'<br/>'
        +'</span>'
        +'<div style="display: table; width: 254px;">'
        +'<div style="display:table-row;">'
        +'<div id="SPLU.PlayersHeading" style="display:table-cell; padding-bottom: 5px;border-top: 2px solid blue; border-top-left-radius: 20px; border-top-right-radius: 20px;">'
        +'<center>'
        +'<a href="javascript:{void(0);}" onClick="javascript:{showPlayersTab();}">'+SPLUi18n.PlayersTabPlayers+'</a>'
        +'</center>'
        +'</div>'
        +'<div id="SPLU.FiltersHeading" style="display:table-cell; padding-bottom: 5px;border-top-left-radius: 20px; border-top-right-radius: 20px;">'
        +'<center>'
        +'<a href="javascript:{void(0);}" onClick="javascript:{showFiltersTab();}">'+SPLUi18n.PlayersTabFilters+'</a>'
        +'</center>'
        +'</div>'
        +'<div id="SPLU.GroupsHeading" style="display:table-cell; padding-bottom: 5px;border-top-left-radius: 20px; border-top-right-radius: 20px;">'
        +'<center>'
        +'<a href="javascript:{void(0);}" onClick="javascript:{showGroupsTab();}">'+SPLUi18n.PlayersTabGroups+'</a>'
        +'</center>'
        +'</div>'
        +'</div>'
        +'<div style="display:table-row;">'
        +'<div id="SPLU.PlayersSubHeading" style="display: table-cell; height: 15px;">'
        +'<div id="SPLU.FiltersDeleteCell" style="display:none;">'
        +'<a href="javascript:{void(0);}" onClick="javascript:{removeFilter();}" style="vertical-align:middle; padding-right:5px;"><img src="https://dazeysan.github.io/SPLU/Images/delete_row_small.png"></a>'
        +'</div>'
        +'<div id="SPLU.GroupsDeleteCell" style="display:none;">'
        +'<a href="javascript:{void(0);}" onClick="javascript:{removeGroup();}" style="vertical-align:middle; padding-right:5px;"><img src="https://dazeysan.github.io/SPLU/Images/delete_row_small.png"></a>'
        +'</div>'
        +'</div>'
        +'<div id="SPLU.FiltersSubHeading" style="display: table-cell;">'
        +'<center>'
        +'<select id="SPLU.FiltersSubSelect" style="margin:2px;display:none;" onChange="javascript:{setFilter(\'edit\');}"></select>'
        +'</center>'
        +'</div>'
        +'<div id="SPLU.GroupsSubHeading" style="display: table-cell;">'
        +'<center>'
        +'<select id="SPLU.GroupsSubSelect" style="margin:2px;display:none;" onChange="javascript:{setGroup(\'edit\');}"></select>'
        +'</center>'
        +'</div>'
        +'</div>'
        +'<div id="SPLUgroupsFilterRow" style="display:none;">'
        +'</div>'
        +'</div>'
        +'<div style="display:table;">'
        +'<div style="display:table-row;">'
        +'<div style="display:table-cell;width:22px;">'
        +'</div>'
        +'<div style="display:table-cell;width:84px;"><center>'+SPLUi18n.PlayersName+' <a onclick=\"javascript:{ELsort.sort(ELsort.toArray().sort(function (a, b) {return a.toLowerCase().localeCompare(b.toLowerCase());}))}\" href=\"javascript:{void(0);}\"><i class=\"fa_SP fa_SP-sort-alpha-asc\"></i></a></center></div>'
        +'<div style="display:table-cell;width:84px;"><center>'+SPLUi18n.PlayersUsername+'</center></div>'
        +'<div style="display:table-cell;width:52px;" name="SPLUplayerEditColumn"><center>'+SPLUi18n.PlayersColor+'</center></div>'
        +'<div style="display:none;width:64px;" name="SPLUplayerFilterColumn"></div>'
        +'</div>'
        +'</div>'
        +'<div id="SPLU.PlayersList" style="overflow-y:auto; width: 280px;"></div>'
        +'<div id="SPLU.PlayersPaneControls">'
        +'<div style="padding-top:10px;">'
        +'<a href="javascript:{void(0);}" onClick="javascript:{savePlayers();}" class="SPLUbuttons" style="margin-right:6px;color:black;" id="SavePlayerListBtn">'+SPLUi18n.PlayersButtonSave+'</a>'
        +'<a href="javascript:{void(0);}" onClick="javascript:{addPlayer();}" class="SPLUbuttons" style="color:black;">'+SPLUi18n.PlayersButtonNew+'</a>'
        +'</div>'
        +'<div id="SPLU.PlayersStatus" style="display:inline;padding-left:5px;">'
        +'</div>'
        +'</div>'
        +'<div id="SPLU.FiltersPaneControls" style="display:none;">'
        +'<div style="padding-top:10px;">'
        +'<a href="javascript:{void(0);}" onClick="javascript:{saveFilters();}" class="SPLUbuttons" style="margin-right:6px;color:black;" id="SavePlayerFilterBtn">'+SPLUi18n.PlayersButtonSaveFilters+'</a>'
        +'<div id="SPLU.fakeFilterBox" style="display:inline-block;padding:0px 2px; -moz-appearance:textfield; -webkit-appearance:textfield;">'
        +'<input type="text" id="SPLU.NewFilterName" placeholder="'+SPLUi18n.PlayersPlaceholderAddFilter+'" style="width:100px;border:none;"></input>'
        +'<a href="javascript:{void(0);}" onClick="javascript:{addFilter();}" style="color:black;"><img src="https://dazeysan.github.io/SPLU/Images/green_circle_plus.png"></a>'
        +'</div>'
        +'</div>'
        +'<div id="SPLU.FiltersStatus" style="display:inline;padding-left:5px;"></div>'
        +'</div>'
        +'<div id="SPLU.GroupsPaneControls" style="display:none;">'
        +'<div style="padding-top:10px;"><a href="javascript:{void(0);}" onClick="javascript:{saveGroups();}" class="SPLUbuttons" style="margin-right:6px;color:black;" id="SavePlayerGroupsBtn">'+SPLUi18n.PlayersButtonSaveGroups+'</a>'
        +'<div id="SPLU.fakeGroupBox" style="display:inline-block;padding:0px 2px; -moz-appearance:textfield; -webkit-appearance:textfield;">'
        +'<input type="text" id="SPLU.NewGroupName" placeholder="'+SPLUi18n.PlayersPlaceholderAddGroup+'" style="width:100px;border:none;"></input>'
        +'<a href="javascript:{void(0);}" onClick="javascript:{addGroup();}" style="color:black;"><img src="https://dazeysan.github.io/SPLU/Images/green_circle_plus.png"></a>'
        +'</div>'
        +'</div>'
        +'<div id="SPLU.GroupsStatus" style="display:inline;padding-left:5px;"></div>'
        +'</div>';
    tmpDiv.innerHTML+=tmpHTML;
    BRlogPlayers.appendChild(tmpDiv);

    var BRlogPlays=document.createElement('div');
    BRlogPlays.id='BRlogPlays';
    BRlogPlays.setAttribute("style","display:none; background-color: #F1F8FB; padding: 13px;border:2px solid #249631;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:100px;position:relative;");
    var tmpDiv=document.createElement('div');
    var tmpHTML='<div id="hidePlaysButton" style="position: absolute; right: -2px; top: -3px;">'
          +'<a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogPlays\').style.display=\'none\';}" style="border:2px solid #249631;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"><img src="https://dazeysan.github.io/SPLU/Images/close_pane.png"></a>'
        +'</div>'
        +'<span style="font-variant:small-caps; font-weight:bold;">'
          +'<center>'+SPLUi18n.PlaysHeader+'</center>'
        +'</span>'
        +'<div>'
          +'<input type="text" id="SPLU.PlaysLogger" value="'+LoggedInAs+'" onClick="javascript:{listFetchedPlayers();}" onKeyPress="eventPlaysPlayerEnter(event);"/>'
          +'<div style="display:inline-block; margin-left:2px;">'
            +'<div style="background-color:lightgrey;border:1px solid gray;border-radius:6px;padding:2px;cursor:pointer;height:19px"><span id="SPLU.GetNextText">'+SPLUi18n.PlaysGetNext+' 100</span> | <span  onclick="javascript:{if(document.getElementById(\'SPLUfetchDrop\').style.display==\'none\'){document.getElementById(\'SPLUfetchDrop\').style.display=\'\';}else{document.getElementById(\'SPLUfetchDrop\').style.display=\'none\';}}"><i style="margin-top: -3px; margin-right: 3px; padding: 4px 2px 0px;" class="fa_SP">&#xf078;</i></span></div>'
            +'<div style="position:absolute;border:1px solid blue;background-color:rgb(206,214,233);display:none;cursor:pointer;z-index: 1573;" id="SPLUfetchDrop">'
              +'<ul class="fa_SP-ul" style="padding-right:8px;">'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{getRecentPlays(true, -1);document.getElementById(\'SPLUfetchDrop\').style.display=\'none\';}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +SPLUi18n.PlaysGetAll
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{getGamePlays();document.getElementById(\'SPLUfetchDrop\').style.display=\'none\';}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +SPLUi18n.PlaysGetGame
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{getRecentPlays(false, -1);document.getElementById(\'SPLUfetchDrop\').style.display=\'none\';}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +SPLUi18n.PlaysGetRecent
                +'</li>'
              +'</ul>'
            +'</div>'
          +'</div>'
          +'</div>'
        +'<div id="SPLU.PlaysPlayers" style="position: absolute; background-color: rgb(205, 237, 251); width: 126px; padding: 3px; border: 1px solid blue; display:none;z-index: 1575;">list</div>'
        +'<div id="SPLU.PlaysStatus" style="padding-bottom:5px;"></div>'
        +'<div id="SPLU.PlaysMenu">'
          +'<div id="SPLUfilterIconBtn" style="display:inline;padding-top:5px;border-top-left-radius:20px;border-top-right-radius:20px;">'
            +'<a href="javascript:{void(0);}" style="padding:0px 20px;" onClick="javascript:{showPlaysTab(\'filters\');loadPlays(document.getElementById(\'SPLU.PlaysLogger\').value,false);}">'
              +'<span style="color: black; transform: translate(0px, -2px); font-weight: bold;" class="fa_SP fa_SP-list-view" id="filtericon" style="margin-top:5px;"></span>'
            +'</a>'
          +'</div>'
          +'<div id="SPLUstatsIconBtn" style="display:inline;padding-top:5px;border-top-left-radius:20px;border-top-right-radius:20px;">'
            +'<a href="javascript:{void(0);}" style="padding:0px 20px;" onClick="javascript:{showPlaysTab(\'stats\');}"><img src="https://dazeysan.github.io/SPLU/Images/statistics.png" id="statisticsicon"></a>'
          +'</div>'
          +'<div id="SPLUcopyModeIconBtn" style="display:none;padding-top:5px;border-top-left-radius:20px;border-top-right-radius:20px;">'
            +'<a href="javascript:{void(0);}" style="padding:0px 20px;" onClick="javascript:{showPlaysTab(\'copymode\');loadPlays(document.getElementById(\'SPLU.PlaysLogger\').value,true);}"><img src="https://dazeysan.github.io/SPLU/Images/copy.gif" id="copymodeicon"></a>'
          +'</div>'
        +'</div>'
        +'<div id="SPLU.PlaysFilters" style="border: 1px solid blue; border-radius: 5px; padding: 3px;">'
          +'<div id="SPLU.PlaysFiltersStatus" style="float:right;"></div>'
          +'<div>'
            +'<div style="background-color:white;width:60%;border:1px solid gray;padding:2px;cursor:pointer;height:19px"  onclick="javascript:{document.getElementById(\'SPLUfilterDrop\').style.display=\'\';showDropMenu();}"><i class="fa_SP fa_SP-funnel"></i> '+SPLUi18n.PlaysFilterAddFilter+'<i style="float: right; padding: 1px 2px 0px;" class="fa_SP">&#xf078;</i></div>'
            +'<div style="position:absolute;border:1px solid blue;background-color:rgb(206,214,233);display:none;cursor:pointer;z-index: 1575;" id="SPLUfilterDrop">'
              +'<ul class="fa_SP-ul" style="padding-right:8px;">'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'gamename\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i class="fa_SP fa_SP-li">&#xee01;</i>'+SPLUi18n.PlaysFilterGame+''
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'playername\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i class="fa_SP fa_SP-li">&#xf007;</i>'+SPLUi18n.PlaysFilterPlayer+''
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'username\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i style="transform: translate(1px, 1px);" class="fa_SP fa_SP-li display:block"></i>'+SPLUi18n.PlaysFilterUsername+''
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'location\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i class="fa_SP fa_SP-li">&#xf041;</i>'+SPLUi18n.PlaysFilterLocation+''
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'daterange\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i style="transform: translate(0.5px, 0px);" class="fa_SP fa_SP-li display:block"></i>'+SPLUi18n.PlaysFilterDateRange+''
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'winner\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i class="fa_SP fa_SP-li">&#xf091;</i>'+SPLUi18n.PlaysFilterWinner+''
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'new\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i style="transform: translate(1px, 0px);" class="fa_SP fa_SP-li display:block"></i>'+SPLUi18n.PlaysFilterNew+''
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'score\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i style="transform: translate(4px, 0px); font-size: 1.3em;" class="fa_SP fa_SP-li fa_SP-dartboard display:block"></i>'+SPLUi18n.PlaysFilterScore+''
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'duration\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i style="transform: translate(4px, 0px); font-size: 1.3em;" class="fa_SP fa_SP-li fa_SP-clock-o display:block"></i>'+SPLUi18n.PlaysFilterDuration+''
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'playercount\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i class="fa_SP fa_SP-li">&#xf0c0;</i>'+SPLUi18n.PlaysFilterPlayerCount+''
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'objecttype\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i class="fa_SP fa_SP-li">&#xee02;</i>'+SPLUi18n.PlaysFilterGameType+''
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'comments\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i class="fa_SP fa_SP-li">&#xf27b;</i>'+SPLUi18n.PlaysFilterComments+''
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'excludeexpansions\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i class="fa_SP fa_SP-li">&#xf0eb;</i>'+SPLUi18n.PlaysFilterExpansions+''
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'excludenowinstats\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i style="" class="fa_SP fa_SP-li fa_SP-ribbon-white-circle"></i>'+SPLUi18n.PlaysFilterNoWinStats+''
                +'</li>'
                +'<li style="background-color: rgb(206, 214, 233);" onClick="javascript:{addPlaysFilter(\'excludeincomplete\',\'\');}" onmouseover="javascript:{this.style.backgroundColor=\'yellow\';}" onmouseout="javascript:{this.style.backgroundColor=\'rgb(206,214,233)\';}">'
                  +'<i style="transform: translate(-1px, -1px);" class="fa_SP fa_SP-li display:block"></i>'+SPLUi18n.PlaysFilterIncomplete+''
                +'</li>'
              +'</ul>'
            +'</div>'
            +'<div id="SPLUdropMenuHider" style="position: absolute; top: -144px; z-index: 1570; left: -625px; display: none;" onclick="javascript:{hideDropMenus();}"></div>'
            +'<span id="SPLU.PlaysLoadingDiv" style="margin-left:20px;display:none;">'
              +'<img src="https://dazeysan.github.io/SPLU/Images/progress.gif">'
            +'</span>'
          +'<div id="SPLU.PlaysFiltersCurrent" style="width:250px;"></div>'
            +'<div id="SPLU.PlaysFiltersGoBtn"style="float:right;margin-top:-20px;margin-right:5px;display:none;">'
              +'<a href="javascript:{void(0);}" onClick="javascript:{loadPlays(document.getElementById(\'SPLU.PlaysLogger\').value,false);}">'+SPLUi18n.PlaysFilterButtonGo+'</a>'
            +'</div>'
          +'</div>'
        +'</div>'
        +'<div id="SPLU.PlaysList" style="overflow-y:auto; width:100%; margin-top: 3px; margin-bottom: 15px;"></div>'
        +'<div id="SPLUcopyPlaysDiv" style="display:none;padding-top:10px;">'
          +'<div class="BRcells" id="CopyPlaysSelectAllBtn">'
            +'<a href="javascript:{void(0);}" onClick="javascript:{copyPlaysSelectAll();}" style="border:2px solid blue;padding:5px 4px;border-radius:5px;background-color:lightGrey; color:black;"><img src="https://dazeysan.github.io/SPLU/Images/select-all.png" style="vertical-align: middle;"></a>'
          +'</div>'
          +'<div class="BRcells" id="CopyPlaysDeselectAllBtn" style="display:none;">'
            +'<a href="javascript:{void(0);}" onClick="javascript:{copyPlaysSelectAll();}" style="border:2px solid blue;padding:5px 4px;border-radius:5px;background-color:lightGrey; color:black;"><img src="https://dazeysan.github.io/SPLU/Images/deselect-all.png" style="vertical-align: middle;"></a>'
          +'</div>'
          +'<div class="BRcells">'
            +'<a href="javascript:{void(0);}" onClick="javascript:{copyPlays(0,200);}" style="border:2px solid blue;padding:5px 4px;border-radius:5px;background-color:lightGrey; color:black;" id="CopyPlaysBtn";><img src="https://dazeysan.github.io/SPLU/Images/copy.gif" style="vertical-align: middle;"> '+SPLUi18n.PlaysButtonCopySelected+'</a>'
          +'</div>'
          +'<div id="CopyPlaysStatus"></div>'
        +'</div>'
        +'<div id="SPLU.StatsMenu" style="display:none; margin-top: 3px;">'
          +SPLUi18n.StatsStat+': <select class="fa_SP" id="SPLU.SelectStat" onChange="javascript:{loadStats(\'choose\');}">'
            +'<option class="fa_SP" style="display:block;" value="PlaysWins" selected>&#xf091; '+SPLUi18n.StatsWins+'</option>'
            +'<option class="fa_SP" style="display:block;" value="WinsByGame">&#xf091; '+SPLUi18n.StatsWinsByGame+'</option>'
            +'<option class="fa_SP" style="display:block;" value="BeginnersLuck">&#x2618; '+SPLUi18n.StatsBeginnersLuck+'</option>'
            +'<option class="fa_SP" style="display:block;" value="GameList">&#xee34; '+SPLUi18n.StatsGameList+'</option>'
            +'<option class="fa_SP" style="display:block;" value="GameListRank">&#xee34; '+SPLUi18n.StatsGameListRank+'</option>'
            +'<option class="fa_SP" style="display:block;" value="GameDetails">&#xf201; '+SPLUi18n.StatsGameDetails+'</option>'
            +'<option class="fa_SP" style="display:block;" value="Locations">&#xf041; '+SPLUi18n.StatsLocations+'</option>'
            +'<option class="fa_SP" style="display:block;" value="GameDaysSince">&#xf272; '+SPLUi18n.StatsDaysSince+'</option>'
            +'<option class="fa_SP" style="display:block;" value="Duration">&#xf272; '+SPLUi18n.StatsGameDuration+'</option>'
            +'<option class="fa_SP" style="display:block;" value="TemporalHotness">&#xf272; '+SPLUi18n.StatsTemporalHotness+'</option>'
          +'</select>'
          +'<span style="margin-left: 10px;" id="SPLUzeroScoreStatsDiv">'
            +SPLUi18n.StatsOptionIncludeZeros+':<input style="vertical-align: middle;" id="SPLUzeroScoreStatsCheck" onChange="javascript:{SPLUzeroScoreStats=document.getElementById(\'SPLUzeroScoreStatsCheck\').checked;loadPlays(document.getElementById(\'SPLU.PlaysLogger\').value,false);}" type="checkbox">'
          +'</span>'
          +'<span id="SPLUcsvDownload" style="margin-left:50px;vertical-align:top;">'
            +'<a href="javascript:{void(0);}" onClick="javascript:{SPLUdownloadText(\'SPLU-Export.csv\',SPLUcsv);}"><img src="https://dazeysan.github.io/SPLU/Images/save-csv.png""></a>'
          +'</span>'
          +'<span id="SPLUshowTemporalChartButton" onclick="javascript:{showTemporalHotnessChart();}" style="cursor: pointer;margin-left: 10px; display: none;">Chart</span>'
          +'<div id="SPLU.StatsPlayerDiv" style="display: none;">'+SPLUi18n.PlaysFilterPlayer+': <select class="fa_SP" id="SPLU.SelectStatPlayer" onChange="javascript:{setWinsByGamePlayer(\'\');}"></select></div>'
        +'</div>'
        +'<div id="SPLU.StatsContent" style="display:none;overflow-y: auto; width: 315px; margin-top: 3px; margin-bottom: 15px;"></div>'
        +'<div id="SPLU.BackupPlaysXML" style="position: absolute; bottom: 5px;"><input type="button" style="background: #505050; color: white; border-radius: 3px; padding-left: 4px; padding-right: 4px; margin-right: 5px;" value="Backup loaded plays to JSON text file" onClick="javascipt:{downloadPlaysJSON();}" /><input type="button" style="background: #505050; color: white; border-radius: 3px; padding-left: 4px; padding-right: 4px;" onclick="javascipt:{generateBBcode();}" value="BBcode of cover art"><span id="SPLU.BBstatus"></span></div>';
    tmpDiv.innerHTML+=tmpHTML;
    BRlogPlays.appendChild(tmpDiv);
    
    BRlogRow.appendChild(BRlogDiv);
    BRlogRow.appendChild(BRlogSettings);
    BRlogRow.appendChild(BRlogExpansions);
    BRlogRow.appendChild(BRlogFavs);
    BRlogRow.appendChild(BRlogLocations);
    BRlogRow.appendChild(BRlogPlayers);
    BRlogRow.appendChild(BRlogPlays);
    BRlogMain.appendChild(BRlogRow);
    document.getElementById('SPLUmain').insertBefore(BRlogMain,document.getElementById('SPLUmain').firstChild);

    //Set up PopText for buttons and such
    listenerForPopText("SaveGamePlayBtn",SPLUi18n.PopupButtonSubmit);
    listenerForPopText("SaveGamePlayBtnDupe",SPLUi18n.PopupButtonSubmitDuplicate);
    listenerForPopText("favoritesGoTo",SPLUi18n.PopupButtonFavorites);
    listenerForPopText("favoritesAddToList",SPLUi18n.PopupButtonAddFavorite);
    listenerForPopText("favoritesCustomAddToList",SPLUi18n.PopupButtonAddFavorite2);
    listenerForPopText("expansionLoggingButton",SPLUi18n.PopupButtonExpansions);
    listenerForPopText("ResetSettingsOption",SPLUi18n.PopupTextSettingsReset);
    listenerForPopText("SPLU.DateFieldReset",SPLUi18n.PopupFieldSettingsResetDate);
    listenerForPopText("hideSettingsButton",SPLUi18n.PopupButtonShutPane);
    listenerForPopText("hideExpansionsButton",SPLUi18n.PopupButtonShutPane);
    listenerForPopText("hideFavsButton",SPLUi18n.PopupButtonShutPane);
    listenerForPopText("SPLU.SettingsReset",SPLUi18n.PopupButtonResetAllSettings);
    listenerForPopText("showPlayersPaneBtn",SPLUi18n.PopupButtonEditPlayers);
    listenerForPopText("showLocationsPaneBtn",SPLUi18n.PopupButtonEditLocations);
    listenerForPopText("SPLU.SaveLocationButton",SPLUi18n.PopupButtonSaveLocation);
    listenerForPopText("BRplaysBtn",SPLUi18n.PopupButtonViewPlays);
    listenerForPopText("ResetFormBtn",SPLUi18n.PopupButtonResetForm);
    listenerForPopText("DeleteGamePlayBtn",SPLUi18n.PopupButtonDeletePlay);
    listenerForPopText("copymodeicon",SPLUi18n.PopupTabMultiCopy);
    listenerForPopText("CopyPlaysBtn",SPLUi18n.PopupButtonCopyPlays);
    listenerForPopText("CopyPlaysSelectAllBtn",SPLUi18n.PopupButtonSelectAllPlays);
    listenerForPopText("CopyPlaysDeselectAllBtn",SPLUi18n.PopupButtonDeselectAllPlays);
    //listenerForPopText("statisticsicon","Basic Stats");
    //listenerForPopText("filtericon","Apply Filter to These Results");
    //listenerForPopText("floppydiskicon","Remember This Player");

    finalSetup();
    //End initSPLU()
  }
  
  function fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }
  
  function finalSetup(){
    highlightDayButton();
    loadPlayers();  
    loadLocations();
    for (var key in SPLU.Settings) {
      if (SPLU.Settings.hasOwnProperty(key)) {
        try{
          if(SPLU.Settings[key].Visible){
            document.getElementById("SPLU."+key+"Check").checked=true;
          }else{
            if(key!="PopUpText" && key!="LocationList" && key!="WinComments" && key!="ExpansionComments" && key!="PlayerList" && key!="ExpansionQuantity" && key!="ExpansionDetails" && key!="SortPlayers" && key!="SortGroups" && key!="PlayerGroups" && key!="ExpansionWinStats" && key!="DefaultPlayer" && key!="DefaultLocation" && key!="ExpansionLinkParent" && key!="i18n" && key!="Favorites" && key!="FetchPlayCount"){
              if(key.slice(-6)=="Column"){
                document.getElementById('SPLU.'+key+'Header').style.display="none";
              }else{
                document.getElementById('SPLU.'+key).style.display="none";
              }
            }
            if(key=="LocationList"){
              document.getElementById('SPLU.LocationList').style.display="none"; LocationList=false;
              document.getElementById('SPLU.LocationButtonIconExpand').style.display="inline-block";
              document.getElementById('SPLU.LocationButtonIconCollapse').style.display="none";
            }
            if(key=="PlayerList"){
              hidePlayers();
            }
            if(key=="SortPlayers"&&SPLU.Settings[key].Order=="Alpha"){
              document.getElementById("SPLU.SortPlayersAlphaCheck").checked=true;
            }
            if(key=="SortGroups"&&SPLU.Settings[key].Order=="Alpha"){
              document.getElementById("SPLU.SortGroupsAlphaCheck").checked=true;
            }
            if(key=="PlayerFilters"){
              document.getElementById("SPLU.FiltersHeading").style.display="none";
            }
            if(key=="PlayerGroups"){
              document.getElementById("SPLU.GroupsHeading").style.display="none";
            }
            if(key=="ExpansionDetails"){
              document.getElementById("SPLU.ExpansionDetailsCheck").checked=SPLU.Settings.ExpansionDetails.Include;
            }
            if(key=="ExpansionWinStats"){
              document.getElementById("SPLU.ExpansionWinStatsCheck").checked=SPLU.Settings.ExpansionWinStats.Enabled;
            }
            if(key=="ExpansionLinkParent"){
              document.getElementById("SPLU.ExpansionLinkParentCheck").checked=SPLU.Settings.ExpansionLinkParent.Enabled;
            }
            if(key=="FetchPlayCount" && SPLU.Settings[key].Enabled){
              document.getElementById("SPLU."+key+"Check").checked=true;
            }
          }
          if(key=="TwitterField"){
            document.getElementById("SPLU.TwitterEnabledCheck").checked=SPLU.Settings.TwitterField.Enabled;
            document.getElementById("twitter").checked=SPLU.Settings.TwitterField.Enabled;
            setTwitterIcons();
          }
        }catch(err){
          console.log(err)
        }
        if(SPLU.Settings[key].Reset){
          document.getElementById("SPLU."+key+"Reset").checked=true;
        }
      }
    }
    
    //Set the ObjectType to "boardgame" first in case the domain doesn't match those below.
    setObjectType("boardgame");
    //Set the ObjectType according to the site they are currently on
    if(window.location.host.slice(-17)=="boardgamegeek.com"){
      setObjectType("boardgame");
    }
    if(window.location.host.slice(-17)=="videogamegeek.com"){
      setObjectType("videogame");
    }
    if(window.location.host.slice(-11)=="rpggeek.com"){
      setObjectType("rpgitem");
    }
    document.getElementById('quickplay_comments99').style.width=SPLU.Settings['CommentsField']['Width'];
    document.getElementById('quickplay_comments99').style.height=SPLU.Settings['CommentsField']['Height'];
    
    getGameID();
    loadFilters();
    loadGroups();
    loadDefaultPlayersList();
    loadDefaultLocationList();
    loadFavoritesThumbSizeList();
    
    //New Pikaday calendar
    //if(Pikaday===undefined){
    // if(!IncompatiblePage){
      // window.setTimeout(function(){addCalendar();},1500);
    // }
    //}else{
    //  addCalendar();
    //}
        
    //SPLUcalendar = new YAHOO.widget.Calendar('SPLU.Calendar');
    //var tmp=new Date();
    //var tmp2=new Date();
    //tmp2.setMinutes(tmp.getMinutes()-tmp.getTimezoneOffset())
    //SPLUcalendar.cfg.setProperty("maxdate",tmp2);
    //SPLUcalendar.selectEvent.subscribe(function(){tmp3=new Date();selectedDate=new Date(SPLUcalendar.getSelectedDates()[0].setMinutes(SPLUcalendar.getSelectedDates()[0].getMinutes()-tmp3.getTimezoneOffset()));setDateField(selectedDate.toISOString().slice(0,selectedDate.toISOString().indexOf("T")));showHideCalendar();});
    document.getElementById('q546e9ffd96dfc').value=getGameTitle();
    
    var tmpDiv=document.createElement('span');
    tmpDiv.style.display="none";
    tmpDiv.style.textAlign="center";
    tmpDiv.id="SPLU.PlayerDragHeader0";
    tmpDiv.dataset.spluplayernumber="0";
    tmpDiv.innerHTML='<span style=""><span style="transform: scaleX(-1); top:7px;" class="fa_SP-stack"><i style="font-size: 1.3em;" class="fa_SP fa_SP-stack-2x fa_SP-drag-row"></i></span></span>';
    document.getElementById('SPLUplayerDragHeader').appendChild(tmpDiv);

    setPlayers("reset");
    setLocation("reset");
    
    window.setTimeout(function(){ 
      PlayerRowSort = Sortable.create(document.getElementById('SPLUplayerRows'), {
        filter: 'input',
        preventOnFilter: false,
        animation: 150,
        group: "SPLUplayerRows"
      })
    }, 1000);

  }
  
  function highlightDayButton(){
    buttonToday=document.getElementById('SPLUbuttonToday');
    buttonYesterday=document.getElementById('SPLUbuttonYesterday');
    buttonDayBefore=document.getElementById('SPLUbuttonDayBefore');
    buttonToday.style.backgroundColor="";
    buttonYesterday.style.backgroundColor="";
    buttonDayBefore.style.backgroundColor="";
    if(document.getElementById('SPLUplayDateInput').value==SPLUdateToday){
      buttonToday.style.backgroundColor="yellow";
    }
    if(document.getElementById('SPLUplayDateInput').value==SPLUdateYesterday){
      buttonYesterday.style.backgroundColor="yellow";
    }
    if(document.getElementById('SPLUplayDateInput').value==SPLUdateDayBefore){
      buttonDayBefore.style.backgroundColor="yellow";
    }
  }
  
  function setPlayers(action){
    tmpName=SPLU.Settings.DefaultPlayer.Name;
    if(action=="reset"){
      if(tmpName!="-none-"){
        if(tmpName=="-blank-"){
          insertPlayer(-1);
        } else {
          if(tmpName.slice(0,6)=="group-"){
            insertGroup(tmpName.slice(6));
          } else {
            insertPlayer(tmpName);
          }
        }
      }
    }
    if(action=="blank"){
      insertPlayer(-1);
    }
  }

  function setLocation(action){
    tmpName=SPLU.Settings.DefaultLocation.Name;
    if(action=="reset"){
      if(tmpName=="-blank-"){
        document.getElementById('SPLU_PlayedAt').value="";
      } else {
        if(SPLU.Settings.LocationList.Visible){
          insertLocation(tmpName,false);
        } else {
          insertLocation(tmpName,true);
        }
      }
    }
    if(action=="blank"){
      document.getElementById('SPLU_PlayedAt').value="";
    }
  }

  function setTwitterIcons(){
    var tmpIcons=document.getElementsByClassName('SPLUtwitterIcon');
    var tmpDisplay="none";
    if(document.getElementById("twitter").checked){
      tmpDisplay="";
    }
    for(i=0;i<tmpIcons.length;i++){
      tmpIcons[i].style.display=tmpDisplay;
    }
  }
  
  function resetSettings(){
    SPLU.Settings={
      "i18n": "en",
      "DateField":{"Visible":true,"Reset":true},
      "LocationField":{"Visible":true,"Reset":true},
      "LocationList":{"Visible":true,"Reset":true},
      "QuantityField":{"Visible":true,"Reset":true},
      "DurationField":{"Visible":true,"Reset":true},
      "IncompleteField":{"Visible":true,"Reset":true},
      "NoWinStatsField":{"Visible":true,"Reset":true},
      "CommentsField":{"Visible":true,"Reset":true,"Width":"315px","Height":"110px"},
      "GameField":{"Visible":true},
      "PlayerList":{"Visible":true},
      "PlayerNameColumn":{"Visible":true,"Reset":false},
      "PlayerUsernameColumn":{"Visible":true,"Reset":false},
      "PlayerColorColumn":{"Visible":true,"Reset":false},
      "PlayerPositionColumn":{"Visible":true,"Reset":true},
      "PlayerScoreColumn":{"Visible":true,"Reset":true},
      "PlayerRatingColumn":{"Visible":true,"Reset":true},
      "PlayerWinColumn":{"Visible":true,"Reset":true},
      "PlayerNewColumn":{"Visible":true,"Reset":true},
      "SummaryTextField":{"Visible":true},
      "PopUpText":{"Visible":true},
      "WinComments":{"Visible":false},
      "ExpansionComments":{"Visible":false},
      "DomainButtons":{"Visible":false},
      "ExpansionQuantity":{"Value":"0"},
      "ExpansionDetails":{"Include":true},
      "ExpansionComments":{"Visible":false},
      "ExpansionLinkParent":{"Enabled":false},
      "SortPlayers":{"Order":"none"},
      "SortGroups":{"Order":"none"},
      "PlayerFilters":{"Visible":false},
      "PlayerGroups":{"Visible":false},
      "TwitterField":{"Enabled":false,"Visible":false,"Reset":true},
      "ExpansionWinStats":{"Enabled":false},
      "DefaultPlayer":{"Name":"-blank-"},
      "DefaultLocation":{"Name":"-blank-"},
      "Favorites":{"ThumbSize":"tallthumb"},
      "FetchPlayCount":{"Enabled":false}
    }
  }
  

  function compareSPLU(){
    SPLUtemp=SPLU;
    SPLU = {
      "Version":SPLUversion,
      "Favorites":{},
      "FavoritesOrder":[],
      "Locations":{
        0: { "Name": "Location1" }
      },
      "Players":{
        0: { "Name": "Player1", "Username": "Username1", "Color": "Color1" }
      },
      "Filters":{},
      "Groups":{}
    };
    resetSettings();
    for(key in SPLU){
      if(SPLUtemp[key]===undefined){
        SPLUtemp[key]=SPLU[key];
      }
    }
    for(key in SPLU.Settings){
      if(SPLUtemp.Settings[key]===undefined){
        SPLUtemp.Settings[key]=SPLU.Settings[key];
      }
      for(key2 in SPLU.Settings[key]){
        if(SPLUtemp.Settings[key][key2]===undefined){
          SPLUtemp.Settings[key][key2]=SPLU.Settings[key][key2];
        }
      }
    }
    SPLU=SPLUtemp;
    return;
  }

  function verifyData(){
    SPLUverifySave=false;
    SPLUverifyDefaultPlayer=false;
    for (var key in SPLU.Players) {
      if (SPLU.Players.hasOwnProperty(key)) {
        //console.log(key);
        if (SPLU.Settings.DefaultPlayer.Name==key){
          SPLUverifyDefaultPlayer=true;
          //console.log("Default Player Found: "+key);
        }
      }
    }
    for (var key in SPLU.Groups) {
      if (SPLU.Groups.hasOwnProperty(key)) {
        //console.log(key);
        if (SPLU.Settings.DefaultPlayer.Name=="group-"+key){
          SPLUverifyDefaultPlayer=true;
          //console.log("Default Player Found: group-"+key);
        }
      }
    }
    if (!SPLUverifyDefaultPlayer){
      console.log("Default Player not found, resetting to -blank-");
      SPLU.Settings.DefaultPlayer.Name="-blank-";
      SPLUverifySave=true;
    }
    try{
      if (SPLU.Locations[SPLU.Settings.DefaultLocation.Name]===undefined && SPLU.Settings.DefaultLocation.Name != "-blank-"){
        console.log("location not found, setting to -blank-");
        SPLU.Settings.DefaultLocation = {};
        SPLU.Settings.DefaultLocation.Name="-blank-";
        SPLUverifySave=true;
      }else{
        //console.log("location found: "+SPLU.Settings.DefaultLocation.Name);
      }
    }catch(err){
          console.log(err)
    }
    // Look for Location names that can't be decoded and remove the %'s so that the user can fix them manually.
    for (var keyL in SPLU.Locations) {
      try{
        decodeURIComponent(SPLU.Locations[keyL].Name);
      }catch(err){
        console.log(err);
        SPLU.Locations[keyL].Name = SPLU.Locations[keyL].Name.replace(/%/g, "");
        SPLUverifySave=true;
      }
    }
    for (var keyG in SPLU.Groups) {
      if (SPLU.Groups.hasOwnProperty(keyG)) {
        //console.log(keyG);
        for (i=SPLU.Groups[keyG].length-1; i>=0; i--){
          //console.log(" - "+SPLU.Groups[keyG][i]);
          var SPLUtmpVerify=false;
          for (var key in SPLU.Players) {
            if (SPLU.Players.hasOwnProperty(key)) {
              if (SPLU.Groups[keyG][i]==key){
                SPLUtmpVerify=true;
                //console.log("Group Player Found: "+key);
                break;
              }
            }
          }
          if (!SPLUtmpVerify){
            console.log("Group Player Not Found, Removing");
            SPLU.Groups[keyG].splice(i, 1);
            SPLUverifySave=true;
          }
        }
      }
    }
    for (var keyF in SPLU.Filters) {
      if (SPLU.Filters.hasOwnProperty(keyF)) {
        //console.log(keyF);
        for (i=SPLU.Filters[keyF].length-1; i>=0; i--){
          //console.log(" - "+SPLU.Filters[keyF][i]);
          var SPLUtmpVerify=false;
          for (var key in SPLU.Players) {
            if (SPLU.Players.hasOwnProperty(key)) {
              if (SPLU.Filters[keyF][i]==key){
                SPLUtmpVerify=true;
                //console.log("Filter Player Found: "+key);
                break;
              }
            }
          }
          for (var key in SPLU.Groups) {
            if (SPLU.Groups.hasOwnProperty(key)) {
              if (SPLU.Filters[keyF][i]=="group-"+key){
                SPLUtmpVerify=true;
                //console.log("Filter Player Found: group-"+key);
                break;
              }
            }
          }
          if (!SPLUtmpVerify){
            console.log("Filter Player Not Found, Removing");
            SPLU.Filters[keyF].splice(i, 1);
            SPLUverifySave=true;
          }
        }
      }
    }
    if (SPLUverifySave){
      console.log("Invalid data found and removed. Settings need to be saved.");
      //document.getElementById('BRresults').innerHTML=SPLUi18n.StatusInvalidDataFoundandRemoved;
      return true;
    }else{
      console.log("Settings look fine.");
      return false;
    }
  }
  
  function fetchSaveData(){
    //document.getElementById("BRresults").innerHTML="Fetching save data.";
    //window.setTimeout(function(){ document.getElementById("BRresults").innerHTML=""; }, 900);
    var tmp="";
    var oReq = new XMLHttpRequest();
    oReq.onload = function(){
      tmp=JSON.parse(this.response);
      //tmp=this.responseXML;
      //if(tmp.getElementsByTagName('comments').length==0){
      //if(tmp.plays[0].comments.value.length==0){
      if(tmp.plays[0]===undefined){
        if(false){
          window.setTimeout(function(){fetchSaveData();},250);
          return;
        }else{
          SPLU = {
            "Version":SPLUversion,
            "Favorites":{ },
            "FavoritesOrder":[],
            "Locations":{
              0: { "Name": "Location1" }
            },
            "Players":{
              0: { "Name": "Player1", "Username": "Username1", "Color": "Color1" }
            },
            "Filters":{},
            "Groups":{}
          };
          resetSettings();
          tmpPlay = {
            "action":"save",
            "ajax":"1",
            "comments":JSON.stringify(SPLU),
            "objectid":"98000",
            "objecttype":"thing",
            "playdate":"1452-04-15",
            "quantity":"0",
            "twitter":"false"
          }
          xmlhttp=new XMLHttpRequest();
          xmlhttp.onload=function(){
            //var tmp2="";
            //var oReq2 = new XMLHttpRequest();
            //oReq2.onload = function(){
              //tmp2=this.responseXML;
              SPLUplayId=JSON.parse(xmlhttp.response).playid
              //SPLUplayId=tmp2.getElementsByTagName("play")[0].id;
              fetchLanguageFileQueue(SPLU.Settings.i18n);
            //};
            //oReq2.open("get", "/xmlapi2/plays?username="+LoggedInAs+"&mindate=1452-04-15&maxdate=1452-04-15&id=98000", true);
            //oReq2.send();
          };
          xmlhttp.open("POST","/geekplay.php",true);
          xmlhttp.setRequestHeader("Content-type","application/json;charset=utf-8");
          xmlhttp.setRequestHeader("Accept","application/json, text/plain, */*");/**/
          xmlhttp.send(JSON.stringify(tmpPlay));
          //xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
          //xmlhttp.send("version=2&objecttype=thing&objectid=98000&action=save&quantity=0&comments="+fixedEncodeURIComponent(JSON.stringify(SPLU))+"&playdate=1452-04-15&B1=Save");
        }
      }else{
        SPLU=JSON.parse(tmp.plays[0].comments.value);
        //Check for invalid data
        var invalidData = verifyData();
        SPLUplayId=tmp.plays[0].playid;
        SPLUremote=SPLU;
        if(SPLUversion != SPLU.Version){
          console.log("Different Versions");
          compareSPLU();
          SPLU.Version=SPLUversion;
          delete SPLU.GameStats;
          tmp=SPLUi18n.StatusVersionUpdatedTo+SPLU.Version;
          saveSooty("BRresults",SPLUi18n.StatusUpdatingVersion,tmp,function(){
            fetchLanguageFileQueue(SPLU.Settings.i18n);
          });
        }else{
          fetchLanguageFileQueue(SPLU.Settings.i18n);
          //Update the saved data if invalid settings were found, but we don't need to if we've updated the version as it will save the new data anyways.
          if (invalidData){
            saveSooty("BRresults",SPLUi18n.StatusThinking,SPLUi18n.StatusInvalidDataFoundandRemoved,function(){});
          }
        }
      }
      SPLUremote=SPLU;
    };
    oReq.timeout = 1000;
    oReq.ontimeout = function (e) {
      //Timed out fetching Sooty plays
      console.log("Timed out fetching Sooty plays, retrying in 5 seconds");
      //document.getElementById("BRresults").innerHTML="Timed out fetching save data, retrying in 5 seconds.";
      window.setTimeout(function(){ fetchSaveData(); }, 5000);
    };
    oReq.open("get","/geekplay.php?action=getplays&ajax=1&currentUser=true&objecttype=thing&pageID=1&showcount=10&objectid=98000&maxdate=1452-04-15&mindate=1452-04-15",true);
    //oReq.open("get", "/xmlapi2/plays?username="+LoggedInAs+"&mindate=1452-04-15&maxdate=1452-04-15&id=98000", true);
    oReq.send();
  }


  async function fetchLanguageFileQueue(lang) {
    //Call this function to add the item to the queue
    console.log('fetchLanguageFileQueue('+lang+')');
    SPLUqueue.push({
      "action":fetchLanguageFile, 
      "arguments":{"language":lang},
      "direction":"fetch",
      "data":"",
      "response":"",
      "attempt":0,
      "finish":fetchLanguageFileFinish
    });
    runQueue();
  }
  
  async function fetchLanguageFile(tmpArgs) {
    //This function is called by runQueue() when processing the queue item
    console.log("fetchLanguageFile() - ", tmpArgs);
    try {
        const url = `https://dazeysan.github.io/SPLU/Source%20Code/i18n/${tmpArgs.language}.json`;
        const options = {};  //Setting headers here seems to trigger CORS
        return await fetchDataJSON(url, options);
    } catch(e) {
      //This shows on bad URLs?
        console.log("catcherror", e); 
    }
  }

  function fetchLanguageFileFinish(tmpObj){
    //This function is called by runQueue() when the item was processed successfully?
    console.log("fetchLanguageFileFinish() - ", tmpObj);
    //window.testObj=tmpObj;
    SPLUi18n=tmpObj.data;
    initSPLU();
    //window.setTimeout(function(){initSPLU();},500);
  }

  async function fetchLanguageListQueue() {
    //Call this function to add the item to the queue
    console.log('fetchLanguageListQueue()');
    SPLUqueue.push({
      "action":fetchLanguageList, 
      "arguments":{},
      "direction":"fetch",
      "data":"",
      "response":"",
      "attempt":0,
      "finish":fetchLanguageListFinish
    });
    runQueue();
  }
  
  async function fetchLanguageList(tmpArgs) {
    //This function is called by runQueue() when processing the queue item
    console.log("fetchLanguageList() - ", tmpArgs);
    try {
        const url = `https://dazeysan.github.io/SPLU/Source%20Code/i18n/list.json`;
        const options = {};  //Setting headers here seems to trigger CORS
        return await fetchDataJSON(url, options);
    } catch(e) {
      //This shows on bad URLs?
        console.log("catcherror", e); 
    }
  }

  function fetchLanguageListFinish(tmpObj){
    //This function is called by runQueue() when the item was processed successfully?
    console.log("fetchLanguageListFinish() - ", tmpObj);
    //window.testObj=tmpObj;
    SPLUi18nList=tmpObj.data;
    //loadLanguageList();
    window.setTimeout(function(){loadLanguageList();},100);
  }

  function loadLanguageList(){
    select=document.getElementById('SPLU.SelectLanguage');
    tmpLang=SPLU.Settings.i18n;
    select.options.length=0;
    var i=0;
    for(var key in SPLUi18nList){
      if (SPLUi18nList.hasOwnProperty(key)) {
        if(tmpLang==key){
          select.options[i]=new Option(decodeURIComponent(SPLUi18nList[key].LocalName), key, false, true);
        }else{
          select.options[i]=new Option(decodeURIComponent(SPLUi18nList[key].LocalName), key, false, false);
        }
        i++;
      }
    }
  }

  function setObjectType(type){
    console.log("setObjectType("+type+");");
    SPLUexpansionsLoaded=false;
    SPLUfamilyLoaded=false;
    var tmpGameName=document.getElementById('q546e9ffd96dfc');
    var tmpExpButton=document.getElementById('expansionLoggingButton');
    var tmpButtonBGG=document.getElementById('SPLU.SelectBGG');
    var tmpButtonVGG=document.getElementById('SPLU.SelectVGG');
    var tmpButtonRPG=document.getElementById('SPLU.SelectRPG');
    var tmpButtonRPGitem=document.getElementById('SPLU.SelectRPGItem');
    var tmpID=document.getElementById('objecttype9999');
    tmpExpButton.style.display="none";
    tmpButtonBGG.style.backgroundColor="";
    tmpButtonVGG.style.backgroundColor="";
    tmpButtonRPG.style.backgroundColor="";
    tmpButtonRPGitem.style.backgroundColor="";
    tmpID.value="thing";
    if(type=="boardgame"){
      SPLUobjecttype="boardgame";
      tmpGameName.placeholder=SPLUi18n.MainPlaceholderBGG;
      tmpExpButton.style.display="block";
      tmpButtonBGG.style.backgroundColor="#F8DF24";
    }
    if(type=="videogame"){
      SPLUobjecttype="videogame";
      tmpGameName.placeholder=SPLUi18n.MainPlaceholderVGG;
      tmpButtonVGG.style.backgroundColor="#F8DF24";
    }
    if(type=="rpg"){
      SPLUobjecttype="rpg";
      tmpGameName.placeholder=SPLUi18n.MainPlaceholderRPG;
      tmpButtonRPG.style.backgroundColor="#F8DF24";
      tmpID.value="family";
    }
    if(type=="rpgitem"){
      SPLUobjecttype="rpgitem";
      tmpGameName.placeholder=SPLUi18n.MainPlaceholderRPGItem;
      tmpButtonRPGitem.style.backgroundColor="#F8DF24";
    }
    document.getElementById("SPLU.GameCountStatus").innerHTML=``;
    clearSearchResult();
  }

  //Sorting functions found on StackOverflow
  function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a,b) {
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }
  function dynamicSortMultiple() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    var props = arguments;
    return function (obj1, obj2) {
      var i = 0, result = 0, numberOfProperties = props.length;
      /* try getting a different result from 0 (equal)
       * as long as we have extra properties to compare
       */
      while(result === 0 && i < numberOfProperties) {
        result = dynamicSort(props[i])(obj1, obj2);
        i++;
      }
      return result;
    }
  }

  //Case Insensitive version
  function dynamicSortCI(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a,b) {
      if(isNumeric(a[property]) || isNumeric(b[property])){
        var result = (parseFloat(a[property]) < parseFloat(b[property])) ? -1 : (parseFloat(a[property]) > parseFloat(b[property])) ? 1 : 0;
      }else{
        var result = (a[property].toLowerCase() < b[property].toLowerCase()) ? -1 : (a[property].toLowerCase() > b[property].toLowerCase()) ? 1 : 0;
      }
      return result * sortOrder;
    }
  }
  function dynamicSortMultipleCI() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    var props = arguments;
    return function (obj1, obj2) {
      var i = 0, result = 0, numberOfProperties = props.length;
      /* try getting a different result from 0 (equal)
       * as long as we have extra properties to compare
       */
      while(result === 0 && i < numberOfProperties) {
        result = dynamicSortCI(props[i])(obj1, obj2);
        i++;
      }
      return result;
    }
  }

  
  function getGameID(){
    var metas=document.getElementsByTagName('meta');
    for(i=0;i<metas.length;i++){
      if(metas[i].getAttribute("name")=="og:image"){
        var thumbDiv='<a><img src="'+metas[i].getAttribute("content").slice(0,-4)+'_mt'+metas[i].getAttribute("content").slice(-4)+'"/></a>';
      }
      if(metas[i].getAttribute("name")=="og:url"){
        SPLUgameID=metas[i].getAttribute("content").substring((metas[i].getAttribute("content").lastIndexOf("/")+1));
        document.getElementById('objectid9999').value=SPLUgameID;
        document.getElementById('selimage9999').innerHTML=thumbDiv;
        return SPLUgameID;
      }
    }
    return "";
  }
  
  function getGameTitle(){
    var metas=document.getElementsByTagName('meta');
    for(i=0;i<metas.length;i++){
      if(metas[i].getAttribute("name")=="og:title"){
        SPLUgameTitle=metas[i].getAttribute("content");
        return SPLUgameTitle;
      }
    }
    return "";
  }
  
  function insertBlank(id){
    var child=1;
    if(document.getElementById(id).childNodes[0].innerHTML==SPLUi18n.StatusLogged){
      child=0;
    }
    document.getElementById(id).childNodes[child].setAttribute("target","_blank");
  }
  
  function saveLocation(){
    if(document.getElementById('SPLU_PlayedAt').value!=""){
      var tmpLoc=0;
      for(var key in SPLU.Locations){
        if (SPLU.Locations.hasOwnProperty(key)) {
          tmpLoc++;
        }
      }
      SPLU.Locations[tmpLoc]={"Name":encodeURIComponent(document.getElementById('SPLU_PlayedAt').value)};
      SPLUremote.Locations=SPLU.Locations;
      saveSooty("BRresults",SPLUi18n.StatusThinking,SPLUi18n.StatusSaved,function(){
        loadLocations();
      });
    }
  }
  
  function loadLocations(){
    var tmpDiv=document.getElementById('SPLU.LocationList');
    tmpDiv.innerHTML="";
    for(var key in SPLU.Locations){
      if (SPLU.Locations.hasOwnProperty(key)) {
        tmpDiv.innerHTML+='<div style="padding: 5px 2px 0px 0px; float: left;"><a href="javascript:{void(0);}" onClick="javascript:{insertLocation('+key+',true);}" onMouseDown="javascript:{this.style.backgroundColor=\'#eff708\';}" onMouseUp="javascript:{this.style.backgroundColor=\'#A4DFF3\';}" style="border:1px dotted green;padding:0px 2px;">'+decodeURIComponent(SPLU.Locations[key].Name)+'</a></div>';
      }
    }
  }
    
  function savePlayer(id){
    if(document.getElementsByName('players['+id+'][name]')[0].value!=""||document.getElementsByName('players['+id+'][username]')[0].value!=""){
      var tmpPly=0;
      for(var key in SPLU.Players){
        if (SPLU.Players.hasOwnProperty(key)) {
          tmpPly++;
        }
      }
      SPLU.Players[(document.getElementsByName('players['+id+'][name]')[0].value.replace(/ /g,'').toLowerCase()+tmpPly)]={"Name":document.getElementsByName('players['+id+'][name]')[0].value,"Username":document.getElementsByName('players['+id+'][username]')[0].value,"Color":document.getElementsByName('players['+id+'][color]')[0].value,"SortOrder":"0"};
      SPLUremote.Players=SPLU.Players;
      saveSooty("BRresults",SPLUi18n.StatusThinking,SPLUi18n.StatusSaved,function(){
        loadPlayers();
        if(document.getElementById('BRlogPlayers').style.display=="table-cell"){
          showPlayersPane("save");
        }
      });
    }
  }
  
  function loadPlayers(){
    var BRplayersDiv=document.getElementById('SPLU.PlayerList');
    BRplayersDiv.innerHTML="";
    var players=[];
    // if(SPLU.Settings.SortPlayers.Order=="Alpha"){
      // players=Object.keys(SPLU.Players).sort();
    // }else{
      players=Object.keys(SPLU.Players);
    // }
    if(SPLUcurrentFilter!="All" && SPLUcurrentFilter!="Groups"){
      var tmpPlayers=[];
      for(i=0;i<players.length;i++){
        if(SPLU.Filters[SPLUcurrentFilter].indexOf(players[i])!=-1){
          tmpPlayers.push(players[i]);
        }
      }
      players=tmpPlayers;
    }
    if(SPLUcurrentFilter!="Groups"){
      for(key=0;key<players.length;key++){
        if (SPLU.Players.hasOwnProperty(players[key])) {
          BRtmpName=decodeURIComponent(SPLU.Players[players[key]].Name);
          if(SPLU.Players[players[key]].Name==""){
            BRtmpName=decodeURIComponent(SPLU.Players[players[key]].Username);
          }
          BRplayersDiv.innerHTML+='<div style="padding: 5px 2px 0px 0px; float: left;"><a href="javascript:{void(0);}" onClick="javascript:{insertPlayer(\''+players[key]+'\');}" onMouseDown="javascript:{this.style.backgroundColor=\'#eff708\';}" onMouseUp="javascript:{this.style.backgroundColor=\'#A4DFF3\';}" style="border:1px dotted green;padding:0px 2px;">'+BRtmpName+'</a></div>';
        }
      }
      BRplayersDiv.innerHTML+='<div style="padding: 5px 2px 0px 0px; float: left;"><a href="javascript:{void(0);}" onClick="javascript:{insertPlayer(-1);}" onMouseDown="javascript:{this.style.backgroundColor=\'#eff708\';}" onMouseUp="javascript:{this.style.backgroundColor=\'#A4DFF3\';}" style="border:1px dotted;padding:0px 2px;">'+SPLUi18n.MainOther+'</a></div>';
    }
    if(SPLU.Settings["PlayerGroups"].Visible){
      var groups=[];
      if(SPLU.Settings.SortGroups.Order=="Alpha"){
        groups=Object.keys(SPLU.Groups).sort();
      }else{
        groups=Object.keys(SPLU.Groups);
      }
      for(key=0;key<groups.length;key++){
        BRtmpName=decodeURIComponent(groups[key]);
        if(SPLUcurrentFilter=="All" || SPLUcurrentFilter=="Groups" || SPLU.Filters[SPLUcurrentFilter].indexOf("group-"+groups[key])!=-1){
          BRplayersDiv.innerHTML+='<div style="padding: 5px 2px 0px 0px; float: left;"><a href="javascript:{void(0);}" onClick="javascript:{insertGroup(\''+fixedEncodeURIComponent(groups[key])+'\');}" onMouseDown="javascript:{this.style.backgroundColor=\'#eff708\';}" onMouseUp="javascript:{this.style.backgroundColor=\'#A4DFF3\';}" style="border:1px solid black;padding:0px 2px;">'+BRtmpName+'</a></div>';
        }
      }
    }
  }
  
  function setFilter(src){
    if(src=="choose"){
      SPLUcurrentFilter=document.getElementById('SPLU.SelectFilter').value;
      showHidePlayers(false,"show");
    }else if(src=="delete" || src=="hide"){
      SPLUcurrentFilter="All";
    }else{
      SPLUcurrentFilter=document.getElementById('SPLU.FiltersSubSelect').value;
      if(SPLUcurrentFilter=="---"){
        SPLUcurrentFilter="All";
      }
    }
    //Make the Filters tab show the currently selected filter
    var checks=document.getElementsByName('SPLUfilterChecks');
    for(i=0;i<checks.length;i++){
      if(SPLUcurrentFilter=="All"||SPLUcurrentFilter=="Groups"){
        checks[i].checked=false;
        continue;
      }
      if(SPLU.Filters[SPLUcurrentFilter].indexOf(checks[i].value)!=-1){
        checks[i].checked=true;
      }else{
        checks[i].checked=false;
      }
    }
    loadFilters();
    loadPlayers();
  }
  
  function setGroup(){
    SPLUcurrentGroup=document.getElementById('SPLU.GroupsSubSelect').value;
    var checks=document.getElementsByName('SPLUgroupChecks');
    for(i=0;i<checks.length;i++){
      if(SPLU.Groups[SPLUcurrentGroup].indexOf(checks[i].value)!=-1){
        checks[i].checked=true;
      }else{
        checks[i].checked=false;
      }
    }
    loadGroups();
  }
  
  function loadFilters(){
    var select=document.getElementById('SPLU.SelectFilter');
    var select2=document.getElementById('SPLU.FiltersSubSelect');
    select.options.length=0;
    select2.options.length=0;
    if(SPLUcurrentFilter=="All"){
      select.options[0]=new Option(SPLUi18n.MainAll, "All", true, true);
      select2.options[0]=new Option("---", "---", true, true);
      select.options[1]=new Option(SPLUi18n.MainAllGroups, "Groups", true, false);
    }else if(SPLUcurrentFilter=="Groups"){
      select.options[0]=new Option(SPLUi18n.MainAll, "All", true, false);
      select2.options[0]=new Option("---", "---", true, false);
      select.options[1]=new Option(SPLUi18n.MainAllGroups, "Groups", true, true);
    }else{
      select.options[0]=new Option(SPLUi18n.MainAll, "All", true, false);
      select2.options[0]=new Option("---", "---", true, false);
      select.options[1]=new Option(SPLUi18n.MainAllGroups, "Groups", true, false);
    }
    var i=2;
    for(var key in SPLU.Filters){
      if (SPLU.Filters.hasOwnProperty(key)) {
        if(SPLUcurrentFilter==key){
          select.options[i]=new Option(key, key, false, true);
          select2.options[i-1]=new Option(key, key, false, true);
        }else{
          select.options[i]=new Option(key, key, false, false);
          select2.options[i-1]=new Option(key, key, false, false);
        }
        i++;
      }
    }
  }

  function loadGroups(){
    var select=document.getElementById('SPLU.GroupsSubSelect');
    select.options.length=0;
    var i=0;
    for(var key in SPLU.Groups){
      if (SPLU.Groups.hasOwnProperty(key)) {
        if(SPLUcurrentGroup==key){
          select.options[i]=new Option(key, key, false, true);
        }else{
          select.options[i]=new Option(key, key, false, false);
        }
        i++;
      }
    }
  }
  
  function loadDefaultPlayersList(){
    select=document.getElementById('SPLU.SelectDefaultPlayer');
    tmpName=SPLU.Settings.DefaultPlayer.Name;
    select.options.length=0;
    if(tmpName=="-none-"){
      select.options[0]=new Option("-"+SPLUi18n.SettingsNone+"-", "-none-", false, true);
    } else {
      select.options[0]=new Option("-"+SPLUi18n.SettingsNone+"-", "-none-", false, false);
    }
    if(tmpName=="-blank-"){
      select.options[1]=new Option("-"+SPLUi18n.SettingsBlank+"-", "-blank-", false, true);
    } else {
      select.options[1]=new Option("-"+SPLUi18n.SettingsBlank+"-", "-blank-", false, false);
    }
    var i=2;
    for(var key in SPLU.Players){
      if (SPLU.Players.hasOwnProperty(key)) {
        if(tmpName==key){
          select.options[i]=new Option(decodeURIComponent(SPLU.Players[key].Name), key, false, true);
        }else{
          select.options[i]=new Option(decodeURIComponent(SPLU.Players[key].Name), key, false, false);
        }
        i++;
      }
    }
    for(var key in SPLU.Groups){
      if (SPLU.Groups.hasOwnProperty(key)) {
        if(tmpName=="group-"+key){
          select.options[i]=new Option("["+key+"]", "group-"+key, false, true);
        }else{
          select.options[i]=new Option("["+key+"]", "group-"+key, false, false);
        }
        i++;
      }
    }
  }

  function insertPlayer(player){
    console.log("insertPlayer()");
    NumOfPlayers++;
    PlayerCount++;
    tmpName="";
    tmpUser="";
    tmpColor="";
    tmpStart="";
    tmpScore="";
    tmpRating="";
    tmpWin="";
    tmpNew="";
    if(typeof player=="object"){
      if(player.uplayerid===undefined){
        tmpName=player.attributes.name.value;
        tmpUser=player.attributes.username.value;
        tmpColor=player.attributes.color.value;
        tmpStart=player.attributes.startposition.value;
        tmpScore=player.attributes.score.value;
        tmpRating=player.attributes.rating.value;
        if(tmpRating==0){
          tmpRating=="";
        }
        if(player.attributes.win.value==1){
          tmpWin="checked";
        }
        if(player.attributes.new.value==1){
          tmpNew="checked";
        }
      }else{
        tmpName=player.name;
        tmpUser=player.username;
        tmpColor=player.color;
        tmpStart=player.position;
        tmpScore=player.score;
        tmpRating=player.rating;
        if(tmpRating==0){
          tmpRating=="";
        }
        if(player.win==1){
          tmpWin="checked";
        }
        if(player.new==1){
          tmpNew="checked";
        }
        if(player.username==null){
          tmpUser="";
        }
      }
    } else if(player!=-1){
      tmpName=decodeURIComponent(SPLU.Players[player].Name);
      tmpUser=decodeURIComponent(SPLU.Players[player].Username);
      tmpColor=decodeURIComponent(SPLU.Players[player].Color);
    } else if(SPLU.Players[player]===undefined && player!=-1){
      console.log(player+" does not exist.");
      return;
    }
    var paddedNum=NumOfPlayers+"";
    while(paddedNum.length<2){
      paddedNum="0"+paddedNum;
    }
    var tmpDiv=document.createElement('div');
    tmpDiv.id="SPLU.PlayerRow"+NumOfPlayers;
    tmpDiv.style.display="table-row";
    tmpDiv.dataset.spluplayernumber=NumOfPlayers;
    document.getElementById('SPLUplayerRows').appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    tmpDiv.style.display="table-cell";
    tmpDiv.style.textAlign="center";
    tmpDiv.style.cursor="grab";
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerDragColumn"+NumOfPlayers;
    tmpDiv.dataset.spluplayernumber=NumOfPlayers;
    tmpDiv.innerHTML='<span style=""><span style=""><span style="transform: scaleX(-1); top:7px;" class="fa_SP-stack"><i style="font-size: 1.3em;" class="fa_SP fa_SP-stack-2x fa_SP-drag-row"></i></span></span>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);

    var tmpDiv=document.createElement('div');
    tmpDiv.style.display="table-cell";
    tmpDiv.className="SPLUrows";
    tmpDiv.innerHTML='<a href="javascript:{void(0);}" onClick="javascript:{removePlayerRow('+NumOfPlayers+');}"><span style="transform: translate(4px, 7px);" class="fa_SP-stack display:block"><i style="color: white; font-size: 1.3em; transform: translate(-2px, 1px);" class="fa_SP fa_SP-stack-2x">&#xee22;</i><i style="transform: scaleX(-1); color: red; font-size: 1.7em;" class="fa_SP fa_SP-stack-2x">&#xee21;</i></span></a>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerNameColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerNameColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="text" style="min-width:3em;margin:0px 5px;" size="1" name="players['+NumOfPlayers+'][name]" data-SPLUplayerNumber="'+NumOfPlayers+'" data-SPLUplayerField="name" value="'+tmpName+'" tabindex="1'+paddedNum+'" onkeyup="setFieldWidth(this.getAttribute(\'data-spluplayerfield\'));"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerUsernameColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerUsernameColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="text" style="min-width:3em;margin:0px 5px;" size="1" name="players['+NumOfPlayers+'][username]" data-SPLUplayerNumber="'+NumOfPlayers+'" data-SPLUplayerField="username" value="'+tmpUser+'" tabindex="2'+paddedNum+'" onkeyup="setFieldWidth(this.getAttribute(\'data-spluplayerfield\'));"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerColorColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerColorColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="text" style="min-width:3em;margin:0px 5px;" size="1" name="players['+NumOfPlayers+'][color]" data-SPLUplayerNumber="'+NumOfPlayers+'" data-SPLUplayerField="color" value="'+tmpColor+'" tabindex="3'+paddedNum+'" onkeyup="setFieldWidth(this.getAttribute(\'data-spluplayerfield\'));"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerPositionColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerPositionColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="text" style="min-width:3em;margin:0px 5px;" size="1" name="players['+NumOfPlayers+'][position]" data-SPLUplayerNumber="'+NumOfPlayers+'" data-SPLUplayerField="startposition" value="'+tmpStart+'" tabindex="4'+paddedNum+'" onkeyup="setFieldWidth(this.getAttribute(\'data-spluplayerfield\'));"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerScoreColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerScoreColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="text" style="min-width:3em;margin:0px 5px;" size="1" name="players['+NumOfPlayers+'][score]" data-SPLUplayerNumber="'+NumOfPlayers+'" data-SPLUplayerField="score" value="'+tmpScore+'" tabindex="5'+paddedNum+'" onkeyup="setFieldWidth(this.getAttribute(\'data-spluplayerfield\'));"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerRatingColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerRatingColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="text" style="min-width:3em;margin:0px 5px;" size="1" name="players['+NumOfPlayers+'][rating]" data-SPLUplayerNumber="'+NumOfPlayers+'" data-SPLUplayerField="rating" value="'+tmpRating+'" tabindex="6'+paddedNum+'" onkeyup="setFieldWidth(this.getAttribute(\'data-spluplayerfield\'));"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerWinColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.style.textAlign="center";
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerWinColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="checkbox" name="players['+NumOfPlayers+'][win]" data-SPLUplayerNumber="'+NumOfPlayers+'" data-SPLUplayerField="win" class="SPLU.WinBox" value="1" '+tmpWin+' tabindex="7'+paddedNum+'" style="margin-bottom:2px;" onClick="javascript:{if(SPLU.Settings.WinComments.Visible){NoreenWinComment();}}"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerNewColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.style.textAlign="center";
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerNewColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="checkbox" name="players['+NumOfPlayers+'][new]" data-SPLUplayerNumber="'+NumOfPlayers+'" data-SPLUplayerField="new" value="1" '+tmpNew+' tabindex="8'+paddedNum+'" style="margin-bottom:2px;"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    tmpDiv.style.display="table-cell";
    tmpDiv.style.textAlign="center";
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerSaveColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<span style="padding-bottom:2px;"><a href="javascript:{void(0);}" onClick="javascript:{savePlayer('+NumOfPlayers+');}"><span style="transform: translate(-1px, 7px);" class="fa_SP-stack"><i style="color: white; transform: translate(0px, -3px); font-size: 1.4em;" class="fa_SP fa_SP-stack-2x fa_SP-square-sharp"></i><i style="font-size: 1.3em; color: black;" class="fa_SP fa_SP-stack-2x fa_SP-floppy2"></i></span></a></span>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    listenerForPopText("SPLU.PlayerSaveColumn"+NumOfPlayers,SPLUi18n.PopupButtonSavePlayer);

    if(NumOfPlayers==2){
      if(document.getElementsByName("players[1][name]")[0].value==""&&document.getElementsByName("players[1][username]")[0].value==""&&document.getElementsByName("players[1][color]")[0].value==""){
        removePlayerRow(1);
      }
    }
    // SPLUdragDiv=-1;
    
   SPLUsetFieldWidthDelay();
  }

  var SPLUsetFieldWidthDelayTimeout;    
  function SPLUsetFieldWidthDelay() {
    if ( SPLUsetFieldWidthDelayTimeout ) {
      clearTimeout( SPLUsetFieldWidthDelayTimeout );
      SPLUsetFieldWidthDelayTimeout = setTimeout( setAllFieldWidths, 500 );
    } else {
      SPLUsetFieldWidthDelayTimeout = setTimeout( setAllFieldWidths, 500 );
    }
  }

  function setFieldWidth(field) {
    console.log("setFieldWidth(" + field + ")");
    tmpfields=document.querySelectorAll("[data-spluplayerfield='"+field+"']");
    //console.log(tmpfields);
    tmpmax = 1;
    for(i=0; i<tmpfields.length; i++){
      if(tmpfields[i].value.length > tmpmax){
        tmpmax=tmpfields[i].value.length;
      }
    }
    for(i=0; i<tmpfields.length; i++){
      tmpfields[i].size=tmpmax;
    }
  }
  
  function setAllFieldWidths() {
    setFieldWidth("name");
    setFieldWidth("username");
    setFieldWidth("color");
    setFieldWidth("startposition");
    setFieldWidth("score");
    setFieldWidth("rating");
  }


  function sortPlayerRows(column, order) {
    // Sort the player rows by the column and order specified
    // This doesn't work reliably at the moment.  If you delete a player row then there are missing numbers and the tmpVal= line below breaks.
    // It also breaks when sorting with duplicate values, it will sort them descending like this: 1, 4, 4, 3, 2, 1 and ascending: 1, 4, 1, 2, 3, 4
    // Tried deleting the header row to get it out of the PlayerRowSort.toArray() but that didn't help.
    for(i=1; i<=PlayerCount; i++){
      tmpVal = document.getElementsByName("players["+i+"]["+column+"]")[0].value;
      if (tmpVal == "") {
        tmpVal = ".";
      }
      console.log(tmpVal);
      document.getElementById("SPLU.PlayerRow"+i).setAttribute("data-id", tmpVal);
    }
    if (order == "asc") {
      PlayerRowSort.sort(PlayerRowSort.toArray().sort(function (a, b) {return a.toLowerCase().localeCompare(b.toLowerCase());}))
    } else if (order == "des") {
      PlayerRowSort.sort(PlayerRowSort.toArray().sort(function (a, b) {return a.toLowerCase().localeCompare(b.toLowerCase());}).reverse())
    }
  }


  
  // function handleDragClick(e){
    // //console.log(this);
    // if(SPLUdragDiv==-1){
      // SPLUdragDiv=this.getAttribute('data-spluplayernumber');
      // this.style.opacity="0.4";
      // document.getElementById('SPLU.PlayerDragHeader0').style.display="";
      // return;
    // }
    // if(SPLUdragDiv!=this.getAttribute('data-spluplayernumber')){
      // movePlayer(SPLUdragDiv,this.getAttribute('data-spluplayernumber'));
    // }else{
      // this.style.opacity="1.0";
      // document.getElementById('SPLU.PlayerDragHeader0').style.display="none";
      // SPLUdragDiv=-1;
    // }
  // }

  // function handleDragStart(e) {
    // this.style.opacity = '0.4';
    // SPLUdragSourceDiv = this;
    // e.dataTransfer.effectAllowed = 'move';
    // e.dataTransfer.setData('text/html', this.getAttribute('data-spluplayernumber'));
    // document.getElementById('SPLU.PlayerDragHeader0').style.display="";
  // }

  // function handleDragOver(e) {
    // if (e.preventDefault) {
      // e.preventDefault();
    // }
    // e.dataTransfer.dropEffect = 'move';
    // return false;
  // }

  // function handleDragEnter(e) {
    // if(this.hasAttribute('data-spluplayernumber')){
      // //console.log(this.getAttribute('data-spluplayernumber'));
      // SPLUdragDiv=this.getAttribute('data-spluplayernumber')
      // highlightPlayerRow(this.getAttribute('data-spluplayernumber'),true);
    // }
  // }

  // function handleDragLeave(e) {
    // if(this.hasAttribute('data-spluplayernumber')){
      // if(SPLUdragDiv!=this.getAttribute('data-spluplayernumber')){
        // //highlightPlayerRow(this.getAttribute('data-spluplayernumber'),false);
      // }
    // }
  // }

  // function handleDrop(e) {
    // if (e.stopPropagation) {
      // e.stopPropagation();
    // }
    // if (e.preventDefault) {
      // e.preventDefault();
    // }
    // if (SPLUdragSourceDiv != this) {
      // console.log(e.dataTransfer.getData('text/html')+'||'+this.getAttribute('data-spluplayernumber'));
      // movePlayer(e.dataTransfer.getData('text/html'),this.getAttribute('data-spluplayernumber'));
    // }
    // document.getElementById('SPLU.PlayerDragHeader0').style.display="none";
    // return false;
  // }
  
  // function handleDragEnd(e){
    // if (e.stopPropagation) {
      // e.stopPropagation();
    // }
    // if (e.preventDefault) {
      // e.preventDefault();
    // }
    // SPLUdragSourceDiv.style.opacity='1.0';
    // highlightPlayerRow(SPLUdragDiv,false);
    // document.getElementById('SPLU.PlayerDragHeader0').style.display="none";
  // }
  
  // function highlightPlayerRow(row,highlight){
    // console.log("highlight|"+row+"|"+highlight);
    // tmp=document.getElementsByClassName('SPLUplayerHighlight');
    // for(i=0;i<tmp.length;i++){
      // tmp[i].style.backgroundColor="";
    // }
    // if(row==-1){
      // return;
    // }
    // if(highlight){
      // document.getElementById('SPLU.PlayerDragHighlight'+row).style.backgroundColor="red";
      // document.getElementById('SPLU.PlayerDeleteHighlight'+row).style.backgroundColor="red";
      // document.getElementById('SPLU.PlayerNameHighlight'+row).style.backgroundColor="red";
      // document.getElementById('SPLU.PlayerUsernameHighlight'+row).style.backgroundColor="red";
      // document.getElementById('SPLU.PlayerColorHighlight'+row).style.backgroundColor="red";
      // document.getElementById('SPLU.PlayerPositionHighlight'+row).style.backgroundColor="red";
      // document.getElementById('SPLU.PlayerScoreHighlight'+row).style.backgroundColor="red";
      // document.getElementById('SPLU.PlayerRatingHighlight'+row).style.backgroundColor="red";
      // document.getElementById('SPLU.PlayerWinHighlight'+row).style.backgroundColor="red";
      // document.getElementById('SPLU.PlayerNewHighlight'+row).style.backgroundColor="red";
      // document.getElementById('SPLU.PlayerSaveHighlight'+row).style.backgroundColor="red";
    // }
  // }
  
  function getWinners(){
    winboxes=document.getElementsByClassName('SPLU.WinBox');
    SPLUwinners=[];
    SPLUwinnersScores=[];
    comment="";
    for(i=0;i<winboxes.length;i++){
      if(winboxes[i].checked){
        SPLUwinners.push(document.getElementsByName('players['+winboxes[i].name.slice(8,winboxes[i].name.indexOf("]"))+'][name]')[0].value);
        SPLUwinnersScores.push(document.getElementsByName('players['+winboxes[i].name.slice(8,winboxes[i].name.indexOf("]"))+'][score]')[0].value);
      }
    }
    return(SPLUwinners.length);
  }
  
  function NoreenWinComment(){
    oldComment = document.getElementById("quickplay_comments99").value;
    if (SPLUwinnersNoreenText != ""){
      oldComment = decodeURIComponent(encodeURIComponent(oldComment).replace(encodeURIComponent(SPLUwinnersNoreenText), ""));
      oldComment = oldComment.trimEnd();
    }
    comment="";
    if(getWinners()>0){
      if(oldComment != ""){
        comment+="\r\n\r\n";
      }
      winboxes=document.getElementsByClassName('SPLU.WinBox');
      for(i=0; i<SPLUwinners.length; i++){
        if(i==0){
          comment+=SPLUwinners[i];
        }else{
          comment+=" & "+SPLUwinners[i];
        }
      }
      if(comment!=""){
        comment+=SPLUi18n.NoreenWinComments_Won;
        if(SPLUwinners.length==1 && SPLUwinnersScores[0]!=""){
          comment+=SPLUi18n.NoreenWinComments_With_a_score_of;
          comment+=SPLUwinnersScores[0];
        }
      }
      SPLUwinnersNoreenText=comment.replace("\r\n\r\n", "");
    }
    document.getElementById("quickplay_comments99").value=oldComment+comment;
  }
  
  function expansionListComment(){
    var comment="";
    if(SPLUexpansionsFromFavorite.length>0){
      expansions=SPLUexpansionsFromFavorite;
      for(i=0;i<expansions.length;i++){
        comment+="-"+expansions[i].name+"\n";
      }
    }else{
      expansions=document.getElementsByClassName('BRexpLogBox');
      for(i=0;i<expansions.length;i++){
        if(expansions[i].checked){
          comment+="-"+expansions[i].getAttribute("data-SPLU-ExpName")+"\n";
        }
      }
    }
    var CommentBox=document.getElementById("quickplay_comments99");
    var tmp=CommentBox.value.indexOf(SPLUi18n.ExpansionsComments_Played_with_the_following_expansions);
    if(tmp!=-1){
      CommentBox.value=CommentBox.value.slice(0,CommentBox.value.indexOf(SPLUi18n.ExpansionsComments_Played_with_the_following_expansions)).trim();
    }
    if(comment!=""){
      CommentBox.value+="\n\n"+SPLUi18n.ExpansionsComments_Played_with_the_following_expansions+"\n"+comment;
    }
  }
  
  function addCustomFavorite(){
    document.getElementById('SPLU.FavoritesCustomNameDiv').style.display="";
    document.getElementById('SPLU.FavoritesCustomName').value=document.getElementById('q546e9ffd96dfc').value;
  }
  
  function addFavorite(custom){
    var id=document.getElementById('objectid9999').value;
    tmp=Math.random();
    tmpid=id+'_'+tmp.toString().slice(-4);
    SPLU.Favorites[tmpid]={
      "objectid":id,
      "thumbnail":document.getElementById('SPLU.GameThumb').src,
      "title":document.getElementById('q546e9ffd96dfc').value,
      "sortorder":0,
      "objecttype":SPLUobjecttype
    };
    if(custom){
      SPLU.Favorites[tmpid].location=document.getElementById(('SPLU_PlayedAt')).value;
      SPLU.Favorites[tmpid].title2=document.getElementById('SPLU.FavoritesCustomName').value;
      document.getElementById('SPLU.FavoritesCustomNameDiv').style.display="none";
      SPLU.Favorites[tmpid].players=[];
      for(i=1; i<=NumOfPlayers; i++){
        tmpPlayer={"attributes":{
          "name":{},
          "username":{},
          "color":{},
          "startposition":{},
          "score":{},
          "rating":{},
          "win":{},
          "new":{}
        }};
        console.log(i);
        if(document.getElementsByName("players["+i+"][name]").length==0){
          continue;
        }
        tmpPlayer.attributes.name.value=document.getElementsByName("players["+i+"][name]")[0].value;
        tmpPlayer.attributes.username.value=document.getElementsByName("players["+i+"][username]")[0].value;
        tmpPlayer.attributes.color.value=document.getElementsByName("players["+i+"][color]")[0].value;
        tmpPlayer.attributes.startposition.value=document.getElementsByName("players["+i+"][position]")[0].value;
        tmpPlayer.attributes.score.value=document.getElementsByName("players["+i+"][score]")[0].value;
        tmpPlayer.attributes.rating.value=document.getElementsByName("players["+i+"][rating]")[0].value;
        if(document.getElementsByName("players["+i+"][win]")[0].checked){
          tmpPlayer.attributes.win.value=1;
        }else{
          tmpPlayer.attributes.win.value=0;
        }
        if(document.getElementsByName("players["+i+"][new]")[0].checked){
          tmpPlayer.attributes.new.value=1;
        }else{
          tmpPlayer.attributes.new.value=0;
        }
        SPLU.Favorites[tmpid].players.push(tmpPlayer);
      }
      SPLU.Favorites[tmpid].expansions=[];
      var tmpExp=document.getElementsByClassName('BRexpLogBox');
      if(tmpExp.length>0){
        for(i=0;i<tmpExp.length;i++){
          if(tmpExp[i].checked){
            SPLU.Favorites[tmpid].expansions.push({"type":tmpExp[i].getAttribute('data-tab'),"id":tmpExp[i].id,"name":tmpExp[i].getAttribute('data-SPLU-ExpName')});
          }
        }
      }
    }
    SPLUremote.Favorites[tmpid]=SPLU.Favorites[tmpid];
    saveSooty("SPLU.GameStatus",SPLUi18n.StatusThinking,SPLUi18n.StatusAdded,function(){
      if (document.getElementById('BRlogFavs').style.display=="table-cell") {
        showFavsPane("add");
      }
    });
  }
    
  function chooseFavorite(id){
    console.log("chooseFavorite("+id+")");
    setObjectType(SPLU.Favorites[id].objecttype);
    document.getElementById('SPLU_ExpansionsQuantity').innerHTML="";
    document.getElementById('objectid9999').value=SPLU.Favorites[id].objectid;
    SPLUgameID=SPLU.Favorites[id].objectid;
    //FIX - replace thing with objecttype and finish rest of feature
    if(SPLU.Settings.FetchPlayCount.Enabled) {
      fetchPlayCountQueue(SPLUgameID, SPLUobjecttype);
    }
    var tmpType="thing";
    var tmpSubType="boardgame";
    if(SPLU.Favorites[id].objecttype=="videogame"){
      tmpSubType="videogame";
    }
    if(SPLU.Favorites[id].objecttype=="rpg"){
      tmpType="family";
      tmpSubType="rpg";
    }
    if(SPLU.Favorites[id].objecttype=="rpgitem"){
      tmpType="rpgitem";
      tmpSubType="rpg";
    }
    if(SPLU.Settings.Favorites.ThumbSize=="off"){
      tmpURL = '/'+SPLU.Favorites[id].objecttype+'/'+SPLU.Favorites[id].objectid;
      fetchImageListQueue(SPLU.Favorites[id].objectid, 'div', 'selimage9999', 'tallthumb', '', tmpURL,tmpType,tmpSubType)
    } else {
      document.getElementById('selimage9999').innerHTML='<a target="_blank" href="/'+SPLU.Favorites[id].objecttype+'/'+SPLU.Favorites[id].objectid+'"><img id="SPLU.GameThumb" src="'+SPLU.Favorites[id].thumbnail+'"/></a>';
    }
    document.getElementById('q546e9ffd96dfc').value=SPLU.Favorites[id].title;
    //document.getElementById('BRlogFavs').style.display="none";
    document.getElementById('SPLUsearchResultsDIV').style.display="none";
    document.getElementById('BRthumbButtons').style.display="block";
    document.getElementById('expansionLoggingButton').style.display="block";
    SPLUexpansionsFromFavorite=[];
    if(SPLU.Favorites[id].players!==undefined){
      if(SPLU.Favorites[id].players.length>0){
        while(document.getElementsByClassName('SPLUrows').length>0){
          removePlayerRow(document.getElementsByClassName('SPLUrows')[0].parentNode.id.slice(14));
        }
        NumOfPlayers=0;
        PlayerCount=0;
        for(p=0;p<SPLU.Favorites[id].players.length;p++){
          insertPlayer(SPLU.Favorites[id].players[p]);
        }
      }
    }
    if(SPLU.Favorites[id].location!==undefined){
      if(SPLU.Favorites[id].location!=""){
        document.getElementById(('SPLU_PlayedAt')).value=SPLU.Favorites[id].location;
        hideLocations();
      }
    }
    // Commented out following line as workaround to comments blanking when user types in comment before selecting game
    //document.getElementById("quickplay_comments99").value="";
    if(SPLU.Favorites[id].expansions!==undefined){
      SPLUexpansionsFromFavorite=[];
      for(i=0;i<SPLU.Favorites[id].expansions.length;i++){
        SPLUexpansionsFromFavorite.push(SPLU.Favorites[id].expansions[i]);
      }
      if(SPLU.Settings.ExpansionComments.Visible){
        expansionListComment();
      }
    }else{
      SPLUexpansionsFromFavorite=[];
    }
    updateExpansionsQuantityField();
  }
  
  function deleteFavorite(id){
    if(id=="edit"){
      id=SPLUfavoritesEditing;
    }
    delete SPLU.Favorites[id];
    delete SPLUremote.Favorites[id];
    saveSooty("SPLU.GameStatus",SPLUi18n.StatusThinking,SPLUi18n.StatusDeleted,function(){
      showFavsPane("delete");
    });

  }
    
  function removePlayerRow(row){
    document.getElementById('SPLUplayerRows').removeChild(document.getElementById('SPLU.PlayerRow'+row));
    PlayerCount--;

   SPLUsetFieldWidthDelay();
  }

  function hideColumn(column){
    var tmpRows=document.getElementsByClassName('SPLUrows');
    if(!SPLU.Settings[column].Visible){
      for(i=0; i<tmpRows.length; i++){
        if(tmpRows[i].id.slice(5,14)==column.slice(0,9)){
          tmpRows[i].style.display="table-cell";
        }
      }
      document.getElementById('SPLU.'+column+'Header').style.display="table-cell";
      document.getElementById('SPLU.'+column+'Check').checked=true;
      SPLU.Settings[column].Visible=true;
    }else{
      for(i=0; i<tmpRows.length; i++){
        if(tmpRows[i].id.slice(5,14)==column.slice(0,9)){
          tmpRows[i].style.display="none";
        }
      }
      document.getElementById('SPLU.'+column+'Header').style.display="none";
      document.getElementById('SPLU.'+column+'Check').checked=false;
      SPLU.Settings[column].Visible=false;
    }
  }

  function showHide(field){
    if(!SPLU.Settings[field].Visible){
      document.getElementById('SPLU.'+field).style.display="block";
      document.getElementById('SPLU.'+field+'Check').checked=true;
      SPLU.Settings[field].Visible=true;
    }else{
      document.getElementById('SPLU.'+field).style.display="none";
      document.getElementById('SPLU.'+field+'Check').checked=false;
      SPLU.Settings[field].Visible=false;
    }
  }

  function showHideFilters(){
    if(!SPLU.Settings["PlayerFilters"].Visible){
      document.getElementById("SPLU.FiltersHeading").style.display="table-cell";
      document.getElementById('SPLU.PlayerFilters').style.display="inline";
      document.getElementById('SPLU.PlayerFiltersCheck').checked=true;
      SPLU.Settings["PlayerFilters"].Visible=true;
    }else{
      document.getElementById("SPLU.FiltersHeading").style.display="none";
      setFilter("hide");
      document.getElementById('SPLU.PlayerFilters').style.display="none";
      document.getElementById('SPLU.PlayerFiltersCheck').checked=false;
      SPLU.Settings["PlayerFilters"].Visible=false;
    }
  }
  
  function showHideGroups(){
    if(!SPLU.Settings["PlayerGroups"].Visible){
      document.getElementById("SPLU.GroupsHeading").style.display="table-cell";
      document.getElementById('SPLU.PlayerGroupsCheck').checked=true;
      SPLU.Settings["PlayerGroups"].Visible=true;
      loadPlayers();
    }else{
      document.getElementById("SPLU.GroupsHeading").style.display="none";
      document.getElementById('SPLU.PlayerGroupsCheck').checked=false;
      SPLU.Settings["PlayerGroups"].Visible=false;
      loadPlayers();
    }
  }

  function hideLocations(){
    console.log("hideLocations()");
    document.getElementById('SPLU.LocationList').style.display="none";
    document.getElementById('SPLU.LocationButtonIconExpand').style.display="inline-block";
    document.getElementById('SPLU.LocationButtonIconCollapse').style.display="none";
    LocationList=false;
  }
  
  function showHideLocations(update){
    if(!LocationList){
      document.getElementById('SPLU.LocationList').style.display="block";
      document.getElementById('SPLU.LocationButtonIconExpand').style.display="none";
      document.getElementById('SPLU.LocationButtonIconCollapse').style.display="inline-block";
      LocationList=true;
      if(update){
        SPLU.Settings.LocationList.Visible=true;
        document.getElementById('SPLU.LocationListCheck').checked=true;
      }
    }else{
      document.getElementById('SPLU.LocationList').style.display="none";
      document.getElementById('SPLU.LocationButtonIconExpand').style.display="inline-block";
      document.getElementById('SPLU.LocationButtonIconCollapse').style.display="none";
      LocationList=false;
      if(update){
        SPLU.Settings.LocationList.Visible=false;
        document.getElementById('SPLU.LocationListCheck').checked=false;
      }
    }
  }
  
  function hidePlayers(){
    console.log("hidePlayers()");
    document.getElementById('SPLU.PlayerList').style.display="none";
    document.getElementById('SPLU.SavedNamesButtonIconExpand').style.display="inline-block";
    document.getElementById('SPLU.SavedNamesButtonIconCollapse').style.display="none";
    PlayerList=false;
  }
  
  function showHidePlayers(update,action){
    if(!PlayerList || action=="show"){
      document.getElementById('SPLU.PlayerList').style.maxWidth=document.getElementById('BRlogMain').clientWidth-40+"px";
      document.getElementById('SPLU.PlayerList').style.display="block";
      document.getElementById('SPLU.SavedNamesButtonIconExpand').style.display="none";
      document.getElementById('SPLU.SavedNamesButtonIconCollapse').style.display="inline-block";
      PlayerList=true;
      if(update){
        SPLU.Settings.PlayerList.Visible=true;
        document.getElementById('SPLU.PlayerListCheck').checked=true;
      }
    }else{
      document.getElementById('SPLU.PlayerList').style.display="none";
      document.getElementById('SPLU.SavedNamesButtonIconExpand').style.display="inline-block";
      document.getElementById('SPLU.SavedNamesButtonIconCollapse').style.display="none";
      PlayerList=false;
      if(update){
        SPLU.Settings.PlayerList.Visible=false;
        document.getElementById('SPLU.PlayerListCheck').checked=false;
      }
    }
  }
  
  /*
  function showHideCalendar(){
    cal=document.getElementById('SPLU.Calendar');
    if(cal.style.display=="none"){
      cal.style.display="";
      SPLUcalendar.render();
    }else{
      cal.style.display="none";
    }
  }
  */
  
  function saveSettings(text){
    document.getElementById('SPLU.SettingsStatus').innerHTML=SPLUi18n.StatusThinking;
    SPLU.Settings["CommentsField"]["Width"]=document.getElementById('quickplay_comments99').style.width;
    SPLU.Settings["CommentsField"]["Height"]=document.getElementById('quickplay_comments99').style.height;
    SPLUremote.Settings=SPLU.Settings;
    saveSooty("SPLU.SettingsStatus",SPLUi18n.StatusThinking,text,function(){});
  }

  function saveSooty(statusID, statusLoading, statusSuccess, onloadFunction){
    console.log("saveSooty()");
    tmpSettings=JSON.stringify(SPLUremote);
    console.log("Settings Size: "+tmpSettings.length);
    //Check if their settings will overflow the 64KB comment limit on BGG.
    if(tmpSettings.length>65500){
      alert("Your saved settings are using too much space to be saved: "+tmpSettings.length+" bytes.\nPlease delete a favorite and try again.");
      document.getElementById(statusID).innerHTML="<img style='vertical-align:bottom;padding-top:5px;' src='https://dazeysan.github.io/SPLU/Images/alert.gif'><span style='background-color:red;color:white;font-weight:bold;'>"+SPLUi18n.StatusErrorOccurred+"</span>";
    } else {
      xmlhttp=new XMLHttpRequest();
      xmlhttp.open("POST","/geekplay.php",true);
      xmlhttp.onload=function(responseJSON){
        console.log("SaveSooty() onload()");
        if(responseJSON.target.status==200){
          ////Should really just fix boot order rather than testing this////
          if(document.getElementById(statusID)==null){
            console.log(statusSuccess);
          }else{
            document.getElementById(statusID).innerHTML=statusSuccess;
          }
          window.setTimeout(function(){ document.getElementById(statusID).innerHTML=""}, 3000);
          onloadFunction();
        }else{
          document.getElementById(statusID).innerHTML="<img style='vertical-align:bottom;padding-top:5px;' src='https://dazeysan.github.io/SPLU/Images/alert.gif'><span style='background-color:red;color:white;font-weight:bold;'>"+SPLUi18n.StatusErrorCode+": "+responseJSON.target.status+"</span>";
        }
      };
      if(document.getElementById(statusID)==null){
        console.log(statusLoading);
      }else{
        document.getElementById(statusID).innerHTML=statusLoading;
      }
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.send("version=2&objecttype=thing&objectid=98000&playid="+SPLUplayId+"&action=save&quantity=0&comments="+fixedEncodeURIComponent(tmpSettings)+"&playdate=1452-04-15&B1=Save");
    }
  }
  
  function insertLocation(location, hide){
    if(location==-1){
      document.getElementById('SPLU_PlayedAt').value="";
    }else{
      document.getElementById('SPLU_PlayedAt').value=decodeURIComponent(SPLU.Locations[location].Name);
    }
    if (hide){
      hideLocations();
    }
    document.getElementById('SPLUsearchLocationsResultsDIV').style.display="none";
  }

  var SPLUsearchLocationDelayTimeout;    
  function SPLUsearchLocationDelay(e) {
    if (e.keyCode=="9"){
      clearTimeout( SPLUsearchLocationDelayTimeout );
      return;
    }
    SPLUsearchResultsLength=20;
    if ( SPLUsearchLocationDelayTimeout ) {
      clearTimeout( SPLUsearchLocationDelayTimeout );
      SPLUsearchLocationDelayTimeout = setTimeout( SPLUsearchForLocations, 500 );
    } else {
      SPLUsearchLocationDelayTimeout = setTimeout( SPLUsearchForLocations, 500 );
    }
  }

  function SPLUsearchForLocations() {
    var tmpText=document.getElementById('SPLU_PlayedAt').value;
    if (tmpText==""){
      document.getElementById('SPLUsearchLocationsResultsDIV').style.display="none";
      return;
    }
    //console.log(tmpText);
    document.getElementById('SPLUsearchLocationsResultsDIV').style.display="";
    document.getElementById('SPLUsearchLocationsResultsDIV').innerHTML=SPLUi18n.StatusSearching;
    tmpHTML="";
    for (key in SPLU.Locations){
      if (SPLU.Locations.hasOwnProperty(key)) {
        //console.log(SPLU.Locations[key].Name);
        if (SPLU.Locations[key].Name.toLowerCase().indexOf(tmpText.toLowerCase())==0){
          tmpHTML+='<a onClick=\'javascript:{insertLocation('+key+',true);}\'>'+decodeURIComponent(SPLU.Locations[key].Name)+"</a><br/>";
        }
      }
    }
    for (key in SPLU.Locations){
      if (SPLU.Locations.hasOwnProperty(key)) {
        //console.log(SPLU.Locations[key].Name);
        if (SPLU.Locations[key].Name.toLowerCase().indexOf(tmpText.toLowerCase())>0){
          tmpHTML+='<a onClick=\'javascript:{insertLocation('+key+',true);}\'>'+decodeURIComponent(SPLU.Locations[key].Name)+"</a><br/>";
        }
      }
    }
    if (tmpHTML==""){
      document.getElementById('SPLUsearchLocationsResultsDIV').style.display="none";
    }
    document.getElementById('SPLUsearchLocationsResultsDIV').innerHTML=tmpHTML;
  }
  
  function loadDefaultLocationList(){
    select=document.getElementById('SPLU.SelectDefaultLocation');
    tmpName=SPLU.Settings.DefaultLocation.Name;
    select.options.length=0;
    if(tmpName=="-blank-"){
      select.options[0]=new Option("-"+SPLUi18n.SettingsBlank+"-", "-blank-", false, true);
    } else {
      select.options[0]=new Option("-"+SPLUi18n.SettingsBlank+"-", "-blank-", false, false);
    }
    var i=1;
    for(var key in SPLU.Locations){
      if (SPLU.Locations.hasOwnProperty(key)) {
        if(tmpName==key){
          select.options[i]=new Option(decodeURIComponent(SPLU.Locations[key].Name), key, false, true);
        }else{
          select.options[i]=new Option(decodeURIComponent(SPLU.Locations[key].Name), key, false, false);
        }
        i++;
      }
    }
  }
  
  function loadFavoritesThumbSizeList(){
    select=document.getElementById('SPLU.SelectFavoritesThumbSize');
    tmpName=SPLU.Settings.Favorites.ThumbSize;
    select.options.length=0;
    if(tmpName=="tallthumb"){
      select.options[0]=new Option("tallthumb (75x125)", "tallthumb", false, true);
    } else {
      select.options[0]=new Option("tallthumb (75x125)", "tallthumb", false, false);
    }
    if(tmpName=="micro"){
      select.options[1]=new Option("micro (64x64)", "micro", false, true);
    } else {
      select.options[1]=new Option("micro (64x64)", "micro", false, false);
    }
    if(tmpName=="off"){
      select.options[2]=new Option("off (0x0)", "off", false, true);
    } else {
      select.options[2]=new Option("off (0x0)", "off", false, false);
    }
  }
  
  function deleteGamePlay(){
    if (confirm(SPLUi18n.PopupAlertDeletePlayOK) == true) {
      tmpGameID=SPLUgameID;
      document.getElementById('BRresults').innerHTML=SPLUi18n.StatusDeleting;
      xmlhttp=new XMLHttpRequest();
      xmlhttp.open("POST","/geekplay.php",true);
      xmlhttp.onload=function(responseJSON,responseText){
        window.resJ=responseJSON;
        window.rest=responseText;
        console.log(responseJSON.target.status+"|"+responseJSON.target.statusText);
        if(responseJSON.target.status==200){
          document.getElementById('BRresults').innerHTML=SPLUi18n.StatusPlayDeleted+".  <a href='"+responseJSON.target.responseURL+"' target='_blank'>"+SPLUi18n.StatusViewYourPlays+"</a>";
          if(SPLU.Settings.FetchPlayCount.Enabled) {
            fetchPlayCountQueue(tmpGameID, SPLUobjecttype);
          }
          SPLUplayData[document.getElementById("SPLU.PlaysLogger").value][tmpPlay.playid].deleted=true;
          loadPlays(document.getElementById("SPLU.PlaysLogger").value,false);
          //Quick and dirty fix for #85 Get Next 100 failing
          getRecentPlays(false, -1);
        }else{
          document.getElementById('BRresults').innerHTML=SPLUi18n.StatusErrorOccurred;
        }
      };
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.send("finalize=1&action=delete&playid="+tmpPlay.playid);
      saveGamePlay2('delete');
      SPLUlastGameSaved=tmpPlay.playid;
    }
  }
  
  function copyPlays(lastCopied,lastCopiedStatus){
    console.log("copyPlays("+lastCopied+","+lastCopiedStatus+")");
    tmpPlays=document.getElementsByName("SPLUcopyBox");
    if(lastCopied==0){
      SPLUcopyCopied=1;
      SPLUcopyTotal=0;
      for(i=0;i<tmpPlays.length;i++){
        if(tmpPlays[i].checked){
          SPLUcopyTotal++;
        }
      }
    }
    if(lastCopiedStatus==200){
      if(lastCopied!=0){
        document.getElementById('SPLUcopyID-'+lastCopied).innerHTML='<span class="fa_SP-stack"><i style="color: white; font-size: 1em; transform: translate(0px, 2px);" class="fa_SP fa_SP-stack-2x fa_SP-square"></i><i style="color: rgb(13, 138, 13); font-size: 1.3em;" class="fa_SP fa_SP-stack-2x fa_SP-check-circle"></i></span>';
        SPLUcopyCopied++;
      }
    }else if(lastCopiedStatus=="retry"){
      SPLUcopyContinue=true;
      loadPlay(lastCopied);
      SPLUcopyID=lastCopied;
      document.getElementById('SPLUcopyID-'+lastCopied).innerHTML='<img src="https://dazeysan.github.io/SPLU/Images/progress.gif">';
      window.setTimeout(function(){saveGamePlay("copy");},2000);
      return;
    }else{
      document.getElementById('SPLUcopyID-'+lastCopied).innerHTML='<a href="javascript:{void(0);}" onClick="javascript:{copyPlays('+lastCopied+',\'retry\');}"><img src="https://dazeysan.github.io/SPLU/Images/alert.gif">';
      document.getElementById('BRresults').innerHTML=SPLUi18n.StatusTimedOutTryAgain;
      SPLUcopyCopied--;
      tmpCopied = SPLUi18n.StatusCopied.replace("$1", SPLUcopyCopied);
      tmpCopied = tmpCopied.replace("$2", SPLUcopyTotal);
      document.getElementById('CopyPlaysStatus').innerHTML=tmpCopied+'.  '+SPLUi18n.StatusHitASnag+'<br/><a href="javascript:{void(0);}" onClick="javascript:{copyPlays('+lastCopied+',\'retry\');}">'+SPLUi18n.SatusKeepGoing+'</a>';
      SPLUcopyContinue=false;
    }
    if(SPLUcopyContinue){
      tmpFinished=1;
      for(i=tmpPlays.length-1;i>=0;i--){
        if(tmpPlays[i].checked){
          tmpFinished=0;
          tmpPlayID=tmpPlays[i].getAttribute("data-SPLUcopyBox");
          console.log(tmpPlayID);
          loadPlay(tmpPlayID);
          SPLUcopyID=tmpPlayID;
          document.getElementById('SPLUcopyID-'+tmpPlayID).innerHTML='<img src="https://dazeysan.github.io/SPLU/Images/progress.gif">';
          window.setTimeout(function(){saveGamePlay("copy");},2000);
          tmpCopying = SPLUi18n.StatusCopying.replace("$1", SPLUcopyCopied);
          tmpCopying = tmpCopying.replace("$2", SPLUcopyTotal);
          document.getElementById('CopyPlaysStatus').innerHTML=tmpCopying+'.';
          break;
        }
      }
      if(tmpFinished){
        SPLUcopyCopied--;
        tmpCopied = SPLUi18n.StatusCopied.replace("$1", SPLUcopyCopied);
        tmpCopied = tmpCopied.replace("$2", SPLUcopyTotal);
        document.getElementById('CopyPlaysStatus').innerHTML=tmpCopied+'.  '+SPLUi18n.StatusFinished;
      }
    }
  }
  
  function copyPlaysSelectAll(){
    tmpPlays=document.getElementsByName("SPLUcopyBox");
    if(!SPLUcopySelectedAll){
      for(i=0;i<tmpPlays.length;i++){
        tmpPlays[i].checked=true;
      }
      document.getElementById('CopyPlaysSelectAllBtn').style.display="none";
      document.getElementById('CopyPlaysDeselectAllBtn').style.display="";
      SPLUcopySelectedAll=true;
    } else {
      for(i=0;i<tmpPlays.length;i++){
        tmpPlays[i].checked=false;
      }
      document.getElementById('CopyPlaysSelectAllBtn').style.display="";
      document.getElementById('CopyPlaysDeselectAllBtn').style.display="none";
      SPLUcopySelectedAll=false;
    }
  }
  
  function saveGamePlay(action){
    console.log("saveGamePlay("+action+")");
    if (!isValidDate(document.getElementById("SPLUplayDateInput").value) || !isValidDate(document.getElementById("playdate99").value)){
      alert("invalid date");
      return false;
    }
    try{
      document.getElementById("SPLU.Plays-"+SPLUcurrentPlayShown).childNodes[tmpChild].style.backgroundColor="";
    } catch(err) {
      //Nothing
    }
    SPLUcurrentPlayShown="0"
    var form=document.forms['SPLUform'];
    var inputs=form.getElementsByTagName('input');
    var querystring="";
    var value="";
    var tmpID="";
    for(n=0; n<inputs.length; n++){
      if(inputs[n].name=="geekitemname" || inputs[n].name=="imageid"){
        continue;
      }
      if(inputs[n].name=="objectid" && inputs[n].value==""){
        document.getElementById('BRresults').innerHTML=SPLUi18n.StatusNoGameSelected;
        return;
      }
      if(inputs[n].type=='checkbox'){
        if(inputs[n].checked){
          value=1;
        }else{
          value=0;
        }
      }else{
        value=inputs[n].value;
      }
      querystring+="&"+inputs[n].name+"="+encodeURIComponent(value);
      SPLUedit[inputs[n].name]=encodeURIComponent(value);
    }
    if(action=="edit"){
      tmpID="&playid="+tmpPlay.playid;
      SPLUedit.submit=true;
      querystring=querystring.replace("twitter=1","twitter=0");
    }
    if(action!="copy" && SPLUhistoryOpened>0){
      SPLUedit.submit=true;
    }
    querystring+="&comments="+encodeURIComponent(form["quickplay_comments99"].value);
    document.getElementById('BRresults').innerHTML=SPLUi18n.StatusSaving;
    if(action=="copy"){
      SPLUtimeouts[SPLUcopyID]=setTimeout(function(){copyPlays(SPLUcopyID,"timeout");}, 10000);
    }else{
      SPLUtimeouts[0]=setTimeout(function(){document.getElementById('BRresults').innerHTML=SPLUi18n.StatusTimedOutTryAgain;}, 10000);
    }
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","/geekplay.php",true);
    xmlhttp.onload=function(responseJSON,responseText){
      console.log("onload()");
        clearTimeout(SPLUtimeouts[SPLUcopyID]);
        if(responseJSON===undefined){
          document.getElementById('BRresults').innerHTML=SPLUi18n.StatusErrorTryAgain;
          if(action=="copy"){
            copyPlays(SPLUcopyID,"undefined");
          }
        }
        tmpJSON=JSON.parse(responseJSON.target.response);
        document.getElementById('BRresults').innerHTML=tmpJSON.html;
        if(SPLU.Settings.FetchPlayCount.Enabled) {
          document.getElementById("SPLU.GameCountStatus").innerHTML=`Your plays: ${tmpJSON.numplays}`;
        }
        window.resJ=responseJSON;
        window.resT=responseText;
        console.log(responseText);
        if(tmpJSON.playid!==undefined){
          SPLUlastGameSaved=tmpJSON.playid;
          insertBlank('BRresults');
          tmpType="";
          if(tmpJSON.html.includes("/thing/")){
            tmpType="thing";
          } else if(tmpJSON.html.includes("/family/")){
            tmpType="family";
          }
          if(SPLUedit.submit){
            fetchPlays(LoggedInAs,0,false,SPLUedit.objectid,SPLUedit.playdate,-1,tmpType);
            SPLUedit.submit=false;
          }
          if(action=="copy"){
            copyPlays(SPLUcopyID,200);
          } else {
            saveExpansionPlays(action);
          }
        } else {
          if(action=="copy"){
            copyPlays(SPLUcopyID,responseJSON.target.status);
          }
        }
    };
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("Accept","application/json, text/plain, */*");/**/
    xmlhttp.send('ajax=1&action=save&version=2'+tmpID+querystring);
  }
  
  function saveGamePlay2(action){
    if(action=="dupe"){
      var form=document.forms['SPLUform'];
      var inputs=form.getElementsByTagName('input');
      for(n=0; n<inputs.length; n++){
        if(inputs[n].name.slice(-6)=="[name]"&&SPLU.Settings.PlayerNameColumn.Reset){inputs[n].value="";}
        if(inputs[n].name.slice(-6)=="rname]"&&SPLU.Settings.PlayerUsernameColumn.Reset){inputs[n].value="";}
        if(inputs[n].name.slice(-6)=="color]"&&SPLU.Settings.PlayerColorColumn.Reset){inputs[n].value="";}
        if(inputs[n].name.slice(-6)=="score]"&&SPLU.Settings.PlayerScoreColumn.Reset){inputs[n].value="";}
        if(inputs[n].name.slice(-6)=="ition]"&&SPLU.Settings.PlayerPositionColumn.Reset){inputs[n].value="";}
        if(inputs[n].name.slice(-6)=="ating]"&&SPLU.Settings.PlayerRatingColumn.Reset){inputs[n].value="";}
        if(inputs[n].name.slice(-6)=="][new]"&&SPLU.Settings.PlayerNewColumn.Reset){inputs[n].checked=false;}
        if(inputs[n].name.slice(-6)=="][win]"&&SPLU.Settings.PlayerWinColumn.Reset){inputs[n].checked=false;}
      }
      if(SPLU.Settings.LocationField.Reset){document.getElementById('SPLU_PlayedAt').value=decodeURIComponent(SPLU.Locations[SPLU.Settings.DefaultLocation.Name].Name);}
      if(SPLU.Settings.LocationList.Reset && SPLU.Settings.LocationList.Visible){
        document.getElementById('SPLU.LocationList').style.display="block";
      } else {
        document.getElementById('SPLU.LocationList').style.display="none";
      }
      if(SPLU.Settings.QuantityField.Reset){document.getElementById('quickplay_quantity99').value="1";}
      if(SPLU.Settings.DurationField.Reset){document.getElementById('quickplay_duration99').value="";}
      if(SPLU.Settings.IncompleteField.Reset){document.getElementById('incomplete').checked=false;}
      if(SPLU.Settings.NoWinStatsField.Reset){document.getElementById('nowinstats').checked=false;}
      if(SPLU.Settings.CommentsField.Reset){document.getElementById('quickplay_comments99').value="";}
      if(SPLU.Settings.TwitterField.Reset){document.getElementById("twitter").checked=SPLU.Settings.TwitterField.Enabled;setTwitterIcons();}
    }
    if(action=="none"||action=="delete"){
      clearForm("reset");
    }
  }

  function clearForm(action){
    while(document.getElementsByClassName('SPLUrows').length>0){
      removePlayerRow(document.getElementsByClassName('SPLUrows')[0].parentNode.id.slice(14));
    }
    document.getElementById('SPLU_PlayedAt').value="";
    if(SPLU.Settings.LocationList.Visible&&!LocationList){
      showHideLocations(false);
    }
    if(SPLU.Settings.PlayerList.Visible&&!PlayerList){
      showHidePlayers(false,"reset");
    }
    document.getElementById('quickplay_comments99').value="";
    document.getElementById('quickplay_quantity99').value="1";
    document.getElementById('quickplay_duration99').value="";
    document.getElementById('incomplete').checked=false;
    document.getElementById('nowinstats').checked=false;
    document.getElementById('SPLU.GameCountStatus').innerHTML="";
    NumOfPlayers=0;
    PlayerCount=0;
    setPlayers(action);
    setLocation(action);
    showHideEditButtons("hide");
    if(SPLU.Settings.DateField.Reset){setDateField(SPLUtoday);}
    if(SPLU.Settings.GameField.Reset){clearSearchResult();}
    document.getElementById("twitter").checked=SPLU.Settings.TwitterField.Enabled;
    setTwitterIcons();
    //Don't do this or it clears the submit details.
    //VoidInstantSearch({itemid:'9999',uniqueid:'546e9ffd96dfc'});
    var tmpExp=document.getElementsByClassName('BRexpLogBox');
    for(i=0;i<tmpExp.length;i++){
      tmpExp[i].checked=false;
    }
    highlightDayButton();
    SPLUcurrentPlayShown="";
    SPLUprevGameID=0;
    SPLUgameID=0;
  }
  
  function setDateField(date){
    console.log("setDateField("+date+")");
    document.getElementById('SPLUplayDateInput').value=date;
    console.log("Run parseDate() from setDateField()");
    parseDate(document.getElementById('SPLUplayDateInput'),document.getElementById('playdate99'),document.getElementById('playdatestatus99'));
    //SPLUcalendar.setDate(new Date(Date.parse(document.getElementById('SPLUplayDateInput').value)));
    // Commenting out the following line to prevent the date picker from highlighting the wrong day and setting the date to the same wrong day.  SPLU seems to work without this...
    // Adding it back as it causes some issues with the calendar popping up when it shouldn't.
    // if(!IncompatiblePage){
      // SPLUcalendar.setDate(document.getElementById('SPLUplayDateInput').value);
    // }
  }

  function addCalendar(){
    var piki18n= {
      previousMonth	: SPLUi18n.CalendarPreviousMonth,
      nextMonth	: SPLUi18n.CalendarNextMonth,
      months		: [SPLUi18n.CalendarJanuary,SPLUi18n.CalendarFebruary,SPLUi18n.CalendarMarch,SPLUi18n.CalendarApril,SPLUi18n.CalendarMay,SPLUi18n.CalendarJune,SPLUi18n.CalendarJuly,SPLUi18n.CalendarAugust,SPLUi18n.CalendarSeptember,SPLUi18n.CalendarOctober,SPLUi18n.CalendarNovember,SPLUi18n.CalendarDecember],
      weekdays	: [SPLUi18n.CalendarSunday,SPLUi18n.CalendarMonday,SPLUi18n.CalendarTuesday,SPLUi18n.CalendarWednesday,SPLUi18n.CalendarThursday,SPLUi18n.CalendarFriday,SPLUi18n.CalendarSaturday],
      weekdaysShort	: [SPLUi18n.CalendarSun,SPLUi18n.CalendarMon, SPLUi18n.CalendarTue,SPLUi18n.CalendarWed,SPLUi18n.CalendarThu,SPLUi18n.CalendarFri,SPLUi18n.CalendarSat]
    };
    SPLUcalendar = new Pikaday(
      {
          field: document.getElementById('SPLUplayDateInput'),
          trigger: document.getElementById('SPLUdatePickerTrigger'),
          firstDay: 0,
          yearRange: 5,
          i18n: piki18n,
          onSelect: function() {
              parseDate(document.getElementById('SPLUplayDateInput'),document.getElementById('playdate99'),document.getElementById('playdatestatus99'));
          }
      });
  }


  function isValidDate(dateString) {
    //From https://stackoverflow.com/questions/18758772/how-do-i-validate-a-date-in-this-format-yyyy-mm-dd-using-jquery
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    var d = new Date(dateString);
    var dNum = d.getTime();
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0,10) === dateString;
  }
  

  function parseDate(src,dst,status){
    console.log("parseDate(", src, dst, status, ")");
    window.tmpsrc=src;
    window.tmpdst=dst;
    window.tmpstatus=status;
    tmpDate=src.value;
    if (isValidDate(tmpDate)){
      console.log("parseDate() - valid date format: "+tmpDate);
      //dst.value=tmpDate.toString("yyyy-MM-dd");
      dst.value=tmpDate;
      //status.innerHTML="<img src='//cf.geekdo-static.com/images/icons/silkicons/accept.png' style='position:relative; top:3px;'> "+tmpDate.toString("yyyy-MM-dd");
      status.innerHTML="<img src='//cf.geekdo-static.com/images/icons/silkicons/accept.png' style='position:relative; top:-3px;'> "+tmpDate;
      highlightDayButton();
    }else{
      console.log("parseDate() - invalid date format: "+tmpDate);
      // //Try reformatting it
      // var tmpRefDate = new Date(tmpDate);
      // //var tmpRefDateString = new Date(tmpRefDate.getTime() - (tmpRefDate.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
      // var tmpRefDateString = new Date(tmpRefDate.setMinutes(tmpRefDate.getMinutes()-tmpRefDate.getTimezoneOffset() )).toISOString().split("T")[0];
      // //new Date(tmp.setMinutes(tmp.getMinutes()-tmp.getTimezoneOffset()));
      // console.log("reformatted: "+tmpRefDateString);
      // if (isValidDate(tmpRefDateString)){
        // dst.value=tmpRefDateString;
        // src.value=tmpRefDateString;
        // status.innerHTML="<img src='//cf.geekdo-static.com/images/icons/silkicons/accept.png' style='position:relative; top:-3px;'> "+tmpRefDateString;
        // highlightDayButton();
      // }
      //Check if it's still invalid:
      tmpDate=src.value;
      if (!isValidDate(tmpDate)){
        console.log("parseDate() - Still invalid: "+tmpDate);
        if (src.value.length){
          dst.value='';status.innerHTML="<img src='//cf.geekdo-static.com/images/icons/silkicons/delete.png' style='position:relative; top:3px;'> "+SPLUi18n.CalendarInvalidDate;
        }else{
          dst.value='';
          status.innerHTML='';
        }
      }
    }
  }

  // //BGG's original parseDate() function (modified a bit)
  // function parseDate(src,dst,status){
    // console.log("parseDate(", src, dst, status, ")");
    // window.tmpsrc=src;
    // window.tmpdst=dst;
    // window.tmpstatus=status;
    // //date=Date.parse(src.value);
    // date=src.value;
    // if(date){
      // //dst.value=date.toString("yyyy-MM-dd");
      // dst.value=date;
      // //status.innerHTML="<img src='//cf.geekdo-static.com/images/icons/silkicons/accept.png' style='position:relative; top:3px;'> "+date.toString("yyyy-MM-dd");
      // status.innerHTML="<img src='//cf.geekdo-static.com/images/icons/silkicons/accept.png' style='position:relative; top:-3px;'> "+date;
    // }else{
      // if(src.get('value').length){
        // dst.value='';status.innerHTML="<img src='//cf.geekdo-static.com/images/icons/silkicons/delete.png' style='position:relative; top:3px;'> "+SPLUi18n.CalendarInvalidDate;
      // }else{
        // dst.value='';
        // status.innerHTML='';
      // }
    // }
    // highlightDayButton();
  // }
  
  function eventPlaysPlayerEnter(e){
    console.log("eventPlaysPlayerEnter()");
    if(e.keyCode === 13){
      //getRecentPlays(false);
      fetchUserID(document.getElementById("SPLU.PlaysLogger").value);
    }
    return false;
  }

  function fetchUserID(username) {
    console.log("fetchUserID("+username+")");
    if(username==-1){
      username=document.getElementById("SPLU.PlaysLogger").value;
    }
    var oReq=new XMLHttpRequest();
    var getString="/geekplay.php?action=searchplayersandusers&ajax=1&q="+encodeURIComponent(username)+"&showcount=10"
    oReq.onload=function(responseJSON){
      console.log(responseJSON.target.status+"|"+responseJSON.target.statusText);
      if(responseJSON.target.status==200){
        console.log("result 200 when fetching UserID");
        var tmpUsers=JSON.parse(this.response);
        getRecentPlays(false, tmpUsers[0].userid);
      }else{
        console.log("other status code, no fetchUserID");
      }
    };
    oReq.open("get",getString,true);
    oReq.setRequestHeader("Accept","application/json, text/plain, */*");/**/
    oReq.send();
  }
  
  function getGamePlays(){
    console.log("getGamePlays()");
    if(SPLUgameID!=0){
      player=document.getElementById("SPLU.PlaysLogger").value;
      removePlaysFilters("gamename");
      window.setTimeout(function(){addPlaysFilter("gamename","="+document.getElementById('q546e9ffd96dfc').value);},500);
      fetchPlays(player,1,true,SPLUgameID,0,-1,"thing");
    }
  }
  
  function getRecentPlays(multiple, userid){
    console.log("getRecentPlays("+multiple+", "+userid+")");
    document.getElementById("SPLU.PlaysPlayers").style.display="none";
    tmpUser=document.getElementById("SPLU.PlaysLogger").value;
    if(SPLUplayFetch[tmpUser]===undefined){
      SPLUplayFetch[tmpUser]=[];
    }
    SPLUplayFetch[tmpUser][1]=0;
    fetchPlays(tmpUser, 1, multiple,0,0,userid,"thing"); 
  }
  
  function fetchPlays(player,page,multiple,gameid,date,userid,objecttype){
    console.log("fetchPlays("+player+", "+page+", "+multiple+", "+gameid+", "+date+", "+userid+", "+objecttype+")");
    var getString="";
    if(page>0){
      var tmpFetch=SPLUi18n.StatusFetchingPageOf.replace("$1", page);
      document.getElementById('SPLU.PlaysStatus').innerHTML="";
      var tmpFirstFetch=1;
      if(SPLUplayData[player]===undefined){
        document.getElementById('SPLU.PlaysStatus').innerHTML+=tmpFetch.replace("$2", "??");;
      } else {
        tmpFirstFetch=0;
        if(gameid==0){
          document.getElementById('SPLU.PlaysStatus').innerHTML+=tmpFetch.replace("$2", Math.ceil(SPLUplayData[player]["total"]/100));
        } else {
          if(SPLUplayData[player]["game"]===undefined){
            SPLUplayData[player]["game"]={};
          }
          if(SPLUplayData[player]["game"][gameid]===undefined){
            SPLUplayData[player]["game"][gameid]={};
          }
          document.getElementById('SPLU.PlaysStatus').innerHTML+=tmpFetch.replace("$2", Math.ceil(SPLUplayData[player]["game"][gameid]["total"]/100));
        }
      }
      //getString="/xmlapi2/plays?username="+player+"&page="+page;
      // For searching for another user I need to replace currentuser=true with userid=###
      if(userid==-1) {
        if(tmpFirstFetch){
          getString="/geekplay.php?action=getplays&ajax=1&currentUser=true&objecttype=thing&pageID="+page;
        } else {
          getString="/geekplay.php?action=getplays&ajax=1&userid="+SPLUplayData[player].userid+"&objecttype=thing&pageID="+page;
        }
      }else{
        getString="/geekplay.php?action=getplays&ajax=1&userid="+userid+"&objecttype=thing&pageID="+page;
      }
      if(gameid!=0){
        getString+="&objectid="+gameid;
        if(page==1 && multiple==true){
          SPLUplayFetch[player]=[];
          console.log("Reset SPLUplayFetch[player] to []");
        }
      }
    }else{
      document.getElementById('SPLU.PlaysStatus').innerHTML=SPLUi18n.StatusFetchingPlaysFromDate+" "+date;
      page=1;
      // getString="/xmlapi2/plays?username="+player+"&id="+gameid+"&mindate="+date+"&maxdate="+date;
      // getString="/geekplay.php?action=getplays&ajax=1&userid="+playerid+"&objectid="+gameid+"&mindate="+date+"&maxdate="+date;
      getString="/geekplay.php?action=getplays&ajax=1&currentUser=true&objectid="+gameid+"&objecttype="+objecttype;
    }
    var tmpTime=new Date;
    getString+="&tstamp="+tmpTime.getTime();
    SPLUplaysPage=page;
    if(SPLUplays[player]===undefined){
      SPLUplays[player]={};
    }
    SPLUplayFetch[player][page]--;
    var oReq=new XMLHttpRequest();
    oReq.onload=function(responseJSON){
      console.log(responseJSON.target.status+"|"+responseJSON.target.statusText);
      if(responseJSON.target.status==200){
        console.log("result 200 on page "+SPLUplaysPage);
        window.tmpresponse=this;
        //SPLUplays[player][page]=this.responseXML;
        SPLUplays[player][page]=JSON.parse(this.response);
        parsePlays(player,page,multiple,gameid,date, userid);
      }else{
        console.log("other status code, no fetchPlays");
      }
    };
    oReq.open("get",getString,true);
    oReq.setRequestHeader("Accept","application/json, text/plain, */*");/**/
    oReq.send();
  }
  
  function downloadPlaysJSON() {
    // ##Fix Me## - convert to JSON
    player=document.getElementById("SPLU.PlaysLogger").value;
    console.log("Making text file for download.");
    // filename=player+"-PlaysBackup.txt";
    // textXML="";
    // for(var tmpkey in SPLUplays[player]){
      // textXML+=new XMLSerializer().serializeToString(SPLUplays[player][tmpkey]);
    // }
    filename=player+"-PlaysBackup.json.txt";
    textJSON=JSON.stringify(SPLUplayData[player]);
    //From Stackoverflow
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textJSON));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  
  function getAllPlays(player,gameid){
    console.log("getAllPlays("+player+","+gameid+")");
      if(gameid==0){
       if(Math.ceil(SPLUplayData[player]["total"]/100)>(SPLUplayFetch[player].length-1)){
        for(i=1;i<=Math.ceil(SPLUplayData[player]["total"]/100);i++){
          if(SPLUplayFetch[player][i]===undefined){
            SPLUplayFetch[player][i]=0;
          }
        }
      }
    } else {
      if(Math.ceil(SPLUplayData[player]["game"][gameid]["total"]/100)>(SPLUplayFetch[player].length-1)){
        for(i=1;i<=Math.ceil(SPLUplayData[player]["game"][gameid]["total"]/100);i++){
          if(SPLUplayFetch[player][i]===undefined){
            SPLUplayFetch[player][i]=0;
          }
        }
      }

    }
    if(SPLUplayFetchFail<5){
      for(i=1;i<SPLUplayFetch[player].length;i++){
        console.log("-- SPLUplayFetch[player].length="+SPLUplayFetch[player].length);
        if(SPLUplayFetch[player][i]<0){
          SPLUplayFetch[player][i]--;
        }
        if(SPLUplayFetch[player][i]<-4){
          SPLUplayFetchFail++;
          SPLUplayFetch[player][i]=0;
        }
        if(SPLUplayFetch[player][i]==0){
          SPLUplayFetch[player][i]=-1;
          window.setTimeout(function(){fetchPlays(player,i,true,gameid,0,-1,"thing");},2500);
          break;
        }
      }
    }else{
      console.log("Failed to fetch "+SPLUplayFetchFail+" pages");
    }
    tmpStatus=1;
    for(i=1;i<SPLUplayFetch[player].length;i++){
      if(SPLUplayFetch[player][i]!=1){
        tmpStatus=0;
        break;
      }
    }
    if(tmpStatus==1){
      loadPlays(player,false);
      SPLUplayFetch[player]=[];
    }else{
      console.log("Still Fetching");
    }
  }
  
  function parsePlays(player,page,multiple,gameid,date, userid){
    console.log("parsePlays("+player+","+page+","+multiple+","+gameid+","+date+")");
    SPLUplayFetch[player][page]=1;
    if(SPLUplayData[player]===undefined){
      SPLUplayData[player]={};
    }
    if(userid!=-1){
      SPLUplayData[player]["userid"]=userid;
    }
    //if(SPLUplays[player][1].getElementsByTagName("plays")[0]===undefined){
    // This doesn't really make sense as fetching data for a single game can reset this total.  Though the new API returns eventcount=0 whereas the old API didn't return any XML so I had to check for undefined previously.
    if(SPLUplays[player][1].eventcount=="0"){
      SPLUplayData[player]["total"]=0;
      multiple=false;
    }else{
      if(gameid==0&&date==0){
        //SPLUplayData[player]["total"]=SPLUplays[player][page].getElementsByTagName("plays")[0].getAttribute("total");
        SPLUplayData[player]["total"]=SPLUplays[player][page].eventcount;
        SPLUplayData[player]["approximate"]=0;
      }else{
        if(SPLUplayData[player]["game"]===undefined){
          SPLUplayData[player]["game"]={};
        }
        if(SPLUplayData[player]["game"][gameid]===undefined){
          SPLUplayData[player]["game"][gameid]={};
        }
        //SPLUplayData[player]["game"][gameid]["total"]=SPLUplays[player][page].getElementsByTagName("plays")[0].getAttribute("total");
        SPLUplayData[player]["game"][gameid]["total"]=SPLUplays[player][page].eventcount;
        SPLUplayData[player]["approximate"]=1;
      }
    }
    //for(i=0;i<SPLUplays[player][page].getElementsByTagName("play").length;i++){
    //  SPLUplayData[player][SPLUplays[player][page].getElementsByTagName("play")[i].id]=SPLUplays[player][page].getElementsByTagName("play")[i];
    //}
    for(i=0;i<SPLUplays[player][page].plays.length;i++){
      SPLUplayData[player][SPLUplays[player][page].plays[i].playid]=SPLUplays[player][page].plays[i];
    }
    // if(SPLUplays[player][page].getElementsByTagName("plays")[0].getAttribute("total")==0 && Object.keys(SPLUplayData[player]).length>2){
      // BGG is returning the wrong total
      // SPLUplayData[player]["total"]=Object.keys(SPLUplayData[player]).length;
      // SPLUplayData[player]["approximate"]=1;
    // }
    
    //Do I still need to do this?
    if(SPLUplays[player][page].eventcount==0 && Object.keys(SPLUplayData[player]).length>2){
      //BGG is returning the wrong total
      SPLUplayData[player]["total"]=Object.keys(SPLUplayData[player]).length;
      SPLUplayData[player]["approximate"]=1;
    }
    if(!multiple){
      if(player==document.getElementById("SPLU.PlaysLogger").value){
        loadPlays(player,false);
      }
    }else{
      getAllPlays(player,gameid);
    }
  }

  function loadPlays(tmpUser,copyMode){
    document.getElementById("SPLU.PlaysPlayers").style.display="none";
    console.log("loadPlays("+tmpUser+")");
    SPLUcopySelectedAll=false;
    document.getElementById('CopyPlaysSelectAllBtn').style.display="";
    document.getElementById('CopyPlaysDeselectAllBtn').style.display="none";
    if(SPLUplayData[tmpUser]["total"]==0){
      document.getElementById('SPLU.PlaysStatus').innerHTML='<div>'+SPLUi18n.StatusNoPlaysFound+'</div>';
      document.getElementById('SPLU.PlaysList').innerHTML='';
      document.getElementById('SPLU.PlaysMenu').style.display='none';
    }else{
      document.getElementById('SPLU.PlaysMenu').style.display='';
      if(tmpUser!=LoggedInAs){
        document.getElementById('SPLUcopyModeIconBtn').style.display="inline";
        SPLUcopyContinue=true;
        if(copyMode){
          showPlaysTab("copymode");
        } else {
          showPlaysTab("same");
        }
      } else {
        document.getElementById('SPLUcopyModeIconBtn').style.display="none";
        document.getElementById('SPLUcopyPlaysDiv').style.display="none";
        copyMode=false;
        showPlaysTab("same");
      }
      var tmpHTML="";
      SPLUlistOfPlays=[];
      tmpHTML='<div id="SPLU.PlaysTable" style="display:table;">';
      for(key in SPLUplayData[tmpUser]){
        //if(key=="total"||key=="approximate"||key=="game"||SPLUplayData[tmpUser][key].attributes.date.value=="1452-04-15"){
        if(key=="total"||key=="approximate"||key=="game"||key=="userid"||SPLUplayData[tmpUser][key].playdate=="1452-04-15"){
          continue;
        }
        //SPLUlistOfPlays.push({id:key,date:SPLUplayData[tmpUser][key].attributes.date.value});
        SPLUlistOfPlays.push({id:key,date:SPLUplayData[tmpUser][key].playdate});
      }
      SPLUlistOfPlays.sort(dynamicSortMultiple("-date", "-id"));
      SPLUlistOfPlays=filterPlays(SPLUlistOfPlays,tmpUser);
      
      if(SPLUplaysListTab=="filters"){
        showPlaysListData(tmpUser,false);
      }else if(SPLUplaysListTab=="copymode"){
        showPlaysListData(tmpUser,true);
      }else if(SPLUplaysListTab=="stats"){
        loadStats("choose");
      }
      var tmpCount=(Object.keys(SPLUplayData[tmpUser]).length)-3;
      var tmpLoaded=SPLUi18n.PlaysLoaded.replace("$1", tmpCount);
      tmpLoaded=tmpLoaded.replace("$2", SPLUplayData[tmpUser]["total"]);
      tmpHTML='<div><div>'+tmpLoaded;
      if(SPLUplayData[tmpUser]["approximate"]==1){
        tmpHTML+='*';
      }
      if(SPLUplayData[tmpUser]["total"]>(Object.keys(SPLUplayData[tmpUser]).length)-1){
        tmpCount=(Math.floor(tmpCount/100))+1;
        tmpHTML+='<a href="javascript:{void(0);}" onClick="javascript:{fetchPlays(\''+tmpUser+'\','+tmpCount+',false,0,0,-1,\'thing\');}"> - '+SPLUi18n.PlaysLoadNext+' 100</a>';
        document.getElementById('SPLU.GetNextText').innerHTML='<a href="javascript:{void(0);}" onClick="javascript:{fetchPlays(\''+tmpUser+'\','+tmpCount+',false,0,0,-1,\'thing\');}">'+SPLUi18n.PlaysGetNext+' 100</a>';
      }
      tmpHTML+='</div>';
      document.getElementById("SPLU.PlaysFiltersStatus").innerHTML='<div>'+SPLUi18n.PlaysShowing+' '+SPLUlistOfPlays.length+'</div>';
      tmpHTML+='</div>';
      document.getElementById('SPLU.PlaysStatus').innerHTML=tmpHTML;
    }
  }

  function showPlaysListData(tmpUser,copyMode){
    console.log("showPlaysListData("+tmpUser+")");
    if(SPLUplayData[tmpUser]["total"]==0){
      document.getElementById('SPLU.PlaysStatus').innerHTML='<div>'+SPLUi18n.StatusNoPlaysFound+'</div>';
      document.getElementById('SPLU.PlaysList').innerHTML='';
    }else{
      if(copyMode){
        showPlaysTab('copymode');
        SPLUcopyMode=true;
      } else {
        showPlaysTab('filters');
        SPLUcopyMode=false;
      }
      var tmpHTML="";
      //Temp warning message about the data not being live.
      //tmpHTML+='<div id="SPLU.PlaysWarning" style="color:red; border-bottom:1px solid black; padding:2px; margin-bottom:5px;">Note: Play history may not show recent changes. <a target="_blank" href="https://boardgamegeek.com/article/30900564#30900564">See this post.</a></div>';
      var tmpSortCount=0;
      var tmpLines=document.getElementsByName("SPLU.PlaysFiltersLine").length;
      for(i=0;i<SPLUlistOfPlays.length;i++){
        if(SPLUlistOfPlays[i].matches==tmpLines){
          tmpSortCount++;
          tmpPlayId=SPLUlistOfPlays[i]["id"];
          //tmpPlayDate=SPLUplayData[tmpUser][tmpPlayId].attributes.date.value;
          tmpPlayDate=SPLUplayData[tmpUser][tmpPlayId].playdate;
          //tmpPlayGame=SPLUplayData[tmpUser][tmpPlayId].getElementsByTagName("item")[0].attributes.name.value;
          tmpPlayGame=SPLUplayData[tmpUser][tmpPlayId].name;
          tmpDecoration="";
          tmpDecoration2="";
          if(SPLUplayData[tmpUser][tmpPlayId].deleted){
            tmpDecoration="text-decoration:line-through;";
          }
          if(SPLUlastGameSaved==tmpPlayId){
            tmpDecoration2+="border:2px dotted purple;";
          }
          if(SPLUcurrentPlayShown==tmpPlayId){
            tmpDecoration+="background-color:rgb(248, 223, 36);";
          }
          tmpCopyDiv='';
          if(copyMode){
            tmpCopyDiv='<div id="SPLUcopyID-'+tmpPlayId+'" style="display:table-cell;"><input type="checkbox" name="SPLUcopyBox" data-SPLUcopyBox="'+tmpPlayId+'"/></div>';
          }
          tmpHTML+='<div id="SPLU.Plays-'+tmpPlayId+'" style="display:table-row;'+tmpDecoration+'">'+tmpCopyDiv+'<div style="display:table-cell;'+tmpDecoration2+'">'+tmpPlayDate+' - <a href="javascript:{void(0);}" onClick="javascript:{loadPlay('+tmpPlayId+');}">'+tmpPlayGame+'</a></div></div>';
        }
      }
      tmpHTML+='</div>';
      document.getElementById('SPLU.PlaysList').innerHTML=tmpHTML;
    }
  }
  
  function filterPlays(plays,user){
    for(i=0;i<plays.length;i++){
      plays[i].matches=0;
    }
    var lines=document.getElementsByName("SPLU.PlaysFiltersLine");
    for(l=0;l<lines.length;l++){
      var filtertype=lines[l].getAttribute("data-SPLU-filtertype");
      if(filtertype=="gamename"){
        for(i=0;i<plays.length;i++){
          if(lines[l].value.slice(0,2)=="!="){
            if(SPLUplayData[user][plays[i].id].name!=lines[l].value.slice(2)){
              plays[i].matches++;
            }
          } else if(lines[l].value.slice(0,1)=="!"){
            if(SPLUplayData[user][plays[i].id].name.toLowerCase().indexOf(lines[l].value.slice(1).toLowerCase())==-1){
              plays[i].matches++;
            }
          } else if(lines[l].value.slice(0,1)=="="){
            if(SPLUplayData[user][plays[i].id].name==lines[l].value.slice(1)){
              plays[i].matches++;
            }
          } else if(SPLUplayData[user][plays[i].id].name.toLowerCase().indexOf(lines[l].value.toLowerCase())>-1){
              plays[i].matches++;
          }
        }
      }
      if(filtertype=="location"){
        for(i=0;i<plays.length;i++){
          if(lines[l].value.slice(0,2)=="!="){
            if(SPLUplayData[user][plays[i].id].location!=lines[l].value.slice(2)){
              plays[i].matches++;
            }
          } else if(lines[l].value.slice(0,1)=="!"){
            if((SPLUplayData[user][plays[i].id].location.toLowerCase().indexOf(lines[l].value.slice(1).toLowerCase())==-1) || SPLUplayData[user][plays[i].id].location==""){
              plays[i].matches++;
            }
          } else if(lines[l].value.slice(0,1)=="="){
            if(SPLUplayData[user][plays[i].id].location==lines[l].value.slice(1)){
              plays[i].matches++;
            }
          } else if(SPLUplayData[user][plays[i].id].location.toLowerCase().indexOf(lines[l].value.toLowerCase())>-1){
            plays[i].matches++;
          }
        }
      }
      if(filtertype=="comments"){
        for(i=0;i<plays.length;i++){
          if(SPLUplayData[user][plays[i].id].comments.value.length>0){
            if(lines[l].value.slice(0,1)=="!"){
              if(SPLUplayData[user][plays[i].id].comments.value.toLowerCase().indexOf(lines[l].value.slice(1).toLowerCase())==-1){
                plays[i].matches++;
              }
            } else if(SPLUplayData[user][plays[i].id].comments.value.toLowerCase().indexOf(lines[l].value.toLowerCase())>-1){
                plays[i].matches++;
            }
          }else if(lines[l].value.slice(0,1)=="!" && lines[l].value.length==1){
            plays[i].matches++;
          }
        }
      }

      if(filtertype=="playername"){
        console.log("filter: playername");
        for(i=0;i<plays.length;i++){
          if(SPLUplayData[user][plays[i].id].players.length>0){
            var tmpPlayers=SPLUplayData[user][plays[i].id].players;
            if(lines[l].value.slice(0,2)=="!="){
              var tmpMatch=0;
              for(p=0;p<tmpPlayers.length;p++){
                if(tmpPlayers[p].name==lines[l].value.slice(2)){
                  tmpMatch++;
                }
              }
              if(tmpMatch==0){
                plays[i].matches++;
              }
            } else if(lines[l].value.slice(0,1)=="!"){
              plays[i].matches++;
              for(p=0;p<tmpPlayers.length;p++){
                if(tmpPlayers[p].name.toLowerCase().indexOf(lines[l].value.slice(1).toLowerCase())>-1){
                  plays[i].matches--;
                  break;
                }
              }
            } else if(lines[l].value.slice(0,1)=="="){
              for(p=0;p<tmpPlayers.length;p++){
                if(tmpPlayers[p].name==lines[l].value.slice(1)){
                  plays[i].matches++;
                  break;
                }
              }
            } else {
              for(p=0;p<tmpPlayers.length;p++){
                if(tmpPlayers[p].name.toLowerCase().indexOf(lines[l].value.toLowerCase())>-1){
                  plays[i].matches++;
                  break;
                }
              }
            }
          }
        }
      }
      if(filtertype=="username"){
        for(i=0;i<plays.length;i++){
          if(SPLUplayData[user][plays[i].id].players.length>0){
            tmpPlayers=SPLUplayData[user][plays[i].id].players;
            //window.tmpPlyrs=tmpPlayers;
            if(lines[l].value.slice(0,1)=="!"){
              plays[i].matches++;
              for(p=0;p<tmpPlayers.length;p++){
                if(tmpPlayers[p].username!==undefined & tmpPlayers[p].username!==null){
                  if(tmpPlayers[p].username.toLowerCase().indexOf(lines[l].value.slice(1).toLowerCase())>-1){
                    plays[i].matches--;
                    break;
                  }
                }
              }
            } else {
              for(p=0;p<tmpPlayers.length;p++){
                if(tmpPlayers[p].username!==undefined & tmpPlayers[p].username!==null){
                  if(tmpPlayers[p].username.toLowerCase().indexOf(lines[l].value.toLowerCase())>-1){
                    plays[i].matches++;
                    break;
                  }
                }
              }
            }
          }
        }
      }
      if(filtertype=="objecttype"){
        for(i=0;i<plays.length;i++){
          if(SPLUplayData[user][plays[i].id].subtypes.length>0){
            var tmpTypes=SPLUplayData[user][plays[i].id].subtypes;
            for(t=0;t<tmpTypes.length;t++){
              if(tmpTypes[t].subtype.toLowerCase().indexOf(lines[l].value.toLowerCase())>-1){
                plays[i].matches++;
                break;
              }
            }
          }
        }
      }
      if(filtertype=="winner"){
        for(i=0;i<plays.length;i++){
          if(SPLUplayData[user][plays[i].id].players.length>0){
            tmpPlayers=SPLUplayData[user][plays[i].id].players;
            if(lines[l].value.slice(0,2)=="!="){
              plays[i].matches++;
              for(p=0;p<tmpPlayers.length;p++){
                if(tmpPlayers[p].username==null){
                  tmpPlayers[p].username="";
                }
                if(tmpPlayers[p].name==null){
                  tmpPlayers[p].name="";
                }
                if((tmpPlayers[p].username == lines[l].value.slice(2) && tmpPlayers[p].win==1) || (tmpPlayers[p].name == lines[l].value.slice(2) && tmpPlayers[p].win==1)){
                  plays[i].matches--;
                  break;
                }
              }
            } else if(lines[l].value.slice(0,1)=="!"){
              plays[i].matches++;
              for(p=0;p<tmpPlayers.length;p++){
                if(tmpPlayers[p].username==null){
                  tmpPlayers[p].username="";
                }
                if(tmpPlayers[p].name==null){
                  tmpPlayers[p].name="";
                }
                if((tmpPlayers[p].username.toLowerCase().indexOf(lines[l].value.slice(1).toLowerCase())>-1 && tmpPlayers[p].win==1) || (tmpPlayers[p].name.toLowerCase().indexOf(lines[l].value.slice(1).toLowerCase())>-1 && tmpPlayers[p].win==1)){
                  plays[i].matches--;
                  break;
                }
              }
            } else if(lines[l].value.slice(0,1)=="="){
              for(p=0;p<tmpPlayers.length;p++){
                if(tmpPlayers[p].username==null){
                  tmpPlayers[p].username="";
                }
                if(tmpPlayers[p].name==null){
                  tmpPlayers[p].name="";
                }
                if((tmpPlayers[p].username == lines[l].value.slice(1) && tmpPlayers[p].win==1) || (tmpPlayers[p].name == lines[l].value.slice(1) && tmpPlayers[p].win==1)){
                  plays[i].matches++;
                  break;
                }
              }
            } else {
              for(p=0;p<tmpPlayers.length;p++){
                if(tmpPlayers[p].username==null){
                  tmpPlayers[p].username="";
                }
                if(tmpPlayers[p].name==null){
                  tmpPlayers[p].name="";
                }
                if((tmpPlayers[p].username.toLowerCase().indexOf(lines[l].value.toLowerCase())>-1 || tmpPlayers[p].name.toLowerCase().indexOf(lines[l].value.toLowerCase())>-1) && tmpPlayers[p].win==1){
                  plays[i].matches++;
                  break;
                }
              }
            }
          }
        }
      }
      if(filtertype=="new"){
        for(i=0;i<plays.length;i++){
          if(SPLUplayData[user][plays[i].id].players.length>0){
            tmpPlayers=SPLUplayData[user][plays[i].id].players;
            if(lines[l].value.slice(0,1)=="!"){
              plays[i].matches++;
              for(p=0;p<tmpPlayers.length;p++){
                if(tmpPlayers[p].username==null){
                  tmpPlayers[p].username="";
                }
                if(tmpPlayers[p].name==null){
                  tmpPlayers[p].name="";
                }
                if((tmpPlayers[p].username.toLowerCase().indexOf(lines[l].value.slice(1).toLowerCase())>-1 && tmpPlayers[p].new==1)||(tmpPlayers[p].name.toLowerCase().indexOf(lines[l].value.slice(1).toLowerCase())>-1 && tmpPlayers[p].new==1)){
                  plays[i].matches--;
                  break;
                }
              }
            } else {
              for(p=0;p<tmpPlayers.length;p++){
                if(tmpPlayers[p].username==null){
                  tmpPlayers[p].username="";
                }
                if(tmpPlayers[p].name==null){
                  tmpPlayers[p].name="";
                }
                if((tmpPlayers[p].username.toLowerCase().indexOf(lines[l].value.toLowerCase())>-1 || tmpPlayers[p].name.toLowerCase().indexOf(lines[l].value.toLowerCase())>-1) && tmpPlayers[p].new==1){
                  plays[i].matches++;
                  break;
                }
              }
            }
          }
        }
      }
      if(filtertype=="excludeexpansions"){
        for(i=0;i<plays.length;i++){
          if(SPLUplayData[user][plays[i].id].subtypes.length>0){
            var tmpTypes=SPLUplayData[user][plays[i].id].subtypes;
            if(lines[l].value=="excluded"){
              plays[i].matches++;
              for(t=0;t<tmpTypes.length;t++){
                if(tmpTypes[t].subtype.toLowerCase().indexOf("expansion")>-1){
                  plays[i].matches--;
                  break;
                }
              }
            }else if(lines[l].value=="only"){
              plays[i].matches++;
              var tmpCount=0;
              for(t=0;t<tmpTypes.length;t++){
                if(tmpTypes[t].subtype.toLowerCase().indexOf("expansion")>-1){
                  tmpCount++;
                }
              }
              if(tmpCount<=0){
                plays[i].matches--;
              }
            }
          }
        }
      }
      if(filtertype=="excludenowinstats"){
        for(i=0;i<plays.length;i++){
          if(SPLUplayData[user][plays[i].id].nowinstats==0 && lines[l].value=="excluded"){
            plays[i].matches++;
          }
          if(SPLUplayData[user][plays[i].id].nowinstats==1 && lines[l].value=="only"){
            plays[i].matches++;
          }
        }
      }
      if(filtertype=="excludeincomplete"){
        for(i=0;i<plays.length;i++){
          if(SPLUplayData[user][plays[i].id].incomplete==0 && lines[l].value=="excluded"){
            plays[i].matches++;
          }
          if(SPLUplayData[user][plays[i].id].incomplete==1 && lines[l].value=="only"){
            plays[i].matches++;
          }
        }
      }
      if(filtertype=="begindate"){
        var d1 = new Date(lines[l].value);
        if (lines[l].parentNode.children[2].value == "") {
          var d2 = d1;
        } else {
          var d2 = new Date(lines[l].parentNode.children[2].value);
        }
        for(i=0;i<plays.length;i++){
          var d3 = new Date(SPLUplayData[user][plays[i].id].playdate);
          //console.log(d1+"||"+d2+"||"+d3);
          if(d3 >= d1 && d3 <= d2){
            console.log("matches");
            plays[i].matches++;
          }
        }
      }
      if(filtertype=="playercount"){
        for(i=0;i<plays.length;i++){
          var tmpCount=SPLUplayData[user][plays[i].id].players.length;
          if(lines[l].value=="eq"){
            if(tmpCount==lines[l].parentNode.children[2].value){
              plays[i].matches++;
            }
          }
          if(lines[l].value=="lt"){
            if(tmpCount<lines[l].parentNode.children[2].value){
              plays[i].matches++;
            }
          }
          if(lines[l].value=="gt"){
            if(tmpCount>lines[l].parentNode.children[2].value){
              plays[i].matches++;
            }
          }
        }
      }
      if(filtertype=="score"){
        for(i=0;i<plays.length;i++){
          if(SPLUplayData[user][plays[i].id].players.length>0){
            tmpPlayers=SPLUplayData[user][plays[i].id].players;
            for(p=0;p<tmpPlayers.length;p++){
              tmpScore=tmpPlayers[p].score;
              tmpCompare=lines[l].parentNode.children[2].value;
              if(lines[l].value=="eq"){
                if(tmpScore==tmpCompare){
                  plays[i].matches++;
                  break;
                }
              }
              if(lines[l].value=="lt"){
                if(Number(tmpScore)<Number(tmpCompare) && tmpScore!=""){
                  plays[i].matches++;
                  break;
                }
              }
              if(lines[l].value=="gt"){
                if(Number(tmpScore)>Number(tmpCompare)){
                  plays[i].matches++;
                  break;
                }
              }
              if(lines[l].value=="in"){
                if(tmpScore.toLowerCase().indexOf(tmpCompare.toLowerCase())>-1){
                  plays[i].matches++;
                  break;
                }
              }
            }
          }
        }
      }
      if(filtertype=="duration"){
        for(i=0;i<plays.length;i++){
          tmpLength=SPLUplayData[user][plays[i].id].length;
          tmpCompare=lines[l].parentNode.children[2].value;
          if(lines[l].value=="eq"){
            if(tmpLength==tmpCompare){
              plays[i].matches++;
            }
          }
          if(lines[l].value=="lt"){
            if(Number(tmpLength)<Number(tmpCompare) && tmpLength!=""){
              plays[i].matches++;
            }
          }
          if(lines[l].value=="gt"){
            if(Number(tmpLength)>Number(tmpCompare)){
              plays[i].matches++;
            }
          }
          if(lines[l].value=="in"){
            if(tmpLength.toLowerCase().indexOf(tmpCompare.toLowerCase())>-1){
              plays[i].matches++;
            }
          }
        }
      }

    }
    var tmpLines=document.getElementsByName("SPLU.PlaysFiltersLine").length;
    var playskeep=[];
    for(i=0;i<plays.length;i++){
      if(plays[i].matches==tmpLines){
        playskeep.push(plays[i]);
      }
    }
    return playskeep;
  }
  
  function eventFilterLineEnter(e){
    if(e.keyCode === 13){
      loadPlays(document.getElementById('SPLU.PlaysLogger').value,false);
    }
    return false;
  }
  
  function removePlaysFilters(filter){
    //Remove all of the plays filters that match filter
    var list=document.getElementsByName('SPLU.PlaysFiltersLine');
    for(i=list.length-1; i>=0; i--){
      if(list[i].getAttribute('data-splu-filtertype')==filter){
        var parent=list[i].parentNode;
        parent.parentElement.removeChild(parent);
      }
    }
  }
  
  function addPlaysFilter(filter,filterVal){
    // document.getElementById('SPLUfilterDrop').style.display="none";
    hideDropMenus();
    var filterName="";
    if(filter!="add" && filter!="---" && filter!="DEL"){
      SPLUplaysFiltersCount++;
      var tmpHTML='<a href="javascript:{void(0);}" onclick="javascript:{document.getElementById(\'SPLU.PlaysFiltersCurrent\').removeChild(document.getElementById(\'SPLU.playsFiltersLine'+SPLUplaysFiltersCount+'\'));window.setTimeout(function(){loadPlays(document.getElementById(\'SPLU.PlaysLogger\').value,false);addPlaysFilter(\'DEL\',\'\');},25);}" style="color:red;margin:2px;">'
        +'<img src="https://dazeysan.github.io/SPLU/Images/delete_row_small.png">'
        +'</a>';
      if(filter=="playername"){filterName=SPLUi18n.PlaysFilterPlayer;}
      if(filter=="username"){filterName=SPLUi18n.PlaysFilterUsername;}
      if(filter=="gamename"){filterName=SPLUi18n.PlaysFilterGame;}
      if(filter=="location"){filterName=SPLUi18n.PlaysFilterLocation;}
      if(filter=="comments"){filterName=SPLUi18n.PlaysFilterComments;}
      if(filter=="winner"){filterName=SPLUi18n.PlaysFilterWinner;}
      if(filter=="new"){filterName=SPLUi18n.PlaysFilterNew;}
      
      if(filter=="playercount"){
        tmpHTML+=SPLUi18n.PlaysFilterPlayerCount+':<select name="SPLU.PlaysFiltersLine" data-SPLU-FilterType="playercount" onChange="javascript:{loadPlays(document.getElementById(\'SPLU.PlaysLogger\').value,false);}">'
        +'<option value="eq">'+SPLUi18n.PlaysFilterValueExactly+'</option>'
        +'<option value="lt">'+SPLUi18n.PlaysFilterValueLessThan+'</option>'
        +'<option value="gt">'+SPLUi18n.PlaysFilterValueGreaterThan+'</option>'
        +' <input type="text" name="SPLU.PlaysFiltersLine2" data-SPLU-FilterType="playercountvalue" onKeyPress="eventFilterLineEnter(event)" style="width:25px;"/>';
      }
      
      if(filter=="score"){
        var selectedEQ="";
        var selectedLT="";
        var selectedGT="";
        var selectedIN="";
        var scrValue="";
        if(filterVal != ""){
          if(filterVal.substr(0,2) == "eq") {
            selectedEQ="selected";
            scrValue=filterVal.substr(2);
          }else if(filterVal.substr(0,2) == "lt") {
            selectedLT="selected";
            scrValue=filterVal.substr(2);
          }else if(filterVal.substr(0,2) == "gt") {
            selectedGT="selected";
            scrValue=filterVal.substr(2);
          }else if(filterVal.substr(0,2) == "in") {
            selectedIN="selected";
            scrValue=filterVal.substr(2);
          }
        }
        tmpHTML+=SPLUi18n.PlaysFilterScore+':<select name="SPLU.PlaysFiltersLine" data-SPLU-FilterType="score" onChange="javascript:{loadPlays(document.getElementById(\'SPLU.PlaysLogger\').value,false);}">'
        +'<option value="eq" '+selectedEQ+'>'+SPLUi18n.PlaysFilterValueExactly+'</option>'
        +'<option value="lt" '+selectedLT+'>'+SPLUi18n.PlaysFilterValueLessThan+'</option>'
        +'<option value="gt" '+selectedGT+'>'+SPLUi18n.PlaysFilterValueGreaterThan+'</option>'
        +'<option value="in" '+selectedIN+'>'+SPLUi18n.PlaysFilterValueContains+'</option>'
        +' <input type="text" name="SPLU.PlaysFiltersLine2" data-SPLU-FilterType="scorevalue" onKeyPress="eventFilterLineEnter(event)" style="width:25px;" value="'+scrValue+'"/>';
      }

      if(filter=="duration"){
        var selectedEQ="";
        var selectedLT="";
        var selectedGT="";
        var selectedIN="";
        var durValue="";
        if(filterVal != ""){
          if(filterVal.substr(0,2) == "eq") {
            selectedEQ="selected";
            durValue=filterVal.substr(2);
          }else if(filterVal.substr(0,2) == "lt") {
            selectedLT="selected";
            durValue=filterVal.substr(2);
          }else if(filterVal.substr(0,2) == "gt") {
            selectedGT="selected";
            durValue=filterVal.substr(2);
          }else if(filterVal.substr(0,2) == "in") {
            selectedIN="selected";
            durValue=filterVal.substr(2);
          }
        }
        tmpHTML+=SPLUi18n.PlaysFilterDuration+':<select name="SPLU.PlaysFiltersLine" data-SPLU-FilterType="duration" onChange="javascript:{loadPlays(document.getElementById(\'SPLU.PlaysLogger\').value,false);}">'
        +'<option value="eq" '+selectedEQ+'>'+SPLUi18n.PlaysFilterValueExactly+'</option>'
        +'<option value="lt" '+selectedLT+'>'+SPLUi18n.PlaysFilterValueLessThan+'</option>'
        +'<option value="gt" '+selectedGT+'>'+SPLUi18n.PlaysFilterValueGreaterThan+'</option>'
        +'<option value="in" '+selectedIN+'>'+SPLUi18n.PlaysFilterValueContains+'</option>'
        +' <input type="text" name="SPLU.PlaysFiltersLine2" data-SPLU-FilterType="durationvalue" onKeyPress="eventFilterLineEnter(event)" style="width:25px;" value="'+durValue+'"/>';
      }

      if(filter=="daterange"){
        tmpHTML+=SPLUi18n.PlaysFilterDateRangeBegin+':<input type="text" style="font-size:8pt;width:70px;" placeholder="YYYY-MM-DD" name="SPLU.PlaysFiltersLine" data-SPLU-FilterType="begindate" onKeyPress="eventFilterLineEnter(event)"/> '+SPLUi18n.PlaysFilterDateRangeEnd+':<input type="text" style="font-size:8pt;width:70px;" placeholder="YYYY-MM-DD" name="SPLU.PlaysFiltersLine2" data-SPLU-FilterType="enddate" onKeyPress="eventFilterLineEnter(event)"/>';
      }
      
      if(filter=="excludeexpansions"){
        tmpHTML+=SPLUi18n.PlaysFilterExpansions+': <div style="display:inline;cursor:pointer;">'
            +'<div id="SPLUexpansionsFilterButtonExclude" onClick="javascript:{highlightExpansionButton(\'excluded\');}" style="display:inline;border:1.5px solid black;padding:0px 7px 0px 2px;background-color:yellow;">'
              +SPLUi18n.PlaysFilterValueExclude
            +'</div>'
            +'<div id="SPLUexpansionsFilterButtonOnly" onClick="javascript:{highlightExpansionButton(\'only\');}" style="display:inline;border:1.5px solid black;padding:0px 2px 0px 7px;">'
              +SPLUi18n.PlaysFilterValueOnly
            +'</div>'
          +'</div>'
          +'<input id="SPLUexpansionsFilterButtonValue" value="excluded" type="hidden" name="SPLU.PlaysFiltersLine" data-SPLU-FilterType="'+filter+'"/>';
      }
      
      if(filter=="excludenowinstats"){
        tmpHTML+=SPLUi18n.PlaysFilterNoWinStats+': <div style="display:inline;cursor:pointer;">'
            +'<div id="SPLUnowinstatsFilterButtonExclude" onClick="javascript:{highlightNowinstatsButton(\'excluded\');}" style="display:inline;border:1.5px solid black;padding:0px 7px 0px 2px;background-color:yellow;">'
              +SPLUi18n.PlaysFilterValueExclude
            +'</div>'
            +'<div id="SPLUnowinstatsFilterButtonOnly" onClick="javascript:{highlightNowinstatsButton(\'only\');}" style="display:inline;border:1.5px solid black;padding:0px 2px 0px 7px;">'
              +SPLUi18n.PlaysFilterValueOnly
            +'</div>'
          +'</div>'
          +'<input id="SPLUnowinstatsFilterButtonValue" value="excluded" type="hidden" name="SPLU.PlaysFiltersLine" data-SPLU-FilterType="'+filter+'"/>';
      }
      
      if(filter=="excludeincomplete"){
        tmpHTML+=SPLUi18n.PlaysFilterIncomplete+': <div style="display:inline;cursor:pointer;">'
            +'<div id="SPLUincompleteFilterButtonExclude" onClick="javascript:{highlightIncompleteButton(\'excluded\');}" style="display:inline;border:1.5px solid black;padding:0px 7px 0px 2px;background-color:yellow;">'
              +SPLUi18n.PlaysFilterValueExclude
            +'</div>'
            +'<div id="SPLUincompleteFilterButtonOnly" onClick="javascript:{highlightIncompleteButton(\'only\');}" style="display:inline;border:1.5px solid black;padding:0px 2px 0px 7px;">'
              +SPLUi18n.PlaysFilterValueOnly
            +'</div>'
          +'</div>'
          +'<input id="SPLUincompleteFilterButtonValue" value="excluded" type="hidden" name="SPLU.PlaysFiltersLine" data-SPLU-FilterType="'+filter+'"/>';
      }
      
      if(filter=="objecttype"){
        tmpHTML+=SPLUi18n.PlaysFilterGameTypeType+': <div style="display:inline;cursor:pointer;">'
            +'<div id="SPLUtypeFilterButtonBoard" onClick="javascript:{highlightFilterTypeButton(\'boardgame\');}" style="display:inline;border:1.5px solid black;padding:0px 2px;">'
              +'<i style="transform: translate(0px, 0.7px);" class="fa_SP display:block">&#xee01;</i> '+SPLUi18n.PlaysFilterGameTypeBoard
            +'</div>'
            +'<div id="SPLUtypeFilterButtonVideo" onClick="javascript:{highlightFilterTypeButton(\'videogame\');}" style="display:inline;border:1.5px solid black;padding:0px 2px;">'
              +'<i style="transform: translate(0px, 0.3px);" class="fa_SP"></i> '+SPLUi18n.PlaysFilterGameTypeVideo
            +'</div>'
            +'<div id="SPLUtypeFilterButtonRPG" onClick="javascript:{highlightFilterTypeButton(\'rpg\');}" style="display:inline;border:1.5px solid black;padding:0px 2px;">'
              +'<i class="fa_SP">&#xee07;</i> '+SPLUi18n.PlaysFilterGameTypeRPG
            +'</div>'
          +'</div>'
          +'<input id="SPLUtypeFilterButtonValue" value="boardgame" type="hidden" name="SPLU.PlaysFiltersLine" data-SPLU-FilterType="'+filter+'"/>';
      }
      
      if(filter!="objecttype" && filter!="excludeexpansions" && filter!="excludenowinstats" && filter!="excludeincomplete" && filter!="daterange" && filter!="playercount" && filter!="score" && filter!="duration"){
        tmpHTML+=filterName+': <input type="text" name="SPLU.PlaysFiltersLine" data-SPLU-FilterType="'+filter+'" onKeyPress="eventFilterLineEnter(event)" value="'+decodeURIComponent(filterVal)+'"/>'; 
      }  
      
      var tmpDiv=document.createElement('div');
      tmpDiv.id="SPLU.playsFiltersLine"+SPLUplaysFiltersCount;
      tmpDiv.setAttribute("style","padding-top:2px;");
      tmpDiv.innerHTML=tmpHTML;
      document.getElementById("SPLU.PlaysFiltersCurrent").appendChild(tmpDiv);
    }
    //document.getElementById("SPLU.SelectPlaysFilter").value="add";
    if(document.getElementsByName("SPLU.PlaysFiltersLine").length==0){
      document.getElementById("SPLU.PlaysFiltersGoBtn").style.display="none";
    }else{
      document.getElementById("SPLU.PlaysFiltersGoBtn").style.display="";
    }
    if(filter=="excludeexpansions" || filter=="excludenowinstats" || filter=="excludeincomplete" || filterVal!=""){
      loadPlays(document.getElementById('SPLU.PlaysLogger').value,false);
    }
  }
  
  function highlightFilterTypeButton(type){
    buttonBoard=document.getElementById('SPLUtypeFilterButtonBoard');
    buttonVideo=document.getElementById('SPLUtypeFilterButtonVideo');
    buttonRPG=document.getElementById('SPLUtypeFilterButtonRPG');
    buttonBoard.style.backgroundColor="";
    buttonVideo.style.backgroundColor="";
    buttonRPG.style.backgroundColor="";
    if(type=="boardgame"){
      buttonBoard.style.backgroundColor="yellow";
    }
    if(type=="videogame"){
      buttonVideo.style.backgroundColor="yellow";
    }
    if(type=="rpg"){
      buttonRPG.style.backgroundColor="yellow";
    }
    document.getElementById('SPLUtypeFilterButtonValue').value=type;
    loadPlays(document.getElementById('SPLU.PlaysLogger').value,false);
  }

  function highlightExpansionButton(option){
    buttonExclude=document.getElementById('SPLUexpansionsFilterButtonExclude');
    buttonOnly=document.getElementById('SPLUexpansionsFilterButtonOnly');
    buttonExclude.style.backgroundColor="";
    buttonOnly.style.backgroundColor="";
    if(option=="excluded"){
      buttonExclude.style.backgroundColor="yellow";
    }
    if(option=="only"){
      buttonOnly.style.backgroundColor="yellow";
    }
    document.getElementById('SPLUexpansionsFilterButtonValue').value=option;
    loadPlays(document.getElementById('SPLU.PlaysLogger').value,false);
  }

    function highlightNowinstatsButton(option){
    buttonExclude=document.getElementById('SPLUnowinstatsFilterButtonExclude');
    buttonOnly=document.getElementById('SPLUnowinstatsFilterButtonOnly');
    buttonExclude.style.backgroundColor="";
    buttonOnly.style.backgroundColor="";
    if(option=="excluded"){
      buttonExclude.style.backgroundColor="yellow";
    }
    if(option=="only"){
      buttonOnly.style.backgroundColor="yellow";
    }
    document.getElementById('SPLUnowinstatsFilterButtonValue').value=option;
    loadPlays(document.getElementById('SPLU.PlaysLogger').value,false);
  }

    function highlightIncompleteButton(option){
    buttonExclude=document.getElementById('SPLUincompleteFilterButtonExclude');
    buttonOnly=document.getElementById('SPLUincompleteFilterButtonOnly');
    buttonExclude.style.backgroundColor="";
    buttonOnly.style.backgroundColor="";
    if(option=="excluded"){
      buttonExclude.style.backgroundColor="yellow";
    }
    if(option=="only"){
      buttonOnly.style.backgroundColor="yellow";
    }
    document.getElementById('SPLUincompleteFilterButtonValue').value=option;
    loadPlays(document.getElementById('SPLU.PlaysLogger').value,false);
  }

  function showPlaysTab(tab){
    console.log("showPlaysTab("+tab+")");
    if(tab!="same"){
      SPLUplaysListTab=tab;
    }
    if(SPLUplaysListTab=="filters"){
      document.getElementById('SPLUfilterIconBtn').style.borderTop="2px solid blue";
      document.getElementById('SPLUstatsIconBtn').style.borderTop="2px solid lightgray";
      document.getElementById('SPLUcopyModeIconBtn').style.borderTop="2px solid lightgray";
      document.getElementById("SPLU.PlaysList").style.maxHeight=(SPLUwindowHeight-122)+"px";
      document.getElementById("SPLU.PlaysList").style.display="";
      document.getElementById("SPLU.StatsMenu").style.display="none";
      document.getElementById("SPLU.StatsContent").style.display="none";
      document.getElementById('SPLUcopyPlaysDiv').style.display="none";
    }else if(SPLUplaysListTab=="stats"){
      document.getElementById('SPLUfilterIconBtn').style.borderTop="2px solid lightgray";
      document.getElementById('SPLUstatsIconBtn').style.borderTop="2px solid blue";
      document.getElementById('SPLUcopyModeIconBtn').style.borderTop="2px solid lightgray";
      document.getElementById("SPLU.StatsContent").style.maxHeight=(SPLUwindowHeight-115)+"px";
      if(document.getElementById("SPLU.StatsMenu").style.display=="none"){
        document.getElementById("SPLU.StatsMenu").style.display="";
        document.getElementById("SPLU.StatsContent").style.display="";
        loadStats("choose");
      }
      document.getElementById("SPLU.PlaysList").style.display="none";
      document.getElementById('SPLUcopyPlaysDiv').style.display="none";
    }else if(SPLUplaysListTab=="copymode"){
      document.getElementById('SPLUfilterIconBtn').style.borderTop="2px solid lightgray";
      document.getElementById('SPLUstatsIconBtn').style.borderTop="2px solid lightgray";
      document.getElementById('SPLUcopyModeIconBtn').style.borderTop="2px solid blue";
      document.getElementById("SPLU.PlaysList").style.maxHeight=(SPLUwindowHeight-122)+"px";
      document.getElementById("SPLU.PlaysList").style.display="";
      document.getElementById("SPLU.StatsMenu").style.display="none";
      document.getElementById("SPLU.StatsContent").style.display="none";
      document.getElementById('SPLUcopyPlaysDiv').style.display="";
      document.getElementById('CopyPlaysStatus').innerHTML="";
    }
  }

  function loadStats(stat){
    document.getElementById('SPLUcsvDownload').style.display="none";
    document.getElementById('SPLUshowTemporalChartButton').style.display="none";
    document.getElementById('SPLUzeroScoreStatsDiv').style.display="none";
    document.getElementById('SPLUzeroScoreStatsCheck').checked=SPLUzeroScoreStats;
    document.getElementById("SPLU.PlaysLoadingDiv").style.display="";
    document.getElementById('SPLU.StatsPlayerDiv').style.display="none";
    if(stat=="choose"){
      stat=document.getElementById("SPLU.SelectStat").value;
    }
    var tmpUser=document.getElementById('SPLU.PlaysLogger').value;
    if(stat=="GameDetails"){
      window.setTimeout(function(){getStatsGameDetails(tmpUser);},25);
      document.getElementById('SPLUzeroScoreStatsDiv').style.display="";
    }
    if(stat=="BeginnersLuck"){
      window.setTimeout(function(){getStatsBeginnersLuck(tmpUser,SPLUstatLuckSort);},25);
    }
    if(stat=="PlaysWins"){
      window.setTimeout(function(){getStatsPlaysWins(tmpUser,SPLUstatWinsSort);},25);
      document.getElementById('SPLUcsvDownload').style.display="";
    }
    if(stat=="WinsByGame"){
      window.setTimeout(function(){getStatsWinsByGame(tmpUser,"",SPLUstatWinsByGameSort);},25);
      document.getElementById('SPLUcsvDownload').style.display="";
      document.getElementById('SPLU.StatsPlayerDiv').style.display="";
    }
    if(stat=="Locations"){
      window.setTimeout(function(){getStatsLocations(tmpUser,SPLUstatLocationSort);},25);
      document.getElementById('SPLUcsvDownload').style.display="";
    }
    if(stat=="GameList"){
      window.setTimeout(function(){getStatsGameList(tmpUser,SPLUstatGameList,"list");},25);
      document.getElementById('SPLUcsvDownload').style.display="";
    }
    if(stat=="GameListRank"){
      window.setTimeout(function(){getStatsGameList(tmpUser,SPLUstatGameList,"rank");},25);
      document.getElementById('SPLUcsvDownload').style.display="";
    }
    if(stat=="GameDaysSince"){
      window.setTimeout(function(){getStatsGameDaysSince(tmpUser,SPLUstatGameDaysSince);},25);
      document.getElementById('SPLUcsvDownload').style.display="";
    }
    if(stat=="Duration"){
      window.setTimeout(function(){getStatsGameDuration(tmpUser,SPLUstatGameDuration);},25);
      document.getElementById('SPLUcsvDownload').style.display="";
    }
    if(stat=="TemporalHotness"){
      window.setTimeout(function(){getStatsTemporalHotness(tmpUser,"day");},25);
      document.getElementById('SPLUcsvDownload').style.display="";
    }
  }

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  
  var SPLUsearchDelayTimeout;    
  function SPLUsearchDelay() {
    SPLUsearchResultsLength=20;
    if ( SPLUsearchDelayTimeout ) {
      clearTimeout( SPLUsearchDelayTimeout );
      SPLUsearchDelayTimeout = setTimeout( SPLUsearchForGames, 500 );
    } else {
      SPLUsearchDelayTimeout = setTimeout( SPLUsearchForGames, 500 );
    }
  }

  function SPLUsearchForGames() {
    var tmpText=document.getElementById('q546e9ffd96dfc').value;
    if (tmpText=="" || tmpText=="="){
      document.getElementById('SPLUsearchResultsDIV').style.display="none";
      return;
    }
    var exactmatch = "";
    if (tmpText.substr(0,1) == "="){
      tmpText = tmpText.substr(1);
      exactmatch = tmpText;
      if (SPLUsearchResultsLength == 20) {
        SPLUsearchResultsLength = 101; // Fetch 100 results but trick SPLU into not showing the Load Mode button.
      }
    }
    document.getElementById('SPLUsearchResultsDIV').style.display="";
    document.getElementById('SPLUsearchResultsDIV').innerHTML=SPLUi18n.StatusSearching;
    var tmpFavs={};
    for (key in SPLU.Favorites){
      if (SPLU.Favorites[key].title2 === undefined){
        SPLU.Favorites[key].title2="";
      }
      if (SPLU.Favorites[key].title.toLowerCase().indexOf(tmpText.toLowerCase())>-1 || SPLU.Favorites[key].title2.toLowerCase().indexOf(tmpText.toLowerCase())>-1){
        tmpFavs[key]=SPLU.Favorites[key];
      }
    }
    var tmpType=SPLUobjecttype;
    if (exactmatch == ""){
      SPLUsearchForGamesLoose(tmpText, tmpType, tmpFavs);
    } else {
      SPLUsearchForGamesExact(tmpText, tmpType, tmpFavs);
    }
    
  }
  
  function SPLUsearchForGamesLoose(tmpText, tmpType, tmpFavs){
    //Use the regular search for non-exact matching, maybe they'll update it in the future...
    var oReq=new XMLHttpRequest();
    var tmpJSON="";
    oReq.onload=function(responseJSON){
      tmpJSON=JSON.parse(responseJSON.target.response);
      window.tmp=responseJSON;
      console.log(responseJSON.target.status+"|"+responseJSON.target.statusText);
      if (responseJSON.target.status=="200"){
        showSearchResults(tmpJSON, tmpFavs, "");
      } else {
        console.log("other status code, no search results");
      }
    };
    var tmpQuery='/geeksearch.php?action=search&q='+tmpText+'&objecttype='+tmpType+'&showcount='+SPLUsearchResultsLength;
    oReq.open("POST",tmpQuery,true);
    //Set the following header so that we get a JSON object instead of HTML
    oReq.setRequestHeader("Accept","application/json, text/plain, */*");/**/
    oReq.send();

  }
  
  function SPLUsearchForGamesExact(tmpText, tmpType, tmpFavs){
    //Search for exact matches via XMLAPI2 since the regular search can't
    var oReq=new XMLHttpRequest();
    var tmpXML="";
    oReq.onload=function(){
      tmpXML=this.responseXML;
      window.tmp=tmpXML;
      console.log(this.status);
      if (this.status=="200"){
        tmpGameList = tmpXML.getElementsByTagName('item');
        tmpJSON = {};
        tmpJSON.items = [];
        for (i=0; i<tmpGameList.length; i++) {
          tmpGame = {};
          tmpGame.objectid = tmpGameList[i].getAttribute('id');
          tmpGame.objecttype = SPLUobjecttype;
          tmpGame.subtype = tmpGameList[i].getAttribute('type');
          tmpGame.name = tmpGameList[i].getElementsByTagName('name')[0].getAttribute('value');
          if(tmpGameList[i].getElementsByTagName('yearpublished')[0] !== undefined){
            tmpGame.yearpublished = tmpGameList[i].getElementsByTagName('yearpublished')[0].getAttribute('value');
          } else {
            tmpGame.yearpublished = "N/A";
          }
          tmpJSON.items.push(tmpGame);
        }
        showSearchResults(tmpJSON, tmpFavs, tmpText);
      } else {
        console.log("other status code, no search results");
      }
    };
    var tmpQuery='/xmlapi2/search?query='+tmpText+'&type='+tmpType+'&exact=1';
    oReq.open("POST",tmpQuery,true);
    oReq.setRequestHeader("Accept","text/xml, text/plain, */*");/**/
    oReq.send();
  }
  
  function showSearchResults(results,favorites,exactmatch){
    window.tmpResults = results;
    tmpHTML="";
    for (key in favorites){
      if (favorites.hasOwnProperty(key)) {
        tmpTitle=favorites[key].title2;
        if (tmpTitle==""){
          tmpTitle=favorites[key].title;
        }
        tmpMarkers=" ";
        if(favorites[key].location!==undefined){
          if(favorites[key].location!=""){
            tmpMarkers+='<i class="fa_SP fa_SP-map-marker" style="color: rgb(211, 60, 199);"></i>';
          }
        }
        if(favorites[key].players!==undefined){
          if(favorites[key].players.length>0){
            tmpMarkers+='<i class="fa_SP fa_SP-user" style="color: rgb(211, 60, 199);"></i>';
          }
        }
        if(favorites[key].expansions!==undefined){
          if(favorites[key].expansions.length>0){
            tmpMarkers+='<i class="fa_SP fa_SP-star" style="color: rgb(211, 60, 199);"></i>';
          }
        }
        if(tmpMarkers!=" "){
          tmpMarkers+=" ";
        }
        tmpHTML+='<i style="color: red;" class="fa_SP fa_SP-heart"></i>'+tmpMarkers+'<a onClick="javascript:{chooseFavorite(\''+key+'\');}">'+tmpTitle+'</a><br/>';
      }
    }
    if (results['items'].length>0){
      results.items.sort(dynamicSortMultipleCI("name"));
      if (results['items'].length>=SPLUsearchResultsLength){
        if(exactmatch == "") {
          SPLUsearchResultsLength+=20;
        } else {
          SPLUsearchResultsLength+=100;
        }
        tmpHTML+='<a style="border: solid 2px; border-radius: 5px; background: lightgray; margin: 2px; padding: 0px 2px;"onClick=\'javascript:{SPLUsearchForGames();}\'>'+SPLUi18n.StatusLoadMore+'</a><br/>';
      }
      for (i=0; i<results['items'].length; i++){
        if (exactmatch == "" || (exactmatch != "" && results['items'][i].name.toLowerCase() == exactmatch.toLowerCase())){
          SPLUsearchResults[results['items'][i].objectid]=results['items'][i];
          tmpName=results['items'][i].name;
          tmpYear=results['items'][i].yearpublished;
          if(tmpYear>10000000){
            tmpYear=tmpYear-4294967296;
          }
          tmpHTML+='<a onClick=\'javascript:{chooseSearchResult('+results['items'][i].objectid+');}\'>';
          console.log(tmpName);
          tmpHTML+=tmpName;
          if(tmpYear!=0){
            tmpHTML+=' ('+tmpYear+')';
          }
          tmpHTML+="</a></br>";
        }
      }
    } else {
      tmpHTML+=SPLUi18n.StatusNoResults;
    }
    document.getElementById('SPLUsearchResultsDIV').innerHTML=tmpHTML;
  }

  function chooseSearchResult(objectid){
    item=SPLUsearchResults[objectid];
    console.log(item);
    setObjectType(item.subtype);
    document.getElementById('objectid9999').value=item.objectid;
    SPLUexpansionsFromFavorite=[]
    SPLUgameID=item.objectid;
    tmpImage=item.objectid;
    if (tmpImage==0){
      tmpImage='1657689';
    }
    tmpURL = "";
    if (item.href === undefined){
      tmpURL = "/"+item.subtype+"/"+item.objectid;
    } else {
      tmpURL = item.href;
    }
    var tmpType=item.objecttype;
    var tmpSubType=item.subtype;
    document.getElementById('selimage9999').innerHTML='Loading<br/>Thubmnail...';
    fetchImageListQueue(tmpImage, 'div', 'selimage9999', 'tallthumb', '', tmpURL,tmpType,tmpSubType)
    document.getElementById('q546e9ffd96dfc').value=item.name;
    SPLUsearchResultsLength=20;
    document.getElementById('SPLUsearchResultsDIV').style.display="none";
    document.getElementById('BRthumbButtons').style.display="block";
    document.getElementById('expansionLoggingButton').style.display="block";
    document.getElementById('SPLU_ExpansionsQuantity').innerHTML="";
    // Commented out following line as a workaround to the form clearing when someone chooses a game after entering text
    //document.getElementById("quickplay_comments99").value="";
    //FIX - replace thing with objecttype and finish rest of feature
    if(SPLU.Settings.FetchPlayCount.Enabled) {
      fetchPlayCountQueue(SPLUgameID, SPLUobjecttype);
    }
  }
  
  function clearSearchResult() {
    document.getElementById('selimage9999').innerHTML='';
    document.getElementById('objectid9999').value='';
    document.getElementById('q546e9ffd96dfc').value='';
    document.getElementById('BRthumbButtons').style.display='block';
    document.getElementById('expansionLoggingButton').style.display="none";
    document.getElementById('BRresults').innerHTML='';
    document.getElementById('SPLU.ExpansionPane').innerHTML='';
    document.getElementById('SPLU.FamilyPane').innerHTML='';
    document.getElementById('BRlogExpansions').style.display="none";
    document.getElementById('SPLU.ExpansionsHeading').style.borderTop="2px solid blue";
    document.getElementById('SPLU.FamilyHeading').style.borderTop="";
    SPLUexpansionsLoaded=false;
    SPLUfamilyLoaded=false;
  }
  
  async function fetchRankDataQueue() {
    //Call this function to add the item to the queue
    console.log('fetchRankDataQueue()');
    SPLUqueue.push({
      "action":fetchRankData, 
      "arguments":{},
      "direction":"fetch",
      "data":"",
      "response":"",
      "attempt":0,
      "finish":fetchRankDataFinish
    });
    runQueue();
  }
  
  async function fetchRankData() {
    console.log("fetchRankData()");
    try {
        const url = `https://raw.githubusercontent.com/beefsack/bgg-ranking-historicals/master/` + SPLUtoday + `.csv`;
        const options = {};
        return await fetchDataCSV(url, options);
    } catch(e) {
      //This shows on bad URLs?
        console.log("catcherror", e); 
    }
  }

  function fetchRankDataFinish(tmpObj){
    //This function is called by runQueue() when the item was processed successfully?
    //console.log("fetchRankDataFinish() - ", tmpObj);
    window.testObj=tmpObj;

    var tmpRows=tmpObj.data.split("\n");
    var tmpResults = [];
    var tmpHeaders=tmpRows[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    for(r=1;r<tmpRows.length;r++){
        var obj = {};
        var tmpRow=tmpRows[r].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        for(h=0;h<tmpHeaders.length;h++){
            obj[tmpHeaders[h]] = tmpRow[h];
        }
        tmpResults.push(obj);
    }
    
    SPLUrank={}
    for(i=0;i<tmpResults.length;i++){
      if(isNumeric(tmpResults[i].ID) && isNumeric(tmpResults[i].Rank)){
        SPLUrank[tmpResults[i].ID]=tmpResults[i].Rank
      } else {
        console.log("Some non-numeric data in rank list: " + tmpResults[i].ID + " | " + tmpResults[i].Rank);
      }
    }
    
    var tmpUser=document.getElementById('SPLU.PlaysLogger').value;
    getStatsGameList(tmpUser,SPLUstatGameList,"rank");
  }
  
  async function fetchPlayCountQueue(objectID, objectType) {
    console.log('fetchPlayCountQueue('+objectID+', '+objectType+')');
    if (objectType == "boardgame" || objectType == "videogame" || objectType == "rpg" || objectType == "rpgitem"){
      document.getElementById("SPLU.GameCountStatus").innerHTML=`Your plays: <img src="https://dazeysan.github.io/SPLU/Images/progress.gif">`;
      if (objectType == "boardgame") {
        tmpObjType = "thing";
        tmpSubType = "boardgame";
      }
      if (objectType == "videogame") {
        tmpObjType = "thing";
        tmpSubType = "videogame";
      }
      if (objectType == "rpg") {
        tmpObjType = "family";
        tmpSubType = "rpg";
      }
      if (objectType == "rpgitem") {
        tmpObjType = "thing";
        tmpSubType = "rpgitem";
      }
      SPLUqueue.push({
        "action":fetchPlayCount, 
        "arguments":{"objectID":objectID, "objectType":tmpObjType, "subType":tmpSubType},
        "direction":"fetch",
        "data":"",
        "response":"",
        "attempt":0,
        "finish":fetchPlayCountFinish
      });
      runQueue();
    } else {
      document.getElementById("SPLU.GameCountStatus").innerHTML=``;
    }
  }
  
  async function fetchPlayCount(tmpArgs) {
    console.log("fetchPlayCount() - ", tmpArgs);
    try {
        const url = `/geekplay.php?action=getuserplaycount&ajax=1&objectid=${tmpArgs.objectID}&objecttype=${tmpArgs.objectType}&subtype=${tmpArgs.subType}`;
        const options = {method: "GET", headers:{'Content-Type': 'application/json'}, credentials: 'same-origin'};
        return await fetchDataJSON(url, options);
    } catch(e) {
      //This shows on bad URLs?
        console.log("catcherror", e); 
    }
  }

  function fetchPlayCountFinish(tmpObj){
    console.log("fetchPlayCountFinish() - ", tmpObj);
    //window.testObj=tmpObj;
    document.getElementById("SPLU.GameCountStatus").innerHTML=`Your plays: ${tmpObj.data.count}`;
  }

 
  async function fetchImageListQueue(gameid, tag, id, size, favid, tmpURL,tmpType,tmpSubType) {
    console.log('fetchImageListQueue('+gameid+', '+tag+', '+id+', '+size+', '+favid+', '+tmpURL+', '+tmpType+', '+tmpSubType+')');
    SPLUqueue.push({
      "action":fetchImageList, 
      "arguments":{"gameid":gameid, "tag":tag, "id":id, "size":size, "favid":favid, "tmpURL":tmpURL, "tmpType":tmpType, "tmpSubType":tmpSubType },
      "direction":"fetch",
      "data":"",
      "response":"",
      "attempt":0,
      "finish":fetchImageListFinish
    });
    SPLUqueueFetchImageCount++;
    runQueue();
  }

  async function fetchImageList(tmpObj) {
    console.log("fetchImageList() - ", tmpObj);
    try {
      //let tmpType=SPLUobjecttype;
      const url = `https://api.geekdo.com/api/geekitems?nosession=1&objectid=${tmpObj.gameid}&objecttype=${tmpObj.tmpType}&subtype=${tmpObj.tmpSubType}`
      //const url = `https://api.geekdo.com/api/things/${tmpObj.gameid}?objecttype=${tmpObj.tmpType}&subtype=${tmpObj.tmpSubType}&partial=essential` //Smaller api call but no longer returns micro or tallthumb images.
      const options = {method: "GET", headers:{'Content-Type': 'application/json'}, credentials: 'same-origin'};
      return await fetchDataJSON(url, options);
      } catch(e) {
      //This shows on bad URLs?
      console.log("catcherror", e); 
    }
  }

  function fetchImageListFinish(tmpObj) {
    console.log("fetchImageListFinish() - ", tmpObj);
    SPLUimageData[tmpObj.arguments.gameid]=tmpObj.data;
    if (tmpObj.arguments.tag == "div" && tmpObj.arguments.tmpURL == "") {
      //Display the image in the div
      document.getElementById(tmpObj.arguments.id).innerHTML='<img src="'+SPLUimageData[tmpObj.arguments.gameid].item.images[tmpObj.arguments.size]+'" />';
    }
    if (tmpObj.arguments.tag == "div" && tmpObj.arguments.id == "selimage9999") {
      //Display the image in the selimage9999 / SPLU.GameThumb div / img
      document.getElementById(tmpObj.arguments.id).innerHTML='<a target="_blank" href="'+tmpURL+'"><img id="SPLU.GameThumb" src="'+SPLUimageData[tmpObj.arguments.gameid].item.images[tmpObj.arguments.size]+'" /></a>';
    }
    if (tmpObj.arguments.tag == "img") {
      //Replace the img src if you can
      try{
        document.getElementById(tmpObj.arguments.id).src=SPLUimageData[tmpObj.arguments.gameid].item.images[tmpObj.arguments.size];
      }catch(err){
        console.log(err);
      }
    }
    if (tmpObj.arguments.tag == "bbcode") {
      //This runs for each image that is downloaded.
      console.log("bbcode - "+SPLUqueueFetchImageCount);
      document.getElementById("SPLU.BBstatus").innerHTML="Fetching Cover Art: "+SPLUqueueFetchImageCount;
    }
    if (tmpObj.arguments.favid != "") {
      console.log("Updating Fav Thumb");
      SPLU.Favorites[tmpObj.arguments.favid].thumbnail = SPLUimageData[tmpObj.arguments.gameid].item.images[tmpObj.arguments.size];
    }
    SPLUqueueFetchImageCount--;
    if (SPLUqueueFetchImageCount == 0) {
      document.getElementById('SPLU.FavoritesLowerStatus').innerHTML=SPLUi18n.StatusFinished;
      window.setTimeout(function(){document.getElementById('SPLU.FavoritesLowerStatus').style.display='none';},2000);
      if (tmpObj.arguments.tag == "bbcode") {
        //Actually generate the forum bbcode
        generateBBcodeFinish(tmpObj);
      }
    }
  }
  
  //From https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  
  function generateBBcode() {
    document.getElementById("SPLU.BBstatus").innerHTML="Fetching Cover Art";
    tmpList=[];
    for(i=0; i<SPLUlistOfPlays.length; i++){
      tmpList.push(SPLUplayData[document.getElementById("SPLU.PlaysLogger").value][SPLUlistOfPlays[i].id].objectid);
    }
    tmpListUnique=tmpList.filter(onlyUnique);
    //console.log(tmpListUnique);
    for(t=0; t<tmpListUnique.length; t++){
      fetchImageListQueue(tmpListUnique[t], "bbcode", "", "square", "", "", "thing", "boardgame");
      //console.log("fetch "+tmpListUnique[t]);
    }
    
  }
  
  function generateBBcodeFinish(tmpObj) {
    tmpBBcode="";
    tmpList=[];
    for(i=0; i<SPLUlistOfPlays.length; i++){
      tmpList.push(SPLUplayData[document.getElementById("SPLU.PlaysLogger").value][SPLUlistOfPlays[i].id].objectid);
    }
    tmpListUnique=tmpList.filter(onlyUnique);
    //console.log(tmpListUnique);
    for(t=0; t<tmpListUnique.length; t++){
      tmpBBcode+="[imageid="+SPLUimageData[tmpListUnique[t]].item.imageid+" "+tmpObj.arguments.size+" inline]";
    }
    console.log(tmpBBcode);
    document.getElementById("SPLU.BBstatus").innerHTML="<input type='button' onclick='javascript:{navigator.clipboard.writeText(tmpBBcode);}' value='Click to copy BBcode to clipboard'>";
  }

  function SPLUdownloadText(filename, text) {
    //From Stackoverflow
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  
  function getStatsGameDetails(tmpUser){
    SPLUgameStats={};
    for(i=0;i<SPLUlistOfPlays.length;i++){
      var tmpPlay=SPLUplayData[tmpUser][SPLUlistOfPlays[i].id];
      if(tmpPlay.deleted){
        continue;
      }
      try{
        // Can probably just get rid of this try/catch since the JSON always returns a players object
        var tmpPlayers=tmpPlay.players;
      } catch(err) {
        continue;
      }
      //Temporary variable and test of combining game scores so you can see all of the TTR series scores together for example
      if(SPLUcombine==true){
        tmpGame=-1;
      }else{
        tmpGame=tmpPlay.objectid;
      }
      if(SPLUgameStats[tmpGame]===undefined){
        SPLUgameStats[tmpGame]={
          "HighScore":-999999999,
          "LowScore":999999999,
          "HighNonZeroScore":-999999999,
          "LowNonZeroScore":999999999,
          "HighSpread":-999999999,
          "LowSpread":999999999,
          "TotalSpread":0,
          "TotalSpreads":0,
          "HighSpreadPlay":0,
          "LowSpreadPlay":0,
          "TotalScore":0,
          "TotalPlays":0,
          "TotalWins":0,
          "WinScoreSum":0,
          "WinHighScore":-999999999,
          "WinLowScore":999999999,
          "TotalDurations":0,
          "DurationSum":0,
          "DurationHigh":-999999999,
          "DurationLow":999999999,
          "TotalZeroScores":0,
          "Players":{},
          "Game":tmpPlay.name
        };
        if(SPLUcombine==true){
          SPLUgameStats[tmpGame]["Game"]="*Multiple Games*";
        }
      }
      var tmpDuration=Number(tmpPlay.length);
      if(tmpDuration>0){
        SPLUgameStats[tmpGame]["TotalDurations"]++;
        SPLUgameStats[tmpGame]["DurationSum"]+=tmpDuration;
        if(tmpDuration>SPLUgameStats[tmpGame]["DurationHigh"]){
          SPLUgameStats[tmpGame]["DurationHigh"]=tmpDuration;
        }
        if(tmpDuration<SPLUgameStats[tmpGame]["DurationLow"]){
          SPLUgameStats[tmpGame]["DurationLow"]=tmpDuration;
        }
      }
      var tmpHigh=-999999999;
      var tmpLow=999999999;
      var tmpSpreadInc=true;
      for(p=0;p<tmpPlayers.length;p++){
        var tmpName="Unknown";
        var tmpNameID="";
        if(tmpPlayers[p].username!=""){
          tmpName=tmpPlayers[p].username;
          tmpNameID=tmpPlayers[p].username;
        }
        if(tmpPlayers[p].name!=""){
          tmpName=tmpPlayers[p].name;
          tmpNameID+=tmpPlayers[p].name;
        }
        if(SPLUgameStats[tmpGame]["Players"][tmpNameID]===undefined){
          SPLUgameStats[tmpGame]["Players"][tmpNameID]={
            "HighScore":-999999999,
            "LowScore":999999999,
            "HighNonZeroScore":-999999999,
            "LowNonZeroScore":999999999,
            "TotalScore":0,
            "TotalPlays":0,
            "TotalWins":0,
            "HighScorePlay":0,
            "LowScorePlay":0,
            "HighNonZeroScorePlay":0,
            "LowNonZeroScorePlay":0,
            "TotalZeroScores":0,
            "Name":tmpName
          };
        }
        var tmpScore=0;
        if(tmpPlayers[p].score!="" && isNumeric(tmpPlayers[p].score)){
          tmpScore=Number(tmpPlayers[p].score);
        }else{
          tmpSpreadInc=false;
        }
        if(tmpScore==0){
          SPLUgameStats[tmpGame]["Players"][tmpNameID]["TotalZeroScores"]++;
          SPLUgameStats[tmpGame]["TotalZeroScores"]++;
        }
        if(tmpScore>SPLUgameStats[tmpGame]["Players"][tmpNameID]["HighScore"]){
          SPLUgameStats[tmpGame]["Players"][tmpNameID]["HighScore"]=tmpScore;
          SPLUgameStats[tmpGame]["Players"][tmpNameID]["HighScorePlay"]=tmpPlay;
        }
        if(tmpScore>SPLUgameStats[tmpGame]["Players"][tmpNameID]["HighNonZeroScore"] && tmpScore!=0){
          SPLUgameStats[tmpGame]["Players"][tmpNameID]["HighNonZeroScore"]=tmpScore;
          SPLUgameStats[tmpGame]["Players"][tmpNameID]["HighNonZeroScorePlay"]=tmpPlay;
        }
        if(tmpScore>SPLUgameStats[tmpGame]["HighScore"]){
          SPLUgameStats[tmpGame]["HighScore"]=tmpScore;
          SPLUgameStats[tmpGame]["HighScorePlay"]=tmpPlay;
        }
        if(tmpScore>SPLUgameStats[tmpGame]["HighNonZeroScore"] && tmpScore!=0){
          SPLUgameStats[tmpGame]["HighNonZeroScore"]=tmpScore;
          SPLUgameStats[tmpGame]["HighNonZeroScorePlay"]=tmpPlay;
        }
        if(tmpScore<SPLUgameStats[tmpGame]["Players"][tmpNameID]["LowScore"]){
          SPLUgameStats[tmpGame]["Players"][tmpNameID]["LowScore"]=tmpScore;
          SPLUgameStats[tmpGame]["Players"][tmpNameID]["LowScorePlay"]=tmpPlay;
        }
        if(tmpScore<SPLUgameStats[tmpGame]["Players"][tmpNameID]["LowNonZeroScore"] && tmpScore!=0){
          SPLUgameStats[tmpGame]["Players"][tmpNameID]["LowNonZeroScore"]=tmpScore;
          SPLUgameStats[tmpGame]["Players"][tmpNameID]["LowNonZeroScorePlay"]=tmpPlay;
        }
        if(tmpScore<SPLUgameStats[tmpGame]["LowScore"]){
          SPLUgameStats[tmpGame]["LowScore"]=tmpScore;
          SPLUgameStats[tmpGame]["LowScorePlay"]=tmpPlay;
        }
        if(tmpScore<SPLUgameStats[tmpGame]["LowNonZeroScore"] && tmpScore!=0){
          SPLUgameStats[tmpGame]["LowNonZeroScore"]=tmpScore;
          SPLUgameStats[tmpGame]["LowNonZeroScorePlay"]=tmpPlay;
        }
        if(tmpScore>tmpHigh){
          tmpHigh=tmpScore;
        }
        if(tmpPlayers[p].score!="" && tmpScore<tmpLow){
          tmpLow=tmpScore;
        }
        SPLUgameStats[tmpGame]["Players"][tmpNameID]["TotalScore"]+=tmpScore;
        SPLUgameStats[tmpGame]["Players"][tmpNameID]["TotalPlays"]++;
        SPLUgameStats[tmpGame]["TotalScore"]+=tmpScore;
        SPLUgameStats[tmpGame]["TotalPlays"]++;
        if(tmpPlayers[p].win=="1"){
          SPLUgameStats[tmpGame]["Players"][tmpNameID]["TotalWins"]++;
          if(tmpScore>0){
            SPLUgameStats[tmpGame]["TotalWins"]++;
            SPLUgameStats[tmpGame]["WinScoreSum"]+=tmpScore;
            if(tmpScore>SPLUgameStats[tmpGame]["WinHighScore"]){
              SPLUgameStats[tmpGame]["WinHighScore"]=tmpScore;
            }
            if(tmpScore<SPLUgameStats[tmpGame]["WinLowScore"]){
              SPLUgameStats[tmpGame]["WinLowScore"]=tmpScore;
            }
          }
        }
      }
      if(tmpSpreadInc){
        tmpSpread=tmpHigh-tmpLow;
        SPLUgameStats[tmpGame]["TotalSpread"]+=tmpSpread;
        if(tmpSpread>SPLUgameStats[tmpGame]["HighSpread"]){
          SPLUgameStats[tmpGame]["HighSpread"]=tmpSpread;
          SPLUgameStats[tmpGame]["HighSpreadPlay"]=tmpPlay;
        }
        if(tmpSpread<SPLUgameStats[tmpGame]["LowSpread"]){
          SPLUgameStats[tmpGame]["LowSpread"]=tmpSpread;
          SPLUgameStats[tmpGame]["LowSpreadPlay"]=tmpPlay;
        }
        if(tmpSpread>0){
          SPLUgameStats[tmpGame]["TotalSpreads"]++;
        }
      }
    }

    tmpHTML="";
    for(keyGame in SPLUgameStats){
      tmpAverageAllScore=0;
      tmpAverageWinScore=0;
      tmpAverageDuration=0;
      tmpAverageSpread=0;
      tmpTotalPlays=SPLUgameStats[keyGame]["TotalPlays"];
      tmpHTML+='<span style="font-style:italic;color:rgb(213, 85, 198);font-weight:bold;">'+SPLUgameStats[keyGame].Game+'</span>';
      if(SPLUgameStats[keyGame]["TotalScore"]!=0){
        if(!SPLUzeroScoreStats){
          tmpTotalPlays=SPLUgameStats[keyGame]["TotalPlays"]-SPLUgameStats[keyGame]["TotalZeroScores"];
        }
        tmpAverageAllScore=SPLUgameStats[keyGame]["TotalScore"]/tmpTotalPlays;
        tmpAverageAllScore=tmpAverageAllScore.toFixed(2);
      }
      if(SPLUgameStats[keyGame]["WinScoreSum"]!=0){
        tmpAverageWinScore=SPLUgameStats[keyGame]["WinScoreSum"]/SPLUgameStats[keyGame]["TotalWins"];
        tmpAverageWinScore=tmpAverageWinScore.toFixed(2);
      }
      if(SPLUgameStats[keyGame]["DurationSum"]>0){
        tmpAverageDuration=SPLUgameStats[keyGame]["DurationSum"]/SPLUgameStats[keyGame]["TotalDurations"];
        tmpAverageDuration=tmpAverageDuration.toFixed(0);
      }
      if(SPLUzeroScoreStats){
        tmpLowScore=SPLUgameStats[keyGame]["LowScore"];
        tmpHighScore=SPLUgameStats[keyGame]["HighScore"];
      }else{
        tmpLowScore=SPLUgameStats[keyGame]["LowNonZeroScore"];
        tmpHighScore=SPLUgameStats[keyGame]["HighNonZeroScore"];
      }
      if(SPLUgameStats[keyGame]["TotalSpread"]>0){
        tmpAverageSpread=SPLUgameStats[keyGame]["TotalSpread"]/SPLUgameStats[keyGame]["TotalSpreads"];
        tmpAverageSpread=tmpAverageSpread.toFixed(2);
      }
      if(tmpAverageAllScore>0 || tmpAverageWinScore>0 || tmpAverageDuration>0 || tmpAverageSpread>0){
        tmpHTML+='<div style="display:table; border-spacing:5px 2px; text-align:right; padding-bottom:10px;">'
        +'<div style="display:table-row;">'
          +'<div style="display:table-cell;font-weight:bold;">'+SPLUi18n.StatsColumnStat+'</div>'
          +'<div style="display:table-cell;font-weight:bold;">'+SPLUi18n.StatsColumnAvg+'</div>'
          +'<div style="display:table-cell;font-weight:bold;">'+SPLUi18n.StatsColumnLow+'</div>'
          +'<div style="display:table-cell;font-weight:bold;">'+SPLUi18n.StatsColumnHigh+'</div>'
          +'<div style="display:table-cell;font-weight:bold;">'+SPLUi18n.StatsColumnPlays+'</div>'
        +'</div>';
        if(tmpAverageAllScore>0){
          tmpHTML+='<div style="display:table-row;">';
          tmpHTML+='<div style="display:table-cell;">'+SPLUi18n.StatsRowsAllScores+'</div>';
          tmpHTML+='<div style="display:table-cell;">'+tmpAverageAllScore+'</div>';
          tmpHTML+='<div style="display:table-cell;">'+tmpLowScore+'</div>';
          tmpHTML+='<div style="display:table-cell;">'+tmpHighScore+'</div>';
          tmpHTML+='<div style="display:table-cell;">'+tmpTotalPlays+'</div></div>';
        }
        if(tmpAverageWinScore>0){
          tmpHTML+='<div style="display:table-row;">';
          tmpHTML+='<div style="display:table-cell;">'+SPLUi18n.StatsRowsWinningScores+'</div>';
          tmpHTML+='<div style="display:table-cell;">'+tmpAverageWinScore+'</div>';
          tmpHTML+='<div style="display:table-cell;">'+SPLUgameStats[keyGame]["WinLowScore"]+'</div>';
          tmpHTML+='<div style="display:table-cell;">'+SPLUgameStats[keyGame]["WinHighScore"]+'</div>';
          tmpHTML+='<div style="display:table-cell;">'+SPLUgameStats[keyGame]["TotalWins"]+'</div></div>';
        }
        if(tmpAverageDuration>0){
          tmpHTML+='<div style="display:table-row;">';
          tmpHTML+='<div style="display:table-cell;">'+SPLUi18n.StatsRowsDuration+'</div>';
          tmpHTML+='<div style="display:table-cell;">'+tmpAverageDuration+' min</div>';
          tmpHTML+='<div style="display:table-cell;">'+SPLUgameStats[keyGame]["DurationLow"]+'</div>';
          tmpHTML+='<div style="display:table-cell;">'+SPLUgameStats[keyGame]["DurationHigh"]+'</div>';
          tmpHTML+='<div style="display:table-cell;">'+SPLUgameStats[keyGame]["TotalDurations"]+'</div></div>';
        }
        if(tmpAverageSpread>0){
          tmpHTML+='<div style="display:table-row;">';
          tmpHTML+='<div style="display:table-cell;">'+SPLUi18n.StatsRowsSpread+'</div>';
          tmpHTML+='<div style="display:table-cell;">'+tmpAverageSpread+'</div>';
          //tmpHTML+='<div style="display:table-cell;"><a href="javascript:{void(0);}" onClick="javascript:{loadPlay('+SPLUgameStats[keyGame]["LowSpreadPlay"].id+');}">'+SPLUgameStats[keyGame]["LowSpread"]+'</a></div>';
          tmpHTML+='<div style="display:table-cell;">'+SPLUgameStats[keyGame]["LowSpread"]+'</div>';
          //tmpHTML+='<div style="display:table-cell;"><a href="javascript:{void(0);}" onClick="javascript:{loadPlay('+SPLUgameStats[keyGame]["HighSpreadPlay"].id+');}">'+SPLUgameStats[keyGame]["HighSpread"]+'</a></div>';
          tmpHTML+='<div style="display:table-cell;">'+SPLUgameStats[keyGame]["HighSpread"]+'</div>';
          tmpHTML+='<div style="display:table-cell;">'+SPLUgameStats[keyGame]["TotalSpreads"]+'</div></div>';
        }
        tmpHTML+='</div>';
      }
      tmpHTML+='<div style="display:table; border-spacing:5px 2px; text-align:right; padding-bottom:10px;">'
        +'<div style="display:table-row;">'
          +'<div style="display:table-cell;font-weight:bold;">'+SPLUi18n.StatsColumnPlayer+'</div>'
          +'<div style="display:table-cell;font-weight:bold;">'+SPLUi18n.StatsColumnPlays+'</div>'
          +'<div style="display:table-cell;font-weight:bold;">'+SPLUi18n.StatsColumnWins+'</div>'
          +'<div style="display:table-cell;font-weight:bold;">'+SPLUi18n.StatsColumnLow+'</div>'
          +'<div style="display:table-cell;font-weight:bold;">'+SPLUi18n.StatsColumnHigh+'</div>'
          +'<div style="display:table-cell;font-weight:bold;">'+SPLUi18n.StatsColumnAvgPoints+'</div>'
          +'<div style="display:table-cell;font-weight:bold;">'+SPLUi18n.StatsColumnAvgWins+'</div>'
        +'</div>';
      for(key in SPLUgameStats[keyGame]["Players"]){
        if(SPLUzeroScoreStats){
          tmpAverageScore=SPLUgameStats[keyGame]["Players"][key]["TotalScore"]/SPLUgameStats[keyGame]["Players"][key]["TotalPlays"];
        }else{
          tmpAverageScore=SPLUgameStats[keyGame]["Players"][key]["TotalScore"]/(SPLUgameStats[keyGame]["Players"][key]["TotalPlays"]-SPLUgameStats[keyGame]["Players"][key]["TotalZeroScores"]);
        }
        if(isNumeric(tmpAverageScore)){
          tmpAverageScore=tmpAverageScore.toFixed(2);
        }else{
          tmpAverageScore="&mdash;";
        }
        tmpAverageWins=(SPLUgameStats[keyGame]["Players"][key]["TotalWins"]/SPLUgameStats[keyGame]["Players"][key]["TotalPlays"])*100;
        tmpAverageWins=tmpAverageWins.toFixed(2);
        tmpGame=SPLUgameStats[keyGame].Game;
        tmpGame=tmpGame.replace("'","\\'");
        tmpGame=tmpGame.replace('"','\\"');
        tmpHTML+='<div style="display:table-row;">';
        tmpHTML+='<div style="display:table-cell;">'+SPLUgameStats[keyGame]["Players"][key]["Name"]+'</div>';
        tmpHTML+='<div style="display:table-cell;"><a onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'playername\',\'='+SPLUgameStats[keyGame]["Players"][key]["Name"]+'\');addPlaysFilter(\'gamename\',\'='+tmpGame+'\');}" href="javascript:{void(0);}">'+SPLUgameStats[keyGame]["Players"][key]["TotalPlays"]+'</a></div>';
        tmpHTML+='<div style="display:table-cell;"><a onclick="javascript:{showPlaysTab(\'filters\');}addPlaysFilter(\'winner\',\''+SPLUgameStats[keyGame]["Players"][key]["Name"]+'\');addPlaysFilter(\'gamename\',\'='+tmpGame+'\');" href="javascript:{void(0);}">'+SPLUgameStats[keyGame]["Players"][key]["TotalWins"]+'</a></div>';
        var tmpBold="";
        var tmpLink="";
        var tmpLink2="";
        if(SPLUzeroScoreStats){
          if(SPLUgameStats[keyGame]["Players"][key]["LowScore"]==SPLUgameStats[keyGame]["LowScore"]){
            tmpBold="font-weight:bold;";
          }
          //tmpHTML+='<div style="display:table-cell;"><a href="javascript:{void(0);}" onClick="javascript:{loadPlay('+SPLUgameStats[keyGame]["Players"][key]["LowScorePlay"].id+');}"><span style="'+tmpBold+'">'+SPLUgameStats[keyGame]["Players"][key]["LowScore"]+'</span></a></div>';
          tmpHTML+='<div style="display:table-cell;"><a href="javascript:{void(0);}" onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'gamename\',\'='+tmpGame+'\');addPlaysFilter(\'playername\',\'='+SPLUgameStats[keyGame]["Players"][key]["Name"]+'\');addPlaysFilter(\'score\',\'eq'+SPLUgameStats[keyGame]["Players"][key]["LowScore"]+'\');}" href="javascript:{void(0);}"><span style="'+tmpBold+'">'+SPLUgameStats[keyGame]["Players"][key]["LowScore"]+'</span></a></div>';
          tmpBold="";
          if(SPLUgameStats[keyGame]["Players"][key]["HighScore"]==SPLUgameStats[keyGame]["HighScore"]){
            tmpBold="font-weight:bold;";
          }
          //tmpHTML+='<div style="display:table-cell;"><a href="javascript:{void(0);}" onClick="javascript:{loadPlay('+SPLUgameStats[keyGame]["Players"][key]["HighScorePlay"].id+');}"><span style="'+tmpBold+'">'+SPLUgameStats[keyGame]["Players"][key]["HighScore"]+'</span></a></div>';
          tmpHTML+='<div style="display:table-cell;"><a href="javascript:{void(0);}" onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'gamename\',\'='+tmpGame+'\');addPlaysFilter(\'playername\',\'='+SPLUgameStats[keyGame]["Players"][key]["Name"]+'\');addPlaysFilter(\'score\',\'eq'+SPLUgameStats[keyGame]["Players"][key]["HighScore"]+'\');}" href="javascript:{void(0);}"><span style="'+tmpBold+'">'+SPLUgameStats[keyGame]["Players"][key]["HighScore"]+'</span></a></div>';
        }else{
          if(SPLUgameStats[keyGame]["Players"][key]["LowNonZeroScore"]==SPLUgameStats[keyGame]["LowNonZeroScore"]){
            tmpBold="font-weight:bold;";
          }
          if(SPLUgameStats[keyGame]["Players"][key]["LowNonZeroScore"]==999999999){
            tmpLowScore="&mdash;";
            tmpLink='';
            tmpLink2='';
          }else{
            tmpLowScore=SPLUgameStats[keyGame]["Players"][key]["LowNonZeroScore"];
            //tmpLink='<a href="javascript:{void(0);}" onClick="javascript:{loadPlay('+SPLUgameStats[keyGame]["Players"][key]["LowNonZeroScorePlay"].id+');}">';
            tmpLink='<a href="javascript:{void(0);}" onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'gamename\',\'='+tmpGame+'\');addPlaysFilter(\'playername\',\'='+SPLUgameStats[keyGame]["Players"][key]["Name"]+'\');addPlaysFilter(\'score\',\'eq'+SPLUgameStats[keyGame]["Players"][key]["LowScore"]+'\');}" href="javascript:{void(0);}">';
            tmpLink2='</a>';
          }
          tmpHTML+='<div style="display:table-cell;">'+tmpLink+'<span style="'+tmpBold+'">'+tmpLowScore+'</span>'+tmpLink2+'</div>';
          tmpBold="";
          if(SPLUgameStats[keyGame]["Players"][key]["HighNonZeroScore"]==SPLUgameStats[keyGame]["HighNonZeroScore"]){
            tmpBold="font-weight:bold;";
          }
          if(SPLUgameStats[keyGame]["Players"][key]["HighNonZeroScore"]==-999999999){
            tmpHighScore="&mdash;";
            tmpLink='';
            tmpLink2='';
          }else{
            tmpHighScore=SPLUgameStats[keyGame]["Players"][key]["HighNonZeroScore"];
            //tmpLink='<a href="javascript:{void(0);}" onClick="javascript:{loadPlay('+SPLUgameStats[keyGame]["Players"][key]["HighNonZeroScorePlay"].id+');}">';
            tmpLink='<a href="javascript:{void(0);}" onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'gamename\',\'='+tmpGame+'\');addPlaysFilter(\'playername\',\'='+SPLUgameStats[keyGame]["Players"][key]["Name"]+'\');addPlaysFilter(\'score\',\'eq'+SPLUgameStats[keyGame]["Players"][key]["HighScore"]+'\');}" href="javascript:{void(0);}">';
            tmpLink2='</a>';
          }
          tmpHTML+='<div style="display:table-cell;">'+tmpLink+'<span style="'+tmpBold+'">'+tmpHighScore+'</span>'+tmpLink2+'</div>';
        }
        tmpBold="";
        tmpHTML+='<div style="display:table-cell;">'+tmpAverageScore+'</div>';
        tmpHTML+='<div style="display:table-cell;">'+tmpAverageWins+'%</div>';
        tmpHTML+='</div>';
      }
      tmpHTML+='</div>';
    }
    document.getElementById("SPLU.StatsContent").innerHTML=tmpHTML;
    document.getElementById("SPLU.PlaysLoadingDiv").style.display="none";
  }
  
  function getStatsBeginnersLuck(tmpUser,sort){
    SPLUstatLuckSort=sort;
    SPLUgameStats={};
    for(i=0;i<SPLUlistOfPlays.length;i++){
      if(SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].players.length==0 || SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].deleted){
        continue;
      }
      var tmpPlayers=SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].players;
      for(p=0;p<tmpPlayers.length;p++){
        var tmpName="Unknown";
        if(tmpPlayers[p].username!=""){
          tmpName=tmpPlayers[p].username;
        }
        if(tmpPlayers[p].name!=""){
          tmpName=tmpPlayers[p].name;
        }
        if(SPLUgameStats[tmpName]===undefined){
          SPLUgameStats[tmpName]={
            "TotalNewWins":0
          };
        }
        if(tmpPlayers[p].new=="1" && tmpPlayers[p].win=="1"){
          SPLUgameStats[tmpName]["TotalNewWins"]++;
        }
      }
    }
    tmpStats=[];
    for(key in SPLUgameStats){
      if(SPLUgameStats.hasOwnProperty(key)) {
        if(SPLUgameStats[key]["TotalNewWins"]>0){
          tmpStats.push({player:key,count:SPLUgameStats[key]["TotalNewWins"]});
        }
      }
    }
    //Sorting by "player" first to get alpha order among numeric groups.
    //Really should check if they are already sorting by player so as not to run it twice.
    tmpStats.sort(dynamicSortMultipleCI("player"));
    tmpStats.sort(dynamicSortMultipleCI(sort));
    tmpSortPlayer="player";
    tmpSortCount="count";
    tmpClassPlayer="fa_SP fa_SP-sort-alpha-asc";
    tmpClassCount="fa_SP fa_SP-sort-amount-asc";
    if(sort=="player"){
      tmpSortPlayer="-player";
      tmpClassPlayer="fa_SP fa_SP-sort-alpha-desc";
    }else if(sort=="count"){
      tmpSortCount="-count";
      tmpClassCount="fa_SP fa_SP-sort-amount-desc";
    }
    tmpHTML='<div style="display:table; border-spacing:5px 2px; text-align:right;">'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell;font-weight:bold;text-align:center;"><a onclick="javascript:{getStatsBeginnersLuck(\''+tmpUser+'\',\''+tmpSortPlayer+'\');}" href="javascript:{void(0);}">'+SPLUi18n.StatsColumnPlayer+' <i class="'+tmpClassPlayer+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsBeginnersLuck(\''+tmpUser+'\',\''+tmpSortCount+'\');}" href="javascript:{void(0);}">'+SPLUi18n.StatsColumnNewWon+' <i class="'+tmpClassCount+'"></i></a></div>'
      +'</div>';
    for(i=0;i<tmpStats.length;i++){
      tmpHTML+='<div style="display:table-row;" onMouseOver="javascript:{this.style.backgroundColor=\'yellow\';}" onMouseOut="javascript:{this.style.backgroundColor=\'#f1f8fb\';}">';
      tmpHTML+='<div style="display:table-cell;text-align:left;">'+tmpStats[i]["player"]+'</div>';
      tmpHTML+='<div style="display:table-cell;padding-right:50px;"><a onclick="javascript:{showPlaysTab(\'filters\');}" href="javascript:{void(0);addPlaysFilter(\'playername\',\'='+tmpStats[i]["player"]+'\');addPlaysFilter(\'winner\',\''+tmpStats[i]["player"]+'\');addPlaysFilter(\'new\',\''+tmpStats[i]["player"]+'\');}">'+tmpStats[i]["count"]+'</a></div>';
      tmpHTML+='</div>';
    }
    tmpHTML+='</div>';
    document.getElementById("SPLU.StatsContent").innerHTML=tmpHTML;
    document.getElementById("SPLU.PlaysLoadingDiv").style.display="none";
  }

  function getStatsPlaysWins(tmpUser,sort){
    //SPLUstatWinsSort=sort;
    SPLUgameStats={};
    for(i=0;i<SPLUlistOfPlays.length;i++){
      if(SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].players.length==0 || SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].deleted){
        continue;
      }
      var tmpPlay=SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].playid;
      var tmpPlayers=SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].players;
      for(p=0;p<tmpPlayers.length;p++){
        var tmpName="Unknown";
        if(tmpPlayers[p].username!=""){
          tmpName=tmpPlayers[p].username;
        }
        if(tmpPlayers[p].name!=""){
          tmpName=tmpPlayers[p].name;
        }
        if(SPLUgameStats[tmpName]===undefined){
          SPLUgameStats[tmpName]={
            "TotalWins":0,
            "TotalPlays":0
          };
        }
        if(tmpPlayers[p].win=="1"){
          SPLUgameStats[tmpName]["TotalWins"]++;
        }
        SPLUgameStats[tmpName]["TotalPlays"]++;
      }
    }
    tmpWins=[];
    for(key in SPLUgameStats){
      if (SPLUgameStats.hasOwnProperty(key)) {
        tmpAverage=(SPLUgameStats[key]["TotalWins"]/SPLUgameStats[key]["TotalPlays"])*100;
        tmpAverage=tmpAverage.toFixed(2);
        tmpWins.push({player:key,plays:SPLUgameStats[key]["TotalPlays"],wins:SPLUgameStats[key]["TotalWins"],average:tmpAverage});
      }
    }
    //Sorting by "player" first to get alpha order among numeric groups.
    //Really should check if they are already sorting by player so as not to run it twice.
    tmpWins.sort(dynamicSortMultipleCI("player"));
    tmpWins.sort(dynamicSortMultipleCI(sort));
    tmpSortPlayer="player";
    tmpSortPlays="plays";
    tmpSortWins="wins";
    tmpSortAverage="average";
    tmpClassPlayer="fa_SP fa_SP-sort-alpha-asc";
    tmpClassPlays="fa_SP fa_SP-sort-amount-asc";
    tmpClassWins="fa_SP fa_SP-sort-amount-asc";
    tmpClassAverage="fa_SP fa_SP-sort-amount-asc";
    if(sort=="player"){
      tmpSortPlayer="-player";
      tmpClassPlayer="fa_SP fa_SP-sort-alpha-desc";
    }else if(sort=="plays"){
      tmpSortPlays="-plays";
      tmpClassPlays="fa_SP fa_SP-sort-amount-desc";
    }else if(sort=="wins"){
      tmpSortWins="-wins";
      tmpClassWins="fa_SP fa_SP-sort-amount-desc";
    }else if(sort=="average"){
      tmpSortAverage="-average";
      tmpClassAverage="fa_SP fa_SP-sort-amount-desc";
    }
    tmpHTML='<div style="display:table; border-spacing:5px 2px; text-align:right;">'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell;font-weight:bold;width:35%;text-align:center;"><a onclick="javascript:{getStatsPlaysWins(\''+tmpUser+'\',\''+tmpSortPlayer+'\');}" href="javascript:{void(0);}">'+SPLUi18n.StatsColumnPlayer+' <i class="'+tmpClassPlayer+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsPlaysWins(\''+tmpUser+'\',\''+tmpSortPlays+'\');}" href="javascript:{void(0);}">'+SPLUi18n.StatsColumnPlays+' <i class="'+tmpClassPlays+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsPlaysWins(\''+tmpUser+'\',\''+tmpSortWins+'\');}" href="javascript:{void(0);}">'+SPLUi18n.StatsColumnWins+' <i class="'+tmpClassWins+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsPlaysWins(\''+tmpUser+'\',\''+tmpSortAverage+'\');}" href="javascript:{void(0);}">'+SPLUi18n.StatsColumnAverage+' <i class="'+tmpClassWins+'"></i></a></div>'
      +'</div>';
    SPLUcsv='"Player","Play Count","Wins","Average"\r\n';
    for(i=0;i<tmpWins.length;i++){
      if(SPLUgameStats[key]["TotalNewWins"]!=0){
        tmpHTML+='<div style="display:table-row;" onMouseOver="javascript:{this.style.backgroundColor=\'yellow\';}" onMouseOut="javascript:{this.style.backgroundColor=\'#f1f8fb\';}">';
        tmpHTML+='<div style="display:table-cell;text-align:left;">'+tmpWins[i]["player"]+'</div>';
        tmpHTML+='<div style="display:table-cell;padding-right:10px;"><a onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'playername\',\'='+tmpWins[i]["player"]+'\');}" href="javascript:{void(0);}">'+tmpWins[i]["plays"]+'</a></div>';
        tmpHTML+='<div style="display:table-cell;padding-right:10px;"><a onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'playername\',\'='+tmpWins[i]["player"]+'\');addPlaysFilter(\'winner\',\''+tmpWins[i]["player"]+'\');}" href="javascript:{void(0);}">'+tmpWins[i]["wins"]+'</a></div>';
        tmpHTML+='<div style="display:table-cell;">'+tmpWins[i]["average"]+'%</div>';
        tmpHTML+='</div>';
        SPLUcsv+='"'+tmpWins[i]["player"]+'","'+tmpWins[i]["plays"]+'","'+tmpWins[i]["wins"]+'","'+tmpWins[i]["average"]+'"\r\n';
      }
    }
    tmpHTML+='</div>';
    document.getElementById("SPLU.StatsContent").innerHTML=tmpHTML;
    document.getElementById("SPLU.PlaysLoadingDiv").style.display="none";
  }

  function setWinsByGamePlayer(player){
    if(player==""){
      player=document.getElementById("SPLU.SelectStatPlayer").value;
    }
    tmpUser=document.getElementById('SPLU.PlaysLogger').value;
    window.setTimeout(function(){getStatsWinsByGame(tmpUser,player,SPLUstatWinsByGameSort);},25);
  }
  
  function getStatsWinsByGame(tmpUser,tmpPlayer,sort){
    SPLUstatWinsByGameSort=sort;
    SPLUgameStats={};
    SPLUgamePlayers={};
    for(i=0;i<SPLUlistOfPlays.length;i++){
      if(SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].players.length==0 || SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].deleted){
        continue;
      }
      var tmpPlay=SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].playid;
      var tmpGame=SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].name;
      var tmpPlayers=SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].players;
      for(p=0;p<tmpPlayers.length;p++){
        var tmpName="Unknown";
        if(tmpPlayers[p].username!=""){
          tmpName=tmpPlayers[p].username;
        }
        if(tmpPlayers[p].name!=""){
          tmpName=tmpPlayers[p].name;
        }
        if(tmpPlayer==""){
          tmpPlayer=tmpName;
        }
        if(SPLUgamePlayers[tmpName]===undefined){
          SPLUgamePlayers[tmpName]={
            "Name":tmpName
          }
        }
        if(SPLUgameStats[tmpGame]===undefined){
          SPLUgameStats[tmpGame]={
            "GameName":tmpGame,
            "TotalPlays":0,
            "Players":{}
          };
        }
        if(SPLUgameStats[tmpGame]["Players"][tmpName]===undefined){
          SPLUgameStats[tmpGame]["Players"][tmpName]={
            "Player":tmpName,
            "TotalPlays":0,
            "TotalWins":0
          }
        }
        if(tmpPlayers[p].win=="1"){
          SPLUgameStats[tmpGame]["Players"][tmpName]["TotalWins"]++;
        }
        SPLUgameStats[tmpGame]["Players"][tmpName]["TotalPlays"]++;
      }
      SPLUgameStats[tmpGame]["TotalPlays"]++;
    }
    tmpWins=[];
    for(key in SPLUgameStats){
      if (SPLUgameStats.hasOwnProperty(key)) {
        if(SPLUgameStats[key]["Players"][tmpPlayer]===undefined){
          continue;
        }
        tmpAverage=(SPLUgameStats[key]["Players"][tmpPlayer]["TotalWins"]/SPLUgameStats[key]["Players"][tmpPlayer]["TotalPlays"])*100;
        tmpAverage=tmpAverage.toFixed(2);
        tmpWins.push({game:key,plays:SPLUgameStats[key]["Players"][tmpPlayer]["TotalPlays"],wins:SPLUgameStats[key]["Players"][tmpPlayer]["TotalWins"],average:tmpAverage});
      }
    }
    tmpNames=[];
    for(key in SPLUgamePlayers){
      if (SPLUgamePlayers.hasOwnProperty(key)) {
        tmpNames.push({name:key});
      }
    }
    tmpNames.sort(dynamicSortMultipleCI("name"));
    //Sorting by "game" first to get alpha order among numeric groups.
    //Really should check if they are already sorting by game so as not to run it twice.
    tmpWins.sort(dynamicSortMultipleCI("game"));
    tmpWins.sort(dynamicSortMultipleCI(sort));
    tmpSortGame="game";
    tmpSortPlays="plays";
    tmpSortWins="wins";
    tmpSortAverage="average";
    tmpClassGame="fa_SP fa_SP-sort-alpha-asc";
    tmpClassPlays="fa_SP fa_SP-sort-amount-asc";
    tmpClassWins="fa_SP fa_SP-sort-amount-asc";
    tmpClassAverage="fa_SP fa_SP-sort-amount-asc";
    if(sort=="game"){
      tmpSortGame="-game";
      tmpClassGame="fa_SP fa_SP-sort-alpha-desc";
    }else if(sort=="plays"){
      tmpSortPlays="-plays";
      tmpClassPlays="fa_SP fa_SP-sort-amount-desc";
    }else if(sort=="wins"){
      tmpSortWins="-wins";
      tmpClassWins="fa_SP fa_SP-sort-amount-desc";
    }else if(sort=="average"){
      tmpSortAverage="-average";
      tmpClassAverage="fa_SP fa_SP-sort-amount-desc";
    }
    tmpHTML='<div style="display:table; border-spacing:5px 2px; text-align:right;">'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell;font-weight:bold;width:35%;text-align:center;"><a onclick="javascript:{getStatsWinsByGame(\''+tmpUser+'\',\''+tmpPlayer+'\',\''+tmpSortGame+'\');}" href="javascript:{void(0);}">Game <i class="'+tmpClassGame+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsWinsByGame(\''+tmpUser+'\',\''+tmpPlayer+'\',\''+tmpSortPlays+'\');}" href="javascript:{void(0);}">Plays <i class="'+tmpClassPlays+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsWinsByGame(\''+tmpUser+'\',\''+tmpPlayer+'\',\''+tmpSortWins+'\');}" href="javascript:{void(0);}">Wins <i class="'+tmpClassWins+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsWinsByGame(\''+tmpUser+'\',\''+tmpPlayer+'\',\''+tmpSortAverage+'\');}" href="javascript:{void(0);}">Average <i class="'+tmpClassWins+'"></i></a></div>'
      +'</div>';
    SPLUcsv='"Game","Play Count","Wins","Average"\r\n';
    for(i=0;i<tmpWins.length;i++){
        tmpHTML+='<div style="display:table-row;" onMouseOver="javascript:{this.style.backgroundColor=\'yellow\';}" onMouseOut="javascript:{this.style.backgroundColor=\'#f1f8fb\';}">';
        tmpHTML+='<div style="display:table-cell;text-align:left;">'+tmpWins[i]["game"]+'</div>';
        tmpHTML+='<div style="display:table-cell;padding-right:10px;"><a onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'gamename\',\'='+tmpWins[i]["game"]+'\');}" href="javascript:{void(0);}">'+tmpWins[i]["plays"]+'</a></div>';
        tmpHTML+='<div style="display:table-cell;padding-right:10px;"><a onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'gamename\',\'='+tmpWins[i]["game"]+'\');addPlaysFilter(\'winner\',\''+tmpPlayer+'\');}" href="javascript:{void(0);}">'+tmpWins[i]["wins"]+'</a></div>';
        tmpHTML+='<div style="display:table-cell;">'+tmpWins[i]["average"]+'%</div>';
        tmpHTML+='</div>';
        SPLUcsv+='"'+tmpWins[i]["game"]+'","'+tmpWins[i]["plays"]+'","'+tmpWins[i]["wins"]+'","'+tmpWins[i]["average"]+'"\r\n';
    }
    tmpHTML+='</div>';
    document.getElementById("SPLU.StatsContent").innerHTML=tmpHTML;
    document.getElementById("SPLU.PlaysLoadingDiv").style.display="none";
    var select=document.getElementById('SPLU.SelectStatPlayer');
    select.options.length=0;
    for(i=0;i<tmpNames.length;i++){
      if(tmpNames[i].name==tmpPlayer){
        select.options[i]=new Option(tmpNames[i].name, tmpNames[i].name, false, true);
      }else{
        select.options[i]=new Option(tmpNames[i].name, tmpNames[i].name, false, false);
      }
    }
  }

  function getStatsGameDuration(tmpUser,sort){
    SPLUstatGameDuration=sort;
    SPLUgameStats={};
    for(i=0;i<SPLUlistOfPlays.length;i++){
      if(SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].length=="0" || SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].deleted){
        continue;
      }
      var tmpPlay=SPLUplayData[tmpUser][SPLUlistOfPlays[i].id];
      var tmpGame=tmpPlay.objectid;
      // var tmpGameName=SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].name;
      // var tmpGame=SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].objectid;
      if(SPLUgameStats[tmpGame]===undefined){
        SPLUgameStats[tmpGame]={
          "TotalDurations":0,
          "DurationSum":0,
          "DurationHigh":-999999999,
          "DurationLow":999999999,
          "Game":tmpPlay.name
        };
      }
      var tmpDuration=Number(tmpPlay.length);
      if(tmpDuration>0){
        SPLUgameStats[tmpGame]["TotalDurations"]++;
        SPLUgameStats[tmpGame]["DurationSum"]+=tmpDuration;
        if(tmpDuration>SPLUgameStats[tmpGame]["DurationHigh"]){
          SPLUgameStats[tmpGame]["DurationHigh"]=tmpDuration;
        }
        if(tmpDuration<SPLUgameStats[tmpGame]["DurationLow"]){
          SPLUgameStats[tmpGame]["DurationLow"]=tmpDuration;
        }
      }
    }

    tmpDuration=[];
    for(keyGame in SPLUgameStats){
      tmpAverageDuration=0;
      if(SPLUgameStats[keyGame]["DurationSum"]>0){
        tmpAverageDuration=SPLUgameStats[keyGame]["DurationSum"]/SPLUgameStats[keyGame]["TotalDurations"];
        tmpAverageDuration=tmpAverageDuration.toFixed(0);
        tmpDuration.push({game:SPLUgameStats[keyGame]["Game"],plays:SPLUgameStats[keyGame]["TotalDurations"],high:SPLUgameStats[keyGame]["DurationHigh"],low:SPLUgameStats[keyGame]["DurationLow"],average:tmpAverageDuration});
      }
    }

    var tmpHTML="";
    //Sorting by "game" first to get alpha order among numeric groups.
    //Really should check if they are already sorting by player so as not to run it twice.
    tmpDuration.sort(dynamicSortMultipleCI("game"));
    tmpDuration.sort(dynamicSortMultipleCI(sort));
    tmpSortGame="game";
    tmpSortPlays="plays";
    tmpSortHigh="high";
    tmpSortLow="low";
    tmpSortAverage="average";
    tmpClassGame="fa_SP fa_SP-sort-alpha-asc";
    tmpClassPlays="fa_SP fa_SP-sort-amount-asc";
    tmpClassHigh="fa_SP fa_SP-sort-amount-asc";
    tmpClassLow="fa_SP fa_SP-sort-amount-asc";
    tmpClassAverage="fa_SP fa_SP-sort-amount-asc";
    if(sort=="game"){
      tmpSortGame="-game";
      tmpClassGame="fa_SP fa_SP-sort-alpha-desc";
    }else if(sort=="plays"){
      tmpSortPlays="-plays";
      tmpClassPlays="fa_SP fa_SP-sort-amount-desc";
    }else if(sort=="high"){
      tmpSortHigh="-high";
      tmpClassHigh="fa_SP fa_SP-sort-amount-desc";
    }else if(sort=="low"){
      tmpSortLow="-low";
      tmpClassLow="fa_SP fa_SP-sort-amount-desc";
    }else if(sort=="average"){
      tmpSortAverage="-average";
      tmpClassAverage="fa_SP fa_SP-sort-amount-desc";
    }
    tmpHTML='<div style="display:table; border-spacing:5px 2px; text-align:right;">'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell;font-weight:bold;width:35%;text-align:center;"><a onclick="javascript:{getStatsGameDuration(\''+tmpUser+'\',\''+tmpSortGame+'\');}" href="javascript:{void(0);}">'+SPLUi18n.StatsColumnGame+' <i class="'+tmpClassGame+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsGameDuration(\''+tmpUser+'\',\''+tmpSortPlays+'\');}" href="javascript:{void(0);}">'+SPLUi18n.StatsColumnPlays+' <i class="'+tmpClassPlays+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsGameDuration(\''+tmpUser+'\',\''+tmpSortHigh+'\');}" href="javascript:{void(0);}">'+SPLUi18n.StatsColumnHigh+' <i class="'+tmpClassHigh+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsGameDuration(\''+tmpUser+'\',\''+tmpSortLow+'\');}" href="javascript:{void(0);}">'+SPLUi18n.StatsColumnLow+' <i class="'+tmpClassLow+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsGameDuration(\''+tmpUser+'\',\''+tmpSortAverage+'\');}" href="javascript:{void(0);}">'+SPLUi18n.StatsColumnAverage+' <i class="'+tmpClassHigh+'"></i></a></div>'
      +'</div>';
    SPLUcsv='"Game","Play Count","High","Low","Average"\r\n';
    for(i=0;i<tmpDuration.length;i++){
      //if(SPLUgameStats[key]["TotalDurations"]!=0){
        tmpHTML+='<div style="display:table-row;" onMouseOver="javascript:{this.style.backgroundColor=\'yellow\';}" onMouseOut="javascript:{this.style.backgroundColor=\'#f1f8fb\';}">';
        tmpHTML+='<div style="display:table-cell;text-align:left;">'+tmpDuration[i]["game"]+'</div>';
        tmpHTML+='<div style="display:table-cell;padding-right:10px;"><a onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'gamename\',\'='+fixedEncodeURIComponent(tmpDuration[i]["game"])+'\');}" href="javascript:{void(0);}">'+tmpDuration[i]["plays"]+'</a></div>';
        tmpHTML+='<div style="display:table-cell;padding-right:10px;"><a onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'gamename\',\'='+fixedEncodeURIComponent(tmpDuration[i]["game"])+'\');addPlaysFilter(\'duration\',\'eq'+tmpDuration[i]["high"]+'\');}" href="javascript:{void(0);}">'+tmpDuration[i]["high"]+'</a></div>';
        tmpHTML+='<div style="display:table-cell;padding-right:10px;"><a onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'gamename\',\'='+fixedEncodeURIComponent(tmpDuration[i]["game"])+'\');addPlaysFilter(\'duration\',\'eq'+tmpDuration[i]["low"]+'\');}" href="javascript:{void(0);}">'+tmpDuration[i]["low"]+'</a></div>';
        tmpHTML+='<div style="display:table-cell;">'+tmpDuration[i]["average"]+' min</div>';
        tmpHTML+='</div>';
        SPLUcsv+='"'+tmpDuration[i]["game"]+'","'+tmpDuration[i]["plays"]+'","'+tmpDuration[i]["high"]+'","'+tmpDuration[i]["low"]+'","'+tmpDuration[i]["average"]+'"\r\n';
      //}
    }
    tmpHTML+='</div>';
    document.getElementById("SPLU.StatsContent").innerHTML=tmpHTML;
    document.getElementById("SPLU.PlaysLoadingDiv").style.display="none";
  }
  
  function getStatsLocations(tmpUser,sort){
    SPLUstatLocationSort=sort;
    tmpLocs=[];
    tmpLocs2=[];
    for(i=0;i<SPLUlistOfPlays.length;i++){
      if(SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].deleted){
        continue;
      }
      var loc=SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].location;
      if(tmpLocs[loc]===undefined){
        tmpLocs[loc]=1;
      }else{
        tmpLocs[loc]++;
      }
    }
    for(key in tmpLocs){
      if (tmpLocs.hasOwnProperty(key)) {
        tmpLocs2.push({location:key,count:tmpLocs[key]});
      }
    }
    tmpLocs2.sort(dynamicSortMultipleCI(sort));
    tmpSortPlays="location";
    tmpSortCount="count";
    tmpClassPlays="fa_SP fa_SP-sort-alpha-asc";
    tmpClassCount="fa_SP fa_SP-sort-amount-asc";
    if(sort=="location"){
      tmpSortPlays="-location";
      tmpClassPlays="fa_SP fa_SP-sort-alpha-desc";
    }else if(sort=="count"){
      tmpSortCount="-count";
      tmpClassCount="fa_SP fa_SP-sort-amount-desc";
    }
    tmpHTML='<div style="display:table; border-spacing:5px 2px; text-align:right;">'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell;font-weight:bold;text-align:center;"><a onclick="javascript:{getStatsLocations(\''+tmpUser+'\',\''+tmpSortPlays+'\');}" href="javascript:{void(0);}">Location <i class="'+tmpClassPlays+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsLocations(\''+tmpUser+'\',\''+tmpSortCount+'\');}" href="javascript:{void(0);}">Plays <i class="'+tmpClassCount+'"></i></a></div>'
      +'</div>';
    SPLUcsv='"Location","Play Count"\r\n';
    for(i=0;i<tmpLocs2.length;i++){
      tmpFilterLoc=tmpLocs2[i].location;
      tmpFilterLoc=tmpFilterLoc.replace("'","\\'");
      tmpFilterLoc=tmpFilterLoc.replace('"','\\"');
      SPLUcsv+='"'+tmpLocs2[i].location+'","'+tmpLocs2[i].count+'"\r\n';
      if(tmpLocs2[i].location==""){
        tmpLocs2[i].location="&lt;Blank&gt;";
      }
      tmpHTML+='<div style="display:table-row;" onMouseOver="javascript:{this.style.backgroundColor=\'yellow\';}" onMouseOut="javascript:{this.style.backgroundColor=\'#f1f8fb\';}">';
      tmpHTML+='<div style="display:table-cell;text-align:left;">'+tmpLocs2[i].location+'</div>';
      tmpHTML+='<div style="display:table-cell;padding-right:10px;"><a onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'location\',\'='+tmpFilterLoc+'\');}" href="javascript:{void(0);}">'+tmpLocs2[i].count+'</a></div>';
      tmpHTML+='</div>';
    }
    tmpHTML+='</div>';
    document.getElementById("SPLU.StatsContent").innerHTML=tmpHTML;
    document.getElementById("SPLU.PlaysLoadingDiv").style.display="none";
  }
  
  function getStatsGameList(tmpUser,sort,view){
    SPLUstatGameList=sort;
    if(view=="rank" && SPLUrank=="empty"){
      tmpHTML="<div><br/>"+SPLUi18n.StatusLoadingRankData+"<br/></div>";
      document.getElementById("SPLU.StatsContent").innerHTML=tmpHTML;
      fetchRankDataQueue();
      return false;
    }
    if(view=="list" && sort.includes("rank")){
      sort="game";
    }
    SPLUgameStats={};
    for(i=0;i<SPLUlistOfPlays.length;i++){
      if(SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].deleted){
        continue;
      }
      var tmpPlay=SPLUplayData[tmpUser][SPLUlistOfPlays[i].id];
      var tmpGame=tmpPlay.objectid;
      if(SPLUgameStats[tmpGame]===undefined){
        SPLUgameStats[tmpGame]={
          "GameName":tmpPlay.name,
          "TotalPlays":0
        };
      }
      SPLUgameStats[tmpGame]["TotalPlays"]++;
    }
    tmpGames=[];
    tmpHIndex={};
    for(key in SPLUgameStats){
      if (SPLUgameStats.hasOwnProperty(key)) {
        if (view=="list"){
          tmpGames.push({game:SPLUgameStats[key]["GameName"],plays:SPLUgameStats[key]["TotalPlays"]});
        } else {
          tmpGames.push({game:SPLUgameStats[key]["GameName"],plays:SPLUgameStats[key]["TotalPlays"],rank:SPLUrank[key]});
        }
        window.tmpGames=tmpGames;
        //H-Index
        if(tmpHIndex[SPLUgameStats[key]["TotalPlays"]]===undefined){
          tmpHIndex[SPLUgameStats[key]["TotalPlays"]]=0;
        }
        tmpHIndex[SPLUgameStats[key]["TotalPlays"]]++;
      }
    }
    tmpHIndex2="";
    for(key in tmpHIndex){
      if (tmpHIndex.hasOwnProperty(key)) {
        if(tmpHIndex[key]>=key){
          tmpHIndex2=key;
        }
      }
    }
    if (view=="rank"){
      for(i=0;i<tmpGames.length;i++){
        if(tmpGames[i]["rank"]===undefined) {
          tmpGames[i]["rank"]="999999";
        }
      }
    }
    //Sorting by "game" first to get alpha order among numeric groups.
    tmpGames.sort(dynamicSortMultipleCI("game"));
    tmpGames.sort(dynamicSortMultipleCI(sort));
    tmpSortGame="game";
    tmpSortPlays="plays";
    tmpSortRank="rank";
    tmpClassPlayer="fa_SP fa_SP-sort-alpha-asc";
    tmpClassPlays="fa_SP fa_SP-sort-amount-asc";
    tmpClassRank="fa_SP fa_SP-sort-amount-asc";
    if(sort=="game"){
      tmpSortGame="-game";
      tmpClassPlayer="fa_SP fa_SP-sort-alpha-desc";
    }else if(sort=="plays"){
      tmpSortPlays="-plays";
      tmpClassPlays="fa_SP fa_SP-sort-amount-desc";
    }else if(sort=="rank"){
      tmpSortRank="-rank";
      tmpClassRank="fa_SP fa_SP-sort-amount-desc";
    }
    tmpHTML='';
    //tmpHTML+='<div>H-Index: '+tmpHIndex2+'</div>';
    tmpHTML+='<div style="display:table; border-spacing:5px 2px; text-align:right;">'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell;font-weight:bold;width:75%;text-align:center;"><a onclick="javascript:{getStatsGameList(\''+tmpUser+'\',\''+tmpSortGame+'\',\''+view+'\');}" href="javascript:{void(0);}">Game <i class="'+tmpClassPlayer+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsGameList(\''+tmpUser+'\',\''+tmpSortPlays+'\',\''+view+'\');}" href="javascript:{void(0);}">Plays <i class="'+tmpClassPlays+'"></i></a></div>';
    if (view=="rank"){
      tmpHTML+='<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsGameList(\''+tmpUser+'\',\''+tmpSortRank+'\',\''+view+'\');}" href="javascript:{void(0);}">Rank <i class="'+tmpClassRank+'"></i></a></div>';
    }
    tmpHTML+='</div>';
    if(view=="list"){
      SPLUcsv='"Game","Play Count"\r\n';
    } else {
      SPLUcsv='"Game","Play Count","Rank"\r\n';
    }
    for(i=0;i<tmpGames.length;i++){
      if (view=="rank"){
        if(tmpGames[i]["rank"]==="999999") {
          tmpGames[i]["rank"]="N/A";
        }
        SPLUcsv+='"'+tmpGames[i]["game"]+'","'+tmpGames[i]["plays"]+'","'+tmpGames[i]["rank"]+'"\r\n';
      } else {
        SPLUcsv+='"'+tmpGames[i]["game"]+'","'+tmpGames[i]["plays"]+'"\r\n';
      }
      tmpHTML+='<div style="display:table-row;" onMouseOver="javascript:{this.style.backgroundColor=\'yellow\';}" onMouseOut="javascript:{this.style.backgroundColor=\'#f1f8fb\';}">';
      tmpHTML+='<div style="display:table-cell;text-align:left;">'+tmpGames[i]["game"]+'</div>';
      tmpHTML+='<div style="display:table-cell;padding-right:10px;font-family:monospace;font-weight:bold;"><a onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'gamename\',\'='+tmpGames[i]["game"]+'\');}" href="javascript:{void(0);}">'+tmpGames[i]["plays"]+'</a></div>';
      if (view=="rank"){
        tmpHTML+='<div style="display:table-cell;text-align:right;font-family:monospace;font-weight:bold;">'+tmpGames[i]["rank"]+'</div>';
      }
      tmpHTML+='</div>';
    }
    tmpHTML+='</div>';
    document.getElementById("SPLU.StatsContent").innerHTML=tmpHTML;
    document.getElementById("SPLU.PlaysLoadingDiv").style.display="none";
  }

  function getStatsGameDaysSince(tmpUser,sort){
    SPLUstatGameDaysSince=sort;
    SPLUgameStats={};
    for(i=0;i<SPLUlistOfPlays.length;i++){
      if(SPLUplayData[tmpUser][SPLUlistOfPlays[i].id].deleted){
        continue;
      }
      var tmpPlay=SPLUplayData[tmpUser][SPLUlistOfPlays[i].id];
      var tmpGame=tmpPlay.objectid;
      var tmpDate=new Date(tmpPlay.playdate);
      if(SPLUgameStats[tmpGame]===undefined){
        SPLUgameStats[tmpGame]={
          "GameName":tmpPlay.name,
          "DaysSincePlayed":99999
        };
      }
      var tmpDiff=Math.round((SPLUtodayDateZero-tmpDate)/(1000*60*60*24));
      if(tmpDiff<SPLUgameStats[tmpGame]["DaysSincePlayed"]){
        SPLUgameStats[tmpGame]["DaysSincePlayed"]=tmpDiff;
      }
    }
    tmpGames=[];
    for(key in SPLUgameStats){
      if (SPLUgameStats.hasOwnProperty(key)) {
        tmpGames.push({game:SPLUgameStats[key]["GameName"],days:SPLUgameStats[key]["DaysSincePlayed"]});
      }
    }
    //Sorting by "game" first to get alpha order among numeric groups.
    tmpGames.sort(dynamicSortMultipleCI("game"));
    tmpGames.sort(dynamicSortMultipleCI(sort));
    tmpSortGame="game";
    tmpSortDays="days";
    tmpClassPlayer="fa_SP fa_SP-sort-alpha-asc";
    tmpClassDays="fa_SP fa_SP-sort-amount-asc";
    if(sort=="game"){
      tmpSortGame="-game";
      tmpClassPlayer="fa_SP fa_SP-sort-alpha-desc";
    }else if(sort=="days"){
      tmpSortDays="-days";
      tmpClassDays="fa_SP fa_SP-sort-amount-desc";
    }
    tmpHTML='';
    //tmpHTML+='<div>H-Index: '+tmpHIndex2+'</div>';
    tmpHTML+='<div style="display:table; border-spacing:5px 2px; text-align:right;">'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell;font-weight:bold;width:75%;text-align:center;"><a onclick="javascript:{getStatsGameDaysSince(\''+tmpUser+'\',\''+tmpSortGame+'\');}" href="javascript:{void(0);}">Game <i class="'+tmpClassPlayer+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsGameDaysSince(\''+tmpUser+'\',\''+tmpSortDays+'\');}" href="javascript:{void(0);}">Days <i class="'+tmpClassDays+'"></i></a></div>'
      +'</div>';
    SPLUcsv='"Game","Days Since"\r\n';
    for(i=0;i<tmpGames.length;i++){
      tmpHTML+='<div style="display:table-row;" onMouseOver="javascript:{this.style.backgroundColor=\'yellow\';}" onMouseOut="javascript:{this.style.backgroundColor=\'#f1f8fb\';}">';
      tmpHTML+='<div style="display:table-cell;text-align:left;">'+tmpGames[i]["game"]+'</div>';
      tmpHTML+='<div style="display:table-cell;padding-right:10px;"><a onclick="javascript:{showPlaysTab(\'filters\');addPlaysFilter(\'gamename\',\'='+tmpGames[i]["game"]+'\');}" href="javascript:{void(0);}">'+tmpGames[i]["days"]+'</a></div>';
      tmpHTML+='</div>';
      SPLUcsv+='"'+tmpGames[i]["game"]+'","'+tmpGames[i]["days"]+'"\r\n';
    }
    tmpHTML+='</div>';
    document.getElementById("SPLU.StatsContent").innerHTML=tmpHTML;
    document.getElementById("SPLU.PlaysLoadingDiv").style.display="none";
  }

  function getStatsTemporalHotness(tmpUser, sort) {
    var startTime = performance.now();
    document.getElementById("SPLUshowTemporalChartButton").style.display="";
    tmpDays={};
    for(m=1; m<=12; m++) {
      for(d=1; d<=31; d++){
        tmpDays[(m+"").padStart(2,0)+"-"+(d+"").padStart(2,0)]=0;
      }
    }
    delete tmpDays["02-30"];
    delete tmpDays["02-31"];
    delete tmpDays["04-31"];
    delete tmpDays["06-31"];
    delete tmpDays["09-31"];
    delete tmpDays["11-31"];
    
    //tmpMonthCount = ["", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    tmpMonthCount = {"01":0, "02":0, "03":0, "04":0, "05":0, "06":0, "07":0, "08":0, "09":0, "10":0, "11":0, "12":0};
    for(p=0; p<SPLUlistOfPlays.length; p++) {
      if(SPLUplayData[tmpUser][SPLUlistOfPlays[p].id].deleted){
        continue;
      }
      tmpDays[SPLUlistOfPlays[p].date.slice(5)]++;
      if(SPLUlistOfPlays[p].date.slice(5,7) == "00"){
        continue;
      }
      tmpMonthCount[SPLUlistOfPlays[p].date.slice(5,7)]++;
    }
    
    tmpCount=[];
    for(key in tmpDays){
      if(key == "00-00"){
        continue;
      }
      tmpCount.push({"day":key, "plays":tmpDays[key]});
    }
    
    var endTime = performance.now();
    console.log((endTime-startTime)+"ms");
    
    tmpResults=[];
    //Sorting by "day" first to get chrono order among numeric groups.
    tmpResults = tmpCount.sort(dynamicSortMultipleCI("day"));
    tmpResults.sort(dynamicSortMultipleCI(sort));
    tmpSortDay="day";
    tmpSortPlays="plays";
    tmpClassDay="fa_SP fa_SP-sort-amount-asc";
    tmpClassPlays="fa_SP fa_SP-sort-amount-asc";
    if(sort=="day"){
      tmpSortDay="-day";
      tmpClassDay="fa_SP fa_SP-sort-amount-desc";
    }else if(sort=="plays"){
      tmpSortPlays="-plays";
      tmpClassPlays="fa_SP fa_SP-sort-amount-desc";
    }
    tmpHTML='';
    tmpHTML+='<div style="display:table; border-spacing:5px 2px; text-align:right;">'
      +'<div style="display:table-row;">'
      +'<div style="display:table-cell;font-weight:bold;width:75%;text-align:center;"><a onclick="javascript:{getStatsTemporalHotness(\''+tmpUser+'\',\''+tmpSortDay+'\');}" href="javascript:{void(0);}">Day <i class="'+tmpClassDay+'"></i></a></div>'
      +'<div style="display:table-cell;font-weight:bold;"><a onclick="javascript:{getStatsTemporalHotness(\''+tmpUser+'\',\''+tmpSortPlays+'\');}" href="javascript:{void(0);}">Plays <i class="'+tmpClassPlays+'"></i></a></div>'
      +'</div>';
    SPLUcsv='"Day","Plays"\r\n';
    for(i=0;i<tmpResults.length;i++){
      tmpHTML+='<div style="display:table-row;" onMouseOver="javascript:{this.style.backgroundColor=\'yellow\';}" onMouseOut="javascript:{this.style.backgroundColor=\'#f1f8fb\';}">';
      tmpHTML+='<div style="display:table-cell;text-align:left;">'+tmpResults[i]["day"]+'</div>';
      tmpHTML+='<div style="display:table-cell;padding-right:10px;">'+tmpResults[i]["plays"]+'</div>';
      tmpHTML+='</div>';
      SPLUcsv+='"'+tmpResults[i]["day"]+'","'+tmpResults[i]["plays"]+'"\r\n';
    }
    tmpHTML+='</div>';
    document.getElementById("SPLU.StatsContent").innerHTML=tmpHTML;
    document.getElementById("SPLU.PlaysLoadingDiv").style.display="none";
    
    endTime = performance.now();
    console.log((endTime-startTime)+"ms");
    
  }
  
  function showTemporalHotnessChart() {
    var tmpTable = document.createElement("table");
    tmpTable.style = "text-align: center; border-collapse: separate;";
    var tmpTHead = document.createElement("thead");
    tmpTHead.style = "font-weight: bold;";
    var tmpTD = document.createElement("td");
    tmpTD.innerHTML = "Total";
    tmpTHead.appendChild(tmpTD);
    var tmpTD = document.createElement("td");
    tmpTD.innerHTML = "Month";
    tmpTHead.appendChild(tmpTD);
    for(i=1; i<=31; i++) {
      var tmpTD = document.createElement("td");
      tmpTD.innerHTML = i;
      tmpTHead.appendChild(tmpTD);
    }
    tmpTable.appendChild(tmpTHead);
    tmpTBody = document.createElement("tbody");
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
    for(m=1; m<=12; m++) {
      tmpTR = document.createElement("tr");
      tmpTD = document.createElement("td");
      tmpTD.id="TH-"+(m+"").padStart(2,0)+"-T";
      tmpTD.innerHTML=tmpMonthCount[(m+"").padStart(2,0)];
      tmpTR.appendChild(tmpTD);
      tmpTD = document.createElement("td");
      tmpTD.innerHTML=months[m-1];
      tmpTR.appendChild(tmpTD);
      for(d=1; d<=31; d++){
        if ( (m == 2 && d == 30) || (m == 2 && d == 31) || (m == 4 && d == 31) || (m == 6 && d == 31) || (m == 9 && d == 31) || (m == 11 && d == 31)) {
          continue;
        }
        tmpTD = document.createElement("td");
        tmpTD.id="TH-"+(m+"").padStart(2,0)+"-"+(d+"").padStart(2,0);
        tmpTD.className="TH-cell";
        tmpTD.innerHTML="#";
        tmpTR.appendChild(tmpTD);
      }
      tmpTBody.appendChild(tmpTR);
    }
    tmpTable.appendChild(tmpTBody);
    
    tmpDiv=document.createElement("div");
    tmpDiv.id="SPLUchart";
    tmpDiv.style="background: white; z-index: 5001; position: relative; float: left; top: 10px;padding: 20px;left: 45px;border: 2px solid blue;";
    tmpDiv.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    tmpDiv.appendChild(tmpTable);
    tmpDivFooter=document.createElement("div");
    tmpDivFooter.innerHTML='<div style="margin-top: 10px;text-align: center;"><span class="TH-cell-1">1+ standard deviations below the mean (<span id="SPLUthLevel1"></span>)</span><br/>'
      +'<span class="TH-cell-2">0.5 - 1 standard deviations below the mean (<span id="SPLUthLevel2"></span>)</span><br/>'
      +'<span class="TH-cell-3">within 0.5 standard deviations of the mean (<span id="SPLUthLevel3"></span>)</span><br/>'
      +'<span class="TH-cell-4">0.5 - 1 standard deviations above the mean (<span id="SPLUthLevel4"></span>)</span><br/>'
      +'<span class="TH-cell-5">1+ standard deviations above the mean (<span id="SPLUthLevel5"></span>)</span><br/>'
      +'<span id="SPLUthMean">Mean = </span> | <span id="SPLUthStdDev">Standard Deviation = </span></div>';
    tmpDiv.appendChild(tmpDivFooter);
    tmpDivBlocker=document.createElement("div");
    tmpDivBlocker.id="SPLUchartBlocker";
    tmpDivBlocker.style="position: fixed;z-index: 5000; top: 0;left: 0;bottom: 0;right: 0;background: rgba(0,0,0,.5);";
    tmpDivBlocker.addEventListener("click", (event) => {
      event.stopPropagation();
      document.getElementById("SPLUchartBlocker").remove();
    });
    tmpDivBlocker.appendChild(tmpDiv);
    tmpDivClose=document.createElement("div");
    tmpDivClose.style="z-index: 5001; position: relative; background: red; font-size: large; float: left; top: 10px; left: 45px; border: 2px solid blue; width: 30px; text-align: center; height: 30px;";
    tmpDivClose.innerHTML = "X";
    tmpDivBlocker.appendChild(tmpDivClose);
    document.getElementById("SPLUmain").appendChild(tmpDivBlocker);

    tmpArray = [];
    for (a=0; a<tmpCount.length; a++) {
      tmpArray.push(tmpCount[a].plays);
      }
    tmpStdDev = standardDeviation(tmpArray);
    document.getElementById("SPLUthStdDev").innerHTML = "Standard Deviation = "+Math.round(tmpStdDev * 100) / 100;
    tmpMean = tmpArray.reduce((acc, val) => acc + val, 0) / tmpArray.length;
    document.getElementById("SPLUthMean").innerHTML = "Mean = "+Math.round(tmpMean * 100) / 100;
    document.getElementById("SPLUthLevel1").innerHTML = "below "+Math.round((tmpMean-(tmpStdDev)) * 100) / 100;
    document.getElementById("SPLUthLevel2").innerHTML = Math.round((tmpMean-(tmpStdDev)) * 100) / 100+" to "+Math.round((tmpMean-(tmpStdDev/2)) * 100) / 100;
    document.getElementById("SPLUthLevel3").innerHTML = Math.round((tmpMean-(tmpStdDev/2)) * 100) / 100+" to "+Math.round((tmpMean+(tmpStdDev/2)) * 100) / 100;
    document.getElementById("SPLUthLevel4").innerHTML = Math.round((tmpMean+(tmpStdDev/2)) * 100) / 100+" to "+Math.round((tmpMean+(tmpStdDev)) * 100) / 100;
    document.getElementById("SPLUthLevel5").innerHTML = "above "+Math.round((tmpMean+(tmpStdDev)) * 100) / 100;
    
    for(d=0; d<tmpCount.length; d++){
      document.getElementById("TH-"+tmpCount[d].day).innerHTML=tmpCount[d].plays;
      tmpCalc = (tmpCount[d].plays-tmpMean)/tmpStdDev;
      tmpClass = "TH-cell-3";
      if(tmpCalc <= -0.5) { tmpClass = "TH-cell-2"; }
      if(tmpCalc <= -1) { tmpClass = "TH-cell-1"; }
      if(tmpCalc >= 0.5) { tmpClass = "TH-cell-4"; }
      if(tmpCalc >= 1) { tmpClass = "TH-cell-5"; }
      document.getElementById("TH-"+tmpCount[d].day).classList.add(tmpClass);
    }
  }
  
  // From: https://stackoverflow.com/questions/7343890/standard-deviation-javascript
  const standardDeviation = (arr, usePopulation = false) => {
    var mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    return Math.sqrt(
      arr.reduce((acc, val) => acc.concat((val - mean) ** 2), []).reduce((acc, val) => acc + val, 0) /
        (arr.length - (usePopulation ? 0 : 1))
    );
  }
  
  function loadPlay(id){
    console.log("loadPlay("+id+")");
    SPLUprevGameID=0;
    tmpChild=0;
    SPLUexpansionsFromFavorite=[];
    updateExpansionsQuantityField();
    if(SPLUcopyMode){
      tmpChild=1;
    }
    try{
      if(document.getElementById("SPLU.Plays-"+SPLUcurrentPlayShown).childNodes[tmpChild].style.backgroundColor=="rgb(248, 223, 36)"){
        document.getElementById("SPLU.Plays-"+SPLUcurrentPlayShown).childNodes[tmpChild].style.backgroundColor="";
      }
    }catch(err){
      console.log(err);
    }
    clearForm("clear");
    try{
      document.getElementById("SPLU.Plays-"+id).childNodes[tmpChild].style.backgroundColor="rgb(248, 223, 36)";
    }catch(err){
      console.log(err);
    }
    SPLUcurrentPlayShown=id;
    tmpPlay=SPLUplayData[document.getElementById("SPLU.PlaysLogger").value][id];
    console.log("Found - "+tmpPlay);
    if(tmpPlay.players.length!=0){
      tmpPlayers=tmpPlay.players;
      for(i=0;i<tmpPlayers.length;i++){
        insertPlayer(tmpPlayers[i]);
      }
    }
    setDateField(tmpPlay.playdate);
    document.getElementById('SPLU_PlayedAt').value=tmpPlay.location;
    hideLocations();
    hidePlayers();
    document.getElementById('quickplay_quantity99').value=tmpPlay.quantity;
    document.getElementById('quickplay_duration99').value=tmpPlay.length;
    if(tmpPlay.incomplete==1){document.getElementById('incomplete').checked=true;}
    if(tmpPlay.nowinstats==1){document.getElementById('nowinstats').checked=true;}
    if(tmpPlay.comments.value.length>0){
      document.getElementById('quickplay_comments99').value=tmpPlay.comments.value;
    }
    var tmpType=tmpPlay.subtypes[0].subtype;
    var tmpSubType=tmpPlay.subtypes[0].subtype;
    setObjectType(tmpType);
    document.getElementById('expansionLoggingButton').style.display="block";
    SPLUgameID=tmpPlay.objectid;
    document.getElementById('objectid9999').value=SPLUgameID;
    document.getElementById('q546e9ffd96dfc').value=tmpPlay.name;
    tmpURL = "/"+tmpSubType+"/"+SPLUgameID;
    getRepImage(tmpPlay.objectid, 'selimage9999', tmpURL,tmpType,tmpSubType);
    if(SPLU.Settings.FetchPlayCount.Enabled) {
      fetchPlayCountQueue(SPLUgameID, SPLUobjecttype);
    }
    if(document.getElementById("SPLU.PlaysLogger").value==LoggedInAs&&!SPLUplayData[document.getElementById("SPLU.PlaysLogger").value][id].deleted){
      showHideEditButtons("show");
    }else{
      showHideEditButtons("hide");
    }
  }
  
  function getRepImage(objectid, div, tmpURL,tmpType,tmpSubType){
    console.log("getRepImage("+objectid+", "+div+", "+tmpURL+")");
    var oReq=new XMLHttpRequest();
    var tmpJSON="";
    oReq.onload=function(responseJSON){
      tmpJSON=JSON.parse(responseJSON.target.response);
      window.tmp=tmpJSON;
      console.log(responseJSON.target.status+"|"+responseJSON.target.statusText);
      if (responseJSON.target.status=="200"){
        document.getElementById(div).innerHTML='<a target="_blank" href="'+tmpURL+'"><img id="SPLU.GameThumb" src="'+tmpJSON.item.images.tallthumb+'"/></a>';
      } else {
        console.log("other status code, no image results");
      }
    };
    var tmpQuery='https://api.geekdo.com/api/geekitems?nosession=1&objectid='+objectid+'&objecttype='+tmpType+'&subtype='+tmpType;
    oReq.open("GET",tmpQuery,true);
    //Set the following header so that we get a JSON object instead of HTML
    oReq.setRequestHeader("Accept","application/json, text/plain, */*");/**/
    oReq.send();
  }
  
  function showHideEditButtons(action){
    console.log("SHB"+action);
    if(action=="show"){
      document.getElementById("SPLUeditPlayDiv").style.display="";
      document.getElementById("SPLUdeletePlayDiv").style.display="";
    }else{
      document.getElementById("SPLUeditPlayDiv").style.display="none";
      document.getElementById("SPLUdeletePlayDiv").style.display="none";
    }
  }
  
  function listFetchedPlayers(){
    var tmpPlayers=[];
    document.getElementById("SPLU.PlaysPlayers").innerHTML="";
    for(key in SPLUplayData){
      if(SPLUplayData[key]["total"]>0){
        tmpPlayers.push(key);
        document.getElementById("SPLU.PlaysPlayers").innerHTML+='<a onClick="javascript:{showPlaysTab(\'filters\');document.getElementById(\'SPLU.PlaysLogger\').value=\''+key+'\';loadPlays(\''+key+'\',false);}">'+key+'</a><br/>';
      }
    }
    if(tmpPlayers.length>0){
      document.getElementById("SPLU.PlaysPlayers").style.display="";
    }
  }
  
  function makeSentence(){
    if(!SPLU.Settings.SummaryTextField.Visible){return;}
    document.getElementById('SPLU.SummaryTextField').style.maxWidth=document.getElementById('SPLUwindow').clientWidth-40+"px";
    document.getElementById('SPLU.SummaryTextField').style.display="block";
    var SPLUselectedDate=new Date(document.getElementById('playdate99').value);
    var sentence="";
    
    SenQty = document.getElementById('quickplay_quantity99').value;
    SenGame = document.getElementById('q546e9ffd96dfc').value;
    SenLoc = document.getElementById('SPLU_PlayedAt').value;
    SenDur = document.getElementById('quickplay_duration99').value;
    SenDate = "";
    if(document.getElementById('SPLUplayDateInput').value==SPLUtoday){
      SenDate = SPLUi18n.SummarySentence_today;
    }else if((SPLUtodayDateZero.getTime()-86400000)==SPLUselectedDate.getTime()){
      SenDate = SPLUi18n.SummarySentence_yesterday;
    }else if(SPLUtodayDateZero.getTime()<SPLUselectedDate.getTime()){
      SenDate = "<span style='background-color:red; color:white; font-weight:bold;'>"+SPLUi18n.SummarySentence_in_the_future+"</span>";
    }else if((SPLUtodayDateZero.getTime()-SPLUselectedDate.getTime())>3155673600000){
      SenDate = "<span style='background-color:yellow; color:black; font-weight:bold;'>"+SPLUi18n.SummarySentence_before_you_were_born+"</span>";
    }else if((SPLUtodayDateZero.getTime()-SPLUselectedDate.getTime())>315567360000){
      SenDate = "<span style='background-color:yellow; color:black; font-weight:bold;'>"+SPLUi18n.SummarySentence_over_a_decade_ago+"</span>";
    }else if((SPLUtodayDateZero.getTime()-SPLUselectedDate.getTime())>31556735999){
      SenDate = "<span style='background-color:yellow; color:black; font-weight:bold;'>"+SPLUi18n.SummarySentence_over_a_year_ago+"</span>";
    }else{
      SenDate = SPLUi18n.SummarySentence_on_date.replace("$1", document.getElementById('playdate99').value);
    }

    if(PlayerCount == 1) { //Solo play
      if(SenQty == 1) { //Quantity 1
        if(SenLoc != "") { //Solo play, quantity 1, location specified
          sentence = SPLUi18n.SummarySentence_You_are_logging_a_solo_play_of_in_location;
        } else { //Solo play, quantity 1, no location
          sentence = SPLUi18n.SummarySentence_You_are_logging_a_solo_play_of;
        }
      } else { //More/less than 1 quantity
        if(SenLoc != "") { //Solo play, more/less than 1 quantity, location specified
          sentence = SPLUi18n.SummarySentence_You_are_logging_plural_solo_plays_of_in_location;
        } else { //Solo play, more/less than 1 quantity, no location
          sentence = SPLUi18n.SummarySentence_You_are_logging_plural_solo_plays_of;
        }
      }   
    } else { //Multiple players
      if(SenQty == 1) { //Quantity 1
        if(SenLoc != "") { //Multiple players, quantity 1, location specified
          sentence = SPLUi18n.SummarySentence_You_are_logging_a_play_of_in_location;
        } else { //Multiple players, quantity 1, no location
          sentence = SPLUi18n.SummarySentence_You_are_logging_a_play_of;
        }
      } else { //More/less than 1 quantity
        if(SenLoc != "") { //Multiple players, more/less than 1 quantity, location specified
          sentence = SPLUi18n.SummarySentence_You_are_logging_plural_plays_of_in_location;
        } else { //Multiple players, more/less than 1 quantity, no location
          sentence = SPLUi18n.SummarySentence_You_are_logging_plural_plays_of;
        }
      }   
    }
    
    sentence = sentence.replace("$1",  SenQty);  //$1 = Quantity field
    sentence = sentence.replace("$2",  SenGame);  //$2 = Game Title
    sentence = sentence.replace("$3",  SenDate);  //$3 = Calculated date, today, yesterday, IN THE FUTURE, etc.
    sentence = sentence.replace("$4",  SenLoc);  //$4 = Location field
    
    var sentence2="";
    getWinners();
    if(PlayerCount>1){
      if(SPLUwinners.length==0&&PlayerCount>1){ //Multiple players and no winners.
        sentence2+=SPLUi18n.SummarySentence_There_were_plural_players;
      }else if(SPLUwinners.length==1&&PlayerCount>1){ //Multiple players and 1 winner.
      sentence2+=SPLUi18n.SummarySentence_There_were_plural_players_and_1_winner;
      sentence2=sentence2.replace("$2", SPLUwinners[0]);  //$2 = First winner
      }else if(SPLUwinners.length==2&&PlayerCount!=2){ //Multiple players and 2 winners.
        sentence2+=SPLUi18n.SummarySentence_There_were_plural_players_and_2_winners;
        sentence2=sentence2.replace("$2", SPLUwinners[0]);
        sentence2=sentence2.replace("$3", SPLUwinners[1]);  //$3 = Second winner
      }else if(SPLUwinners.length==3&&PlayerCount!=3){ //Multiple players and 3 winners.
        sentence2+=SPLUi18n.SummarySentence_There_were_plural_players_and_3_winners;
        sentence2=sentence2.replace("$2", SPLUwinners[0]);
        sentence2=sentence2.replace("$3", SPLUwinners[1]);
        sentence2=sentence2.replace("$4", SPLUwinners[2]);  //$4 = Third winner
      }else if(SPLUwinners.length==2&&PlayerCount==2){ //2 players and 2 winners.
        sentence2+=SPLUi18n.SummarySentence_There_were_2_players_and_2_winners;
      }else if(SPLUwinners.length==PlayerCount&&PlayerCount>2){ //Multiple players and everybody won.
        sentence2+=SPLUi18n.SummarySentence_There_were_plural_players_and_all_won;
      }else if(SPLUwinners.length>3&&SPLUwinners.length!=PlayerCount){ //Multiple players and more than 3 winners.
        sentence2+=SPLUi18n.SummarySentence_There_were_plural_players_and_many_winners;
      }
    }
    sentence2=sentence2.replace("$1", PlayerCount);  //$1 = the number of players
    
    var sentence3 = "";
    if(SenDur != "" && SenDur != 0) { //There is a duration
      if(SenQty == 1) { //Quantity 1
        if(SenDur == 1) { //Duration 1 minute, Quantity 1
          sentence3 = SPLUi18n.SummarySentence_The_game_lasted_1_minute;
        } else { //Duration other than 1 minute, Quantity 1
          sentence3 = SPLUi18n.SummarySentence_The_game_lasted_plural_minutes;
        }
      } else { //Quantity not 1
        if(SenDur == 1) { //Duration 1 minute, Quantity not 1
          sentence3 = SPLUi18n.SummarySentence_Each_game_lasted_1_minute;
        } else { //Duration other than 1 minute, Quantity not 1
          sentence3 = SPLUi18n.SummarySentence_Each_game_lasted_plural_minutes;
        }
      }
    }
    sentence3=sentence3.replace("$1", SenDur); //$1 = Duration Field
    
    sentence += sentence2;
    sentence += sentence3;
    
    if(PlayerCount==1){
      sentence+=SPLUi18n.SummarySentence_Nicely_done;
    }
    
    document.getElementById('SPLU.SummaryTextField').innerHTML=sentence;
  }
  
  function hideSentence(){
    document.getElementById('SPLU.SummaryTextField').style.display="none";
  }
  
  function hideDropMenus(){
    console.log("hideDropMenus()");
    document.getElementById('SPLUfilterDrop').style.display="none";
    document.getElementById('SPLUdropMenuHider').style.display="none";
    document.getElementById('SPLUdropMenuHider').style.width="";
    document.getElementById('SPLUdropMenuHider').style.height="";
  }
  
  function showDropMenu(){
    document.getElementById('SPLUdropMenuHider').style.display="";
    document.getElementById('SPLUdropMenuHider').style.left=(document.getElementById('BRlogMain').getLeft()-document.getElementById('SPLUfilterDrop').getLeft()+"px");
    document.getElementById('SPLUdropMenuHider').style.top=(document.getElementById('BRlogMain').getTop()-document.getElementById('SPLUfilterDrop').getTop()+"px");
    document.getElementById('SPLUdropMenuHider').style.width=document.getElementById('BRlogMain').getWidth()+"px";
    document.getElementById('SPLUdropMenuHider').style.height=document.getElementById('BRlogMain').getHeight()+"px";
  }
  
  function showPopText(text,e){
    if(!SPLU.Settings.PopUpText.Visible){
      return;
    }
    txtDiv=document.getElementById('SPLU.popText');
    txtDiv.innerHTML='<span style="font-size:small">';
    txtDiv.innerHTML+=text;
    txtDiv.innerHTML+='</span>';
    txtDiv.style.left=e.pageX+10+"px";
    txtDiv.style.top=e.pageY-35+"px";
    txtDiv.style.visibility="visible";
  }
  function hidePopText(){
    document.getElementById('SPLU.popText').style.visibility="hidden";
  }

  function listenerForPopText(id,text){
    document.getElementById(id).addEventListener("mouseover",function(e){showPopText(text,e);},false);
    document.getElementById(id).addEventListener("mouseout",function(){hidePopText();},false);
  }
  
  function saveExpansionQuantity(){
    document.getElementById('SPLU.ExpansionsPaneStatus').innerHTML=SPLUi18n.StatusSaving;
    SPLU.Settings.ExpansionQuantity.Value=document.getElementById('BRexpPlayQTY').value;
    SPLUremote.Settings.ExpansionQuantity.Value=SPLU.Settings.ExpansionQuantity.Value;
    saveSooty("SPLU.ExpansionsPaneStatus",SPLUi18n.StatusThinking,SPLUi18n.StatusSaved,function(){});
  }
  
  function loadExpansions(){
    var tmpExpID="";
    var tmpExpName="";
    document.getElementById('SPLU.FamilyPane').style.display="none";
    document.getElementById('SPLU.ExpansionPane').style.display="";
    document.getElementById('SPLU.ExpansionPane').innerHTML="";
    document.getElementById('SPLU.FamilyPane').innerHTML="";
    document.getElementById('BRexpPlayQTY').value=SPLU.Settings.ExpansionQuantity.Value;
    document.getElementById('SPLU.ExpansionDetailsCheck').checked=SPLU.Settings.ExpansionDetails.Include;
    tmpLinks=this.responseXML.getElementsByTagName("link");
    SPLUfamilyList=[];
    SPLUintegrationList=[];
    BRexpList=[];
    for(i=0;i<tmpLinks.length;i++){
      if(tmpLinks[i].getAttribute("type")=="boardgameexpansion"){
        BRexpList.push(tmpLinks[i]);
      }
      if(tmpLinks[i].getAttribute("type")=="boardgamefamily"){
        SPLUfamilyList.push(tmpLinks[i]);
      }
      if(tmpLinks[i].getAttribute("type")=="boardgameintegration"){
        SPLUintegrationList.push(tmpLinks[i]);
      }
    }
    if(!BRexpList.length){
      document.getElementById('SPLU.ExpansionPane').innerHTML+='<div>'+SPLUi18n.StatusNoExpansionsFound+'</div>';
    }else{
      //BRexpList=this.responseXML.getElementsByTagName("boardgameexpansion");
      var tmpHTML="";
      tmpHTML+='<div style="display:table;">';
      for(i=0;i<BRexpList.length;i++){
        tmpExpID=BRexpList[i].id;
        tmpExpName=BRexpList[i].getAttribute("value");
        tmpHTML+='<div style="display:table-row;"><div style="display:table-cell;"><input type="checkbox" id="'+tmpExpID+'" class="BRexpLogBox" data-tab="expansion" data-SPLU-ExpName="'+tmpExpName+'" onClick="javascript:{updateExpansionsQuantityField();if(SPLU.Settings.ExpansionComments.Visible){expansionListComment();}}"/> '+tmpExpName+'</div><div style="display:table-cell; width:50px;" id="QPresultsExp'+tmpExpID+'" name="QPresults'+tmpExpID+'"></div></div>';
      }
      if(SPLUintegrationList.length > 0) {
        tmpHTML+='<div style="display:table-row;"><div style="display:table-cell; color:black; padding-top:10px;">'+SPLUi18n.ExpansionsIntegrations+':</div><div style="display:table-cell; width:50px;"></div></div>';
      }
      for(i=0;i<SPLUintegrationList.length;i++){
        tmpIntID=SPLUintegrationList[i].id;
        tmpIntName=SPLUintegrationList[i].getAttribute("value");
        tmpHTML+='<div style="display:table-row;"><div style="display:table-cell;"><input type="checkbox" id="'+tmpIntID+'" class="BRexpLogBox" data-tab="expansion" data-SPLU-ExpName="'+tmpIntName+'" onClick="javascript:{updateExpansionsQuantityField();if(SPLU.Settings.ExpansionComments.Visible){expansionListComment();}}"/> '+tmpIntName+'</div><div style="display:table-cell; width:50px;" id="QPresultsExp'+tmpIntID+'" name="QPresults'+tmpIntID+'"></div></div>';
      }
      tmpHTML+='</div>';
      document.getElementById('SPLU.ExpansionPane').innerHTML+=tmpHTML;
    }
    if(SPLUexpansionsFromFavorite.length>0){
      var tmpExp=document.getElementsByClassName('BRexpLogBox');
      for(i=0;i<tmpExp.length;i++){
        for(f=0;f<SPLUexpansionsFromFavorite.length;f++){
          if(tmpExp[i].id==SPLUexpansionsFromFavorite[f].id){
            tmpExp[i].checked=true;
            SPLUexpansionsFromFavorite.splice(f, 1);
          }
        }
      }
    }
    //Check if the length is still > 0 as this would indicate there are Family items to fetch and check as well
    if(SPLUexpansionsFromFavorite.length>0){
      showFamilyTab();
    }
  }
  
  function fetchExpansions(){
    SPLUprevGameID=SPLUgameID;
    document.getElementById('SPLU.ExpansionPane').innerHTML=SPLUi18n.StatusLoadingExpansions+"<img src='https://dazeysan.github.io/SPLU/Images/progress.gif'/>";
    var oReq=new XMLHttpRequest();
    oReq.onload=loadExpansions;
    oReq.open("get","/xmlapi2/thing?type=boardgame&id="+SPLUgameID,true);
    oReq.send();
  }
  
  function updateExpansionsQuantityField(){
    console.log("upExp");
    tmpQty=0;
    if(SPLUexpansionsFromFavorite.length==0){
      var tmpExp=document.getElementsByClassName('BRexpLogBox');
      for(i=0;i<tmpExp.length;i++){
        if(tmpExp[i].checked){
          tmpQty++;
        }
      }
    }else{
      tmpQty=SPLUexpansionsFromFavorite.length;
    }
    if(tmpQty==0){
      document.getElementById('SPLU_ExpansionsQuantity').innerHTML="";
    }else{
      document.getElementById('SPLU_ExpansionsQuantity').innerHTML=tmpQty+" "+SPLUi18n.StatusExpansionsSelected;
    }
  }

  function loadFamily(){
    var tmpExpID="";
    var tmpExpName="";
    document.getElementById('SPLU.ExpansionPane').style.display="none";
    document.getElementById('SPLU.FamilyPane').style.display="";
    document.getElementById('SPLU.FamilyPane').innerHTML="";
    document.getElementById('BRexpPlayQTY').value=SPLU.Settings.ExpansionQuantity.Value;
    document.getElementById('SPLU.ExpansionDetailsCheck').checked=SPLU.Settings.ExpansionDetails.Include;
    if(!this.responseXML.getElementsByTagName('link').length){
      document.getElementById('SPLU.FamilyPane').innerHTML+='<div>'+SPLUi18n.StatusNoFamilyItemsFound+'</div>';
    }else{
      BRexpList=this.responseXML.getElementsByTagName("link");
      var tmpHTML="";
      tmpHTML+='<div style="display:table;">';
      for(i=0;i<BRexpList.length;i++){
        tmpExpID=BRexpList[i].getAttribute("id");
        tmpExpName=BRexpList[i].getAttribute("value");
        tmpHTML+='<div style="display:table-row;"><div style="display:table-cell;"><input type="checkbox" id="'+tmpExpID+'" class="BRexpLogBox" data-tab="family" data-SPLU-ExpName="'+tmpExpName+'" onClick="javascript:{updateExpansionsQuantityField();if(SPLU.Settings.ExpansionComments.Visible){expansionListComment();}}"/> '+tmpExpName+'</div><div style="display:table-cell; width:50px;" id="QPresultsFam'+tmpExpID+'" name="QPresults'+tmpExpID+'"></div></div>';
      }
      tmpHTML+='</div>';
      document.getElementById('SPLU.FamilyPane').innerHTML+=tmpHTML;
      if(SPLUexpansionsFromFavorite.length>0){
        var tmpExp=document.getElementsByClassName('BRexpLogBox');
        for(i=0;i<tmpExp.length;i++){
          for(f=0;f<SPLUexpansionsFromFavorite.length;f++){
            if(tmpExp[i].id==SPLUexpansionsFromFavorite[f].id){
              tmpExp[i].checked=true;
              SPLUexpansionsFromFavorite.splice(f, 1);
            }
          }
        }
      }
    }
  }

  function fetchFamily(id){
    SPLUprevGameID=SPLUgameID;
    document.getElementById('SPLU.FamilyPane').innerHTML=SPLUi18n.StatusLoadingFamilyItems+"<img src='https://dazeysan.github.io/SPLU/Images/progress.gif'/>";
    SPLUfamilyID="-1";
    var name=document.getElementById('q546e9ffd96dfc').value;
    if(id==-1){
      for(i=0;i<SPLUfamilyList.length;i++){
        if(SPLUfamilyList[i].getAttribute("value")==name||SPLUfamilyList[i].getAttribute("value")==name.slice(0,name.indexOf(":"))){
          SPLUfamilyID=SPLUfamilyList[i].id;
        }
      }
    }else{
      SPLUfamilyID=id;
    }
    if(SPLUfamilyID==-1){
      tmpHTML=SPLUi18n.StatusNoMatchingFamilyFound+"<br/><br/>";
      if(SPLUfamilyList.length>=1){
        tmpHTML+=SPLUi18n.StatusPleaseChooseFamily+":<br/>";
        for(var i=0;i<SPLUfamilyList.length;i++){
          tmpHTML+='&nbsp;-&nbsp;<a href="javascript:{void(0);}" onClick="javascript:{fetchFamily(\''+SPLUfamilyList[i].id+'\');}">'+SPLUfamilyList[i].getAttribute("value")+'</a><br/>';
        }
      }
      document.getElementById('SPLU.FamilyPane').innerHTML=tmpHTML;
    }else{
      var oReq=new XMLHttpRequest();
      oReq.onload=loadFamily;
      oReq.open("get","/xmlapi2/family?id="+SPLUfamilyID,true);
      oReq.send();
    }
    SPLUfamilyLoaded=true;
  }
  
  function showExpansionTab(){
    document.getElementById('SPLU.FamilyPane').style.display="none";
    document.getElementById('SPLU.ExpansionPane').style.display="";
    document.getElementById('SPLU.ExpansionsHeading').style.borderTop="2px solid blue";
    document.getElementById('SPLU.FamilyHeading').style.borderTop="";
    if(SPLUgameID!=0&&SPLUprevGameID!=SPLUgameID&&!SPLUexpansionsLoaded){
      fetchExpansions();
    }
  }

  function showFamilyTab(){
    document.getElementById('SPLU.ExpansionPane').style.display="none";
    document.getElementById('SPLU.FamilyPane').style.display="";
    document.getElementById('SPLU.ExpansionsHeading').style.borderTop="";
    document.getElementById('SPLU.FamilyHeading').style.borderTop="2px solid blue";
    if(!SPLUfamilyLoaded){
      fetchFamily("-1");
    }
  }

  function clearExpansions(){
    var tmpExp=document.getElementsByClassName('BRexpLogBox');
    for(i=0;i<tmpExp.length;i++){
      tmpExp[i].checked=false;
    }
    if(SPLU.Settings.ExpansionComments.Visible){
      expansionListComment();
    }
  }

  function saveExpansionPlays(action){
    ExpansionsToLog=0;
    if(SPLUexpansionsFromFavorite.length==0){
      var tmpExp=document.getElementsByClassName('BRexpLogBox');
      for(i=0;i<tmpExp.length;i++){
        if(tmpExp[i].checked){
          ExpansionsToLog++;
        }
      }
    }else{
      var tmpExp=SPLUexpansionsFromFavorite;
      for(i=0; i<tmpExp.length; i++){
        tmpExp[i].checked=true;
        ExpansionsToLog++;
      }
    }
    if(ExpansionsToLog==0){
      document.getElementById('SPLUexpansionResults').innerHTML='';
      saveGamePlay2(action);
    }else{
      for(i=0;i<tmpExp.length;i++){
        if(tmpExp[i].checked){
          tmpWaiting = SPLUi18n.StatusWaitingForExpansionsToBeLogged.replace("$1", ExpansionsToLog);
          document.getElementById('SPLUexpansionResults').innerHTML=tmpWaiting;
          //document.getElementById('SPLUexpansionResults').innerHTML='Waiting for '+ExpansionsToLog+' expansions to be logged.';
          var QPR="";
          //Don't bother with status message if they haven't opened Expansion pane after loading Favorite
          if(SPLUexpansionsFromFavorite.length==0){
            if(tmpExp[i].getAttribute('data-tab')=="expansion"){
              QPR="QPresultsExp";
            }else{
              QPR="QPresultsFam";
            }
            var results=$(QPR+tmpExp[i].id);
            results.innerHTML=SPLUi18n.StatusSaving;
          }
          var form=document.forms['SPLUform'];
          var inputs=form.getElementsByTagName('input');
          var querystring="";
          var value="";
          var tmpComments="";
          if(SPLU.Settings.ExpansionLinkParent.Enabled){
            tmpComments=SPLUi18n.CommentLoggedAsPartOfThis+" [geekurl=/play/"+SPLUlastGameSaved+"]"+SPLUi18n.CommentParentPlay+"[/geekurl]\r\n"
          }
          if(SPLU.Settings.ExpansionDetails.Include){
            for(n=0; n<inputs.length; n++){
              if(inputs[n].name=="geekitemname" || inputs[n].name=="imageid"){
                continue;
              }
              if(inputs[n].type=='checkbox'){
                if(inputs[n].name=='nowinstats' && SPLU.Settings.ExpansionWinStats.Enabled){
                  value=1;
                }else{
                  if(inputs[n].checked){
                    value=1;
                  }else{
                    value=0;
                  }
                }
              }else{
                value=inputs[n].value;
              }
              querystring+="&"+inputs[n].name+"="+encodeURIComponent(value);
            }
            querystring+="&comments="+tmpComments+encodeURIComponent(form["quickplay_comments99"].value);
            querystring=querystring.replace("objectid="+SPLUgameID,"objectid="+tmpExp[i].id);
            querystring=querystring.replace("quantity="+document.getElementById('quickplay_quantity99').value,"quantity="+document.getElementById('BRexpPlayQTY').value);
          } else {
            querystring+="&objectid="+tmpExp[i].id;
            querystring+="&quantity="+document.getElementById('BRexpPlayQTY').value;
            querystring+="&playdate="+document.getElementById('playdate99').value;
          }
          if(SPLU.Settings.ExpansionWinStats.Enabled){
            querystring+="&nowinstats=1";
          }
          xmlhttp=new XMLHttpRequest();
          xmlhttp.open("POST","/geekplay.php",true);
          xmlhttp.onload=function(responseJSON,responseText){
            console.log("onload()");
            tmpJSON=JSON.parse(responseJSON.target.response);
            if(SPLUexpansionsFromFavorite.length==0){
              var results=document.getElementsByName('QPresults'+tmpJSON.html.slice(29,tmpJSON.html.indexOf("?")));
              for(var i=0;i<results.length;i++){
                if(tmpJSON.html.slice(-5)=="></a>"){
                  results[i].innerHTML=tmpJSON.html.slice(7,-4)+SPLUi18n.StatusLogged+"</a>";
                  console.log("line 6356");
                  fetchPlays(LoggedInAs,0,false,tmpJSON.html.slice(29,tmpJSON.html.indexOf("?")),document.getElementById('playdate99').value,-1,"");
                }else{
                  results[i].innerHTML=tmpJSON.html;
                }
                insertBlank(results[i].id);
              }
            }
            ExpansionsToLog--;
            tmpWaiting = SPLUi18n.StatusWaitingForExpansionsToBeLogged.replace("$1", ExpansionsToLog);
            document.getElementById('SPLUexpansionResults').innerHTML=tmpWaiting;
            //document.getElementById('SPLUexpansionResults').innerHTML='Waiting for '+ExpansionsToLog+' expansions to be logged.';
            if(ExpansionsToLog==0){
              document.getElementById('SPLUexpansionResults').innerHTML='';
              saveGamePlay2(action);
            }
          };
        xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.send('ajax=1&action=save&version=2&objecttype=thing'+querystring);        }
      }
    }
  }
  
  function showFavsPane(source){
    console.log("showFavsPane("+source+")");
    if(source=="button"&&document.getElementById('BRlogFavs').style.display=="table-cell"){
      document.getElementById('BRlogFavs').style.display="none";
      return;
    }
    hidePanes();
    //document.getElementById('SPLU.FavoritesEdit').style.display="none";
    document.getElementById('SPLU.FavoritesList').style.display="";
    document.getElementById('SPLU.FavoritesList').style.width="250px";
    document.getElementById('SPLU.FavoritesList').style.maxHeight=document.getElementById('BRlogMain').clientHeight-95+"px";
    document.getElementById('BRlogFavs').style.display="table-cell";
    var tmpHTML='<div id="FavoritesGrid" style="display:unset;">';
    var size=0;
    var old_thumbs = false;
    for(key in SPLU.Favorites){
        if(SPLU.Favorites.hasOwnProperty(key)){size++};
        if(size % 2==1){
          //tmpHTML+='<div style="display:table-row;">';
        }
        tmpMarkers="";
        if(SPLU.Favorites[key].location!==undefined){
          if(SPLU.Favorites[key].location!=""){
            tmpMarkers+='<i class="fa_SP fa_SP-map-marker" style="color: rgb(211, 60, 199);"></i>';
          }
        }
        if(SPLU.Favorites[key].players!==undefined){
          if(SPLU.Favorites[key].players.length>0){
            tmpMarkers+='<i class="fa_SP fa_SP-user" style="color: rgb(211, 60, 199);"></i>';
          }
        }
        if(SPLU.Favorites[key].expansions!==undefined){
          if(SPLU.Favorites[key].expansions.length>0){
            tmpMarkers+='<i class="fa_SP fa_SP-star" style="color: rgb(211, 60, 199);"></i>';
          }
        }
        tmpTitle=SPLU.Favorites[key].title;
        if(SPLU.Favorites[key].title2 !== undefined){
          if(SPLU.Favorites[key].title2 != ""){
            tmpTitle=SPLU.Favorites[key].title2;
          }
        }
        tmpHTML+='<div class="SPLUfavoritesGridItems" data-id="'+key+'" data-title="'+fixedEncodeURIComponent(tmpTitle)+'">';
        if(SPLU.Favorites[key].thumbnail == "off"){
          tmpHTML+='<a href="javascript:{void(0);}" onClick="javascript:{deleteFavorite(\''+key+'\');}"><img src="https://dazeysan.github.io/SPLU/Images/red_circle_x.png" style=""/></a>';
          tmpHTML+=tmpMarkers+'<a href="javascript:{void(0);}" onClick="javascript:{chooseFavorite(\''+key+'\');}">'+decodeURIComponent(tmpTitle)+'</a>';
        } else {
          tmpHTML+='<a href="javascript:{void(0);}" onClick="javascript:{chooseFavorite(\''+key+'\');}"><img id="SPLU.FavoritesThumb-'+key+'" src="'+SPLU.Favorites[key].thumbnail+'"></a>';
          tmpHTML+='<a href="javascript:{void(0);}" onClick="javascript:{deleteFavorite(\''+key+'\');}"><img src="https://dazeysan.github.io/SPLU/Images/red_circle_x.png" style="vertical-align:top; position: relative; margin-left: -8px; margin-top: -8px;"/></a>';
          tmpHTML+='<br/>';
          tmpHTML+=tmpMarkers+' '+decodeURIComponent(tmpTitle);
        }
        tmpHTML+='</div>';
        if(size % 2==0){
          //tmpHTML+='</div>';
        }
        //Check if they have the old thumbnail URLs
        // if(SPLU.Favorites[key].thumbnail !== undefined){
          // if (SPLU.Favorites[key].thumbnail.substr(0,36) == "https://cf.geekdo-images.com/images/"){
            // //Old URL detected, set flag to update all thumbnails
            // old_thumbs = true;
          // }
        // }
    }
    tmpHTML+='</div>';
    document.getElementById('SPLU.FavoritesList').innerHTML=tmpHTML;
    tmpFavs = SPLUi18n.StatusYouHaveFavorites.replace("$1", size);
    tmpFavs += "<a onclick=\"javascript:{FLsort.options.dataIdAttr='data-title'; FLsort.sort(FLsort.toArray().sort(function (a, b) {return a.toLowerCase().localeCompare(b.toLowerCase());}))}\" href=\"javascript:{void(0);}\"><i class=\"fa_SP fa_SP-sort-alpha-asc\"></i></a>"
    document.getElementById('SPLU.FavoritesStatus').innerHTML='<center>'+tmpFavs+'</center><br/>';
    //document.getElementById('SPLU.FavoritesStatus').innerHTML='<center>You have '+size+' Favorites.</center><br/>';
    //Do we need to fetch new thumbnails?
    //Just run updateFavoriteThumbs() and have it check for old URL and size
    // if (old_thumbs && SPLU.Settings.Favorites.ThumbSize!="off") {
      updateFavoriteThumbs(SPLU.Settings.Favorites.ThumbSize);
      // old_thumbs = false;
    // }
    FLsort = Sortable.create(document.getElementById('FavoritesGrid'), {
      group: "SPLUFavoritesList",
    }) 
    if (SPLU.FavoritesOrder!==undefined){
      //Sort the favorites using the saved settings
      console.log("Sorting Favs using saved settings.");
      FLsort.options.dataIdAttr="data-id";
      FLsort.sort(SPLU.FavoritesOrder);
    } else {
      //Load the current unsorted favorites in to the settings, but don't save
      console.log("No Favs sort order saved, not sorting.");
      FLsort.options.dataIdAttr="data-id";
      SPLU.FavoritesOrder=FLsort.toArray();
    }
  }

  function saveFavoritesOrder(){
    document.getElementById('SPLU.FavoritesLowerStatus').innerHTML=SPLUi18n.StatusThinking;
    FLsort.options.dataIdAttr="data-id";
    SPLU.FavoritesOrder=FLsort.toArray();
    SPLUremote.FavoritesOrder=SPLU.FavoritesOrder;
    saveSooty("SPLU.FavoritesLowerStatus",SPLUi18n.StatusThinking,SPLUi18n.StatusSaved,function(){
      //Nothing to do after saving favorites order?
    });
  }
  
  function updateFavoriteThumbs(size){
    console.log("updateFavoriteThumbs("+size+");");
    //var tmpNewThumbs=false;
    for(key in SPLU.Favorites){
      objectid = SPLU.Favorites[key].objectid;
      var tmpType="thing";
      var tmpSubType="boardgame";
      if(SPLU.Favorites[key].objecttype=="videogame"){
        tmpSubType="videogame";
      }
      if(SPLU.Favorites[key].objecttype=="rpg"){
        tmpType="family";
        tmpSubType="rpg";
      }
      if(SPLU.Favorites[key].objecttype=="rpgitem"){
        tmpType="rpgitem";
        tmpSubType="rpg";
      }
      if(size == "off"){
        SPLU.Favorites[key].thumbnail = "off";
      } else {
        if(SPLU.Favorites[key].thumbnail !== undefined){
          //Check if they have an old URL for the tumbnail or if the size doesn't match their settings.  
          if (SPLU.Favorites[key].thumbnail.substr(0,36) == "https://cf.geekdo-images.com/images/" || !SPLU.Favorites[key].thumbnail.includes(size)){
            document.getElementById('SPLU.FavoritesLowerStatus').innerHTML=SPLUi18n.StatusUpdatingThumbnails;
            fetchImageListQueue(objectid, "img", "SPLU.FavoritesThumb-"+key, size, key, "",tmpType,tmpSubType);
            //tmpNewThumbs=true;
            SPLUqueueSaveAfter=true;
          }
        }  
      }
    }
    // if(tmpNewThumbs) {
      // window.setTimeout(saveSettings(SPLUi18n.StatusFinished),5000);
    // }
  }
    
  function showSettingsPane(source){
    if(source=="button"&&document.getElementById('BRlogSettings').style.display=="table-cell"){
      document.getElementById('SPLUwindow').style.minWidth="";
      document.getElementById('BRlogSettings').style.display="none";
      return;
    }
    hidePanes();
    document.getElementById('SPLUwindow').style.minWidth="610px";
    document.getElementById('BRlogSettings').style.display="table-cell";
    loadDefaultPlayersList();
    loadDefaultLocationList();
    loadFavoritesThumbSizeList();
    if(SPLUi18nList.en===undefined){
      fetchLanguageListQueue();
    }
  }
  
  function showExpansionsPane(source){
    if(source=="button"&&document.getElementById('BRlogExpansions').style.display=="table-cell"){
      document.getElementById('BRlogExpansions').style.display="none";
      return;
    }
    hidePanes();
    document.getElementById('SPLU.ExpansionPane').style.height=document.getElementById('BRlogMain').clientHeight-155+"px";
    document.getElementById('SPLU.FamilyPane').style.height=document.getElementById('BRlogMain').clientHeight-155+"px";
    document.getElementById('BRlogExpansions').style.display="table-cell";
    if(SPLUgameID!=0&&SPLUprevGameID!=SPLUgameID&&!SPLUexpansionsLoaded){
      fetchExpansions();
    }
  }

  function showPlaysPane(source){
    SPLUhistoryOpened++;
    SPLUwindowHeight=document.getElementById("SPLUwindow").clientHeight;
    if(source=="button"&&document.getElementById('BRlogPlays').style.display=="table-cell"){
      document.getElementById('BRlogPlays').style.display="none";
      return;
    }
    hidePanes();
    document.getElementById("SPLU.PlaysList").style.maxHeight=(document.getElementById("SPLUwindow").clientHeight-122)+"px";
    document.getElementById('BRlogPlays').style.display="table-cell";
    if(SPLUhistoryOpened==1){
      //getRecentPlays(false, -1);
      fetchUserID(-1);
    }
    showPlaysTab("filters");
  }
  
  function showLocationsPane(source){
    if(source=="button"&&document.getElementById('BRlogLocations').style.display=="table-cell"){
      document.getElementById('BRlogLocations').style.display="none";
      return;
    }
    hidePanes();
    document.getElementById('SPLU.LocationsList').style.height=document.getElementById('BRlogMain').clientHeight-100+"px";
    document.getElementById('BRlogLocations').style.display="table-cell";
    SPLUlocationCount=0;
    var tmpHTML="<div style='text-align: center;width: 100%;'><a onclick=\"javascript:{ELsort.sort(ELsort.toArray().sort(function (a, b) {return a.toLowerCase().localeCompare(b.toLowerCase());}))}\" href=\"javascript:{void(0);}\"><i class=\"fa_SP fa_SP-sort-alpha-asc\"></i></a></div>";
    tmpHTML+="<div style='display:table;' id='EditLocationsTable'>";
    for(var key in SPLU.Locations){
      if (SPLU.Locations.hasOwnProperty(key)) {
        SPLUlocationCount++;
        tmpStar="";
        if(key==SPLU.Settings.DefaultLocation.Name){
          tmpStar="checked";
        }
        tmpHTML+="<div style='display:table-row;' id='EditLocationsRow"+key+"' data-id='"+SPLU.Locations[key].Name+"'>";
        tmpHTML+='<div style="display:table-cell;padding:1px;"><a href="javascript:{void(0);}" onClick="javascript:{document.getElementById(\'EditLocationsTable\').removeChild(document.getElementById(\'EditLocationsRow'+key+'\'));}" style="color:red;margin:2px;"><img src="https://dazeysan.github.io/SPLU/Images/delete_row_small.png"></a></div>';
        tmpHTML+="<div style='display:table-cell;padding:1px;'><span style='background-color: white;padding: 2px;'><input type='text' class='EditLocationsField' tabindex='"+(1000+SPLUlocationCount)+"' style='border:none;width:160px;background-color: transparent;' value=\""+decodeURIComponent(SPLU.Locations[key].Name)+"\" onkeyup='javascript:{document.getElementById(\"EditLocationsRow"+key+"\").setAttribute(\"data-id\",fixedEncodeURIComponent(this.value))}' /><input type='radio' style='margin-right: 5px;' name='SPLUdefaultLocationRadio' "+tmpStar+"></input></span><div style='display:inline-block;'><i style='font-size: 1.1em;' class='fa_SP fa_SP-drag-row'></i></div></div>";
        tmpHTML+="</div>";
      }
    }
    tmpHTML+='</div>';
    document.getElementById('SPLU.LocationsList').innerHTML=tmpHTML;
    addLocation();

    ELsort = Sortable.create(document.getElementById('EditLocationsTable'), {
      filter: 'input',
      preventOnFilter: false,
      animation: 150,
      group: "EditLocationsTable"
    })    
  }
  
  function addLocation(){
    SPLUlocationCount++;
    var tmpDiv=document.createElement('div');
    tmpDiv.style.display="table-row";
    tmpDiv.id="EditLocationsRow"+SPLUlocationCount;
    tmpDiv.setAttribute('data-id' , 'ZZZ');
    var tmpHTML='<div style="display:table-cell;padding:1px;"><a href="javascript:{void(0);}" onClick="javascript:{document.getElementById(\'EditLocationsTable\').removeChild(document.getElementById(\'EditLocationsRow'+SPLUlocationCount+'\'));}" style="color:red;margin:2px;"><img src="https://dazeysan.github.io/SPLU/Images/delete_row_small.png"></a></div>';
    tmpHTML+="<div style='display:table-cell;padding:1px;'><span style='background-color: white;padding: 2px;'><input type='text' class='EditLocationsField' tabindex='"+(1000+SPLUlocationCount)+"' style='border:none;width:160px;background-color: transparent;' onkeyup='javascript:{document.getElementById(\"EditLocationsRow"+SPLUlocationCount+"\").setAttribute(\"data-id\",fixedEncodeURIComponent(this.value))}' /><input type='radio' style='margin-right: 5px;' name='SPLUdefaultLocationRadio'></input></span><div style='display:inline-block;'><i style='font-size: 1.1em;' class='fa_SP fa_SP-drag-row'></i></div></div>";
    tmpDiv.innerHTML=tmpHTML;
    document.getElementById('EditLocationsTable').appendChild(tmpDiv);
  }
  
  function saveLocations(){
    document.getElementById('SPLU.LocationsStatus').innerHTML=SPLUi18n.StatusThinking;
    SPLU.Locations={};
    var locations=document.getElementsByClassName('EditLocationsField');
    var tmpFav=document.getElementsByName('SPLUdefaultLocationRadio');
    for(i=0;i<locations.length;i++){
      if(locations[i].value!=""){
        SPLU.Locations[i]={"Name":fixedEncodeURIComponent(locations[i].value)};
        if(tmpFav[i].checked){
          SPLU.Settings.DefaultLocation.Name=i;
        }
      }
    }
    SPLUremote.Locations=SPLU.Locations;
    saveSooty("SPLU.LocationsStatus",SPLUi18n.StatusThinking,SPLUi18n.StatusSaved,function(){
      loadLocations();
      showLocationsPane("save");
    });
  }
  
  function showPlayersPane(source){
    if(source=="button"&&document.getElementById('BRlogPlayers').style.display=="table-cell"){
      document.getElementById('BRlogPlayers').style.display="none";
      return;
    }
    hidePanes();
    showPlayersTab();
    document.getElementById('SPLU.PlayersList').style.height=document.getElementById('BRlogMain').clientHeight-155+"px";
    document.getElementById('BRlogPlayers').style.display="table-cell";
    SPLUplayerCount=0;
    var tmpHTML="<div style='display:table;' id='EditPlayersTable'>";
    var players=[];
    // if(SPLU.Settings.SortPlayers.Order=="Alpha"){
      // players = Object.keys(SPLU.Players).sort();
    // }else{
      players = Object.keys(SPLU.Players);
    // }
    for(var key=0;key<players.length;key++){
      var tmp="";
      if (SPLU.Players.hasOwnProperty(players[key])) {
        SPLUplayerCount++;
        if(SPLUplayerCount % 2==1){
          tmp="background-color:#E5EA3C;";
        }else{
          tmp="";
        }
        tmpHTML+="<div style='display:table-row;' id='EditPlayersRow"+fixedEncodeURIComponent(players[key])+"' data-id='"+SPLU.Players[players[key]].Name+"'>";
        tmpHTML+="<div style='display:table-cell;' name='SPLUplayerEditColumn'>"+'<a href="javascript:{void(0);}" onClick="javascript:{document.getElementById(\'EditPlayersTable\').removeChild(document.getElementById(\'EditPlayersRow'+fixedEncodeURIComponent(players[key])+'\'));removePlayer(\''+fixedEncodeURIComponent(players[key])+'\')}" style="vertical-align:middle; padding-right:5px;"><img src="https://dazeysan.github.io/SPLU/Images/delete_row_small.png"></a></div>';
        tmpHTML+="<div style='display:table-cell;padding-right:2px;' name='SPLUplayerEditColumn'><input type='text' size='12' tabindex='"+(1100+(SPLUplayerCount*5))+"' class='EditPlayersField' id='SPLUplayerName"+players[key]+"' value=\""+decodeURIComponent(SPLU.Players[players[key]].Name)+"\"/></div>";
        tmpHTML+="<div style='display:table-cell;padding-right:2px;' name='SPLUplayerEditColumn'><input type='text' size='12' tabindex='"+(1101+(SPLUplayerCount*5))+"' id='SPLUplayerUsername"+players[key]+"' value=\""+decodeURIComponent(SPLU.Players[players[key]].Username)+"\"/></div>";
        tmpHTML+="<div style='display:table-cell;padding-right:2px;' name='SPLUplayerEditColumn'><input type='text' size='5' tabindex='"+(1102+(SPLUplayerCount*5))+"' id='SPLUplayerColor"+players[key]+"' value=\""+decodeURIComponent(SPLU.Players[players[key]].Color)+"\"/><input type='hidden' id='SPLUplayerID"+players[key]+"' value='"+players[key]+"'><i style='font-size: 1.1em;' class='fa_SP fa_SP-drag-row'></i></div>";
        
        tmpHTML+="<div style='display:none;width:22px;' name='SPLUplayerStaticColumn'></div>";
        tmpHTML+="<div style='display:none;width:84px;"+tmp+"' name='SPLUplayerStaticColumn'>"+decodeURIComponent(SPLU.Players[players[key]].Name)+"</div>";
        tmpHTML+="<div style='display:none;width:84px;"+tmp+"' name='SPLUplayerStaticColumn'>"+decodeURIComponent(SPLU.Players[players[key]].Username)+"</div>";
        tmpHTML+="<div style='display:none;width:64px;"+tmp+"' name='SPLUplayerFilterColumn'><center><input type='checkbox' name='SPLUfilterChecks' style='vertical-align:middle;' value='"+players[key]+"' onClick='javascript:{updateFilters(this);}'></input></center></div>";
        tmpHTML+="<div style='display:none;width:64px;"+tmp+"' name='SPLUplayerGroupColumn'><center><input type='checkbox' name='SPLUgroupChecks' style='vertical-align:middle;' value='"+players[key]+"' onClick='javascript:{updateGroups(this);}'></input></center></div>";
        tmpHTML+="</div>";
      }
    }
    var groups=[];
    var tmpCount=SPLUplayerCount;
    if(SPLU.Settings.SortGroups.Order=="Alpha"){
      groups = Object.keys(SPLU.Groups).sort();
    }else{
      groups = Object.keys(SPLU.Groups);
    }
    for(var key=0;key<groups.length;key++){
      var tmp="";
      if (SPLU.Groups.hasOwnProperty(groups[key])) {
        tmpCount++;
        if(tmpCount % 2==1){
          tmp="background-color:#E5EA3C;";
        }else{
          tmp="";
        }
        tmpHTML+="<div style='display:table-row;' name='SPLUgroupsFilterRow'>";
        tmpHTML+="<div style='display:table-cell; display:none;'></div>";
        tmpHTML+="<div style='display:table-cell;padding-right:2px; display:none;'></div>";
        tmpHTML+="<div style='display:table-cell;padding-right:2px; display:none;'></div>";
        tmpHTML+="<div style='display:table-cell;padding-right:2px; display:none;'></div>";
        tmpHTML+="<div style='display:none;width:22px;' name='SPLUplayerStaticColumn'></div>";
        tmpHTML+="<div style='display:none;width:84px;"+tmp+"' name='SPLUplayerStaticColumn'>["+decodeURIComponent(groups[key])+"]</div>";
        tmpHTML+="<div style='display:none;width:84px;"+tmp+"' name='SPLUplayerStaticColumn'></div>";
        tmpHTML+="<div style='display:none;width:64px;"+tmp+"' name='SPLUplayerFilterColumn'><center><input type='checkbox' name='SPLUfilterChecks' style='vertical-align:middle;' value='group-"+groups[key]+"' onClick='javascript:{updateFilters(this);}'></input></center></div>";
        tmpHTML+="<div style='display:none;width:64px;"+tmp+"' name='SPLUplayerGroupColumn'></div>";
        tmpHTML+="</div>";
      }
    }
    tmpHTML+='</div>';
    document.getElementById('SPLU.PlayersList').innerHTML=tmpHTML;
    addPlayer();
    
    ELsort = Sortable.create(document.getElementById('EditPlayersTable'), {
      filter: 'input',
      preventOnFilter: false,
      animation: 150,
      group: "EditPlayersTable"
    })
    
  }

  function addPlayer(){
    SPLUplayerCount++;
    var tmpDiv=document.createElement('div');
    tmpDiv.style.display="table-row";
    tmpDiv.id="EditPlayersRow"+SPLUplayerCount;
    var tmpHTML="<div style='display:table-cell;' name='SPLUplayerEditColumn'>"+'<a href="javascript:{void(0);}" onClick="javascript:{document.getElementById(\'EditPlayersTable\').removeChild(document.getElementById(\'EditPlayersRow'+SPLUplayerCount+'\'));}" style="vertical-align:middle;"><img src="https://dazeysan.github.io/SPLU/Images/delete_row_small.png"></a></div>';
    tmpHTML+="<div style='display:table-cell;' name='SPLUplayerEditColumn'><input type='text' size='12' tabindex='"+(1100+(SPLUplayerCount*5))+"' class='EditPlayersField' id='SPLUplayerName"+SPLUplayerCount+"'/></div>";
    tmpHTML+="<div style='display:table-cell;' name='SPLUplayerEditColumn'><input type='text' size='12' tabindex='"+(1101+(SPLUplayerCount*5))+"' id='SPLUplayerUsername"+SPLUplayerCount+"'/></div>";
    tmpHTML+="<div style='display:table-cell;' name='SPLUplayerEditColumn'><input type='text' size='5' tabindex='"+(1102+(SPLUplayerCount*5))+"' id='SPLUplayerColor"+SPLUplayerCount+"'/><input type='hidden' id='SPLUplayerID"+SPLUplayerCount+"' value='-1'><i style='font-size: 1.1em;' class='fa_SP fa_SP-drag-row'></i></div>";
    tmpDiv.innerHTML=tmpHTML;
    document.getElementById('EditPlayersTable').appendChild(tmpDiv);
  }
  
  function savePlayers(){
    document.getElementById('SPLU.PlayersStatus').innerHTML=SPLUi18n.StatusThinking;
    SPLU.Players={};
    SPLU.PlayersOrder=[];
    var players=document.getElementsByClassName('EditPlayersField');
    for(i=0;i<players.length;i++){
      p=players[i].id.slice(14);
      playersUsername=document.getElementById('SPLUplayerUsername'+p).value;
      playersColor=document.getElementById('SPLUplayerColor'+p).value;
      playersID=document.getElementById('SPLUplayerID'+p).value;
      if(players[i].value!=""||playersUsername!=""){
        if(playersID == -1) {
          tmp=Math.random();
          if(players[i].value==""){
            tmpPlayersID=playersUsername.replace(/ /g,'').toLowerCase()+tmp.toString().slice(-4);
          }else{
            tmpPlayersID=players[i].value.replace(/ /g,'').toLowerCase()+tmp.toString().slice(-4);
          }
          if(playersID.slice(0,-4)!=tmpPlayersID.slice(0,-4)){
            playersID=tmpPlayersID;
          }
        }
        SPLU.Players[(playersID)]={"Name":encodeURIComponent(players[i].value),"Username":encodeURIComponent(playersUsername),"Color":encodeURIComponent(playersColor)};
        SPLU.PlayersOrder.push(playersID);
      }
    }
    SPLUremote.Players=SPLU.Players;
    saveSooty("SPLU.PlayersStatus",SPLUi18n.StatusThinking,SPLUi18n.StatusSaved,function(){
      loadPlayers();
      showPlayersPane("save");
    });
  }
  
  function removePlayer(id){
    for(var key in SPLU.Groups){
      var index=SPLU.Groups[key].indexOf(id);
      if(index>=0){
       SPLU.Groups[key].splice(index,1);
        document.getElementById('SPLU.PlayersStatus').innerHTML="<span style='color:red;'>"+SPLUi18n.StatusUnsavedGroupsFilters+"</span>";
        document.getElementById('SPLU.GroupsStatus').innerHTML="<span style='color:red;'>"+SPLUi18n.StatusUnsavedGroups+"</span>";
      }
    }
    for(var key in SPLU.Filters){
      var index=SPLU.Filters[key].indexOf(id);
      if(index>=0){
        SPLU.Filters[key].splice(index,1);
        document.getElementById('SPLU.PlayersStatus').innerHTML="<span style='color:red;'>"+SPLUi18n.StatusUnsavedGroupsFilters+"</span>";
        document.getElementById('SPLU.FiltersStatus').innerHTML="<span style='color:red;'>"+SPLUi18n.StatusUnsavedFilters+"</span>";
      }
    }
  }
  
  function setPlayerPaneColumn(name,value){
    tmp=document.getElementsByName(name);
    for(i=0;i<tmp.length;i++){
      tmp[i].style.display=value;
    }
  }
  
  function setGroupsFilterRow(value){
    tmp=document.getElementsByName('SPLUgroupsFilterRow');
    for(i=0;i<tmp.length;i++){
      tmp[i].style.display=value;
    }
  }
  
  function showFiltersTab(){
    setPlayerPaneColumn('SPLUplayerEditColumn','none');
    setPlayerPaneColumn('SPLUplayerGroupColumn','none');
    setPlayerPaneColumn('SPLUplayerFilterColumn','table-cell');
    setPlayerPaneColumn('SPLUplayerStaticColumn','table-cell');
    document.getElementById('SPLU.FiltersSubSelect').style.display="";
    document.getElementById('SPLU.GroupsSubSelect').style.display="none";
    document.getElementById('SPLU.PlayersHeading').style.borderTop="";
    document.getElementById('SPLU.FiltersHeading').style.borderTop="2px solid blue";
    document.getElementById('SPLU.GroupsHeading').style.borderTop="";
    document.getElementById('SPLU.PlayersPaneControls').style.display="none";
    document.getElementById('SPLU.FiltersPaneControls').style.display="";
    document.getElementById('SPLU.GroupsPaneControls').style.display="none";
    document.getElementById('SPLU.FiltersDeleteCell').style.display="";
    document.getElementById('SPLU.GroupsDeleteCell').style.display="none";
    setGroupsFilterRow('table-row');
    setFilter("choose");
  }

  function showPlayersTab(){
    setPlayerPaneColumn('SPLUplayerGroupColumn','none');
    setPlayerPaneColumn('SPLUplayerFilterColumn','none');
    setPlayerPaneColumn('SPLUplayerStaticColumn','none');
    setPlayerPaneColumn('SPLUplayerEditColumn','table-cell');
    document.getElementById('SPLU.FiltersSubSelect').style.display="none";
    document.getElementById('SPLU.GroupsSubSelect').style.display="none";
    document.getElementById('SPLU.PlayersHeading').style.borderTop="2px solid blue";
    document.getElementById('SPLU.FiltersHeading').style.borderTop="";
    document.getElementById('SPLU.GroupsHeading').style.borderTop="";
    document.getElementById('SPLU.PlayersPaneControls').style.display="";
    document.getElementById('SPLU.FiltersPaneControls').style.display="none";
    document.getElementById('SPLU.GroupsPaneControls').style.display="none";
    document.getElementById('SPLU.FiltersDeleteCell').style.display="none";
    document.getElementById('SPLU.GroupsDeleteCell').style.display="none";
    setGroupsFilterRow('none');
  }
  
  function showGroupsTab(){
    setPlayerPaneColumn('SPLUplayerFilterColumn','none');
    setPlayerPaneColumn('SPLUplayerEditColumn','none');
    setPlayerPaneColumn('SPLUplayerStaticColumn','table-cell');
    setPlayerPaneColumn('SPLUplayerGroupColumn','table-cell');
    document.getElementById('SPLU.FiltersSubSelect').style.display="none";
    document.getElementById('SPLU.GroupsSubSelect').style.display="";
    document.getElementById('SPLU.PlayersHeading').style.borderTop="";
    document.getElementById('SPLU.FiltersHeading').style.borderTop="";
    document.getElementById('SPLU.GroupsHeading').style.borderTop="2px solid blue";
    document.getElementById('SPLU.PlayersPaneControls').style.display="none";
    document.getElementById('SPLU.FiltersPaneControls').style.display="none";
    document.getElementById('SPLU.GroupsPaneControls').style.display="";
    document.getElementById('SPLU.FiltersDeleteCell').style.display="none";
    document.getElementById('SPLU.GroupsDeleteCell').style.display="";
    setGroupsFilterRow('none');
    setGroup();
  }

  function updateFilters(id){
    if(document.getElementById('SPLU.FiltersSubSelect').value!="---"){
      if(id.checked){
        SPLU.Filters[SPLUcurrentFilter].push(id.value);
      }else{
        var index=SPLU.Filters[SPLUcurrentFilter].indexOf(id.value);
        if (index>-1) {
          SPLU.Filters[SPLUcurrentFilter].splice(index, 1);
        }
      }
      loadPlayers();
      document.getElementById('SPLU.FiltersStatus').innerHTML="<span style='color:red;'>"+SPLUi18n.StatusUnsavedFilters+"</span>";
    }else{
      id.checked=false;
    }
  }
  
  function addFilter(){
    var filter=document.getElementById('SPLU.NewFilterName');
    if(filter.value!=""){
      SPLU.Filters[filter.value]=[];
      SPLUcurrentFilter=filter.value;
      loadFilters();
      loadPlayers();
      var checks=document.getElementsByName('SPLUfilterChecks');
      for(i=0;i<checks.length;i++){
        checks[i].checked=false;
      }
      filter.value="";
      document.getElementById('SPLU.FiltersStatus').innerHTML="<span style='color:red;'>"+SPLUi18n.StatusUnsavedFilters+"</span>";
    }
  }
  
  function saveFilters(){
    document.getElementById('SPLU.FiltersStatus').innerHTML=SPLUi18n.StatusThinking;
    document.getElementById('SPLU.PlayersStatus').innerHTML="";
    SPLUremote.Filters=SPLU.Filters;
    saveSooty("SPLU.FiltersStatus",SPLUi18n.StatusThinking,SPLUi18n.StatusSaved,function(){});
  }

  function removeFilter(){
    var filter=document.getElementById('SPLU.FiltersSubSelect').value;
    if(filter!="---"){
      delete SPLU.Filters[filter];
      setFilter("delete");
      document.getElementById('SPLU.FiltersStatus').innerHTML="<span style='color:red;'>"+SPLUi18n.StatusUnsavedFilters+"</span>";
    }
  }

  function updateGroups(id){
    if(document.getElementById('SPLU.GroupsSubSelect').value!=""){
      if(id.checked){
        SPLU.Groups[SPLUcurrentGroup].push(id.value);
      }else{
        var index=SPLU.Groups[SPLUcurrentGroup].indexOf(id.value);
        if (index>-1) {
          SPLU.Groups[SPLUcurrentGroup].splice(index, 1);
        }
      }
      document.getElementById('SPLU.GroupsStatus').innerHTML="<span style='color:red;'>"+SPLUi18n.StatusUnsavedGroups+"</span>";
    }else{
      id.checked=false;
    }
  }

  function addGroup(){
    var group=document.getElementById('SPLU.NewGroupName');
    if(group.value!=""){
      SPLU.Groups[group.value]=[];
      SPLUcurrentGroup=group.value;
      loadGroups();
      loadPlayers();
      var checks=document.getElementsByName('SPLUgroupChecks');
      for(i=0;i<checks.length;i++){
        checks[i].checked=false;
      }
      group.value="";
      document.getElementById('SPLU.GroupsStatus').innerHTML="<span style='color:red;'>"+SPLUi18n.StatusUnsavedGroups+"</span>";
    }
  }
  
  function removeGroup(){
    var group=document.getElementById('SPLU.GroupsSubSelect').value;
    if(group!=""){
      delete SPLU.Groups[group];
      loadGroups();
      if(SPLUcurrentFilter=="All"){
        loadPlayers();
      }
      document.getElementById('SPLU.GroupsStatus').innerHTML="<span style='color:red;'>"+SPLUi18n.StatusUnsavedGroups+"</span>";
    }
  }
  
  function saveGroups(){
    document.getElementById('SPLU.GroupsStatus').innerHTML=SPLUi18n.StatusThinking;
    document.getElementById('SPLU.PlayersStatus').innerHTML="";
    SPLUremote.Groups=SPLU.Groups;
    saveSooty("SPLU.GroupsStatus",SPLUi18n.StatusThinking,SPLUi18n.StatusSaved,function(){});
  }

  function insertGroup(group){
    group = decodeURIComponent(group);
    for(i=0;i<SPLU.Groups[group].length;i++){
      insertPlayer(SPLU.Groups[group][i]);
    }
  }
  
  function hidePanes(){
    console.log("hidePanes()");
    document.getElementById('BRlogSettings').style.display="none";
    document.getElementById('SPLUwindow').style.minWidth="";
    document.getElementById('BRlogFavs').style.display="none";
    document.getElementById('BRlogExpansions').style.display="none";
    document.getElementById('BRlogLocations').style.display="none";
    document.getElementById('BRlogPlayers').style.display="none";
    document.getElementById('BRlogPlays').style.display="none";
  }
  
  var SPLUuser={};
  var oReq=new XMLHttpRequest();
  oReq.onload=function(responseJSON){
    console.log(responseJSON.target.status+"|"+responseJSON.target.statusText);
    if(responseJSON.target.status==200){
      console.log("result 200 fetching user");
      SPLUuser=JSON.parse(responseJSON.target.responseText);
      LoggedInAs=SPLUuser.username;
      if(!SPLUuser.loggedIn){
        alert("You aren't logged in.");
        throw new Error("You aren't logged in.");
      }else{
        fetchSaveData();
      }
    }else{
      console.log("other status code, can't determine user");
      alert("Can't determine who you are.  Reload, Login if needed and try again.");
      throw new Error("Can't determine user.");
    }
  };
  oReq.open("get","/api/users/current",true);
  oReq.send();



