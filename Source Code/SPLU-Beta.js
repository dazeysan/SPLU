// SPLU 5.2.3 Beta

  //Check if SPLU is already open, throw an error if not
  if(document.getElementById('BRlog')){throw new Error("SPLU Already Running");}
  var LoggedInAs = document.getElementsByClassName('menu_login')[0].childNodes[3].childNodes[1].innerHTML;
  //Check if the user is logged in to BGG, throw an error if not
  if(LoggedInAs==""){alert("You aren't logged in.");throw new Error("You aren't logged in.");}
  var SPLUversion="5.2.3";

  function fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }
  
  //This should be at the bottom but is up here to deal with splitting the code to save it in a geeklist.
  //Could probably rearrange it if we're going to load from GitHub directly.
  function finalSetup(){
    loadPlayers();  
    loadLocations();    
    for (var key in SPLU.Settings) {
      if (SPLU.Settings.hasOwnProperty(key)) {
        if(SPLU.Settings[key].Visible){
          document.getElementById("SPLU."+key+"Check").checked=true;
        }else{
          if(key!="PopUpText" && key!="LocationList" && key!="WinComments" && key!="PlayerList" && key!="ExpansionQuantity" && key!="SortPlayers" && key!="SortGroups" && key!="PlayerGroups"){
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
            showHidePlayers();
          }
          if(key=="SortPlayers"&&SPLU.Settings[key].Order=="Alpha"){
            document.getElementById("SPLU.SortPlayersAlphaCheck").checked=true;
          }
          if(key=="PlayerFilters"){
            document.getElementById("SPLU.FiltersHeading").style.display="none";
          }
          if(key=="PlayerGroups"){
            document.getElementById("SPLU.GroupsHeading").style.display="none";
          }
        }
        if(SPLU.Settings[key].Reset){
          document.getElementById("SPLU."+key+"Reset").checked=true;
        }
      }
    }
    
    //Set the ObjectType accoring to the site they are currently on
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
    insertPlayer(-1);
    getGameID();
    loadFilters();
    loadGroups();
    SPLUcalendar = new YAHOO.widget.Calendar('SPLU.Calendar');
    var tmp=new Date();
    SPLUcalendar.cfg.setProperty("maxdate",tmp);
    SPLUcalendar.selectEvent.subscribe(function(){setDateField(SPLUcalendar.getSelectedDates()[0].toISOString().slice(0,SPLUcalendar.getSelectedDates()[0].toISOString().indexOf("T")));showHideCalendar();});
    document.getElementById('q546e9ffd96dfc').value=getGameTitle();
    
  }
  
  function resetSettings(){
    SPLU.Settings={
      "DateField":{"Visible":true,"Reset":false},
      "LocationField":{"Visible":true,"Reset":false},
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
      "DomainButtons":{"Visible":false},
      "ExpansionQuantity":{"Value":".1"},
      "SortPlayers":{"Order":"none"},
      "SortGroups":{"Order":"none"},
      "PlayerFilters":{"Visible":false},
      "PlayerGroups":{"Visible":false}
    }
  }
  
  var SPLU={};
  var SPLUplayId="";

  function compareSPLU(){
    SPLUtemp=SPLU;
    SPLU = {
      "Version":SPLUversion,
      "Favorites":{},
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
  
  function findSaveData(){
    var tmp="";
    var oReq = new XMLHttpRequest();
    oReq.onload = function(){
      tmp=this.responseXML;
      if(tmp.getElementsByTagName('comments').length==0){
        if(false){
          window.setTimeout(function(){findSaveData();},250);
          return;
        }else{
          SPLU = {
            "Version":SPLUversion,
            "Favorites":{ },
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
          xmlhttp=new XMLHttpRequest();
          xmlhttp.onload=function(){
            var tmp2="";
            var oReq2 = new XMLHttpRequest();
            oReq2.onload = function(){
              tmp2=this.responseXML;
              SPLUplayId=tmp2.getElementsByTagName("play")[0].id;
              finalSetup();
            };
            oReq2.open("get", "/xmlapi2/plays?username="+LoggedInAs+"&mindate=1452-04-15&maxdate=1452-04-15&id=98000", true);
            oReq2.send();
          };
          xmlhttp.open("POST","/geekplay.php",true);
          xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
          xmlhttp.send("version=2&objecttype=thing&objectid=98000&action=save&quantity=0&comments="+fixedEncodeURIComponent(JSON.stringify(SPLU))+"&playdate=1452-04-15&B1=Save");
        }
      }else{
        SPLU=JSON.parse(tmp.getElementsByTagName('comments')[0].textContent);
        SPLUplayId=tmp.getElementsByTagName("play")[0].id;
        if(SPLUversion != SPLU.Version){
          console.log("Different Versions");
          compareSPLU();
          SPLU.Version=SPLUversion;
          SPLUremote=SPLU;
          xmlhttp=new XMLHttpRequest();
          xmlhttp.onload=function(){console.log("Version Updated to "+SPLU.Version);finalSetup();};
          xmlhttp.open("POST","/geekplay.php",true);
          xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
          xmlhttp.send("version=2&objecttype=thing&objectid=98000&playid="+SPLUplayId+"&action=save&quantity=0&comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&playdate=1452-04-15&B1=Save");
        }else{
          finalSetup();
        }
      }
      SPLUremote=SPLU;
    };
    oReq.open("get", "/xmlapi2/plays?username="+LoggedInAs+"&mindate=1452-04-15&maxdate=1452-04-15&id=98000", true);
    oReq.send();
  }

  var NumOfPlayers=0;
  var PlayerCount=0;
  var LocationList=true;
  var PlayerList=true;
  
  var tmp=new Date();
  var SPLUtoday=tmp.getFullYear()+"-"+(tmp.getMonth()+1)+"-"+tmp.getDate();
  var SPLUgameID=0;
  var SPLUgameTitle="";
  var SPLUprevGameID=-1;
  var ExpansionsToLog=0;
  var SPLUwinners=[];
  var SPLUlocationCount=0;
  var SPLUcurrentFilter="All";
  var SPLUcurrentGroup="";
  var SPLUcalendar="";
  var SPLUfamilyList="";
  var SPLUfamilyID="-1";
  var SPLUexpansionsLoaded=false;
  var SPLUfamilyLoaded=false;
  var SPLUplays={};
  var SPLUplay={};
  var SPLUobjecttype="";
  var SPLUplayFilter={enabeled:false, username:"", playername:"", mindate:"", maxdate:"", location:""};
  var SPLUplaysPage=1;
  var SPLUplayData={};
  var SPLUplayFetch={};
  var SPLUplayFetchFail=0;
  
  function setObjectType(type){
    VoidInstantSearch({itemid:'0',uniqueid:'546e9ffd96dfc'});
    SPLUexpansionsLoaded=false;
    SPLUfamilyLoaded=false;
    if(type=="boardgame"){
      SPLUobjecttype="boardgame";
      document.getElementById('q546e9ffd96dfc').placeholder="enter board game";
      document.getElementById('expansionLoggingButton').style.display="block";
      document.getElementById('SPLU.SelectBGG').style.backgroundColor="#F8DF24";
      document.getElementById('SPLU.SelectVGG').style.backgroundColor="";
      document.getElementById('SPLU.SelectRPG').style.backgroundColor="";
    }
    if(type=="videogame"){
      SPLUobjecttype="videogame";
      document.getElementById('q546e9ffd96dfc').placeholder="enter video game";
      document.getElementById('expansionLoggingButton').style.display="none";
      document.getElementById('SPLU.SelectBGG').style.backgroundColor="";
      document.getElementById('SPLU.SelectVGG').style.backgroundColor="#F8DF24";
      document.getElementById('SPLU.SelectRPG').style.backgroundColor="";
    }
    if(type=="rpgitem"){
      SPLUobjecttype="rpgitem";
      document.getElementById('q546e9ffd96dfc').placeholder="enter RPG item";
      document.getElementById('expansionLoggingButton').style.display="none";
      document.getElementById('SPLU.SelectBGG').style.backgroundColor="";
      document.getElementById('SPLU.SelectVGG').style.backgroundColor="";
      document.getElementById('SPLU.SelectRPG').style.backgroundColor="#F8DF24";
    }
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

  function getGameID(){
    var metas=document.getElementsByTagName('meta');
    for(i=0;i<metas.length;i++){
      if(metas[i].getAttribute("name")=="og:image"){
        var thumbDiv='<a><img src="'+metas[i].getAttribute("content").slice(0,-4)+'_mt'+metas[i].getAttribute("content").slice(-4)+'"/></a>';
      }
      if(metas[i].getAttribute("name")=="og:url"){
        SPLUgameID=metas[i].getAttribute("content").substring((metas[i].getAttribute("content").lastIndexOf("/")+1));
        document.getElementById('objectid0').value=SPLUgameID;
        document.getElementById('selimage0').innerHTML=thumbDiv;
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
    if(document.getElementById(id).childNodes[0].innerHTML=="Logged"){
      child=0;
    }
    document.getElementById(id).childNodes[child].setAttribute("target","_blank");
  }
  
  function saveLocation(){
    if(document.getElementById('quickplay_location99').value!=""){
      var tmpLoc=0;
      for(var key in SPLU.Locations){
        if (SPLU.Locations.hasOwnProperty(key)) {
          tmpLoc++;
        }
      }
      SPLU.Locations[tmpLoc]={"Name":encodeURIComponent(document.getElementById('quickplay_location99').value)};
      SPLUremote.Locations=SPLU.Locations;
      xmlhttp=new XMLHttpRequest();
      xmlhttp.onload=function(){loadLocations();};
      xmlhttp.open("POST","/geekplay.php",true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.send("version=2&objecttype=thing&objectid=98000&playid="+SPLUplayId+"&action=save&quantity=0&comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&playdate=1452-04-15&B1=Save");
    }
  }
  
  function loadLocations(){
    var tmpDiv=document.getElementById('SPLU.LocationList');
    tmpDiv.innerHTML="";
    for(var key in SPLU.Locations){
      if (SPLU.Locations.hasOwnProperty(key)) {
        tmpDiv.innerHTML+='<div style="padding: 5px 2px 0px 0px; float: left;"><a href="javascript:{void(0);}" onClick="javascript:{insertLocation('+key+');}" onMouseDown="javascript:{this.style.backgroundColor=\'#eff708\';}" onMouseUp="javascript:{this.style.backgroundColor=\'#A4DFF3\';}" style="border:1px dotted green;padding:0px 2px;">'+decodeURIComponent(SPLU.Locations[key].Name)+'</a></div>';
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
      xmlhttp=new XMLHttpRequest();
      xmlhttp.onload=function(){loadPlayers();if(document.getElementById('BRlogPlayers').style.display=="table-cell"){showPlayersPane("save");}};
      xmlhttp.open("POST","/geekplay.php",true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.send("version=2&objecttype=thing&objectid=98000&playid="+SPLUplayId+"&action=save&quantity=0&comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&playdate=1452-04-15&B1=Save");
    }
  }
  
  function loadPlayers(){
    var BRplayersDiv=document.getElementById('SPLU.PlayerList');
    BRplayersDiv.innerHTML="";
    var players=[];
    if(SPLU.Settings.SortPlayers.Order=="Alpha"){
      players=Object.keys(SPLU.Players).sort();
    }else{
      players=Object.keys(SPLU.Players);
    }
    if(SPLUcurrentFilter!="All"){
      var tmpPlayers=[];
      for(i=0;i<players.length;i++){
        if(SPLU.Filters[SPLUcurrentFilter].indexOf(players[i])!=-1){
          tmpPlayers.push(players[i]);
        }
      }
      players=tmpPlayers;
    }
    for(key=0;key<players.length;key++){
      if (SPLU.Players.hasOwnProperty(players[key])) {
        BRtmpName=decodeURIComponent(SPLU.Players[players[key]].Name);
        if(SPLU.Players[players[key]].Name==""){
          BRtmpName=decodeURIComponent(SPLU.Players[players[key]].Username);
        }
        BRplayersDiv.innerHTML+='<div style="padding: 5px 2px 0px 0px; float: left;"><a href="javascript:{void(0);}" onClick="javascript:{insertPlayer(\''+players[key]+'\');}" onMouseDown="javascript:{this.style.backgroundColor=\'#eff708\';}" onMouseUp="javascript:{this.style.backgroundColor=\'#A4DFF3\';}" style="border:1px dotted green;padding:0px 2px;">'+BRtmpName+'</a></div>';
      }
    }
    BRplayersDiv.innerHTML+='<div style="padding: 5px 2px 0px 0px; float: left;"><a href="javascript:{void(0);}" onClick="javascript:{insertPlayer(-1);}" onMouseDown="javascript:{this.style.backgroundColor=\'#eff708\';}" onMouseUp="javascript:{this.style.backgroundColor=\'#A4DFF3\';}" style="border:1px dotted;padding:0px 2px;">Other</a></div>';
    if(SPLUcurrentFilter=="All"&&SPLU.Settings["PlayerGroups"].Visible){
      var groups=[];
      if(SPLU.Settings.SortGroups.Order=="Alpha"){
        groups=Object.keys(SPLU.Groups).sort();
      }else{
        groups=Object.keys(SPLU.Groups);
      }
      for(key=0;key<groups.length;key++){
        BRtmpName=decodeURIComponent(groups[key]);
        BRplayersDiv.innerHTML+='<div style="padding: 5px 2px 0px 0px; float: left;"><a href="javascript:{void(0);}" onClick="javascript:{insertGroup(\''+groups[key]+'\');}" onMouseDown="javascript:{this.style.backgroundColor=\'#eff708\';}" onMouseUp="javascript:{this.style.backgroundColor=\'#A4DFF3\';}" style="border:1px solid black;padding:0px 2px;">'+BRtmpName+'</a></div>';
      }
    }
  }
  
  function setFilter(src){
    if(src=="choose"){
      SPLUcurrentFilter=document.getElementById('SPLU.SelectFilter').value;
    }else if(src=="delete" || src=="hide"){
      SPLUcurrentFilter="All";
    }else{
      SPLUcurrentFilter=document.getElementById('SPLU.FiltersSubSelect').value;
      if(SPLUcurrentFilter=="---"){
        SPLUcurrentFilter="All";
      }
    }
    var checks=document.getElementsByName('SPLUfilterChecks');
    for(i=0;i<checks.length;i++){
      if(SPLUcurrentFilter=="All"){
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
      select.options[0]=new Option("All", "All", true, true);
      select2.options[0]=new Option("---", "---", true, true);
    }else{
      select.options[0]=new Option("All", "All", true, false);
      select2.options[0]=new Option("---", "---", true, false);
    }
    var i=1;
    for(var key in SPLU.Filters){
      if (SPLU.Filters.hasOwnProperty(key)) {
        if(SPLUcurrentFilter==key){
          select.options[i]=new Option(key, key, false, true);
          select2.options[i]=new Option(key, key, false, true);
        }else{
          select.options[i]=new Option(key, key, false, false);
          select2.options[i]=new Option(key, key, false, false);
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

  function insertPlayer(player){
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
      if(player.getAttribute("new")==1){
        tmpNew="checked";
      }
    } else if(player!=-1){
      tmpName=decodeURIComponent(SPLU.Players[player].Name);
      tmpUser=decodeURIComponent(SPLU.Players[player].Username);
      tmpColor=decodeURIComponent(SPLU.Players[player].Color);
    }
    var paddedNum=NumOfPlayers+"";
    while(paddedNum.length<2){
      paddedNum="0"+paddedNum;
    }
    var tmpDiv=document.createElement('div');
    tmpDiv.id="SPLU.PlayerRow"+NumOfPlayers;
    tmpDiv.style.display="table-row";
    document.getElementById('SPLUplayerRows').appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    tmpDiv.style.display="table-cell";
    tmpDiv.className="SPLUrows";
    tmpDiv.innerHTML='<a href="javascript:{void(0);}" onClick="javascript:{deletePlayerRow('+NumOfPlayers+');}"><img src="http://cf.geekdo-images.com/images/pic2321641.png"></a>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerNameColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerNameColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="text" style="width:120px;" name="players['+NumOfPlayers+'][name]" value="'+tmpName+'" tabindex="1'+paddedNum+'"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerUsernameColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerUsernameColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="text" style="width:110px;" name="players['+NumOfPlayers+'][username]" value="'+tmpUser+'" tabindex="2'+paddedNum+'"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerColorColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerColorColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="text" style="width:50px;" name="players['+NumOfPlayers+'][color]" value="'+tmpColor+'" tabindex="3'+paddedNum+'"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerPositionColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerPositionColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="text" style="width:50px;" name="players['+NumOfPlayers+'][position]" value="'+tmpStart+'" tabindex="4'+paddedNum+'"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerScoreColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerScoreColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="text" style="width:37px;" name="players['+NumOfPlayers+'][score]" value="'+tmpScore+'" tabindex="5'+paddedNum+'"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerRatingColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerRatingColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="text" style="width:32px;" name="players['+NumOfPlayers+'][rating]" value="'+tmpRating+'" tabindex="6'+paddedNum+'"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerWinColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.style.textAlign="center";
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerWinColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="checkbox" name="players['+NumOfPlayers+'][win]" class="SPLU.WinBox" value="1" '+tmpWin+' tabindex="7'+paddedNum+'" style="margin-bottom:2px;" onClick="javascript:{if(SPLU.Settings.WinComments.Visible){NoreenWinComment();}}"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    if(!SPLU.Settings.PlayerNewColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
    tmpDiv.style.textAlign="center";
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerNewColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<input type="checkbox" name="players['+NumOfPlayers+'][new]" value="1" '+tmpNew+' tabindex="8'+paddedNum+'" style="margin-bottom:2px;"></input>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);
    
    var tmpDiv=document.createElement('div');
    tmpDiv.style.display="table-cell";
    tmpDiv.style.textAlign="center";
    tmpDiv.className="SPLUrows";
    tmpDiv.id="SPLU.PlayerSaveColumn"+NumOfPlayers;
    tmpDiv.innerHTML='<span style="padding-bottom:2px;"><a href="javascript:{void(0);}" onClick="javascript:{savePlayer('+NumOfPlayers+');}"><img src="https://cf.geekdo-images.com/images/pic2345639.png"></a></span>';
    document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);

    if(NumOfPlayers==2){
      if(document.getElementsByName("players[1][name]")[0].value==""&&document.getElementsByName("players[1][username]")[0].value==""&&document.getElementsByName("players[1][color]")[0].value==""){
        deletePlayerRow(1);
      }
    }
  }
  
  function getWinners(){
    winboxes=document.getElementsByClassName('SPLU.WinBox');
    SPLUwinners=[];
    comment="";
    for(i=0;i<winboxes.length;i++){
      if(winboxes[i].checked){
        SPLUwinners.push(document.getElementsByName('players['+winboxes[i].name.slice(8,winboxes[i].name.indexOf("]"))+'][name]')[0].value);
      }
    }
    return(SPLUwinners.length);
  }
  
  function NoreenWinComment(){
    if(getWinners()>0){
      comment="";
      winboxes=document.getElementsByClassName('SPLU.WinBox');
      for(i=0; i<SPLUwinners.length; i++){
        if(i==0){
          comment=SPLUwinners[i];
        }else{
          comment+=" & "+SPLUwinners[i];
        }
      }
      if(comment!=""){
        comment+=" won";
      }
      document.getElementById("quickplay_comments99").value=comment;
    }
  }
  
  function addFavorite(){
    var id=document.getElementById('objectid0').value;
    SPLU.Favorites[id]={
      "objectid":id,
      "thumbnail":document.getElementById('selimage0').childNodes[0].childNodes[0].src,
      "title":document.getElementById('q546e9ffd96dfc').value,
      "sortorder":0,
      "objecttype":SPLUobjecttype
    };
    SPLUremote.Favorites[id]=SPLU.Favorites[id];
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","/geekplay.php",true);
    xmlhttp.onload=function(){
      document.getElementById('SPLU.GameStatus').innerHTML="Added";
      window.setTimeout(function(){ document.getElementById('SPLU.GameStatus').innerHTML=""}, 2000);
      if (document.getElementById('BRlogFavs').style.display=="table-cell") {
        showFavsPane("add");
      }
    };
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("version=2&objecttype=thing&objectid=98000&playid="+SPLUplayId+"&action=save&quantity=0&comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&playdate=1452-04-15&B1=Save");
  }
  
  function chooseFavorite(id){
    setObjectType(SPLU.Favorites[id].objecttype);
    document.getElementById('objectid0').value=id;
    document.getElementById('selimage0').innerHTML='<a><img src="'+SPLU.Favorites[id].thumbnail+'"/></a>';
    document.getElementById('q546e9ffd96dfc').value=SPLU.Favorites[id].title;
    document.getElementById('BRlogFavs').style.display="none";
  }
  
  function deleteFavorite(id){
      delete SPLU.Favorites[id];
      delete SPLUremote.Favorites[id];
      xmlhttp=new XMLHttpRequest();
      xmlhttp.open("POST","/geekplay.php",true);
      xmlhttp.onload=function(){showFavsPane("delete");};
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.send("version=2&objecttype=thing&objectid=98000&playid="+SPLUplayId+"&action=save&quantity=0&comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&playdate=1452-04-15&B1=Save");
    }
  
  function deletePlayerRow(row){
    document.getElementById('SPLUplayerRows').removeChild(document.getElementById('SPLU.PlayerRow'+row));
    PlayerCount--;
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
  function showHidePlayers(update){
    if(!PlayerList){
      document.getElementById('SPLU.PlayerList').style.maxWidth=document.getElementById('BRlogMain').clientWidth-40+"px";
      document.getElementById('SPLU.PlayerList').style.display="block";
      document.getElementById('SPLU.SavedNamesButtonIconExpand').style.display="none";
      document.getElementById('SPLU.SavedNamesButtonIconCollapse').style.display="inline-block";
      PlayerList=true;
      if(update){
        SPLU.Settings.PlayerList.Visible=true;
        document.getElementById('SPLU.LocationListCheck').checked=true;
      }
    }else{
      document.getElementById('SPLU.PlayerList').style.display="none";
      document.getElementById('SPLU.SavedNamesButtonIconExpand').style.display="inline-block";
      document.getElementById('SPLU.SavedNamesButtonIconCollapse').style.display="none";
      PlayerList=false;
      if(update){
        SPLU.Settings.PlayerList.Visible=false;
        document.getElementById('SPLU.LocationListCheck').checked=false;
      }
    }
  }
  
  function showHideCalendar(){
    cal=document.getElementById('SPLU.Calendar');
    if(cal.style.display=="none"){
      cal.style.display="";
      SPLUcalendar.render();
    }else{
      cal.style.display="none";
    }
  }
  
  function saveSettings(text){
    document.getElementById('SPLU.SettingsStatus').innerHTML="Thinking";
    SPLU.Settings["CommentsField"]["Width"]=document.getElementById('quickplay_comments99').style.width;
    SPLU.Settings["CommentsField"]["Height"]=document.getElementById('quickplay_comments99').style.height;
    SPLUremote.Settings=SPLU.Settings;
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","/geekplay.php",true);
    xmlhttp.onload=function(responseJSON){
      console.log(responseJSON.target.status+"|"+responseJSON.target.statusText);
      if(responseJSON.target.status==200){
        document.getElementById('SPLU.SettingsStatus').innerHTML=text;
        window.setTimeout(function(){ document.getElementById('SPLU.SettingsStatus').innerHTML="" }, 5000);
      }else{
        document.getElementById('SPLU.SettingsStatus').innerHTML="<img style='vertical-align:bottom;padding-top:5px;' src='//cf.geekdo-static.com/mbs/mb_3264_0.gif'><span style='background-color:red;color:white;font-weight:bold;'>Error Code: "+responseJSON.target.status+"</span> Try saving again.";
      }
    };
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("version=2&objecttype=thing&objectid=98000&playid="+SPLUplayId+"&action=save&quantity=0&comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&playdate=1452-04-15&B1=Save");
  }

  function insertLocation(location){
    document.getElementById(('quickplay_location99')).value=decodeURIComponent(SPLU.Locations[location].Name);
    showHideLocations();
  }

  function deleteGamePlay(){
    if (confirm("Press OK to delete this play") == true) {
      document.getElementById('BRresults').innerHTML="Deleting...";
      
      
      xmlhttp=new XMLHttpRequest();
      xmlhttp.open("POST","/geekplay.php",true);
      xmlhttp.onload=function(responseJSON,responseText){
        window.resJ=responseJSON;
        window.rest=responseText;
        console.log(responseJSON.target.status+"|"+responseJSON.target.statusText);
        if(responseJSON.target.status==200){
          document.getElementById('BRresults').innerHTML="Play Deleted";
        }else{
          document.getElementById('BRresults').innerHTML="An Error Occurred";
        }
      };
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.send("version=2&action=delete&playid="+tmpPlay.id);

      saveGamePlay2('delete');

      
    }
  }
  
  function saveGamePlay(action){
    var form=$('myform');
    var inputs=form.getElementsByTagName('input');
    var querystring="";
    var value="";
    var tmpID="";
    for(n=0; n<inputs.length; n++){
      if(inputs[n].name=="geekitemname" || inputs[n].name=="imageid"){
        continue;
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
    }
    if(action=="edit"){
      tmpID="&playid="+tmpPlay.id;
    }
    querystring+="&comments="+encodeURIComponent(form["quickplay_comments99"].value);
    document.getElementById('BRresults').innerHTML="Saving...";
    new Request.JSON({url:'/geekplay.php',data:'ajax=1&action=save&version=2&objecttype=thing'+tmpID+querystring,onComplete:function(responseJSON,responseText){window.resJ=responseJSON; document.getElementById('BRresults').innerHTML=responseJSON.html; console.log(responseText); insertBlank('BRresults'); saveExpansionPlays(action);}}).send();
  }
  
  function saveGamePlay2(action){
    if(action=="dupe"){
      var form=$('myform');
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
      if(SPLU.Settings.LocationField.Reset){document.getElementById('quickplay_location99').value="";}
      if(SPLU.Settings.QuantityField.Reset){document.getElementById('quickplay_quantity99').value="1";}
      if(SPLU.Settings.DurationField.Reset){document.getElementById('quickplay_duration99').value="";}
      if(SPLU.Settings.IncompleteField.Reset){document.getElementById('incomplete').checked=false;}
      if(SPLU.Settings.NoWinStatsField.Reset){document.getElementById('nowinstats').checked=false;}
      if(SPLU.Settings.CommentsField.Reset){document.getElementById('quickplay_comments99').value="";}
    }
    if(action=="none"||action=="delete"){
      clearForm();
    }
    if(SPLU.Settings.DateField.Reset){setDateField(SPLUtoday);}
    if(SPLU.Settings.GameField.Reset){VoidInstantSearch({itemid:'0',uniqueid:'546e9ffd96dfc'});}
  }

  function clearForm(){
    while(document.getElementsByClassName('SPLUrows').length>0){
      deletePlayerRow(document.getElementsByClassName('SPLUrows')[0].parentNode.id.slice(14));
    }
    document.getElementById('quickplay_location99').value="";
    if(SPLU.Settings.LocationList.Visible&&!LocationList){
      showHideLocations(false);
    }
    if(SPLU.Settings.PlayerList.Visible&&!PlayerList){
      showHidePlayers(false);
    }
    document.getElementById('quickplay_comments99').value="";
    document.getElementById('quickplay_quantity99').value="1";
    document.getElementById('quickplay_duration99').value="";
    document.getElementById('incomplete').checked=false;
    document.getElementById('nowinstats').checked=false;
    NumOfPlayers=0;
    PlayerCount=0;
    insertPlayer(-1);
    showHideEditButtons("hide");
  }
  
  function setDateField(date){
    document.getElementById('playdateinput99').value=date;
    parseDate(document.getElementById('playdateinput99'),$('playdate99'),$('playdatestatus99'));
  }

  function getRecentPlays(multiple){
    tmpUser=document.getElementById("SPLU.PlaysLogger").value;
    if(SPLUplayFetch[tmpUser]===undefined){
      SPLUplayFetch[tmpUser]=[];
    }
    SPLUplayFetch[tmpUser][1]=0;
    getPlays(tmpUser, 1, multiple); 
  }
  
  function getPlays(player,page,multiple){
    console.log("getPlays("+player+", "+page+", "+multiple+")");
    document.getElementById('SPLU.PlaysStatus').innerHTML="Fetching Page: "+page;
    if(SPLUplayData[player]===undefined){
      document.getElementById('SPLU.PlaysStatus').innerHTML+=" of ??";
    } else {
      document.getElementById('SPLU.PlaysStatus').innerHTML+=" of "+Math.ceil(SPLUplayData[player]["total"]/100);
    }
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
        SPLUplays[player][page]=this.responseXML;
        parsePlays(player,page,multiple);
      }else{
        console.log("other status code, no getplays");
      }
    };
    oReq.open("get","/xmlapi2/plays?username="+player+"&page="+SPLUplaysPage,true);
    oReq.send();
  }
  
  function getAllPlays(player){
    console.log("getAllPlays("+player+")");
    if(Math.ceil(SPLUplayData[player]["total"]/100)>(SPLUplayFetch[player].length-1)){
      for(i=1;i<=Math.ceil(SPLUplayData[player]["total"]/100);i++){
        if(SPLUplayFetch[player][i]===undefined){
          SPLUplayFetch[player][i]=0;
        }
      }
    }
    if(SPLUplayFetchFail<5){
      for(i=1;i<SPLUplayFetch[player].length;i++){
        if(SPLUplayFetch[player][i]<0){
          SPLUplayFetch[player][i]--;
        }
        if(SPLUplayFetch[player][i]<-4){
          SPLUplayFetchFail++;
          SPLUplayFetch[player][i]=0;
        }
        if(SPLUplayFetch[player][i]==0){
          SPLUplayFetch[player][i]=-1;
          window.setTimeout(function(){getPlays(player,i,true);},2500);
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
      loadPlays(player);
    }else{
      console.log("Still Fetching");
    }
  }
  
  function parsePlays(player,page,multiple){
    console.log("parsePlays("+multiple+")");
    SPLUplayFetch[player][page]=1;
    if(SPLUplayData[player]===undefined){
      SPLUplayData[player]={};
    }
    SPLUplayData[player]["total"]=SPLUplays[player][page].getElementsByTagName("plays")[0].getAttribute("total");
    for(i=0;i<SPLUplays[player][page].getElementsByTagName("play").length;i++){
      SPLUplayData[player][SPLUplays[player][page].getElementsByTagName("play")[i].id]=SPLUplays[player][page].getElementsByTagName("play")[i];
    }
    if(!multiple){
      loadPlays(player);
    }else{
      getAllPlays(player);
    }
  }

  function loadPlays(tmpUser){
    if(SPLUplayData[tmpUser]["total"]==0){
      document.getElementById('SPLU.PlaysList').innerHTML=='<div>No Plays Found.</div>';
    }else{
      var tmpHTML="";
      var display=true;
      var tmpSort=[];
      tmpHTML='<div id="SPLU.PlaysTable" style="display:table;">';
      for(key in SPLUplayData[tmpUser]){
        if(key=="total"||SPLUplayData[tmpUser][key].attributes.date.value=="1452-04-15"){
          continue;
        }
        tmpSort.push({id:key,date:SPLUplayData[tmpUser][key].attributes.date.value});
      }
      tmpSort.sort(dynamicSortMultiple("-date", "id"));
      for(i=0;i<tmpSort.length;i++){
        tmpPlayId=tmpSort[i]["id"];
        tmpPlayDate=SPLUplayData[tmpUser][tmpPlayId].attributes.date.value;
        tmpPlayGame=SPLUplayData[tmpUser][tmpPlayId].getElementsByTagName("item")[0].attributes.name.value;
        tmpHTML+='<div id="SPLU.Plays-'+tmpPlayId+'" style="display:table-row;"><div style="display:table-cell;">'+tmpPlayDate+' - <a href="javascript:{void(0);}" onClick="javascript:{loadPlay('+tmpPlayId+');}">'+tmpPlayGame+'</a></div></div>';
      }
      tmpHTML+='</div>';
      tmpCount=(Object.keys(SPLUplayData[tmpUser]).length)-1;
      document.getElementById('SPLU.PlaysList').innerHTML=tmpHTML;
      tmpHTML='<div style="display:table-row;"><div style="display:table-cell;">Loaded '+tmpCount+' of '+SPLUplayData[tmpUser]["total"];
      if(SPLUplayData[tmpUser]["total"]>(Object.keys(SPLUplayData[tmpUser]).length)-1){
        tmpCount=(Math.floor(tmpCount/100))+1;
        tmpHTML+='<a href="javascript:{void(0);}" onClick="javascript:{getPlays(\''+tmpUser+'\','+tmpCount+',false);}"> - Load next 100</a>';
      }
      tmpHTML+='</div></div>';
      document.getElementById('SPLU.PlaysStatus').innerHTML=tmpHTML;
    }
  }
  
  function filterPlaysByUser(){
    SPLUplayFilter.username=document.getElementById("SPLU.PlaysUserFilter").value;
    SPLUplayFilter.enabled=true;
  }
  
  function loadPlay(id){
	  console.log(id);
    clearForm();
    tmpPlay=SPLUplayData[document.getElementById("SPLU.PlaysLogger").value][id];
    console.log("Found");
    if(tmpPlay.getElementsByTagName("players")[0]!==undefined){
      tmpPlayer=tmpPlay.getElementsByTagName("players")[0].getElementsByTagName("player");
      for(i=0;i<tmpPlayer.length;i++){
        insertPlayer(tmpPlayer[i]);
      }
    }
    setDateField(tmpPlay.attributes.date.value);
    document.getElementById('quickplay_location99').value=tmpPlay.attributes.location.value;
    showHideLocations();
    document.getElementById('quickplay_quantity99').value=tmpPlay.attributes.quantity.value;
    document.getElementById('quickplay_duration99').value=tmpPlay.getAttribute("length");
    if(tmpPlay.getAttribute("incomplete")==1){document.getElementById('incomplete').checked=true;}
    if(tmpPlay.getAttribute("nowinstats")==1){document.getElementById('nowinstats').checked=true;}
    if(tmpPlay.getElementsByTagName("comments").length>0){
      document.getElementById('quickplay_comments99').value=tmpPlay.getElementsByTagName("comments")[0].textContent;
    }
    setObjectType(tmpPlay.getElementsByTagName("subtypes")[0].getElementsByTagName("subtype")[0].getAttribute("value"));
    tmpItem=tmpPlay.getElementsByTagName("item")[0];
    SetInstantSearchObject({itemid:'0',objecttype:tmpItem.attributes.objecttype.value,objectid:tmpItem.attributes.objectid.value, name:tmpItem.attributes.name.value,uniqueid:'546e9ffd96dfc'} );
    if(document.getElementById("SPLU.PlaysLogger").value==LoggedInAs){
      showHideEditButtons("show");
    }else{
      showHideEditButtons("hide");
    }
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
  
  function makeSentence(){
    if(!SPLU.Settings.SummaryTextField.Visible){return;}
    document.getElementById('SPLU.SummaryTextField').style.maxWidth=document.getElementById('BRlog').clientWidth-40+"px";
    document.getElementById('SPLU.SummaryTextField').style.display="block";
    var SPLUtodayDate=new Date(SPLUtoday);
    var SPLUselectedDate=new Date(document.getElementById('playdate99').value);
    var sentence="";
    sentence="You are logging ";
    if(document.getElementById('quickplay_quantity99').value==1){
      sentence+="a play of ";  
    }else{
      sentence+=document.getElementById('quickplay_quantity99').value;  
      sentence+=" plays of ";
    }
    sentence+=document.getElementById('q546e9ffd96dfc').value;
    sentence+=", which you played";
    if(document.getElementById('playdateinput99').value==SPLUtoday){
      sentence+=" today";
    }else{
      if((SPLUtodayDate.getTime()-86400000)==SPLUselectedDate.getTime()){
        sentence+=" yesterday";
      }else{
        if(SPLUtodayDate.getTime()<SPLUselectedDate.getTime()){
          sentence+=" <span style='background-color:red; color:white; font-weight:bold;'>IN THE FUTURE</span>";
        }else{
          if((SPLUtodayDate.getTime()-SPLUselectedDate.getTime())>3155673600000){
            sentence+=" <span style='background-color:yellow; color:black; font-weight:bold;'>BEFORE YOU WERE BORN</span>";
          }else{
            sentence+=" on ";
            sentence+=document.getElementById('playdate99').value;
          }
        }
      }
    }
    if(document.getElementById('quickplay_location99').value!=""){
      sentence+=" in "; 
      sentence+=document.getElementById('quickplay_location99').value;
      sentence+=".";
    }else{
      sentence+=".";
    }
    if(PlayerCount==1&&NumOfPlayers!=1){
      sentence+=" There was only one player.";
    }
    if(PlayerCount>1){
      sentence+=" There were ";
      sentence+=PlayerCount;
      sentence+=" players";
    }
    
    getWinners();
    if(SPLUwinners.length==0&&PlayerCount>1){
      sentence+=".";
    }
    if(SPLUwinners.length==1&&PlayerCount>1){
      sentence+=" and "+SPLUwinners[0]+" won.";
    }
    if(SPLUwinners.length==2&&PlayerCount!=2){
      sentence+=" and the winners were "+SPLUwinners[0]+" and "+SPLUwinners[1]+".";
    }
    if(SPLUwinners.length==3&&SPLUwinners.length!=PlayerCount){
      sentence+=" and the winners were "+SPLUwinners[0]+", "+SPLUwinners[1]+", and "+SPLUwinners[2]+".";
    }
    if(SPLUwinners.length==2&&PlayerCount==2){
      sentence+=" and they both won.";
    }
    if(SPLUwinners.length==PlayerCount&&PlayerCount>2){
      sentence+=" and everybody won.";
    }
    if(SPLUwinners.length>3&&SPLUwinners.length!=PlayerCount){
      sentence+=" and many winners.";
    }
    if(document.getElementById('quickplay_duration99').value!=""){
      if(document.getElementById('quickplay_quantity99').value==1){
        sentence+=" The game lasted ";
        sentence+=document.getElementById('quickplay_duration99').value;
        if(document.getElementById('quickplay_duration99').value<5){
          sentence+=" whole";
        }
        if(document.getElementById('quickplay_duration99').value==1){
          sentence+=" minute.";
        }else{
          sentence+=" minutes.";
        }
      }  
      if(document.getElementById('quickplay_quantity99').value>1){
        sentence+=" Each game lasted ";
        sentence+=document.getElementById('quickplay_duration99').value;
        sentence+=" minutes.";
      }
    }
    document.getElementById('SPLU.SummaryTextField').innerHTML=sentence;
  }
  
  function hideSentence(){
    document.getElementById('SPLU.SummaryTextField').style.display="none";
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
    document.getElementById('SPLU.ExpansionsPaneStatus').innerHTML="Saving...";
    SPLU.Settings.ExpansionQuantity.Value=document.getElementById('BRexpPlayQTY').value;
    SPLUremote.Settings.ExpansionQuantity.Value=SPLU.Settings.ExpansionQuantity.Value;
    xmlhttp=new XMLHttpRequest();
    xmlhttp.onload=function(){document.getElementById('SPLU.ExpansionsPaneStatus').innerHTML="Saved";window.setTimeout(function(){document.getElementById('SPLU.ExpansionsPaneStatus').innerHTML=""},3000);};
    xmlhttp.open("POST","/geekplay.php",true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("version=2&objecttype=thing&objectid=98000&playid="+SPLUplayId+"&action=save&quantity=0&comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&playdate=1452-04-15&B1=Save");

  }
  
  function loadExpansions(){
    var tmpExpID="";
    var tmpExpName="";
    document.getElementById('SPLU.FamilyPane').style.display="none";
    document.getElementById('SPLU.ExpansionPane').style.display="";
    document.getElementById('SPLU.ExpansionPane').innerHTML="";
    document.getElementById('SPLU.FamilyPane').innerHTML="";
    document.getElementById('BRexpPlayQTY').value=SPLU.Settings.ExpansionQuantity.Value;
    SPLUfamilyList=[];
    SPLUfamilyList=this.responseXML.getElementsByTagName("boardgamefamily");
    if(!this.responseXML.getElementsByTagName('boardgameexpansion').length){
      document.getElementById('SPLU.ExpansionPane').innerHTML+='<div>No Expansions Found.</div>';
    }else{
      BRexpList=this.responseXML.getElementsByTagName("boardgameexpansion");
      var tmpHTML="";
      tmpHTML+='<div style="display:table;">';
      for(i=0;i<BRexpList.length;i++){
        tmpExpID=BRexpList[i].getAttribute("objectid");
        tmpExpName=BRexpList[i].textContent;
        tmpHTML+='<div style="display:table-row;"><div style="display:table-cell;"><input type="checkbox" id="'+tmpExpID+'" class="BRexpLogBox" data-tab="expansion"/> '+tmpExpName+'</div><div style="display:table-cell; width:50px;" id="QPresultsExp'+tmpExpID+'" name="QPresults'+tmpExpID+'"></div></div>';
      }
      tmpHTML+='</div>';
      document.getElementById('SPLU.ExpansionPane').innerHTML+=tmpHTML;
    }
  }
  
  function getExpansions(){
    SPLUprevGameID=SPLUgameID;
    document.getElementById('SPLU.ExpansionPane').innerHTML="Loading Expansions...<img src='http://cf.geekdo-static.com/images/progress.gif'/>";
    var oReq=new XMLHttpRequest();
    oReq.onload=loadExpansions;
    oReq.open("get","/xmlapi/boardgame/"+SPLUgameID,true);
    oReq.send();
  }

  function loadFamily(){
    var tmpExpID="";
    var tmpExpName="";
    document.getElementById('SPLU.ExpansionPane').style.display="none";
    document.getElementById('SPLU.FamilyPane').style.display="";
    document.getElementById('SPLU.FamilyPane').innerHTML="";
    document.getElementById('BRexpPlayQTY').value=SPLU.Settings.ExpansionQuantity.Value;
    if(!this.responseXML.getElementsByTagName('link').length){
      document.getElementById('SPLU.FamilyPane').innerHTML+='<div>No Family Items Found.</div>';
    }else{
      BRexpList=this.responseXML.getElementsByTagName("link");
      var tmpHTML="";
      tmpHTML+='<div style="display:table;">';
      for(i=0;i<BRexpList.length;i++){
        tmpExpID=BRexpList[i].getAttribute("id");
        tmpExpName=BRexpList[i].getAttribute("value");
        tmpHTML+='<div style="display:table-row;"><div style="display:table-cell;"><input type="checkbox" id="'+tmpExpID+'" class="BRexpLogBox" data-tab="family"/> '+tmpExpName+'</div><div style="display:table-cell; width:50px;" id="QPresultsFam'+tmpExpID+'" name="QPresults'+tmpExpID+'"></div></div>';
      }
      tmpHTML+='</div>';
      document.getElementById('SPLU.FamilyPane').innerHTML+=tmpHTML;
    }
  }

  function getFamily(id){
    SPLUprevGameID=SPLUgameID;
    document.getElementById('SPLU.FamilyPane').innerHTML="Loading Family Items...<img src='http://cf.geekdo-static.com/images/progress.gif'/>";
    SPLUfamilyID="-1";
    var name=document.getElementById('q546e9ffd96dfc').value;
    if(id==-1){
      for(i=0;i<SPLUfamilyList.length;i++){
        if(SPLUfamilyList[i].textContent==name||SPLUfamilyList[i].textContent==name.slice(0,name.indexOf(":"))){
          SPLUfamilyID=SPLUfamilyList[i].getAttribute('objectid');
        }
      }
    }else{
      SPLUfamilyID=id;
    }
    if(SPLUfamilyID==-1){
      tmpHTML="No Matching Family Found.<br/><br/>";
      if(SPLUfamilyList.length>=1){
        tmpHTML+="Please choose from the following Families:<br/>";
        for(var i=0;i<SPLUfamilyList.length;i++){
          tmpHTML+='&nbsp;-&nbsp;<a href="javascript:{void(0);}" onClick="javascript:{getFamily(\''+SPLUfamilyList[0].getAttribute('objectid')+'\');}">'+SPLUfamilyList[i].textContent+'</a><br/>';
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
      getExpansions();
    }
  }

  function showFamilyTab(){
    document.getElementById('SPLU.ExpansionPane').style.display="none";
    document.getElementById('SPLU.FamilyPane').style.display="";
    document.getElementById('SPLU.ExpansionsHeading').style.borderTop="";
    document.getElementById('SPLU.FamilyHeading').style.borderTop="2px solid blue";
    if(!SPLUfamilyLoaded){
      getFamily("-1");
    }
  }

  function clearExpansions(){
    var tmpExp=document.getElementsByClassName('BRexpLogBox');
    for(i=0;i<tmpExp.length;i++){
      tmpExp[i].checked=false;
    }
  }

  function saveExpansionPlays(action){
    ExpansionsToLog=0;
    var tmpExp=document.getElementsByClassName('BRexpLogBox');
    for(i=0;i<tmpExp.length;i++){
      if(tmpExp[i].checked){
        ExpansionsToLog++;
      }
    }
    if(ExpansionsToLog==0){
      document.getElementById('SPLUexpansionResults').innerHTML='';
      saveGamePlay2(action);
    }else{
      for(i=0;i<tmpExp.length;i++){
        if(tmpExp[i].checked){
          document.getElementById('SPLUexpansionResults').innerHTML='Waiting for '+ExpansionsToLog+' expansions to be logged.';
          var QPR="";
          if(tmpExp[i].getAttribute('data-tab')=="expansion"){
            QPR="QPresultsExp";
          }else{
            QPR="QPresultsFam";
          }
          var results=$(QPR+tmpExp[i].id);
          results.innerHTML="Saving...";
          var form=$('myform');
          var inputs=form.getElementsByTagName('input');
          var querystring="";
          var value="";
          for(n=0; n<inputs.length; n++){
            if(inputs[n].name=="geekitemname" || inputs[n].name=="imageid"){
              continue;
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
          }
          querystring+="&comments="+encodeURIComponent(form["quickplay_comments99"].value);
          querystring=querystring.replace("objectid="+SPLUgameID,"objectid="+tmpExp[i].id);
          querystring=querystring.replace("quantity="+document.getElementById('quickplay_quantity99').value,"quantity="+document.getElementById('BRexpPlayQTY').value);
          new Request.JSON({url:'/geekplay.php',data:'ajax=1&action=save&version=2&objecttype=thing'+querystring,onComplete:function(responseJSON,responseText){
            var results=document.getElementsByName('QPresults'+responseJSON.html.slice(29,responseJSON.html.indexOf("?")));
            for(var i=0;i<results.length;i++){
              if(responseJSON.html.slice(-5)=="></a>"){
                results[i].innerHTML=responseJSON.html.slice(7,-4)+"Logged</a>";
              }else{
                results[i].innerHTML=responseJSON.html;
              }
              insertBlank(results[i].id);
            }
            ExpansionsToLog--;
            document.getElementById('SPLUexpansionResults').innerHTML='Waiting for '+ExpansionsToLog+' expansions to be logged.';
            if(ExpansionsToLog==0){
              document.getElementById('SPLUexpansionResults').innerHTML='';
              saveGamePlay2(action);
            }
          }}).send();
        }
      }
    }
  }
  
  tmpDiv=document.createElement('div');
  tmpDiv.id="SPLU.popText";
  tmpDiv.style.visibility="hidden";
  tmpDiv.style.zIndex="577";
  tmpDiv.style.position="absolute";
  tmpDiv.style.backgroundColor="#f2ffa3";
  tmpDiv.style.border="1px Solid Black";
  tmpDiv.style.padding="3px";
  document.getElementById("main_content").appendChild(tmpDiv);
  
  var style=document.createElement('style');
  style.type='text/css';
  style.id="BRstyle";
  style.innerHTML='.SPLUheader{height:32px; border:1px solid blue; padding:2px 5px;} .SPLUheaderClose{float:right; margin-right:-6px; margin-top:-3px;} .SPLUrows{vertical-align:bottom; padding-right:5px; padding-top:5px; padding-left:5px;} .BRbutn{border:1px dotted green;padding:0px 2px;} .BRcells{display:table-cell; padding-right:10px; padding-bottom:10px;} .SPLUplayerCells{display:table-cell;} .SPLUsettingAltRows{background-color: #80E086;} .SPLUbuttons{border:2px solid blue;padding:2px 4px;border-radius:5px;background-color:lightGrey;color:black;}';
  document.getElementsByTagName('head')[0].appendChild(style);
  
  var BRlogMain=document.createElement('div');
  BRlogMain.id='BRlogMain';
  BRlogMain.setAttribute("style","display:table; position: absolute; left: 50px; z-index: 565; border-radius:15px;");
  BRlogMain.style.top=self.pageYOffset+50+"px";
  var BRlogRow=document.createElement('div');
  BRlogRow.id='BRlogRow';
  BRlogRow.setAttribute("style","display:table-row;");
    
  var BRlogDiv=document.createElement('div');
  BRlogDiv.id='BRlog';
  BRlogDiv.setAttribute("style","display:table-cell; background-color: #A4DFF3; padding: 13px;border:2px solid blue;border-radius:15px; box-shadow:10px 10px 5px #888;");
  
  var BRlogForm=document.createElement('form');
  BRlogForm.id='myform';
  BRlogForm.name='myform';
  BRlogDiv.appendChild(BRlogForm);
  
  var SPLUtempDate=new Date();
  var todayText=SPLUtempDate.toDateString().slice(0,3);
  var todayDate=SPLUtempDate.getFullYear()+"-"+(SPLUtempDate.getMonth()+1)+"-"+(SPLUtempDate.toDateString().slice(8,10));
  SPLUtempDate.setTime(SPLUtempDate.getTime()-86400000);
  yesterdayText=SPLUtempDate.toDateString().slice(0,3);
  yesterdayDate=SPLUtempDate.getFullYear()+"-"+(SPLUtempDate.getMonth()+1)+"-"+(SPLUtempDate.toDateString().slice(8,10));
  SPLUtempDate.setTime(SPLUtempDate.getTime()-86400000);
  daybeforeText=SPLUtempDate.toDateString().slice(0,3);
  daybeforeDate=SPLUtempDate.getFullYear()+"-"+(SPLUtempDate.getMonth()+1)+"-"+(SPLUtempDate.toDateString().slice(8,10));
  
  var tmpDiv=document.createElement('div');
  var tmpHTML='<div style="float:right;margin-left:-20px; margin-right:-15px; margin-top:-13px;">    <div id="closeButton" style=""><a href="javascript:{void(0);}" onClick="javascript:{hidePopText();observer.disconnect();BRlogMain.parentNode.removeChild(BRlogMain);}" style="border:2px solid blue;padding:0px 10px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:large;font-weight:900;color:red;">X</a></div>    <div style="padding-top: 15px; padding-left: 8px;"><a href="javascript:{void(0);}" onClick="javascript:{showSettingsPane(\'button\');}" id="BRshowHideBtn"><img src="http://cf.geekdo-images.com/images/pic2319219.png"></a></div>            </div>     <div style="display:table;">    <div style="display:table-row;">    <div id="SPLU.DateField" class="BRcells" style="width:120px;">      <div style="display:table;">        <div style="display:table-row;">          <div style="display:inline;">            <input id="playdate99" type="hidden" value="'+SPLUtoday+'" name="playdate"/>            <input id="playdateinput99" tabindex="10" style="width:75px;" type="text" onkeyup="parseDate(this,$(\'playdate99\'),$(\'playdatestatus99\') );" value="'+SPLUtoday+'" autocomplete="off" name="dateinput"/>          </div>          <div id="playdatestatus99" class="sf" style="font-style:italic; font-size:0;display:inline;">            <img style="position:relative; top:3px; right:2px;" src="http://cf.geekdo-static.com/images/icons/silkicons/accept.png">'+SPLUtoday+'          </div>          <div style="display:inline;">            <a href="javascript:{void(0);}" onClick="javascript:{showHideCalendar();}">              <img style="vertical-align:bottom;" src="//cf.geekdo-static.com/images/icons/silkicons/calendar_view_week.png">            </a>          </div>          <div id="SPLU.Calendar" style="position:absolute;z-index:600;display:none;">C</div>        </div>        <div style="display:table-row;">          <div style="display:table-cell;font-size:x-small;padding-top:7px;">            <a href="javascript:{void(0);}" onClick="javascript:{setDateField(\''+daybeforeDate+'\')}">'+daybeforeText+'</a> | <a href="javascript:{void(0);}" onClick="javascript:{setDateField(\''+yesterdayDate+'\')}">'+yesterdayText+'</a> | <a href="javascript:{void(0);}" onClick="javascript:{setDateField(\''+todayDate+'\')}">'+todayText+'</a>          </div>        </div>      </div>    </div>        <div class="BRcells" style="padding-right:20px;">      <div id="SPLU.QuantityField" style="margin-bottom:5px;width:75px;">        <span style="font-size:xx-small;">Quantity: </span><input type="text" id="quickplay_quantity99" name="quantity" value="1" tabindex="30" style="width: 20px;"/>      </div>      <div id="SPLU.DurationField" style="width:75px;">        <span style="font-size:xx-small;">Duration: </span><input type="text" id="quickplay_duration99" name="length" value="" tabindex="40" style="width: 20px;"/>      </div>    </div><div class="BRcells" style="padding-right:20px;">      <div id="SPLU.IncompleteField" style="margin-bottom:5px;width:80px;">        <span style="font-size:xx-small;">Incomplete: </span><input type="checkbox" id="incomplete" name="incomplete" value="1" tabindex="45" />      </div>      <div id="SPLU.NoWinStatsField" style="width:80px;">        <span style="font-size:xx-small;">No Win Stats: </span><input type="checkbox" id="nowinstats" name="nowinstats" value="1" tabindex="47" />      </div>    </div>        <div class="BRcells">      <div id="SPLU.LocationField" style="width:275px;">        <div id="SPLU.fakeLocationBox" style="width:200px; display:inline-block; -moz-appearance:textfield; -webkit-appearance:textfield;">          <input type="text" placeholder="click or type a location" id="quickplay_location99" tabindex="20" name="location" style="width: 175px; border:none;"/>          <a href="javascript:{void(0);}" onClick="javascript:{saveLocation();}" style="vertical-align:middle;" id="SPLU.SaveLocationButton">            <img src="http://cf.geekdo-images.com/images/pic2345639.png">          </a>        </div>        <a href="javascript:{void(0);}" onClick="javascript:{showHideLocations();}" id="BRlocsBtn" style="padding-left:1px; vertical-align:middle;">          <span id="SPLU.LocationButtonIconCollapse" style="display:inline-block;">            <img src="http://cf.geekdo-images.com/images/pic2321002.png">          </span>          <span id="SPLU.LocationButtonIconExpand" style="display:none;">            <img src="http://cf.geekdo-images.com/images/pic2320964.png">          </span>        </a>        <div style="display:inline-block; position:absolute; padding-top:2px;padding-left:4px;"><a href="javascript:{void(0);}" onClick="javascript:{showLocationsPane(\'button\');}" id="showLocationsPaneBtn"><img src="https://cf.geekdo-images.com/images/pic2344362.png"></a></div>        <br/>        <div id="SPLU.LocationList" style="">          Loading...        </div>      </div>    </div>    </div>    </div>      <div style="display:table;">    <div style="display:table-row;">      <div class="BRcells">        <div id="SPLU.CommentsField">          <textarea id="quickplay_comments99" tabindex="50" style="width:314px; height:109px; font:99% arial,helvetica,clean,sans-serif" name="comments;" placeholder="write a comment";></textarea>        </div>      </div>      <div class="BRcells" style="margin-top:5px;vertical-align:top;">        <div id="SPLU.GameField">          <div id="SPLU.DomainButtons">            <a href="javascript:{void(0);}" onClick="javascript:{setObjectType(\'boardgame\');}" id="SPLU.SelectBGG" style="padding:0px 5px;border:1px solid black;">BGG</a>            <a href="javascript:{void(0);}" onClick="javascript:{setObjectType(\'videogame\');}" id="SPLU.SelectVGG" style="padding:0px 5px;border:1px solid black;">VGG</a>            <a href="javascript:{void(0);}" onClick="javascript:{setObjectType(\'rpgitem\');}" id="SPLU.SelectRPG" style="padding:0px 5px;border:1px solid black;">RPG</a>          </div>          <input name="objectid" value="32946" id="objectid0" type="hidden"/>          <input style="margin:3px 0px 0px;" autocomplete="off" class="geekinput_medium" name="geekitemname" id="q546e9ffd96dfc" tabindex="60" placeholder="enter a game title" onClick="this.select();" onkeydown="return StartInstantSearch({event: event,itemid: \'0\',objecttype: SPLUobjecttype,onclick: \'\',extraonclick: \'\',uniqueid: \'546e9ffd96dfc\',formname: \'\',textareaname: \'\',inline: \'\',userobject: null} );" type="text">          <a href="javascript:{void(0);}" onClick="javascript:{showFavsPane(\'button\');}" id="favoritesGoTo" style="border:4px solid lightblue;border-radius:4px"><img src="http://cf.geekdo-images.com/images/pic2319725.png" border="0" style="position:relative; margin-top:-5px; top:5px;"></a>          <span id="instantsearch546e9ffd96dfc" style="display: none;">            <div class="searchbox_results">              <div id="instantsearchresults546e9ffd96dfc"></div>            </div>          </span>          <div id="objectiddisp546e9ffd96dfc" style="display:none;">ID: </div>          <div id="objectname0"></div>          <input name="objecttype" id="objecttype0" value="thing" type="hidden">        </div>        <input size="12" class="geekinput_medium" id="imageid0" name="imageid" value="" type="hidden"></input>        <div style="display:table;">          <div style="display:table-row;">            <div style="display:table-cell;">              <div id="selimage0" style=padding-top:7px;"></div>            </div>          <div style="display:table-cell; vertical-align:top;">            <div id="BRthumbButtons" style="display:none">            <div style="padding-bottom:5px; padding-top:7px;"><a href="javascript:{void(0);}" onClick="javascript:{addFavorite();}" id="favoritesAddToList" style="padding:4px;"><img src="https://cf.geekdo-images.com/images/pic2321598.png" border="0"></a></div>            <div><a javascript:{void(0);}" onClick="javascript:{SPLUgameID=document.getElementById(\'objectid0\').value;showExpansionsPane(\'button\');}" id="expansionLoggingButton" style="padding:4px;"><img src="https://cf.geekdo-images.com/images/pic2344399.png" border="0"></a></div>          </div>        </div>        <div style="display:table-cell; vertical-align:top; padding-top:10px;" id="SPLU.GameStatus"></div>      </div>    </div></div>    </div></div>      <div style="display:table;">    <div style="display:table-row;">    <div class="BRcells">    Players:<a href="javascript:{void(0);}" onClick="javascript:{showHidePlayers(false);}" id="SPLU.SavedNamesBtn" style="padding-left:1px;"><span id="SPLU.SavedNamesButtonIconCollapse" style="display:inline-block;"><img src="http://cf.geekdo-images.com/images/pic2321002.png"></span><span id="SPLU.SavedNamesButtonIconExpand" style="display:none;"><img src="http://cf.geekdo-images.com/images/pic2320964.png"></span></a>    <a href="javascript:{void(0);}" onClick="javascript:{showPlayersPane(\'button\');}" id="showPlayersPaneBtn"><img src="https://cf.geekdo-images.com/images/pic2346497.png"></a>    <div style="display:inline;" id="SPLU.PlayerFilters"><select id="SPLU.SelectFilter" onChange="javascript:{setFilter(\'choose\');}"></select></div>    <div id="SPLU.PlayerList" style="padding-top:15px 0px 3px 0px; width:450px;">Loading...</div>    </div></div></div>      <div id="SPLUplayerRows" style="display:table; padding-bottom:15px;">    <div style="display:table-row;">    <div class="SPLUplayerCells" style="width:25px;">        </div>    <div class="SPLUplayerCells" id="SPLU.PlayerNameColumnHeader">    <div id="SPLU.PlayerNameColumn" class="SPLUheader" style="min-width:38px;"><div id="collapseName" class="SPLUheaderClose"><a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerNameColumn\');}"><img src=http://cf.geekdo-images.com/images/pic2284822.png></a></div><center>Name</center></div>    </div>    <div class="SPLUplayerCells" id="SPLU.PlayerUsernameColumnHeader">    <div id="SPLU.PlayerUsernameColumn" class="SPLUheader" style="min-width:66px;"><div id="collapseUsername" class="SPLUheaderClose"><a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerUsernameColumn\');}"><img src=http://cf.geekdo-images.com/images/pic2284822.png></a></div><center>Username</center></div>    </div>    <div class="SPLUplayerCells" id="SPLU.PlayerColorColumnHeader">    <div id="SPLU.PlayerColorColumn" class="SPLUheader" style="min-width:36px;"><div id="collapseColor" class="SPLUheaderClose"><a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerColorColumn\');}"><img src=http://cf.geekdo-images.com/images/pic2284822.png></a></div><center>Team<br/>Color</center></div>    </div>    <div class="SPLUplayerCells" id="SPLU.PlayerPositionColumnHeader">    <div id="SPLU.PlayerPositionColumn" class="SPLUheader" style="min-width:33px;"><div id="collapseStart" class="SPLUheaderClose"><a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerPositionColumn\');}"><img src=http://cf.geekdo-images.com/images/pic2284822.png></a></div><center>Start<br/>Pos</center></div>    </div>    <div class="SPLUplayerCells" id="SPLU.PlayerScoreColumnHeader">    <div id="SPLU.PlayerScoreColumn" class="SPLUheader" style="min-width:37px;"><div id="collapseScore" class="SPLUheaderClose"><a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerScoreColumn\');}"><img src=http://cf.geekdo-images.com/images/pic2284822.png></a></div><center>Score</center></div>    </div>    <div class="SPLUplayerCells" id="SPLU.PlayerRatingColumnHeader">    <div id="SPLU.PlayerRatingColumn" class="SPLUheader" style="min-width:32px;"><div id="collapseRating" class="SPLUheaderClose"><a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerRatingColumn\');}"><img src=http://cf.geekdo-images.com/images/pic2284822.png></a></div><center>Rate</center></div>    </div>    <div class="SPLUplayerCells" id="SPLU.PlayerWinColumnHeader">    <div id="SPLU.PlayerWinColumn" class="SPLUheader" style="min-width:30px;"><div id="collapseWin" class="SPLUheaderClose"><a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerWinColumn\');}"><img src=http://cf.geekdo-images.com/images/pic2284822.png></a></div><center>Win</center></div>    </div>    <div class="SPLUplayerCells" id="SPLU.PlayerNewColumnHeader">    <div id="SPLU.PlayerNewColumn" class="SPLUheader" style="min-width:30px;"><div id="collapseNewPlayer" class="SPLUheaderClose"><a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerNewColumn\');}"><img src=http://cf.geekdo-images.com/images/pic2284822.png></a></div><center>New</center></div></div>    </div></div></div>      <div style="display:table; margin-top:15px;">    <div style="display:table-row;">    <div class="BRcells">    <div><a href="javascript:{void(0);}" onClick="javascript:{saveGamePlay(\'none\');}" style="border:2px solid blue;padding:2px 4px;border-radius:5px;background-color:lightGrey; color:black;" id="SaveGamePlayBtn" onMouseOver="makeSentence();" onMouseOut="hideSentence();">Submit</a></div>    </div>    <div class="BRcells">    <div><a href="javascript:{void(0);}" onClick="javascript:{saveGamePlay(\'dupe\');}" style="border:2px solid blue;padding:2px 4px;border-radius:5px;background-color:lightGrey; color:black;" id="SaveGamePlayBtnDupe" onMouseOver="makeSentence();" onMouseOut="hideSentence();">Submit & Duplicate</a></div>    </div><div class="BRcells" id="SPLUeditPlayDiv" style="display:none;"><div><a href="javascript:{void(0);}" onClick="javascript:{saveGamePlay(\'edit\');}" style="border:2px solid blue;padding:2px 4px;border-radius:5px;background-color:lightGrey; color:black;" id="EditGamePlayBtn" onMouseOver="makeSentence();" onMouseOut="hideSentence();">Submit Edits</a></div></div><div class="BRcells" id="SPLUdeletePlayDiv" style="display:none;"><div><a href="javascript:{void(0);}" onClick="javascript:{deleteGamePlay();}" style="border:2px solid blue;padding:2px 4px;border-radius:5px;background-color:lightGrey; color:black;" id="DeleteGamePlayBtn" onMouseOver="makeSentence();" onMouseOut="hideSentence();">Delete This Play</a></div></div>    <div class="BRcells">    <div id="BRresults"></div>    </div>    <div class="BRcells">    <div id="SPLUexpansionResults"></div>    </div></div></div>        <div style="float:right;margin-top:-25px;">    <div><a href="javascript:{void(0);}" onClick="javascript:{showPlaysPane(\'button\');}" id="BRplaysBtn"><img src="http://cf.geekdo-images.com/images/pic2447320.png"></a></div>    </div>        <div style="display:table;">    <div style="display:table-row;">    <div class="BRcells">    <div id="SPLU.SummaryTextField" style="max-width:400px;"></div>    </div></div></div>';  
  tmpDiv.innerHTML+=tmpHTML;
  BRlogForm.appendChild(tmpDiv);


  
  var BRlogSettings=document.createElement('div');
  BRlogSettings.id='BRlogSettings';
  BRlogSettings.setAttribute("style","display:none; background-color: #80FE86; padding: 13px;border:2px solid black;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:75px;");
  var tmpDiv=document.createElement('div');
  var tmpHTML='<div id="hideSettingsButton" style="position: absolute; right: 0px; top: 2px;"><a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlog\').style.minWidth=\'\';document.getElementById(\'BRlogSettings\').style.display=\'none\';}" style="border:2px solid black;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"><img src="http://cf.geekdo-images.com/images/pic2336662.png"></a></div>    <span style="font-variant:small-caps; font-weight:bold; font-size:13px;"><center>Settings</center></span>    <div style="display:table;">    <div style="display:table-row;">    <div style="display:table-cell; text-align:left;"><b>Area</b></div>    <div style="display:table-cell; padding-left:10px; text-align:center;">Visible</div>    <div style="display:table-cell; padding-left: 10px; text-align:center;" id="ResetSettingsOption">Reset</div>    </div>    <div style="display:table-row;">    <div style="display:table-cell; text-align:right;">Date</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.DateFieldCheck" onClick="javascript:{showHide(\'DateField\');}" ></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.DateFieldReset" onclick="javascript:{SPLU.Settings.DateField.Reset=document.getElementById(\'SPLU.DateFieldReset\').checked;}"></input></div>    </div>    <div style="display:table-row;" class="SPLUsettingAltRows">    <div style="display:table-cell; text-align:right;">Location</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.LocationFieldCheck" onClick="javascript:{showHide(\'LocationField\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.LocationFieldReset" onclick="javascript:{SPLU.Settings.LocationField.Reset=document.getElementById(\'SPLU.LocationFieldReset\').checked;}"></input></div>    </div>    <div style="display:table-row;">    <div style="display:table-cell; text-align:right;">Saved Location List</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.LocationListCheck" onClick="javascript:{showHideLocations(\'true\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.LocationListReset" onclick="javascript:{SPLU.Settings.LocationList.Reset=document.getElementById(\'SPLU.LocationListReset\').checked;}"></input></div>    </div>      <div style="display:table-row;" class="SPLUsettingAltRows">    <div style="display:table-cell; text-align:right;">Quantity</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.QuantityFieldCheck" onclick="javascript:{showHide(\'QuantityField\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.QuantityFieldReset" onclick="javascript:{SPLU.Settings.QuantityField.Reset=document.getElementById(\'SPLU.QuantityFieldReset\').checked;}"></input></div>    </div>      <div style="display:table-row;">    <div style="display:table-cell; text-align:right;">Duration</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.DurationFieldCheck" onclick="javascript:{showHide(\'DurationField\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.DurationFieldReset" onclick="javascript:{SPLU.Settings.DurationField.Reset=document.getElementById(\'SPLU.DurationFieldReset\').checked;}"></input></div>    </div>      <div style="display:table-row;" class="SPLUsettingAltRows">    <div style="display:table-cell; text-align:right;">Incomplete</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.IncompleteFieldCheck" onclick="javascript:{showHide(\'IncompleteField\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.IncompleteFieldReset" onclick="javascript:{SPLU.Settings.IncompleteField.Reset=document.getElementById(\'SPLU.IncompleteFieldReset\').checked;}"></input></div>    </div>      <div style="display:table-row;">    <div style="display:table-cell; text-align:right;">No Win Stats</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.NoWinStatsFieldCheck" onclick="javascript:{showHide(\'NoWinStatsField\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.NoWinStatsFieldReset" onclick="javascript:{SPLU.Settings.NoWinStatsField.Reset=document.getElementById(\'SPLU.NoWinStatsFieldReset\').checked;}"></input></div>    </div>      <div style="display:table-row;" class="SPLUsettingAltRows">    <div style="display:table-cell; text-align:right;">Comments</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.CommentsFieldCheck" onclick="javascript:{showHide(\'CommentsField\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.CommentsFieldReset" onclick="javascript:{SPLU.Settings.CommentsField.Reset=document.getElementById(\'SPLU.CommentsFieldReset\').checked;}"></input></div>    </div>      <div style="display:table-row;">    <div style="display:table-cell; text-align:right;">Game</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.GameFieldCheck" onclick="javascript:{showHide(\'GameField\');}"></input></div>    <div style="display:table-cell; text-align:center;"></div>    </div>    <div style="display:table-row;">    <div style="display:table-cell; text-align:right;">Domain Buttons</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.DomainButtonsCheck" onclick="javascript:{showHide(\'DomainButtons\');}"></input></div>    <div style="display:table-cell; text-align:center;"></div>    </div>		    <div style="display:table-row;" class="SPLUsettingAltRows">    <div style="display:table-cell; text-align:right;">Saved Player Names</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerListCheck" onclick="javascript:{showHide(\'PlayerList\');}"></input></div>    <div style="display:table-cell; text-align:center;"></div>    </div>        <div style="display:table-row;" class="SPLUsettingAltRows">    <div style="display:table-cell; text-align:right;">Enable Filters</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerFiltersCheck" onclick="javascript:{showHideFilters();}"></input></div>    <div style="display:table-cell; text-align:center;"></div>    </div>        <div style="display:table-row;" class="SPLUsettingAltRows">    <div style="display:table-cell; text-align:right;">Enable Groups</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerGroupsCheck" onclick="javascript:{showHideGroups();}"></input></div>    <div style="display:table-cell; text-align:center;"></div>    </div>    <div style="display:table-row;"><div style="display:table-cell; text-align:left; padding-top:10px;"><b>Player Columns</b></div></div>      <div style="display:table-row;">    <div style="display:table-cell; text-align:right;">Name</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerNameColumnCheck" onclick="javascript:{hideColumn(\'PlayerNameColumn\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerNameColumnReset" onclick="javascript:{SPLU.Settings.PlayerNameColumn.Reset=document.getElementById(\'SPLU.PlayerNameColumnReset\').checked;}"></input></div>    </div>      <div style="display:table-row;" class="SPLUsettingAltRows">    <div style="display:table-cell; text-align:right;">Username</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerUsernameColumnCheck" onclick="javascript:{hideColumn(\'PlayerUsernameColumn\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerUsernameColumnReset" onclick="javascript:{SPLU.Settings.PlayerUsernameColumn.Reset=document.getElementById(\'SPLU.PlayerUsernameColumnReset\').checked;}"></input></div>    </div>      <div style="display:table-row;">    <div style="display:table-cell; text-align:right;">Team / Color</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerColorColumnCheck" onclick="javascript:{hideColumn(\'PlayerColorColumn\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerColorColumnReset" onclick="javascript:{SPLU.Settings.PlayerColorColumn.Reset=document.getElementById(\'SPLU.PlayerColorColumnReset\').checked;}"></input></div>    </div>      <div style="display:table-row;" class="SPLUsettingAltRows">    <div style="display:table-cell; text-align:right;">Starting Position</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerPositionColumnCheck" onclick="javascript:{hideColumn(\'PlayerPositionColumn\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerPositionColumnReset" onclick="javascript:{SPLU.Settings.PlayerPositionColumn.Reset=document.getElementById(\'SPLU.PlayerPositionColumnReset\').checked;}"></input></div>    </div>      <div style="display:table-row;">    <div style="display:table-cell; text-align:right;">Score</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerScoreColumnCheck" onclick="javascript:{hideColumn(\'PlayerScoreColumn\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerScoreColumnReset" onclick="javascript:{SPLU.Settings.PlayerScoreColumn.Reset=document.getElementById(\'SPLU.PlayerScoreColumnReset\').checked;}"></input></div>    </div>      <div style="display:table-row;" class="SPLUsettingAltRows">    <div style="display:table-cell; text-align:right;">Rating</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerRatingColumnCheck" onclick="javascript:{hideColumn(\'PlayerRatingColumn\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerRatingColumnReset" onclick="javascript:{SPLU.Settings.PlayerRatingColumn.Reset=document.getElementById(\'SPLU.PlayerRatingColumnReset\').checked;}"></input></div>    </div>      <div style="display:table-row;">    <div tyle="display:table-cell; text-align:right;">Win</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerWinColumnCheck" onclick="javascript:{hideColumn(\'PlayerWinColumn\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerWinColumnReset" onclick="javascript:{SPLU.Settings.PlayerWinColumn.Reset=document.getElementById(\'SPLU.PlayerWinColumnReset\').checked;}"></input></div>    </div>      <div style="display:table-row;" class="SPLUsettingAltRows">    <div style="display:table-cell; text-align:right;">New</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerNewColumnCheck" onclick="javascript:{hideColumn(\'PlayerNewColumn\');}"></input></div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PlayerNewColumnReset" onclick="javascript:{SPLU.Settings.PlayerNewColumn.Reset=document.getElementById(\'SPLU.PlayerNewColumnReset\').checked;}"></input></div>    </div>    <div style="display:table-row;"><div style="display:table-cell; text-align:left; padding-top:10px;"><b>Other Stuff</b></div></div>      <div style="display:table-row;" class="SPLUsettingAltRows">    <div style="display:table-cell; text-align:right;">Pop-Up Text</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.PopUpTextCheck" onclick="javascript:{SPLU.Settings.PopUpText.Visible=document.getElementById(\'SPLU.PopUpTextCheck\').checked;}"></input></div>    <div style="display:table-cell; text-align:center;"></div>    </div>      <div style="display:table-row;">    <div style="display:table-cell; text-align:right;">Summary Sentence</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.SummaryTextFieldCheck" onclick="javascript:{showHide(\'SummaryTextField\');}"></input></div>    <div style="display:table-cell; text-align:center;"></div>    </div>      <div style="display:table-row;" class="SPLUsettingAltRows">    <div style="display:table-cell; text-align:right;">Noreen\'s Win Comments</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.WinCommentsCheck" onclick="javascript:{SPLU.Settings.WinComments.Visible=document.getElementById(\'SPLU.WinCommentsCheck\').checked; if(SPLU.Settings.WinComments.Visible){NoreenWinComment();}}"></input></div>    <div style="display:table-cell; text-align:center;"></div>    </div>    <div style="display:table-row;">    <div style="display:table-cell; text-align:right;">Sort Players: Alpha</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.SortPlayersAlphaCheck" onclick="javascript:{if(document.getElementById(\'SPLU.SortPlayersAlphaCheck\').checked){SPLU.Settings.SortPlayers.Order=\'Alpha\';}else{SPLU.Settings.SortPlayers.Order=\'None\';} loadPlayers();}"></input></div>    <div style="display:table-cell; text-align:center;"></div>    </div>    <div style="display:table-row;" class="SPLUsettingAltRows">    <div style="display:table-cell; text-align:right;">Sort Groups: Alpha</div>    <div style="display:table-cell; text-align:center;"><input type="checkbox" id="SPLU.SortGroupsAlphaCheck" onclick="javascript:{if(document.getElementById(\'SPLU.SortGroupsAlphaCheck\').checked){SPLU.Settings.SortGroups.Order=\'Alpha\';}else{SPLU.Settings.SortGroups.Order=\'None\';} loadPlayers();}"></input></div>    <div style="display:table-cell; text-align:center;"></div>    </div>        </div>      <div style="display:table; padding-top:15px;">    <div style="display:table-row;">    <div style="display:table-cell; padding-right:10px;"><a href="javascript:{void(0);}" onClick="javascript:{saveSettings(\'Saved\');}" class="BRbutn" style="border:2px solid black;padding:2px 4px;border-radius:5px;background-color:lightGrey; color:black;">Save Settings</a></div>    <div style="display:table-cell;width:135px;" id="SPLU.SettingsStatus"></div>    <div style="display:table-cell;" id="SPLU.SettingsReset"><a href="javascript:{void(0);}" onClick="javascript:{resetSettings();saveSettings(\'Settings Reset. Please close SPLU.\');}" style="color:red;">!</a></div>    </div></div>      </div>';  tmpDiv.innerHTML+=tmpHTML;
  BRlogSettings.appendChild(tmpDiv);


  var BRlogFavs=document.createElement('div');
  BRlogFavs.id='BRlogFavs';
  BRlogFavs.setAttribute("style","display:none; background-color: #FFAEC5; font-style:initial; color:black; padding: 13px;border:2px solid #F30F27;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:100px;");
  var tmpDiv=document.createElement('div');
  var tmpHTML='<div id="hideFavsButton" style="position: absolute; right: 0px; top: 2px;"><a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogFavs\').style.display=\'none\';}" style="border:2px solid #F30F27;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"><img src="http://cf.geekdo-images.com/images/pic2336662.png"></a></div>';
  tmpHTML+='<span style="font-variant:small-caps; font-weight:bold;"><center>Favorites</center><br /></span>';
  tmpHTML+='<div id="SPLU.FavoritesStatus"></div>';
  tmpHTML+='<div id="SPLU.FavoritesList" style="overflow-y:auto; width:220px;"></div>';
  tmpDiv.innerHTML+=tmpHTML;
  BRlogFavs.appendChild(tmpDiv);

  var BRlogExpansions=document.createElement('div');
  BRlogExpansions.id='BRlogExpansions';
  BRlogExpansions.setAttribute("style","display:none; background-color: #B269FB; font-style:initial; color:white; padding: 13px;border:2px solid blue;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:75px; max-width:250px;");
  var tmpDiv=document.createElement('div');
  var tmpHTML='<div id="hideExpansionsButton" style="position: absolute; right: 0px; top: 2px;"><a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogExpansions\').style.display=\'none\';}" style="border:2px solid blue;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"><img src="http://cf.geekdo-images.com/images/pic2336662.png"></a></div>';
  tmpHTML+='<form name="BRexpLogForm">';
  tmpHTML+='<center><b>Expansion Logging</b></center>';
  tmpHTML+='<div style="display:table;width:250px;"><div style="display:table-row;"><div id="SPLU.ExpansionsHeading" style="display:table-cell;padding-bottom:5px;border-top:2px solid blue;border-top-left-radius:20px;border-top-right-radius:20px;"><center><a href="javascript:{void(0);}" onClick="javascript:{showExpansionTab();}">Expansions</a></center></div><div id="SPLU.FamilyHeading" style="display:table-cell;padding-bottom:5px;border-top-left-radius:20px;border-top-right-radius:20px;"><center><a href="javascript:{void(0);}" onClick="javascript:{showFamilyTab();}">Family</a></center></div></div></div>';
  tmpHTML+='<div id="SPLU.ExpansionPane" style="overflow-y:auto;margin-top:10px;margin-bottom:10px;"></div>';
  tmpHTML+='<div id="SPLU.FamilyPane" style="overflow-y:auto;margin-top:10px;margin-bottom:10px;display:none;"></div>';
  tmpHTML+='<div id="SPLU.ExpansionPaneControls">';
  tmpHTML+='<div style="padding-top:10px;">Expansion Play Quantity: ';
  tmpHTML+='<div id="SPLU.fakeExpQtyBox" style="display:inline-block;padding:0px 2px; -moz-appearance:textfield; -webkit-appearance:textfield;">';
  tmpHTML+='<input type="text" id="BRexpPlayQTY"/ value=".1" style="width:40px;border:none;">';
  tmpHTML+='<a href="javascript:{void(0);}" onClick="javascript:{saveExpansionQuantity();}" style="vertical-align:middle;" id="SPLU.SaveExpQtyButton"><img src="http://cf.geekdo-images.com/images/pic2345639.png"></a></div>';
  tmpHTML+='<div style="display:table; padding-top:10px;"><div style="display:table-row;"><div style="display:table-cell; padding-top:10px;"><a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogExpansions\').style.display=\'none\';}" style="border:2px solid blue;padding:2px 4px;border-radius:5px;background-color:lightGrey;margin-top:10px;">OK</a></div><div style="display:table-cell; padding-top:10px; padding-left:10px;"><a href="javascript:{void(0);}" onClick="javascript:{clearExpansions();}" style="border:2px solid blue;padding:2px 4px;border-radius:5px;background-color:lightGrey;margin-top:10px;">Clear Selection</a></div><div id="SPLU.ExpansionsPaneStatus" style="display:table-cell; padding-top:10px; padding-left:10px;"></div></div></div></div>';
  tmpHTML+='</form>';
  tmpDiv.innerHTML+=tmpHTML;
  BRlogExpansions.appendChild(tmpDiv);
  
  var BRlogLocations=document.createElement('div');
  BRlogLocations.id='BRlogLocations';
  BRlogLocations.setAttribute("style","display:none; background-color: #F5C86C; padding: 13px;border:2px solid #249631;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:100px;");
  var tmpDiv=document.createElement('div');
  var tmpHTML='<div id="hideLocationsButton" style="position: absolute; right: 0px; top: 2px;"><a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogLocations\').style.display=\'none\';}" style="border:2px solid #249631;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"><img src="http://cf.geekdo-images.com/images/pic2336662.png"></a></div>';
  tmpHTML+='<span style="font-variant:small-caps; font-weight:bold;"><center>Saved Locations</center><br/></span>';
  tmpHTML+='<div id="SPLU.LocationsList" style="overflow-y:auto; width:200px;"></div>';
  tmpHTML+='<div style="padding-top:10px;display:inline;"><a href="javascript:{void(0);}" onClick="javascript:{saveLocations();}" class="SPLUbuttons" style="margin-right:6px;color:black;border:2px solid #249631">Save</a> <a href="javascript:{void(0);}" onClick="javascript:{addLocation();}" class="SPLUbuttons" style="color:black; border:2px solid #249631">New</a></div><div id="SPLU.LocationsStatus" style="display:inline;padding-left:5px;"></div>';
  tmpDiv.innerHTML+=tmpHTML;
  BRlogLocations.appendChild(tmpDiv);

  var BRlogPlayers=document.createElement('div');
  BRlogPlayers.id='BRlogPlayers';
  BRlogPlayers.setAttribute("style","display:none; background-color: #F7FB6F; padding: 13px;border:2px solid #00F; border-radius:15px; box-shadow:10px 10px 5px #888; min-width:275px;");
  var tmpDiv=document.createElement('div');
  var tmpHTML='<div id="hidePlayersButton" style="position: absolute; right: 0px; top: 2px;"><a href="javascript:{void(0);}" onClick="javascript:{hidePopText();showPlayersTab();document.getElementById(\'BRlogPlayers\').style.display=\'none\';}" style="border:2px solid #00F;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"><img src="http://cf.geekdo-images.com/images/pic2336662.png"></a></div>';
  tmpHTML+='<span style="font-variant:small-caps; font-weight:bold;"><center>Saved Players</center><br/></span>';
  tmpHTML+='<div style="display: table; width: 254px;"><div style="display:table-row;"><div id="SPLU.PlayersHeading" style="display:table-cell; padding-bottom: 5px;border-top: 2px solid blue; border-top-left-radius: 20px; border-top-right-radius: 20px;"><center><a href="javascript:{void(0);}" onClick="javascript:{showPlayersTab();}">Players</a></center></div><div id="SPLU.FiltersHeading" style="display:table-cell; padding-bottom: 5px;border-top-left-radius: 20px; border-top-right-radius: 20px;"><center><a href="javascript:{void(0);}" onClick="javascript:{showFiltersTab();}">Filters</a></center></div><div id="SPLU.GroupsHeading" style="display:table-cell; padding-bottom: 5px;border-top-left-radius: 20px; border-top-right-radius: 20px;"><center><a href="javascript:{void(0);}" onClick="javascript:{showGroupsTab();}">Groups</a></center></div></div>';
  tmpHTML+='<div style="display:table-row;"><div id="SPLU.PlayersSubHeading" style="display: table-cell; height: 15px;"><div id="SPLU.FiltersDeleteCell" style="display:none;"><a href="javascript:{void(0);}" onClick="javascript:{deleteFilter();}" style="vertical-align:middle; padding-right:5px;"><img src="http://cf.geekdo-images.com/images/pic2346458.png"></a></div><div id="SPLU.GroupsDeleteCell" style="display:none;"><a href="javascript:{void(0);}" onClick="javascript:{deleteGroup();}" style="vertical-align:middle; padding-right:5px;"><img src="http://cf.geekdo-images.com/images/pic2346458.png"></a></div></div>';
  tmpHTML+='<div id="SPLU.FiltersSubHeading" style="display: table-cell;"><center><select id="SPLU.FiltersSubSelect" style="margin:2px;display:none;" onChange="javascript:{setFilter(\'edit\');}"></select></center></div><div id="SPLU.GroupsSubHeading" style="display: table-cell;"><center><select id="SPLU.GroupsSubSelect" style="margin:2px;display:none;" onChange="javascript:{setGroup(\'edit\');}"></select></center></div></div></div>';
  tmpHTML+="<div style='display:table;'><div style='display:table-row;'><div style='display:table-cell;width:22px;'></div><div style='display:table-cell;width:84px;'><center>Name</center></div><div style='display:table-cell;width:84px;'><center>Username</center></div><div style='display:table-cell;width:64px;' name='SPLUplayerEditColumn'><center>Color</center></div><div style='display:none;width:64px;' name='SPLUplayerFilterColumn'></div></div></div>";
  tmpHTML+='<div id="SPLU.PlayersList" style="overflow-y:auto;"></div>';
  tmpHTML+='<div id="SPLU.PlayersPaneControls"><div style="padding-top:10px;"><a href="javascript:{void(0);}" onClick="javascript:{savePlayers();}" class="SPLUbuttons" style="margin-right:6px;color:black;" id="SavePlayerListBtn">Save</a> <a href="javascript:{void(0);}" onClick="javascript:{addPlayer();}" class="SPLUbuttons" style="color:black;">New</a></div><div id="SPLU.PlayersStatus" style="display:inline;padding-left:5px;"></div></div>';
  tmpHTML+='<div id="SPLU.FiltersPaneControls" style="display:none;"><div style="padding-top:10px;"><a href="javascript:{void(0);}" onClick="javascript:{saveFilters();}" class="SPLUbuttons" style="margin-right:6px;color:black;" id="SavePlayerFilterBtn">Save Filters</a> <div id="SPLU.fakeFilterBox" style="display:inline-block;padding:0px 2px; -moz-appearance:textfield; -webkit-appearance:textfield;"><input type="text" id="SPLU.NewFilterName" placeholder="Add a new Filter" style="width:100px;border:none;"></input><a href="javascript:{void(0);}" onClick="javascript:{addFilter();}" style="color:black;"><img src="//cf.geekdo-static.com/images/icons/silkicons/add.png"></a></div></div><div id="SPLU.FiltersStatus" style="display:inline;padding-left:5px;"></div></div>';
  tmpHTML+='<div id="SPLU.GroupsPaneControls" style="display:none;"><div style="padding-top:10px;"><a href="javascript:{void(0);}" onClick="javascript:{saveGroups();}" class="SPLUbuttons" style="margin-right:6px;color:black;" id="SavePlayerGroupsBtn">Save Groups</a> <div id="SPLU.fakeGroupBox" style="display:inline-block;padding:0px 2px; -moz-appearance:textfield; -webkit-appearance:textfield;"><input type="text" id="SPLU.NewGroupName" placeholder="Add a new Group" style="width:100px;border:none;"></input><a href="javascript:{void(0);}" onClick="javascript:{addGroup();}" style="color:black;"><img src="//cf.geekdo-static.com/images/icons/silkicons/add.png"></a></div></div><div id="SPLU.GroupsStatus" style="display:inline;padding-left:5px;"></div></div>';
  tmpDiv.innerHTML+=tmpHTML;
  BRlogPlayers.appendChild(tmpDiv);

  var BRlogPlays=document.createElement('div');
  BRlogPlays.id='BRlogPlays';
  BRlogPlays.setAttribute("style","display:none; background-color: #F1F8FB; padding: 13px;border:2px solid #249631;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:100px;");
  var tmpDiv=document.createElement('div');
  var tmpHTML='<div id="hidePlaysButton" style="position: absolute; right: 0px; top: 2px;"><a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogPlays\').style.display=\'none\';}" style="border:2px solid #249631;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"><img src="http://cf.geekdo-images.com/images/pic2336662.png"></a></div>';
  tmpHTML+='<span style="font-variant:small-caps; font-weight:bold;"><center>Plays</center><br/></span>';
  tmpHTML+='<div><input type="text" id="SPLU.PlaysLogger" value="'+LoggedInAs+'"/><a href="javascript:{void(0);}" onClick="javascript:{getRecentPlays(false);}">Get Recent</a> | <a href="javascript:{void(0);}" onClick="javascript:{getRecentPlays(true);}">Get All</a></div>';
  tmpHTML+='<div id="SPLU.PlaysStatus"></div>';
  tmpHTML+='<div id="SPLU.PlaysList" style="overflow-y:auto; width:275px;"></div>';
  tmpDiv.innerHTML+=tmpHTML;
  BRlogPlays.appendChild(tmpDiv);
  
  function showFavsPane(source){
    if(source=="button"&&document.getElementById('BRlogFavs').style.display=="table-cell"){
      document.getElementById('BRlogFavs').style.display="none";
      return;
    }
    hidePanes();
    document.getElementById('SPLU.FavoritesList').style.maxHeight=document.getElementById('BRlogMain').clientHeight-95+"px";
    document.getElementById('BRlogFavs').style.display="table-cell";
    var tmpHTML='<div style="display:table;">';
    var size=0;
    for(key in SPLU.Favorites){
        if(SPLU.Favorites.hasOwnProperty(key)){size++};
        if(size % 2==1){
          tmpHTML+='<div style="display:table-row;">';
        } 
        tmpHTML+='<div style="display:table-cell; max-width:110px; padding-top:10px;"><a href="javascript:{void(0);}" onClick="javascript:{chooseFavorite('+key+');}"><img src="'+SPLU.Favorites[key].thumbnail+'"></a><a href="javascript:{void(0);}" onClick="javascript:{deleteFavorite('+key+');}"><img src="http://cf.geekdo-images.com/images/pic2333696.png" style="vertical-align:top; position: relative; margin-left: -8px; margin-top: -8px;"/></a><br/>'+SPLU.Favorites[key].title+'</div>';
        if(size % 2==0){
          tmpHTML+='</div>';
        }
    }
    tmpHTML+='</div>';
    document.getElementById('SPLU.FavoritesList').innerHTML=tmpHTML;
    document.getElementById('SPLU.FavoritesStatus').innerHTML='<center>You have '+size+' Favorites.</center><br/>';
  }
  
  
  function showSettingsPane(source){
    if(source=="button"&&document.getElementById('BRlogSettings').style.display=="table-cell"){
      document.getElementById('BRlog').style.minWidth="";
      document.getElementById('BRlogSettings').style.display="none";
      return;
    }
    hidePanes();
    document.getElementById('BRlog').style.minWidth="610px";
    document.getElementById('BRlogSettings').style.display="table-cell";
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
      getExpansions();
    }
  }

  function showPlaysPane(source){
    if(source=="button"&&document.getElementById('BRlogPlays').style.display=="table-cell"){
      document.getElementById('BRlogPlays').style.display="none";
      return;
    }
    hidePanes();
    document.getElementById('SPLU.PlaysList').style.height=document.getElementById('BRlogMain').clientHeight-155+"px";
    document.getElementById('BRlogPlays').style.display="table-cell";
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
    var tmpHTML="<div style='display:table;' id='EditLocationsTable'>";
    for(var key in SPLU.Locations){
      if (SPLU.Locations.hasOwnProperty(key)) {
        SPLUlocationCount++;
        tmpHTML+="<div style='display:table-row;' id='EditLocationsRow"+key+"'>";
        tmpHTML+='<div style="display:table-cell;padding:1px;"><a href="javascript:{void(0);}" onClick="javascript:{document.getElementById(\'EditLocationsTable\').removeChild(document.getElementById(\'EditLocationsRow'+key+'\'));}" style="color:red;margin:2px;"><img src="http://cf.geekdo-images.com/images/pic2346458.png"></a></div>';
        tmpHTML+="<div style='display:table-cell;padding:1px;'><input type='text' size='25' class='EditLocationsField' tabindex='"+(1000+SPLUlocationCount)+"' style='border:none;' value=\""+decodeURIComponent(SPLU.Locations[key].Name)+"\"/></div>";
        tmpHTML+="</div>";
      }
    }
    tmpHTML+='</div>';
    document.getElementById('SPLU.LocationsList').innerHTML=tmpHTML;
    addLocation();
  }
  
  function addLocation(){
    SPLUlocationCount++;
    var tmpDiv=document.createElement('div');
    tmpDiv.style.display="table-row";
    tmpDiv.id="EditLocationsRow"+SPLUlocationCount;
    var tmpHTML='<div style="display:table-cell;padding:1px;"><a href="javascript:{void(0);}" onClick="javascript:{document.getElementById(\'EditLocationsTable\').removeChild(document.getElementById(\'EditLocationsRow'+SPLUlocationCount+'\'));}" style="color:red;margin:2px;"><img src="http://cf.geekdo-images.com/images/pic2346458.png"></a></div>';
    tmpHTML+="<div style='display:table-cell;padding:1px;'><input type='text' size='25' class='EditLocationsField' tabindex='"+(1000+SPLUlocationCount)+"' style='border:none;'/></div>";
    tmpDiv.innerHTML=tmpHTML;
    document.getElementById('EditLocationsTable').appendChild(tmpDiv);
  }
  
  function saveLocations(){
    document.getElementById('SPLU.LocationsStatus').innerHTML="Thinking...";
    SPLU.Locations={};
    var locations=document.getElementsByClassName('EditLocationsField');
    for(i=0;i<locations.length;i++){
      if(locations[i].value!=""){
        SPLU.Locations[i]={"Name":encodeURIComponent(locations[i].value)};
      }
    }
    SPLUremote.Locations=SPLU.Locations;
    xmlhttp=new XMLHttpRequest();
    xmlhttp.onload=function(responseJSON){
      console.log(responseJSON.target.status+"|"+responseJSON.target.statusText);
      if(responseJSON.target.status==200){
        document.getElementById('SPLU.LocationsStatus').innerHTML="Saved";
        window.setTimeout(function(){document.getElementById('SPLU.LocationsStatus').innerHTML=""},3000);loadLocations();showLocationsPane("save");
      }else{
        document.getElementById('SPLU.LocationsStatus').innerHTML="<img style='vertical-align:bottom;padding-top:5px;' src='//cf.geekdo-static.com/mbs/mb_3264_0.gif'><span style='background-color:red;color:white;font-weight:bold;'>Error Code: "+responseJSON.target.status+"</span> Try saving again.";
      }
    };
    xmlhttp.open("POST","/geekplay.php",true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("version=2&objecttype=thing&objectid=98000&playid="+SPLUplayId+"&action=save&quantity=0&comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&playdate=1452-04-15&B1=Save");
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
    if(SPLU.Settings.SortPlayers.Order=="Alpha"){
      players = Object.keys(SPLU.Players).sort();
    }else{
      players = Object.keys(SPLU.Players);
    }
    for(var key=0;key<players.length;key++){
      var tmp="";
      if (SPLU.Players.hasOwnProperty(players[key])) {
        SPLUplayerCount++;
        if(SPLUplayerCount % 2==1){
          tmp="background-color:#E5EA3C;";
        }else{
          tmp="";
        }
        tmpHTML+="<div style='display:table-row;' id='EditPlayersRow"+players[key]+"'>";
        tmpHTML+="<div style='display:table-cell;' name='SPLUplayerEditColumn'>"+'<a href="javascript:{void(0);}" onClick="javascript:{document.getElementById(\'EditPlayersTable\').removeChild(document.getElementById(\'EditPlayersRow'+players[key]+'\'));deletePlayer(\''+players[key]+'\')}" style="vertical-align:middle; padding-right:5px;"><img src="http://cf.geekdo-images.com/images/pic2346458.png"></a></div>';
        tmpHTML+="<div style='display:table-cell;padding-right:2px;' name='SPLUplayerEditColumn'><input type='text' size='12' tabindex='"+(1100+(SPLUplayerCount*5))+"' class='EditPlayersField' id='SPLUplayerName"+players[key]+"' value=\""+decodeURIComponent(SPLU.Players[players[key]].Name)+"\"/></div>";
        tmpHTML+="<div style='display:table-cell;padding-right:2px;' name='SPLUplayerEditColumn'><input type='text' size='12' tabindex='"+(1101+(SPLUplayerCount*5))+"' id='SPLUplayerUsername"+players[key]+"' value=\""+decodeURIComponent(SPLU.Players[players[key]].Username)+"\"/></div>";
        tmpHTML+="<div style='display:table-cell;padding-right:2px;' name='SPLUplayerEditColumn'><input type='text' size='8' tabindex='"+(1102+(SPLUplayerCount*5))+"' id='SPLUplayerColor"+players[key]+"' value=\""+decodeURIComponent(SPLU.Players[players[key]].Color)+"\"/><input type='hidden' id='SPLUplayerID"+players[key]+"' value='"+players[key]+"'></div>";
        tmpHTML+="<div style='display:none;width:22px;' name='SPLUplayerStaticColumn'></div>";
        tmpHTML+="<div style='display:none;width:84px;"+tmp+"' name='SPLUplayerStaticColumn'>"+decodeURIComponent(SPLU.Players[players[key]].Name)+"</div>";
        tmpHTML+="<div style='display:none;width:84px;"+tmp+"' name='SPLUplayerStaticColumn'>"+decodeURIComponent(SPLU.Players[players[key]].Username)+"</div>";
        tmpHTML+="<div style='display:none;width:64px;"+tmp+"' name='SPLUplayerFilterColumn'><center><input type='checkbox' name='SPLUfilterChecks' style='vertical-align:middle;' value='"+players[key]+"' onClick='javascript:{updateFilters(this);}'></input></center></div>";
        tmpHTML+="<div style='display:none;width:64px;"+tmp+"' name='SPLUplayerGroupColumn'><center><input type='checkbox' name='SPLUgroupChecks' style='vertical-align:middle;' value='"+players[key]+"' onClick='javascript:{updateGroups(this);}'></input></center></div>";
        tmpHTML+="</div>";
      }
    }
    tmpHTML+='</div>';
    document.getElementById('SPLU.PlayersList').innerHTML=tmpHTML;
    addPlayer();
  }

  function addPlayer(){
    SPLUplayerCount++;
    var tmpDiv=document.createElement('div');
    tmpDiv.style.display="table-row";
    tmpDiv.id="EditPlayersRow"+SPLUplayerCount;
    var tmpHTML="<div style='display:table-cell;' name='SPLUplayerEditColumn'>"+'<a href="javascript:{void(0);}" onClick="javascript:{document.getElementById(\'EditPlayersTable\').removeChild(document.getElementById(\'EditPlayersRow'+SPLUplayerCount+'\'));}" style="vertical-align:middle;"><img src="http://cf.geekdo-images.com/images/pic2346458.png"></a></div>';
    tmpHTML+="<div style='display:table-cell;' name='SPLUplayerEditColumn'><input type='text' size='12' tabindex='"+(1100+(SPLUplayerCount*5))+"' class='EditPlayersField' id='SPLUplayerName"+SPLUplayerCount+"'/></div>";
    tmpHTML+="<div style='display:table-cell;' name='SPLUplayerEditColumn'><input type='text' size='12' tabindex='"+(1101+(SPLUplayerCount*5))+"' id='SPLUplayerUsername"+SPLUplayerCount+"'/></div>";
    tmpHTML+="<div style='display:table-cell;' name='SPLUplayerEditColumn'><input type='text' size='8' tabindex='"+(1102+(SPLUplayerCount*5))+"' id='SPLUplayerColor"+SPLUplayerCount+"'/><input type='hidden' id='SPLUplayerID"+SPLUplayerCount+"' value='-1'></div>";
    tmpDiv.innerHTML=tmpHTML;
    document.getElementById('EditPlayersTable').appendChild(tmpDiv);
  }
  
  function savePlayers(){
    document.getElementById('SPLU.PlayersStatus').innerHTML="Thinking...";
    SPLU.Players={};
    var players=document.getElementsByClassName('EditPlayersField');
    for(i=0;i<players.length;i++){
      p=players[i].id.slice(14);
      playersUsername=document.getElementById('SPLUplayerUsername'+p).value;
      playersColor=document.getElementById('SPLUplayerColor'+p).value;
      playersID=document.getElementById('SPLUplayerID'+p).value;
      if(players[i].value!=""||playersUsername!=""){
        tmp=Math.random();
        if(players[i].value==""){
          tmpPlayersID=playersUsername.replace(/ /g,'').toLowerCase()+tmp.toString().slice(-4);
        }else{
          tmpPlayersID=players[i].value.replace(/ /g,'').toLowerCase()+tmp.toString().slice(-4);
        }
        if(playersID.slice(0,-4)!=tmpPlayersID.slice(0,-4)){
          playersID=tmpPlayersID;
        }
        SPLU.Players[(playersID)]={"Name":encodeURIComponent(players[i].value),"Username":encodeURIComponent(playersUsername),"Color":encodeURIComponent(playersColor)};
      }
    }
    SPLUremote.Players=SPLU.Players;
    xmlhttp=new XMLHttpRequest();
    xmlhttp.onload=function(responseJSON){
      console.log(responseJSON.target.status+"|"+responseJSON.target.statusText);
      if(responseJSON.target.status==200){
        document.getElementById('SPLU.PlayersStatus').innerHTML="Saved";
        window.setTimeout(function(){document.getElementById('SPLU.PlayersStatus').innerHTML=""},3000);loadPlayers();showPlayersPane("save");
      }else{
        document.getElementById('SPLU.PlayersStatus').innerHTML="<img style='vertical-align:bottom;padding-top:5px;' src='//cf.geekdo-static.com/mbs/mb_3264_0.gif'><span style='background-color:red;color:white;font-weight:bold;'>Error Code: "+responseJSON.target.status+"</span> Try saving again.";
      }
    };
    xmlhttp.open("POST","/geekplay.php",true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("version=2&objecttype=thing&objectid=98000&playid="+SPLUplayId+"&action=save&quantity=0&comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&playdate=1452-04-15&B1=Save");
  }
  
  function deletePlayer(id){
    for(var key in SPLU.Groups){
      var index=SPLU.Groups[key].indexOf(id);
      if(index>=0){
       SPLU.Groups[key].splice(index,1);
        document.getElementById('SPLU.PlayersStatus').innerHTML="<span style='color:red;'>You have unsaved groups and/or filters.</span>";
        document.getElementById('SPLU.GroupsStatus').innerHTML="<span style='color:red;'>You have unsaved groups.</span>";
      }
    }
    for(var key in SPLU.Filters){
      var index=SPLU.Filters[key].indexOf(id);
      if(index>=0){
        SPLU.Filters[key].splice(index,1);
        document.getElementById('SPLU.PlayersStatus').innerHTML="<span style='color:red;'>You have unsaved groups and/or filters.</span>";
        document.getElementById('SPLU.FiltersStatus').innerHTML="<span style='color:red;'>You have unsaved filters.</span>";
      }
    }
  }
  
  function setPlayerPaneColumn(name,value){
    tmp=document.getElementsByName(name);
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
      document.getElementById('SPLU.FiltersStatus').innerHTML="<span style='color:red;'>You have unsaved filters.</span>";
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
      document.getElementById('SPLU.FiltersStatus').innerHTML="<span style='color:red;'>You have unsaved filters.</span>";
    }
  }
  
  function saveFilters(){
    document.getElementById('SPLU.FiltersStatus').innerHTML="Thinking...";
    document.getElementById('SPLU.PlayersStatus').innerHTML="";
    SPLUremote.Filters=SPLU.Filters;
    xmlhttp=new XMLHttpRequest();
    xmlhttp.onload=function(responseJSON){
      console.log(responseJSON.target.status+"|"+responseJSON.target.statusText);
      if(responseJSON.target.status==200){
        document.getElementById('SPLU.FiltersStatus').innerHTML="Saved";
        window.setTimeout(function(){document.getElementById('SPLU.FiltersStatus').innerHTML=""},3000);
      }else{
        document.getElementById('SPLU.FiltersStatus').innerHTML="<img style='vertical-align:bottom;padding-top:5px;' src='//cf.geekdo-static.com/mbs/mb_3264_0.gif'><span style='background-color:red;color:white;font-weight:bold;'>Error Code: "+responseJSON.target.status+"</span> Try saving again.";
      }
    };
    xmlhttp.open("POST","/geekplay.php",true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("version=2&objecttype=thing&objectid=98000&playid="+SPLUplayId+"&action=save&quantity=0&comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&playdate=1452-04-15&B1=Save");
  }

  function deleteFilter(){
    var filter=document.getElementById('SPLU.FiltersSubSelect').value;
    if(filter!="---"){
      delete SPLU.Filters[filter];
      setFilter("delete");
      document.getElementById('SPLU.FiltersStatus').innerHTML="<span style='color:red;'>You have unsaved filters.</span>";
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
      document.getElementById('SPLU.GroupsStatus').innerHTML="<span style='color:red;'>You have unsaved groups.</span>";
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
      document.getElementById('SPLU.GroupsStatus').innerHTML="<span style='color:red;'>You have unsaved groups.</span>";
    }
  }
  
  function deleteGroup(){
    var group=document.getElementById('SPLU.GroupsSubSelect').value;
    if(group!=""){
      delete SPLU.Groups[group];
      loadGroups();
      if(SPLUcurrentFilter=="All"){
        loadPlayers();
      }
      document.getElementById('SPLU.GroupsStatus').innerHTML="<span style='color:red;'>You have unsaved groups.</span>";
    }
  }
  
  function saveGroups(){
    document.getElementById('SPLU.GroupsStatus').innerHTML="Thinking...";
    document.getElementById('SPLU.PlayersStatus').innerHTML="";
    SPLUremote.Groups=SPLU.Groups;
    xmlhttp=new XMLHttpRequest();
    xmlhttp.onload=function(responseJSON){
      console.log(responseJSON.target.status+"|"+responseJSON.target.statusText);
      if(responseJSON.target.status==200){
        document.getElementById('SPLU.GroupsStatus').innerHTML="Saved";
        window.setTimeout(function(){document.getElementById('SPLU.GroupsStatus').innerHTML=""},3000);
      }else{
        document.getElementById('SPLU.GroupsStatus').innerHTML="<img style='vertical-align:bottom;padding-top:5px;' src='//cf.geekdo-static.com/mbs/mb_3264_0.gif'><span style='background-color:red;color:white;font-weight:bold;'>Error Code: "+responseJSON.target.status+"</span> Try saving again.";
      }
    };
    xmlhttp.open("POST","/geekplay.php",true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("version=2&objecttype=thing&objectid=98000&playid="+SPLUplayId+"&action=save&quantity=0&comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&playdate=1452-04-15&B1=Save");
  }

  function insertGroup(group){
    for(i=0;i<SPLU.Groups[group].length;i++){
      insertPlayer(SPLU.Groups[group][i]);
    }
  }
  
  function hidePanes(){
    document.getElementById('BRlogSettings').style.display="none";
    document.getElementById('BRlog').style.minWidth="";
    document.getElementById('BRlogFavs').style.display="none";
    document.getElementById('BRlogExpansions').style.display="none";
    document.getElementById('BRlogLocations').style.display="none";
    document.getElementById('BRlogPlayers').style.display="none";
    document.getElementById('BRlogPlays').style.display="none";
  }
  
  BRlogRow.appendChild(BRlogDiv);
  BRlogRow.appendChild(BRlogSettings);
  BRlogRow.appendChild(BRlogExpansions);
  BRlogRow.appendChild(BRlogFavs);
  BRlogRow.appendChild(BRlogLocations);
  BRlogRow.appendChild(BRlogPlayers);
  BRlogRow.appendChild(BRlogPlays);
  BRlogMain.appendChild(BRlogRow);
  document.getElementById('maincontent').insertBefore(BRlogMain,document.getElementById('maincontent').firstChild);

  //Set up PopText for buttons and such
  listenerForPopText("collapseColor","Collapse");
  listenerForPopText("collapseStart","Collapse");
  listenerForPopText("collapseRating","Collapse");
  listenerForPopText("collapseScore","Collapse");
  listenerForPopText("collapseNewPlayer","Collapse");
  listenerForPopText("collapseWin","Collapse");
  listenerForPopText("collapseName","Collapse");
  listenerForPopText("collapseUsername","Collapse");
  listenerForPopText("SaveGamePlayBtn","Submit and Reset Form");
  listenerForPopText("SaveGamePlayBtnDupe","Submit but Keep Player Data");
  listenerForPopText("favoritesGoTo","Choose from your Favorites list");
  listenerForPopText("favoritesAddToList","Add to Favorites");
  listenerForPopText("expansionLoggingButton","Log an expansion");
  listenerForPopText("ResetSettingsOption","Check these items to clear their values when you press <b>Submit & Duplicate</b>");
  listenerForPopText("SPLU.DateFieldReset","Date will also reset when clicking <b>Submit</b>");
  listenerForPopText("hideSettingsButton","Shut this Drawer");
  listenerForPopText("hideExpansionsButton","Shut this Drawer");
  listenerForPopText("hideFavsButton","Shut this Drawer");
  listenerForPopText("SPLU.SettingsReset","Reset all settings to default.  Close and re-open SPLU after clicking this.");
  listenerForPopText("showPlayersPaneBtn","Edit All Players");
  listenerForPopText("showLocationsPaneBtn","Edit All Locations");
  listenerForPopText("SPLU.SaveLocationButton","Save This Location");
  listenerForPopText("BRplaysBtn","View/Edit Play History")

  var observer=new MutationObserver(function(){
    if(document.getElementById('selimage0').innerHTML.slice(0,4)=="<div"){
      document.getElementById('BRthumbButtons').style.display="none";
    }else{
      document.getElementById('BRthumbButtons').style.display="block";
    }
    document.getElementById('BRresults').innerHTML='';
    document.getElementById('SPLU.ExpansionPane').innerHTML='';
    document.getElementById('SPLU.FamilyPane').innerHTML='';
    document.getElementById('BRlogExpansions').style.display="none";
    document.getElementById('SPLU.ExpansionsHeading').style.borderTop="2px solid blue";
    document.getElementById('SPLU.FamilyHeading').style.borderTop="";
    SPLUexpansionsLoaded=false;
    SPLUfamilyLoaded=false;
  });
  observer.observe(document.getElementById('selimage0'),{childList: true});

  findSaveData();
