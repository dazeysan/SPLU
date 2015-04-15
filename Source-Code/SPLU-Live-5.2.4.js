if(window.location.host.slice(-17)!="boardgamegeek.com" &amp;&amp;  window.location.host.slice(-17)!="videogamegeek.com" &amp;&amp; window.location.host.slice(-11)!="rpggeek.com" &amp;&amp; window.location.host.slice(-6)!="bgg.cc" &amp;&amp; window.location.host.slice(-10)!="geekdo.com"){
alert("You must be on a BGG website to run SPLU.");
throw new Error("You aren't on a BGG site.");
}
if(document.getElementById('BRlog')){throw new Error("SPLU Already Running");}
var LoggedInAs = document.getElementsByClassName('menu_login')[0].childNodes[3].childNodes[1].innerHTML;
if(LoggedInAs==""){alert("You aren't logged in.");throw new Error("You aren't logged in.");}
var SPLUversion="5.2.4";

function fixedEncodeURIComponent(str) {
return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
return '%' + c.charCodeAt(0).toString(16);
});
}

function finalSetup(){
loadPlayers();  
loadLocations();    
for (var key in SPLU.Settings) {
if (SPLU.Settings.hasOwnProperty(key)) {
if(SPLU.Settings[key].Visible){
document.getElementById("SPLU."+key+"Check").checked=true;
}else{
if(key!="PopUpText" &amp;&amp; key!="LocationList" &amp;&amp; key!="WinComments" &amp;&amp; key!="PlayerList" &amp;&amp; key!="ExpansionQuantity" &amp;&amp; key!="SortPlayers" &amp;&amp; key!="SortGroups" &amp;&amp; key!="PlayerGroups"){
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
if(key=="SortPlayers"&amp;&amp;SPLU.Settings[key].Order=="Alpha"){
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
oReq2.open("get", "/xmlapi2/plays?username="+LoggedInAs+"&amp;mindate=1452-04-15&amp;maxdate=1452-04-15&amp;id=98000", true);
oReq2.send();
};
xmlhttp.open("POST","/geekplay.php",true);
xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
xmlhttp.send("version=2&amp;objecttype=thing&amp;objectid=98000&amp;action=save&amp;quantity=0&amp;comments="+fixedEncodeURIComponent(JSON.stringify(SPLU))+"&amp;playdate=1452-04-15&amp;B1=Save");
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
xmlhttp.send("version=2&amp;objecttype=thing&amp;objectid=98000&amp;playid="+SPLUplayId+"&amp;action=save&amp;quantity=0&amp;comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&amp;playdate=1452-04-15&amp;B1=Save");
}else{
finalSetup();
}
}
SPLUremote=SPLU;
};
oReq.open("get", "/xmlapi2/plays?username="+LoggedInAs+"&amp;mindate=1452-04-15&amp;maxdate=1452-04-15&amp;id=98000", true);
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
var SPLUplaysPage=1;
var SPLUplayData={};
var SPLUplayFetch={};
var SPLUplayFetchFail=0;
var SPLUplaysFiltersCount=0;

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
var result = (a[property] &lt; b[property]) ? -1 : (a[property] &gt; b[property]) ? 1 : 0;
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
while(result === 0 &amp;&amp; i &lt; numberOfProperties) {
result = dynamicSort(props[i])(obj1, obj2);
i++;
}
return result;
}
}

function getGameID(){
var metas=document.getElementsByTagName('meta');
for(i=0;i&lt;metas.length;i++){
if(metas[i].getAttribute("name")=="og:image"){
var thumbDiv='&lt;a&gt;&lt;img src="'+metas[i].getAttribute("content").slice(0,-4)+'_mt'+metas[i].getAttribute("content").slice(-4)+'"/&gt;&lt;/a&gt;';
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
for(i=0;i&lt;metas.length;i++){
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
xmlhttp.send("version=2&amp;objecttype=thing&amp;objectid=98000&amp;playid="+SPLUplayId+"&amp;action=save&amp;quantity=0&amp;comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&amp;playdate=1452-04-15&amp;B1=Save");
}
}

function loadLocations(){
var tmpDiv=document.getElementById('SPLU.LocationList');
tmpDiv.innerHTML="";
for(var key in SPLU.Locations){
if (SPLU.Locations.hasOwnProperty(key)) {
tmpDiv.innerHTML+='&lt;div style="padding: 5px 2px 0px 0px; float: left;"&gt;&lt;a href="javascript:{void(0);}" onClick="javascript:{insertLocation('+key+');}" onMouseDown="javascript:{this.style.backgroundColor=\'#eff708\';}" onMouseUp="javascript:{this.style.backgroundColor=\'#A4DFF3\';}" style="border:1px dotted green;padding:0px 2px;"&gt;'+decodeURIComponent(SPLU.Locations[key].Name)+'&lt;/a&gt;&lt;/div&gt;';
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
xmlhttp.send("version=2&amp;objecttype=thing&amp;objectid=98000&amp;playid="+SPLUplayId+"&amp;action=save&amp;quantity=0&amp;comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&amp;playdate=1452-04-15&amp;B1=Save");
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
for(i=0;i&lt;players.length;i++){
if(SPLU.Filters[SPLUcurrentFilter].indexOf(players[i])!=-1){
tmpPlayers.push(players[i]);
}
}
players=tmpPlayers;
}
for(key=0;key&lt;players.length;key++){
if (SPLU.Players.hasOwnProperty(players[key])) {
BRtmpName=decodeURIComponent(SPLU.Players[players[key]].Name);
if(SPLU.Players[players[key]].Name==""){
BRtmpName=decodeURIComponent(SPLU.Players[players[key]].Username);
}
BRplayersDiv.innerHTML+='&lt;div style="padding: 5px 2px 0px 0px; float: left;"&gt;&lt;a href="javascript:{void(0);}" onClick="javascript:{insertPlayer(\''+players[key]+'\');}" onMouseDown="javascript:{this.style.backgroundColor=\'#eff708\';}" onMouseUp="javascript:{this.style.backgroundColor=\'#A4DFF3\';}" style="border:1px dotted green;padding:0px 2px;"&gt;'+BRtmpName+'&lt;/a&gt;&lt;/div&gt;';
}
}
BRplayersDiv.innerHTML+='&lt;div style="padding: 5px 2px 0px 0px; float: left;"&gt;&lt;a href="javascript:{void(0);}" onClick="javascript:{insertPlayer(-1);}" onMouseDown="javascript:{this.style.backgroundColor=\'#eff708\';}" onMouseUp="javascript:{this.style.backgroundColor=\'#A4DFF3\';}" style="border:1px dotted;padding:0px 2px;"&gt;Other&lt;/a&gt;&lt;/div&gt;';
if(SPLUcurrentFilter=="All"&amp;&amp;SPLU.Settings["PlayerGroups"].Visible){
var groups=[];
if(SPLU.Settings.SortGroups.Order=="Alpha"){
groups=Object.keys(SPLU.Groups).sort();
}else{
groups=Object.keys(SPLU.Groups);
}
for(key=0;key&lt;groups.length;key++){
BRtmpName=decodeURIComponent(groups[key]);
BRplayersDiv.innerHTML+='&lt;div style="padding: 5px 2px 0px 0px; float: left;"&gt;&lt;a href="javascript:{void(0);}" onClick="javascript:{insertGroup(\''+groups[key]+'\');}" onMouseDown="javascript:{this.style.backgroundColor=\'#eff708\';}" onMouseUp="javascript:{this.style.backgroundColor=\'#A4DFF3\';}" style="border:1px solid black;padding:0px 2px;"&gt;'+BRtmpName+'&lt;/a&gt;&lt;/div&gt;';
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
for(i=0;i&lt;checks.length;i++){
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
for(i=0;i&lt;checks.length;i++){
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
while(paddedNum.length&lt;2){
paddedNum="0"+paddedNum;
}
var tmpDiv=document.createElement('div');
tmpDiv.id="SPLU.PlayerRow"+NumOfPlayers;
tmpDiv.style.display="table-row";
document.getElementById('SPLUplayerRows').appendChild(tmpDiv);

var tmpDiv=document.createElement('div');
tmpDiv.style.display="table-cell";
tmpDiv.className="SPLUrows";
tmpDiv.innerHTML='&lt;a href="javascript:{void(0);}" onClick="javascript:{deletePlayerRow('+NumOfPlayers+');}"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2321641.png"&gt;&lt;/a&gt;';
document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);

var tmpDiv=document.createElement('div');
if(!SPLU.Settings.PlayerNameColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
tmpDiv.className="SPLUrows";
tmpDiv.id="SPLU.PlayerNameColumn"+NumOfPlayers;
tmpDiv.innerHTML='&lt;input type="text" style="width:120px;" name="players['+NumOfPlayers+'][name]" value="'+tmpName+'" tabindex="1'+paddedNum+'"&gt;&lt;/input&gt;';
document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);

var tmpDiv=document.createElement('div');
if(!SPLU.Settings.PlayerUsernameColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
tmpDiv.className="SPLUrows";
tmpDiv.id="SPLU.PlayerUsernameColumn"+NumOfPlayers;
tmpDiv.innerHTML='&lt;input type="text" style="width:110px;" name="players['+NumOfPlayers+'][username]" value="'+tmpUser+'" tabindex="2'+paddedNum+'"&gt;&lt;/input&gt;';
document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);

var tmpDiv=document.createElement('div');
if(!SPLU.Settings.PlayerColorColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
tmpDiv.className="SPLUrows";
tmpDiv.id="SPLU.PlayerColorColumn"+NumOfPlayers;
tmpDiv.innerHTML='&lt;input type="text" style="width:50px;" name="players['+NumOfPlayers+'][color]" value="'+tmpColor+'" tabindex="3'+paddedNum+'"&gt;&lt;/input&gt;';
document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);

var tmpDiv=document.createElement('div');
if(!SPLU.Settings.PlayerPositionColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
tmpDiv.className="SPLUrows";
tmpDiv.id="SPLU.PlayerPositionColumn"+NumOfPlayers;
tmpDiv.innerHTML='&lt;input type="text" style="width:50px;" name="players['+NumOfPlayers+'][position]" value="'+tmpStart+'" tabindex="4'+paddedNum+'"&gt;&lt;/input&gt;';
document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);

var tmpDiv=document.createElement('div');
if(!SPLU.Settings.PlayerScoreColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
tmpDiv.className="SPLUrows";
tmpDiv.id="SPLU.PlayerScoreColumn"+NumOfPlayers;
tmpDiv.innerHTML='&lt;input type="text" style="width:37px;" name="players['+NumOfPlayers+'][score]" value="'+tmpScore+'" tabindex="5'+paddedNum+'"&gt;&lt;/input&gt;';
document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);

var tmpDiv=document.createElement('div');
if(!SPLU.Settings.PlayerRatingColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
tmpDiv.className="SPLUrows";
tmpDiv.id="SPLU.PlayerRatingColumn"+NumOfPlayers;
tmpDiv.innerHTML='&lt;input type="text" style="width:32px;" name="players['+NumOfPlayers+'][rating]" value="'+tmpRating+'" tabindex="6'+paddedNum+'"&gt;&lt;/input&gt;';
document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);

var tmpDiv=document.createElement('div');
if(!SPLU.Settings.PlayerWinColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
tmpDiv.style.textAlign="center";
tmpDiv.className="SPLUrows";
tmpDiv.id="SPLU.PlayerWinColumn"+NumOfPlayers;
tmpDiv.innerHTML='&lt;input type="checkbox" name="players['+NumOfPlayers+'][win]" class="SPLU.WinBox" value="1" '+tmpWin+' tabindex="7'+paddedNum+'" style="margin-bottom:2px;" onClick="javascript:{if(SPLU.Settings.WinComments.Visible){NoreenWinComment();}}"&gt;&lt;/input&gt;';
document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);

var tmpDiv=document.createElement('div');
if(!SPLU.Settings.PlayerNewColumn.Visible){tmpDiv.style.display="none";}else{tmpDiv.style.display="table-cell";}
tmpDiv.style.textAlign="center";
tmpDiv.className="SPLUrows";
tmpDiv.id="SPLU.PlayerNewColumn"+NumOfPlayers;
tmpDiv.innerHTML='&lt;input type="checkbox" name="players['+NumOfPlayers+'][new]" value="1" '+tmpNew+' tabindex="8'+paddedNum+'" style="margin-bottom:2px;"&gt;&lt;/input&gt;';
document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);

var tmpDiv=document.createElement('div');
tmpDiv.style.display="table-cell";
tmpDiv.style.textAlign="center";
tmpDiv.className="SPLUrows";
tmpDiv.id="SPLU.PlayerSaveColumn"+NumOfPlayers;
tmpDiv.innerHTML='&lt;span style="padding-bottom:2px;"&gt;&lt;a href="javascript:{void(0);}" onClick="javascript:{savePlayer('+NumOfPlayers+');}"&gt;&lt;img src="https://cf.geekdo-images.com/images/pic2345639.png"&gt;&lt;/a&gt;&lt;/span&gt;';
document.getElementById('SPLU.PlayerRow'+NumOfPlayers).appendChild(tmpDiv);

if(NumOfPlayers==2){
if(document.getElementsByName("players[1][name]")[0].value==""&amp;&amp;document.getElementsByName("players[1][username]")[0].value==""&amp;&amp;document.getElementsByName("players[1][color]")[0].value==""){
deletePlayerRow(1);
}
}
}

function getWinners(){
winboxes=document.getElementsByClassName('SPLU.WinBox');
SPLUwinners=[];
comment="";
for(i=0;i&lt;winboxes.length;i++){
if(winboxes[i].checked){
SPLUwinners.push(document.getElementsByName('players['+winboxes[i].name.slice(8,winboxes[i].name.indexOf("]"))+'][name]')[0].value);
}
}
return(SPLUwinners.length);
}

function NoreenWinComment(){
if(getWinners()&gt;0){
comment="";
winboxes=document.getElementsByClassName('SPLU.WinBox');
for(i=0; i&lt;SPLUwinners.length; i++){
if(i==0){
comment=SPLUwinners[i];
}else{
comment+=" &amp; "+SPLUwinners[i];
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
xmlhttp.send("version=2&amp;objecttype=thing&amp;objectid=98000&amp;playid="+SPLUplayId+"&amp;action=save&amp;quantity=0&amp;comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&amp;playdate=1452-04-15&amp;B1=Save");
}

function chooseFavorite(id){
setObjectType(SPLU.Favorites[id].objecttype);
document.getElementById('objectid0').value=id;
document.getElementById('selimage0').innerHTML='&lt;a&gt;&lt;img src="'+SPLU.Favorites[id].thumbnail+'"/&gt;&lt;/a&gt;';
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
xmlhttp.send("version=2&amp;objecttype=thing&amp;objectid=98000&amp;playid="+SPLUplayId+"&amp;action=save&amp;quantity=0&amp;comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&amp;playdate=1452-04-15&amp;B1=Save");
}

function deletePlayerRow(row){
document.getElementById('SPLUplayerRows').removeChild(document.getElementById('SPLU.PlayerRow'+row));
PlayerCount--;
}

function hideColumn(column){
var tmpRows=document.getElementsByClassName('SPLUrows');
if(!SPLU.Settings[column].Visible){
for(i=0; i&lt;tmpRows.length; i++){
if(tmpRows[i].id.slice(5,14)==column.slice(0,9)){
tmpRows[i].style.display="table-cell";
}
}
document.getElementById('SPLU.'+column+'Header').style.display="table-cell";
document.getElementById('SPLU.'+column+'Check').checked=true;
SPLU.Settings[column].Visible=true;
}else{
for(i=0; i&lt;tmpRows.length; i++){
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
document.getElementById('SPLU.PlayerList').style.display="none";
document.getElementById('SPLU.SavedNamesButtonIconExpand').style.display="inline-block";
document.getElementById('SPLU.SavedNamesButtonIconCollapse').style.display="none";
PlayerList=false;
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
document.getElementById('SPLU.SettingsStatus').innerHTML="&lt;img style='vertical-align:bottom;padding-top:5px;' src='//cf.geekdo-static.com/mbs/mb_3264_0.gif'&gt;&lt;span style='background-color:red;color:white;font-weight:bold;'&gt;Error Code: "+responseJSON.target.status+"&lt;/span&gt; Try saving again.";
}
};
xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
xmlhttp.send("version=2&amp;objecttype=thing&amp;objectid=98000&amp;playid="+SPLUplayId+"&amp;action=save&amp;quantity=0&amp;comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&amp;playdate=1452-04-15&amp;B1=Save");
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
document.getElementById('BRresults').innerHTML="Play Deleted.  &lt;a href='"+responseJSON.target.responseURL+"' target='_blank'&gt;View your plays&lt;/a&gt;";
SPLUplayData[document.getElementById("SPLU.PlaysLogger").value][tmpPlay.id].deleted=true;
loadPlays(document.getElementById("SPLU.PlaysLogger").value);
}else{
document.getElementById('BRresults').innerHTML="An Error Occurred";
}
};
xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
xmlhttp.send("version=2&amp;action=delete&amp;playid="+tmpPlay.id);

saveGamePlay2('delete');


}
}

function saveGamePlay(action){
var form=$('myform');
var inputs=form.getElementsByTagName('input');
var querystring="";
var value="";
var tmpID="";
for(n=0; n&lt;inputs.length; n++){
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
querystring+="&amp;"+inputs[n].name+"="+encodeURIComponent(value);
}
if(action=="edit"){
tmpID="&amp;playid="+tmpPlay.id;
}
querystring+="&amp;comments="+encodeURIComponent(form["quickplay_comments99"].value);
document.getElementById('BRresults').innerHTML="Saving...";
new Request.JSON({url:'/geekplay.php',data:'ajax=1&amp;action=save&amp;version=2&amp;objecttype=thing'+tmpID+querystring,onComplete:function(responseJSON,responseText){window.resJ=responseJSON; document.getElementById('BRresults').innerHTML=responseJSON.html; console.log(responseText); insertBlank('BRresults'); saveExpansionPlays(action);}}).send();
}

function saveGamePlay2(action){
if(action=="dupe"){
var form=$('myform');
var inputs=form.getElementsByTagName('input');
for(n=0; n&lt;inputs.length; n++){
if(inputs[n].name.slice(-6)=="[name]"&amp;&amp;SPLU.Settings.PlayerNameColumn.Reset){inputs[n].value="";}
if(inputs[n].name.slice(-6)=="rname]"&amp;&amp;SPLU.Settings.PlayerUsernameColumn.Reset){inputs[n].value="";}
if(inputs[n].name.slice(-6)=="color]"&amp;&amp;SPLU.Settings.PlayerColorColumn.Reset){inputs[n].value="";}
if(inputs[n].name.slice(-6)=="score]"&amp;&amp;SPLU.Settings.PlayerScoreColumn.Reset){inputs[n].value="";}
if(inputs[n].name.slice(-6)=="ition]"&amp;&amp;SPLU.Settings.PlayerPositionColumn.Reset){inputs[n].value="";}
if(inputs[n].name.slice(-6)=="ating]"&amp;&amp;SPLU.Settings.PlayerRatingColumn.Reset){inputs[n].value="";}
if(inputs[n].name.slice(-6)=="][new]"&amp;&amp;SPLU.Settings.PlayerNewColumn.Reset){inputs[n].checked=false;}
if(inputs[n].name.slice(-6)=="][win]"&amp;&amp;SPLU.Settings.PlayerWinColumn.Reset){inputs[n].checked=false;}
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
}

function clearForm(){
while(document.getElementsByClassName('SPLUrows').length&gt;0){
deletePlayerRow(document.getElementsByClassName('SPLUrows')[0].parentNode.id.slice(14));
}
document.getElementById('quickplay_location99').value="";
if(SPLU.Settings.LocationList.Visible&amp;&amp;!LocationList){
showHideLocations(false);
}
if(SPLU.Settings.PlayerList.Visible&amp;&amp;!PlayerList){
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
if(SPLU.Settings.DateField.Reset){setDateField(SPLUtoday);}
if(SPLU.Settings.GameField.Reset){VoidInstantSearch({itemid:'0',uniqueid:'546e9ffd96dfc'});}

}

function setDateField(date){
document.getElementById('playdateinput99').value=date;
parseDate(document.getElementById('playdateinput99'),$('playdate99'),$('playdatestatus99'));
}

function eventPlaysPlayerEnter(e){
if(e.keyCode === 13){
getRecentPlays(false);
}
return false;
}

function getRecentPlays(multiple){
document.getElementById("SPLU.PlaysPlayers").style.display="none";
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
oReq.open("get","/xmlapi2/plays?username="+player+"&amp;page="+SPLUplaysPage,true);
oReq.send();
}

function getAllPlays(player){
console.log("getAllPlays("+player+")");
if(Math.ceil(SPLUplayData[player]["total"]/100)&gt;(SPLUplayFetch[player].length-1)){
for(i=1;i&lt;=Math.ceil(SPLUplayData[player]["total"]/100);i++){
if(SPLUplayFetch[player][i]===undefined){
SPLUplayFetch[player][i]=0;
}
}
}
if(SPLUplayFetchFail&lt;5){
for(i=1;i&lt;SPLUplayFetch[player].length;i++){
if(SPLUplayFetch[player][i]&lt;0){
SPLUplayFetch[player][i]--;
}
if(SPLUplayFetch[player][i]&lt;-4){
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
for(i=1;i&lt;SPLUplayFetch[player].length;i++){
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
console.log("parsePlays("+player+","+page+","+multiple+")");
SPLUplayFetch[player][page]=1;
if(SPLUplayData[player]===undefined){
SPLUplayData[player]={};
}
if(SPLUplays[player][1].getElementsByTagName("plays")[0]===undefined){
SPLUplayData[player]["total"]=0;
multiple=false;
}else{
SPLUplayData[player]["total"]=SPLUplays[player][page].getElementsByTagName("plays")[0].getAttribute("total");
}
for(i=0;i&lt;SPLUplays[player][page].getElementsByTagName("play").length;i++){
SPLUplayData[player][SPLUplays[player][page].getElementsByTagName("play")[i].id]=SPLUplays[player][page].getElementsByTagName("play")[i];
}
if(!multiple){
loadPlays(player);
}else{
getAllPlays(player);
}
}

function loadPlays(tmpUser){
document.getElementById("SPLU.PlaysPlayers").style.display="none";
console.log("loadPlays("+tmpUser+")");
if(SPLUplayData[tmpUser]["total"]==0){
document.getElementById('SPLU.PlaysStatus').innerHTML='&lt;div&gt;No Plays Found.&lt;/div&gt;';
document.getElementById('SPLU.PlaysList').innerHTML='';
document.getElementById('SPLU.PlaysMenu').style.display='none';
}else{
var tmpHTML="";
var display=true;
var tmpSort=[];
tmpHTML='&lt;div id="SPLU.PlaysTable" style="display:table;"&gt;';
for(key in SPLUplayData[tmpUser]){
if(key=="total"||SPLUplayData[tmpUser][key].attributes.date.value=="1452-04-15"){
continue;
}
tmpSort.push({id:key,date:SPLUplayData[tmpUser][key].attributes.date.value});
}
tmpSort.sort(dynamicSortMultiple("-date", "id"));
tmpSort=filterPlays(tmpSort,tmpUser);
var tmpSortCount=0;
var tmpLines=document.getElementsByName("SPLU.PlaysFiltersLine").length;
for(i=0;i&lt;tmpSort.length;i++){
if(tmpSort[i].matches==tmpLines){
tmpSortCount++;
tmpPlayId=tmpSort[i]["id"];
tmpPlayDate=SPLUplayData[tmpUser][tmpPlayId].attributes.date.value;
tmpPlayGame=SPLUplayData[tmpUser][tmpPlayId].getElementsByTagName("item")[0].attributes.name.value;
tmpDecoration="";
if(SPLUplayData[tmpUser][tmpPlayId].deleted){
tmpDecoration="text-decoration:line-through;";
}
tmpHTML+='&lt;div id="SPLU.Plays-'+tmpPlayId+'" style="display:table-row;'+tmpDecoration+'"&gt;&lt;div style="display:table-cell;"&gt;'+tmpPlayDate+' - &lt;a href="javascript:{void(0);}" onClick="javascript:{loadPlay('+tmpPlayId+');}"&gt;'+tmpPlayGame+'&lt;/a&gt;&lt;/div&gt;&lt;/div&gt;';
}
}
tmpHTML+='&lt;/div&gt;';
tmpCount=(Object.keys(SPLUplayData[tmpUser]).length)-1;
document.getElementById('SPLU.PlaysList').innerHTML=tmpHTML;
tmpHTML='&lt;div&gt;&lt;div&gt;Loaded '+tmpCount+' of '+SPLUplayData[tmpUser]["total"];
if(SPLUplayData[tmpUser]["total"]&gt;(Object.keys(SPLUplayData[tmpUser]).length)-1){
tmpCount=(Math.floor(tmpCount/100))+1;
tmpHTML+='&lt;a href="javascript:{void(0);}" onClick="javascript:{getPlays(\''+tmpUser+'\','+tmpCount+',false);}"&gt; - Load next 100&lt;/a&gt;';
}
tmpHTML+='&lt;/div&gt;';
document.getElementById("SPLU.PlaysFiltersStatus").innerHTML='&lt;div&gt;Showing '+tmpSortCount+'&lt;/div&gt;';
tmpHTML+='&lt;/div&gt;';
document.getElementById('SPLU.PlaysStatus').innerHTML=tmpHTML;
document.getElementById('SPLU.PlaysMenu').style.display='';
}
}

function filterPlays(plays,user){
for(i=0;i&lt;plays.length;i++){
plays[i].matches=0;
}
var lines=document.getElementsByName("SPLU.PlaysFiltersLine");
for(l=0;l&lt;lines.length;l++){
var filtertype=lines[l].getAttribute("data-SPLU-filtertype");
if(filtertype=="gamename"){
for(i=0;i&lt;plays.length;i++){
if(SPLUplayData[user][plays[i].id].getElementsByTagName("item")[0].attributes.name.value.toLowerCase().indexOf(lines[l].value.toLowerCase())&gt;-1){
plays[i].matches++;
}
}
}
if(filtertype=="location"){
for(i=0;i&lt;plays.length;i++){
if(SPLUplayData[user][plays[i].id].getAttribute("location").toLowerCase().indexOf(lines[l].value.toLowerCase())&gt;-1){
plays[i].matches++;
}
}
}
if(filtertype=="comments"){
for(i=0;i&lt;plays.length;i++){
if(SPLUplayData[user][plays[i].id].getElementsByTagName("comments")[0]!==undefined){
if(SPLUplayData[user][plays[i].id].getElementsByTagName("comments")[0].textContent.toLowerCase().indexOf(lines[l].value.toLowerCase())&gt;-1){
plays[i].matches++;
}
}
}
}

if(filtertype=="playername"){
for(i=0;i&lt;plays.length;i++){
if(SPLUplayData[user][plays[i].id].getElementsByTagName("players")[0]!==undefined){
var tmpPlayers=SPLUplayData[user][plays[i].id].getElementsByTagName("players")[0].getElementsByTagName("player");
for(p=0;p&lt;tmpPlayers.length;p++){
if(tmpPlayers[p].getAttribute("name").toLowerCase().indexOf(lines[l].value.toLowerCase())&gt;-1){
plays[i].matches++;
break;
}
}
}
}
}
if(filtertype=="username"){
for(i=0;i&lt;plays.length;i++){
if(SPLUplayData[user][plays[i].id].getElementsByTagName("players")[0]!==undefined){
tmpPlayers=SPLUplayData[user][plays[i].id].getElementsByTagName("players")[0].getElementsByTagName("player");
for(p=0;p&lt;tmpPlayers.length;p++){
if(tmpPlayers[p].getAttribute("username").toLowerCase().indexOf(lines[l].value.toLowerCase())&gt;-1){
plays[i].matches++;
break;
}
}
}
}
}
}
return plays;
}

function eventFilterLineEnter(e){
if(e.keyCode === 13){
loadPlays(document.getElementById('SPLU.PlaysLogger').value);
}
return false;
}

function addPlaysFilter(){
var filter=document.getElementById("SPLU.SelectPlaysFilter").value;
var filterName="";
if(filter!="add" &amp;&amp; filter!="---"){
SPLUplaysFiltersCount++;
if(filter=="playername"){filterName="Player";}
if(filter=="username"){filterName="User Name";}
if(filter=="gamename"){filterName="Game";}
if(filter=="location"){filterName="Location";}
if(filter=="comments"){filterName="Comments";}

tmpHTML='&lt;a href="javascript:{void(0);}" onclick="javascript:{document.getElementById(\'SPLU.PlaysFiltersCurrent\').removeChild(document.getElementById(\'SPLU.playsFiltersLine'+SPLUplaysFiltersCount+'\'));loadPlays(document.getElementById(\'SPLU.PlaysLogger\').value);addPlaysFilter();}" style="color:red;margin:2px;"&gt;'
+'&lt;img src="http://cf.geekdo-images.com/images/pic2346458.png"&gt;'
+'&lt;/a&gt;'
+filterName+': &lt;input type="text" name="SPLU.PlaysFiltersLine" data-SPLU-FilterType="'+filter+'" onKeyPress="eventFilterLineEnter(event)"/&gt;'; 
var tmpDiv=document.createElement('div');
tmpDiv.id="SPLU.playsFiltersLine"+SPLUplaysFiltersCount;
tmpDiv.setAttribute("style","padding-top:2px;");
tmpDiv.innerHTML=tmpHTML;
document.getElementById("SPLU.PlaysFiltersCurrent").appendChild(tmpDiv);
}
document.getElementById("SPLU.SelectPlaysFilter").value="add";
if(document.getElementsByName("SPLU.PlaysFiltersLine").length==0){
document.getElementById("SPLU.PlaysFiltersGoBtn").style.display="none";
}else{
document.getElementById("SPLU.PlaysFiltersGoBtn").style.display="";
}
}

function showHidePlaysFilters(){
if(document.getElementById("SPLU.PlaysFilters").style.display=="none"){
document.getElementById("SPLU.PlaysFilters").style.display="";
}else{
document.getElementById("SPLU.PlaysFilters").style.display="none";
}
}

function loadPlay(id){
console.log(id);
clearForm();
tmpPlay=SPLUplayData[document.getElementById("SPLU.PlaysLogger").value][id];
console.log("Found");
if(tmpPlay.getElementsByTagName("players")[0]!==undefined){
tmpPlayer=tmpPlay.getElementsByTagName("players")[0].getElementsByTagName("player");
for(i=0;i&lt;tmpPlayer.length;i++){
insertPlayer(tmpPlayer[i]);
}
}
setDateField(tmpPlay.attributes.date.value);
document.getElementById('quickplay_location99').value=tmpPlay.attributes.location.value;
hideLocations();
hidePlayers();
document.getElementById('quickplay_quantity99').value=tmpPlay.attributes.quantity.value;
document.getElementById('quickplay_duration99').value=tmpPlay.getAttribute("length");
if(tmpPlay.getAttribute("incomplete")==1){document.getElementById('incomplete').checked=true;}
if(tmpPlay.getAttribute("nowinstats")==1){document.getElementById('nowinstats').checked=true;}
if(tmpPlay.getElementsByTagName("comments").length&gt;0){
document.getElementById('quickplay_comments99').value=tmpPlay.getElementsByTagName("comments")[0].textContent;
}
setObjectType(tmpPlay.getElementsByTagName("subtypes")[0].getElementsByTagName("subtype")[0].getAttribute("value"));
tmpItem=tmpPlay.getElementsByTagName("item")[0];
SetInstantSearchObject({itemid:'0',objecttype:tmpItem.attributes.objecttype.value,objectid:tmpItem.attributes.objectid.value, name:tmpItem.attributes.name.value,uniqueid:'546e9ffd96dfc'} );
if(document.getElementById("SPLU.PlaysLogger").value==LoggedInAs&amp;&amp;!SPLUplayData[document.getElementById("SPLU.PlaysLogger").value][id].deleted){
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

function listFetchedPlayers(){
var tmpPlayers=[];
document.getElementById("SPLU.PlaysPlayers").innerHTML="";
for(key in SPLUplayData){
if(SPLUplayData[key]["total"]&gt;0){
tmpPlayers.push(key);
document.getElementById("SPLU.PlaysPlayers").innerHTML+='&lt;a onClick="javascript:{document.getElementById(\'SPLU.PlaysLogger\').value=\''+key+'\';loadPlays(\''+key+'\');}"&gt;'+key+'&lt;/a&gt;&lt;br/&gt;';
}
}
if(tmpPlayers.length&gt;0){
document.getElementById("SPLU.PlaysPlayers").style.display="";
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
if(SPLUtodayDate.getTime()&lt;SPLUselectedDate.getTime()){
sentence+=" &lt;span style='background-color:red; color:white; font-weight:bold;'&gt;IN THE FUTURE&lt;/span&gt;";
}else{
if((SPLUtodayDate.getTime()-SPLUselectedDate.getTime())&gt;3155673600000){
sentence+=" &lt;span style='background-color:yellow; color:black; font-weight:bold;'&gt;BEFORE YOU WERE BORN&lt;/span&gt;";
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
if(PlayerCount==1&amp;&amp;NumOfPlayers!=1){
sentence+=" There was only one player.";
}
if(PlayerCount&gt;1){
sentence+=" There were ";
sentence+=PlayerCount;
sentence+=" players";
}

getWinners();
if(SPLUwinners.length==0&amp;&amp;PlayerCount&gt;1){
sentence+=".";
}
if(SPLUwinners.length==1&amp;&amp;PlayerCount&gt;1){
sentence+=" and "+SPLUwinners[0]+" won.";
}
if(SPLUwinners.length==2&amp;&amp;PlayerCount!=2){
sentence+=" and the winners were "+SPLUwinners[0]+" and "+SPLUwinners[1]+".";
}
if(SPLUwinners.length==3&amp;&amp;SPLUwinners.length!=PlayerCount){
sentence+=" and the winners were "+SPLUwinners[0]+", "+SPLUwinners[1]+", and "+SPLUwinners[2]+".";
}
if(SPLUwinners.length==2&amp;&amp;PlayerCount==2){
sentence+=" and they both won.";
}
if(SPLUwinners.length==PlayerCount&amp;&amp;PlayerCount&gt;2){
sentence+=" and everybody won.";
}
if(SPLUwinners.length&gt;3&amp;&amp;SPLUwinners.length!=PlayerCount){
sentence+=" and many winners.";
}
if(document.getElementById('quickplay_duration99').value!="" &amp;&amp; document.getElementById('quickplay_duration99').value!=0){
if(document.getElementById('quickplay_quantity99').value==1){
sentence+=" The game lasted ";
sentence+=document.getElementById('quickplay_duration99').value;
if(document.getElementById('quickplay_duration99').value&lt;5){
sentence+=" whole";
}
if(document.getElementById('quickplay_duration99').value==1){
sentence+=" minute.";
}else{
sentence+=" minutes.";
}
}  
if(document.getElementById('quickplay_quantity99').value&gt;1){
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
txtDiv.innerHTML='&lt;span style="font-size:small"&gt;';
txtDiv.innerHTML+=text;
txtDiv.innerHTML+='&lt;/span&gt;';
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
xmlhttp.send("version=2&amp;objecttype=thing&amp;objectid=98000&amp;playid="+SPLUplayId+"&amp;action=save&amp;quantity=0&amp;comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&amp;playdate=1452-04-15&amp;B1=Save");

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
document.getElementById('SPLU.ExpansionPane').innerHTML+='&lt;div&gt;No Expansions Found.&lt;/div&gt;';
}else{
BRexpList=this.responseXML.getElementsByTagName("boardgameexpansion");
var tmpHTML="";
tmpHTML+='&lt;div style="display:table;"&gt;';
for(i=0;i&lt;BRexpList.length;i++){
tmpExpID=BRexpList[i].getAttribute("objectid");
tmpExpName=BRexpList[i].textContent;
tmpHTML+='&lt;div style="display:table-row;"&gt;&lt;div style="display:table-cell;"&gt;&lt;input type="checkbox" id="'+tmpExpID+'" class="BRexpLogBox" data-tab="expansion"/&gt; '+tmpExpName+'&lt;/div&gt;&lt;div style="display:table-cell; width:50px;" id="QPresultsExp'+tmpExpID+'" name="QPresults'+tmpExpID+'"&gt;&lt;/div&gt;&lt;/div&gt;';
}
tmpHTML+='&lt;/div&gt;';
document.getElementById('SPLU.ExpansionPane').innerHTML+=tmpHTML;
}
}

function getExpansions(){
SPLUprevGameID=SPLUgameID;
document.getElementById('SPLU.ExpansionPane').innerHTML="Loading Expansions...&lt;img src='http://cf.geekdo-static.com/images/progress.gif'/&gt;";
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
document.getElementById('SPLU.FamilyPane').innerHTML+='&lt;div&gt;No Family Items Found.&lt;/div&gt;';
}else{
BRexpList=this.responseXML.getElementsByTagName("link");
var tmpHTML="";
tmpHTML+='&lt;div style="display:table;"&gt;';
for(i=0;i&lt;BRexpList.length;i++){
tmpExpID=BRexpList[i].getAttribute("id");
tmpExpName=BRexpList[i].getAttribute("value");
tmpHTML+='&lt;div style="display:table-row;"&gt;&lt;div style="display:table-cell;"&gt;&lt;input type="checkbox" id="'+tmpExpID+'" class="BRexpLogBox" data-tab="family"/&gt; '+tmpExpName+'&lt;/div&gt;&lt;div style="display:table-cell; width:50px;" id="QPresultsFam'+tmpExpID+'" name="QPresults'+tmpExpID+'"&gt;&lt;/div&gt;&lt;/div&gt;';
}
tmpHTML+='&lt;/div&gt;';
document.getElementById('SPLU.FamilyPane').innerHTML+=tmpHTML;
}
}

function getFamily(id){
SPLUprevGameID=SPLUgameID;
document.getElementById('SPLU.FamilyPane').innerHTML="Loading Family Items...&lt;img src='http://cf.geekdo-static.com/images/progress.gif'/&gt;";
SPLUfamilyID="-1";
var name=document.getElementById('q546e9ffd96dfc').value;
if(id==-1){
for(i=0;i&lt;SPLUfamilyList.length;i++){
if(SPLUfamilyList[i].textContent==name||SPLUfamilyList[i].textContent==name.slice(0,name.indexOf(":"))){
SPLUfamilyID=SPLUfamilyList[i].getAttribute('objectid');
}
}
}else{
SPLUfamilyID=id;
}
if(SPLUfamilyID==-1){
tmpHTML="No Matching Family Found.&lt;br/&gt;&lt;br/&gt;";
if(SPLUfamilyList.length&gt;=1){
tmpHTML+="Please choose from the following Families:&lt;br/&gt;";
for(var i=0;i&lt;SPLUfamilyList.length;i++){
tmpHTML+='&amp;nbsp;-&amp;nbsp;&lt;a href="javascript:{void(0);}" onClick="javascript:{getFamily(\''+SPLUfamilyList[0].getAttribute('objectid')+'\');}"&gt;'+SPLUfamilyList[i].textContent+'&lt;/a&gt;&lt;br/&gt;';
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
if(SPLUgameID!=0&amp;&amp;SPLUprevGameID!=SPLUgameID&amp;&amp;!SPLUexpansionsLoaded){
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
for(i=0;i&lt;tmpExp.length;i++){
tmpExp[i].checked=false;
}
}

function saveExpansionPlays(action){
ExpansionsToLog=0;
var tmpExp=document.getElementsByClassName('BRexpLogBox');
for(i=0;i&lt;tmpExp.length;i++){
if(tmpExp[i].checked){
ExpansionsToLog++;
}
}
if(ExpansionsToLog==0){
document.getElementById('SPLUexpansionResults').innerHTML='';
saveGamePlay2(action);
}else{
for(i=0;i&lt;tmpExp.length;i++){
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
for(n=0; n&lt;inputs.length; n++){
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
querystring+="&amp;"+inputs[n].name+"="+encodeURIComponent(value);
}
querystring+="&amp;comments="+encodeURIComponent(form["quickplay_comments99"].value);
querystring=querystring.replace("objectid="+SPLUgameID,"objectid="+tmpExp[i].id);
querystring=querystring.replace("quantity="+document.getElementById('quickplay_quantity99').value,"quantity="+document.getElementById('BRexpPlayQTY').value);
new Request.JSON({url:'/geekplay.php',data:'ajax=1&amp;action=save&amp;version=2&amp;objecttype=thing'+querystring,onComplete:function(responseJSON,responseText){
var results=document.getElementsByName('QPresults'+responseJSON.html.slice(29,responseJSON.html.indexOf("?")));
for(var i=0;i&lt;results.length;i++){
if(responseJSON.html.slice(-5)=="&gt;&lt;/a&gt;"){
results[i].innerHTML=responseJSON.html.slice(7,-4)+"Logged&lt;/a&gt;";
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
var tmpHTML='&lt;div style="float:right;margin-left:-20px; margin-right:-15px; margin-top:-13px;"&gt;'
+'&lt;div id="closeButton" style=""&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hidePopText();observer.disconnect();BRlogMain.parentNode.removeChild(BRlogMain);}" style="border:2px solid blue;padding:0px 10px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:large;font-weight:900;color:red;"&gt;X&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;div style="padding-top: 15px; padding-left: 8px;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{showSettingsPane(\'button\');}" id="BRshowHideBtn"&gt;'
+'&lt;img src="http://cf.geekdo-images.com/images/pic2319219.png"&gt;'
+'&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;div style="margin-top: 25px; padding-left: 8px;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{showPlaysPane(\'button\');}" id="BRplaysBtn"&gt;'
+'&lt;img src="http://cf.geekdo-images.com/images/pic2447320.png"&gt;'
+'&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div style="display:table;"&gt;'
+'&lt;div style="display:table-row;"&gt;'
+'&lt;div id="SPLU.DateField" class="BRcells" style="width:120px;"&gt;'
+'&lt;div style="display:table;"&gt;'
+'&lt;div style="display:table-row;"&gt;'
+'&lt;div style="display:inline;"&gt;'
+'&lt;input id="playdate99" type="hidden" value="'+SPLUtoday+'" name="playdate"/&gt;'
+'&lt;input id="playdateinput99" tabindex="10" style="width:75px;" type="text" onkeyup="parseDate(this,$(\'playdate99\'),$(\'playdatestatus99\') );" value="'+SPLUtoday+'" autocomplete="off" name="dateinput"/&gt;'
+'&lt;/div&gt;'
+'&lt;div id="playdatestatus99" class="sf" style="font-style:italic; font-size:0;display:inline;"&gt;'
+'&lt;img style="position:relative; top:3px; right:2px;" src="http://cf.geekdo-static.com/images/icons/silkicons/accept.png"&gt;'+SPLUtoday
+'&lt;/div&gt;'
+'&lt;div style="display:inline;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{showHideCalendar();}"&gt;&lt;img style="vertical-align:bottom;" src="//cf.geekdo-static.com/images/icons/silkicons/calendar_view_week.png"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.Calendar" style="position:absolute;z-index:600;display:none;"&gt;'
+'C'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div style="display:table-row;"&gt;'
+'&lt;div style="display:table-cell;font-size:x-small;padding-top:7px;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{setDateField(\''+daybeforeDate+'\')}"&gt;'+daybeforeText+'&lt;/a&gt;'
+'|'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{setDateField(\''+yesterdayDate+'\')}"&gt;'+yesterdayText+'&lt;/a&gt;'
+'|'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{setDateField(\''+todayDate+'\')}"&gt;'+todayText+'&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="BRcells" style="padding-right:20px;"&gt;'
+'&lt;div id="SPLU.QuantityField" style="margin-bottom:5px;width:75px;"&gt;'
+'&lt;span style="font-size:xx-small;"&gt;Quantity: &lt;/span&gt;'
+'&lt;input type="text" id="quickplay_quantity99" name="quantity" value="1" tabindex="30" style="width: 20px;"/&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.DurationField" style="width:75px;"&gt;'
+'&lt;span style="font-size:xx-small;"&gt;Duration: &lt;/span&gt;'
+'&lt;input type="text" id="quickplay_duration99" name="length" value="" tabindex="40" style="width: 20px;"/&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="BRcells" style="padding-right:20px;"&gt;'
+'&lt;div id="SPLU.IncompleteField" style="margin-bottom:5px;width:80px;"&gt;'
+'&lt;span style="font-size:xx-small;"&gt;Incomplete: &lt;/span&gt;'
+'&lt;input type="checkbox" id="incomplete" name="incomplete" value="1" tabindex="45" /&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.NoWinStatsField" style="width:80px;"&gt;'
+'&lt;span style="font-size:xx-small;"&gt;No Win Stats: &lt;/span&gt;'
+'&lt;input type="checkbox" id="nowinstats" name="nowinstats" value="1" tabindex="47" /&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="BRcells"&gt;'
+'&lt;div id="SPLU.LocationField" style="width:275px;"&gt;'
+'&lt;div id="SPLU.fakeLocationBox" style="width:200px; display:inline-block; -moz-appearance:textfield; -webkit-appearance:textfield;"&gt;'
+'&lt;input type="text" placeholder="click or type a location" id="quickplay_location99" tabindex="20" name="location" style="width: 175px; border:none;"/&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{saveLocation();}" style="vertical-align:middle;" id="SPLU.SaveLocationButton"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2345639.png"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{showHideLocations();}" id="BRlocsBtn" style="padding-left:1px; vertical-align:middle;"&gt;&lt;span id="SPLU.LocationButtonIconCollapse" style="display:inline-block;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2321002.png"&gt;&lt;/span&gt;&lt;span id="SPLU.LocationButtonIconExpand" style="display:none;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2320964.png"&gt;&lt;/span&gt;&lt;/a&gt;'
+'&lt;div style="display:inline-block; position:absolute; padding-top:2px;padding-left:4px;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{showLocationsPane(\'button\');}" id="showLocationsPaneBtn"&gt;&lt;img src="https://cf.geekdo-images.com/images/pic2480325.png"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;br/&gt;'
+'&lt;div id="SPLU.LocationList" style=""&gt;'
+'Loading...'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div style="display:table;"&gt;'
+'&lt;div style="display:table-row;"&gt;'
+'&lt;div class="BRcells"&gt;'
+'&lt;div id="SPLU.CommentsField"&gt;'
+'&lt;textarea id="quickplay_comments99" tabindex="50" style="width:314px; height:109px; font:99% arial,helvetica,clean,sans-serif" name="comments;" placeholder="write a comment";&gt;&lt;/textarea&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="BRcells" style="margin-top:5px;vertical-align:top;"&gt;'
+'&lt;div id="SPLU.GameField"&gt;'
+'&lt;div id="SPLU.DomainButtons"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{setObjectType(\'boardgame\');}" id="SPLU.SelectBGG" style="padding:0px 5px;border:1px solid black;"&gt;BGG&lt;/a&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{setObjectType(\'videogame\');}" id="SPLU.SelectVGG" style="padding:0px 5px;border:1px solid black;"&gt;VGG&lt;/a&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{setObjectType(\'rpgitem\');}" id="SPLU.SelectRPG" style="padding:0px 5px;border:1px solid black;"&gt;RPG&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;input name="objectid" value="32946" id="objectid0" type="hidden"/&gt;'
+'&lt;input style="margin:3px 0px 0px;" autocomplete="off" class="geekinput_medium" name="geekitemname" id="q546e9ffd96dfc" tabindex="60" placeholder="enter a game title" onClick="this.select();" onkeydown="return StartInstantSearch({event: event,itemid: \'0\',objecttype: SPLUobjecttype,onclick: \'\',extraonclick: \'\',uniqueid: \'546e9ffd96dfc\',formname: \'\',textareaname: \'\',inline: \'\',userobject: null} );" type="text"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{showFavsPane(\'button\');}" id="favoritesGoTo" style="border:4px solid lightblue;border-radius:4px"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2319725.png" border="0" style="position:relative; margin-top:-5px; top:5px;"&gt;&lt;/a&gt;'
+'&lt;span id="instantsearch546e9ffd96dfc" style="display: none;"&gt;'
+'&lt;div class="searchbox_results"&gt;'
+'&lt;div id="instantsearchresults546e9ffd96dfc"&gt;&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/span&gt;'
+'&lt;div id="objectiddisp546e9ffd96dfc" style="display:none;"&gt;'
+'ID:'
+'&lt;/div&gt;'
+'&lt;div id="objectname0"&gt;&lt;/div&gt;'
+'&lt;input name="objecttype" id="objecttype0" value="thing" type="hidden"&gt;'
+'&lt;/div&gt;'
+'&lt;input size="12" class="geekinput_medium" id="imageid0" name="imageid" value="" type="hidden"&gt;&lt;/input&gt;'
+'&lt;div style="display:table;"&gt;'
+'&lt;div style="display:table-row;"&gt;'
+'&lt;div style="display:table-cell;"&gt;'
+'&lt;div id="selimage0" style=padding-top:7px;"&gt;&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div style="display:table-cell; vertical-align:top;"&gt;'
+'&lt;div id="BRthumbButtons" style="display:none"&gt;'
+'&lt;div style="padding-bottom:5px; padding-top:7px;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{addFavorite();}" id="favoritesAddToList" style="padding:4px;"&gt;&lt;img src="https://cf.geekdo-images.com/images/pic2321598.png" border="0"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;div&gt;'
+'&lt;a javascript:{void(0);}" onClick="javascript:{SPLUgameID=document.getElementById(\'objectid0\').value;showExpansionsPane(\'button\');}" id="expansionLoggingButton" style="padding:4px;"&gt;&lt;img src="https://cf.geekdo-images.com/images/pic2344399.png" border="0"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div style="display:table-cell; vertical-align:top; padding-top:10px;" id="SPLU.GameStatus"&gt;&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div style="display:table;"&gt;'
+'&lt;div style="display:table-row;"&gt;'
+'&lt;div class="BRcells"&gt;'
+'Players:&lt;a href="javascript:{void(0);}" onClick="javascript:{showHidePlayers(false);}" id="SPLU.SavedNamesBtn" style="padding-left:1px;"&gt;&lt;span id="SPLU.SavedNamesButtonIconCollapse" style="display:inline-block;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2321002.png"&gt;&lt;/span&gt;&lt;span id="SPLU.SavedNamesButtonIconExpand" style="display:none;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2320964.png"&gt;&lt;/span&gt;&lt;/a&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{showPlayersPane(\'button\');}" id="showPlayersPaneBtn" style="padding-right:5px;"&gt;&lt;img src="https://cf.geekdo-images.com/images/pic2480328.png"&gt;&lt;/a&gt;'
+'&lt;div style="display:inline;" id="SPLU.PlayerFilters"&gt;'
+'&lt;select id="SPLU.SelectFilter" onChange="javascript:{setFilter(\'choose\');}"&gt;&lt;/select&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.PlayerList" style="padding-top:15px 0px 3px 0px; width:450px;"&gt;'
+'Loading...'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLUplayerRows" style="display:table; padding-bottom:15px;"&gt;'
+'&lt;div style="display:table-row;"&gt;'
+'&lt;div class="SPLUplayerCells" style="width:25px;"&gt;&lt;/div&gt;'
+'&lt;div class="SPLUplayerCells" id="SPLU.PlayerNameColumnHeader"&gt;'
+'&lt;div id="SPLU.PlayerNameColumn" class="SPLUheader" style="min-width:38px;"&gt;'
+'&lt;div id="collapseName" class="SPLUheaderClose"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerNameColumn\');}"&gt;&lt;img src=http://cf.geekdo-images.com/images/pic2284822.png&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;center&gt;Name&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="SPLUplayerCells" id="SPLU.PlayerUsernameColumnHeader"&gt;'
+'&lt;div id="SPLU.PlayerUsernameColumn" class="SPLUheader" style="min-width:66px;"&gt;'
+'&lt;div id="collapseUsername" class="SPLUheaderClose"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerUsernameColumn\');}"&gt;&lt;img src=http://cf.geekdo-images.com/images/pic2284822.png&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;center&gt;Username&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="SPLUplayerCells" id="SPLU.PlayerColorColumnHeader"&gt;'
+'&lt;div id="SPLU.PlayerColorColumn" class="SPLUheader" style="min-width:36px;"&gt;'
+'&lt;div id="collapseColor" class="SPLUheaderClose"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerColorColumn\');}"&gt;&lt;img src=http://cf.geekdo-images.com/images/pic2284822.png&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;center&gt;Team&lt;br/&gt;Color&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="SPLUplayerCells" id="SPLU.PlayerPositionColumnHeader"&gt;'
+'&lt;div id="SPLU.PlayerPositionColumn" class="SPLUheader" style="min-width:33px;"&gt;'
+'&lt;div id="collapseStart" class="SPLUheaderClose"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerPositionColumn\');}"&gt;&lt;img src=http://cf.geekdo-images.com/images/pic2284822.png&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;center&gt;Start&lt;br/&gt;Pos&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="SPLUplayerCells" id="SPLU.PlayerScoreColumnHeader"&gt;'
+'&lt;div id="SPLU.PlayerScoreColumn" class="SPLUheader" style="min-width:37px;"&gt;'
+'&lt;div id="collapseScore" class="SPLUheaderClose"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerScoreColumn\');}"&gt;&lt;img src=http://cf.geekdo-images.com/images/pic2284822.png&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;center&gt;Score&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="SPLUplayerCells" id="SPLU.PlayerRatingColumnHeader"&gt;'
+'&lt;div id="SPLU.PlayerRatingColumn" class="SPLUheader" style="min-width:32px;"&gt;'
+'&lt;div id="collapseRating" class="SPLUheaderClose"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerRatingColumn\');}"&gt;&lt;img src=http://cf.geekdo-images.com/images/pic2284822.png&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;center&gt;Rate&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="SPLUplayerCells" id="SPLU.PlayerWinColumnHeader"&gt;'
+'&lt;div id="SPLU.PlayerWinColumn" class="SPLUheader" style="min-width:30px;"&gt;'
+'&lt;div id="collapseWin" class="SPLUheaderClose"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerWinColumn\');}"&gt;&lt;img src=http://cf.geekdo-images.com/images/pic2284822.png&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;center&gt;Win&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="SPLUplayerCells" id="SPLU.PlayerNewColumnHeader"&gt;'
+'&lt;div id="SPLU.PlayerNewColumn" class="SPLUheader" style="min-width:30px;"&gt;'
+'&lt;div id="collapseNewPlayer" class="SPLUheaderClose"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hideColumn(\'PlayerNewColumn\');}"&gt;&lt;img src=http://cf.geekdo-images.com/images/pic2284822.png&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;center&gt;New&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div style="display:table; margin-top:15px;"&gt;'
+'&lt;div style="display:table-row;"&gt;'
+'&lt;div class="BRcells"&gt;'
+'&lt;div&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{saveGamePlay(\'none\');}" style="border:2px solid blue;padding:5px 4px;border-radius:5px;background-color:lightGrey; color:black;" id="SaveGamePlayBtn" onMouseOver="makeSentence();" onMouseOut="hideSentence();"&gt;&lt;img src="https://cf.geekdo-images.com/images/pic2476930.png" style="vertical-align: middle; margin-right:1px;"&gt;Submit&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="BRcells"&gt;'
+'&lt;div&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{saveGamePlay(\'dupe\');}" style="border:2px solid blue;padding:5px 4px;border-radius:5px;background-color:lightGrey; color:black;" id="SaveGamePlayBtnDupe" onMouseOver="makeSentence();" onMouseOut="hideSentence();"&gt;&lt;img src="https://cf.geekdo-images.com/images/pic2476933.png" style="vertical-align: middle; margin-right:4px;"&gt;Submit &amp; Duplicate&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="BRcells" id="SPLUeditPlayDiv" style="display:none;"&gt;'
+'&lt;div&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{saveGamePlay(\'edit\');}" style="border:2px solid blue;padding:5px 4px;border-radius:5px;background-color:lightGrey; color:black;" id="EditGamePlayBtn" onMouseOver="makeSentence();" onMouseOut="hideSentence();"&gt;&lt;img src="https://cf.geekdo-images.com/images/pic2476934.png" style="vertical-align: middle;"&gt;Submit Edits&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="BRcells" id="SPLUdeletePlayDiv" style="display:none;"&gt;'
+'&lt;div&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{deleteGamePlay();}" style="border:2px solid blue;padding:5px 4px;border-radius:5px;background-color:lightGrey; color:black;" id="DeleteGamePlayBtn";&gt;&lt;img src="https://cf.geekdo-images.com/images/pic2476931.png" style="vertical-align: middle;"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="BRcells" id="SPLUresetFormDiv"&gt;'
+'&lt;div&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{clearForm();}" style="border:2px solid blue;padding:5px 4px;border-radius:5px;background-color:lightGrey; color:black;" id="ResetFormBtn"&gt;&lt;img src="https://cf.geekdo-images.com/images/pic2476932.png" style="vertical-align: middle;"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="BRcells"&gt;'
+'&lt;div id="BRresults"&gt;&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div class="BRcells"&gt;'
+'&lt;div id="SPLUexpansionResults"&gt;&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div style="display:table;"&gt;'
+'&lt;div style="display:table-row;"&gt;'
+'&lt;div class="BRcells"&gt;'
+'&lt;div id="SPLU.SummaryTextField" style="max-width:400px;"&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;';  
tmpDiv.innerHTML+=tmpHTML;
BRlogForm.appendChild(tmpDiv);



var BRlogSettings=document.createElement('div');
BRlogSettings.id='BRlogSettings';
BRlogSettings.setAttribute("style","display:none; background-color: #80FE86; padding: 13px;border:2px solid black;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:75px;");
var tmpDiv=document.createElement('div');
var tmpHTML='&lt;div id="hideSettingsButton" style="position: absolute; right: 0px; top: 2px;"&gt;&lt;a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlog\').style.minWidth=\'\';document.getElementById(\'BRlogSettings\').style.display=\'none\';}" style="border:2px solid black;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2336662.png"&gt;&lt;/a&gt;&lt;/div&gt;    &lt;span style="font-variant:small-caps; font-weight:bold; font-size:13px;"&gt;&lt;center&gt;Settings&lt;/center&gt;&lt;/span&gt;    &lt;div style="display:table;"&gt;    &lt;div style="display:table-row;"&gt;    &lt;div style="display:table-cell; text-align:left;"&gt;&lt;b&gt;Area&lt;/b&gt;&lt;/div&gt;    &lt;div style="display:table-cell; padding-left:10px; text-align:center;"&gt;Visible&lt;/div&gt;    &lt;div style="display:table-cell; padding-left: 10px; text-align:center;" id="ResetSettingsOption"&gt;Reset&lt;/div&gt;    &lt;/div&gt;    &lt;div style="display:table-row;"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Date&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.DateFieldCheck" onClick="javascript:{showHide(\'DateField\');}" &gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.DateFieldReset" onclick="javascript:{SPLU.Settings.DateField.Reset=document.getElementById(\'SPLU.DateFieldReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;    &lt;div style="display:table-row;" class="SPLUsettingAltRows"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Location&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.LocationFieldCheck" onClick="javascript:{showHide(\'LocationField\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.LocationFieldReset" onclick="javascript:{SPLU.Settings.LocationField.Reset=document.getElementById(\'SPLU.LocationFieldReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;    &lt;div style="display:table-row;"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Saved Location List&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.LocationListCheck" onClick="javascript:{showHideLocations(\'true\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.LocationListReset" onclick="javascript:{SPLU.Settings.LocationList.Reset=document.getElementById(\'SPLU.LocationListReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;" class="SPLUsettingAltRows"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Quantity&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.QuantityFieldCheck" onclick="javascript:{showHide(\'QuantityField\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.QuantityFieldReset" onclick="javascript:{SPLU.Settings.QuantityField.Reset=document.getElementById(\'SPLU.QuantityFieldReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Duration&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.DurationFieldCheck" onclick="javascript:{showHide(\'DurationField\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.DurationFieldReset" onclick="javascript:{SPLU.Settings.DurationField.Reset=document.getElementById(\'SPLU.DurationFieldReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;" class="SPLUsettingAltRows"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Incomplete&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.IncompleteFieldCheck" onclick="javascript:{showHide(\'IncompleteField\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.IncompleteFieldReset" onclick="javascript:{SPLU.Settings.IncompleteField.Reset=document.getElementById(\'SPLU.IncompleteFieldReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;No Win Stats&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.NoWinStatsFieldCheck" onclick="javascript:{showHide(\'NoWinStatsField\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.NoWinStatsFieldReset" onclick="javascript:{SPLU.Settings.NoWinStatsField.Reset=document.getElementById(\'SPLU.NoWinStatsFieldReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;" class="SPLUsettingAltRows"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Comments&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.CommentsFieldCheck" onclick="javascript:{showHide(\'CommentsField\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.CommentsFieldReset" onclick="javascript:{SPLU.Settings.CommentsField.Reset=document.getElementById(\'SPLU.CommentsFieldReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Game&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.GameFieldCheck" onclick="javascript:{showHide(\'GameField\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;/div&gt;    &lt;/div&gt;    &lt;div style="display:table-row;"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Domain Buttons&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.DomainButtonsCheck" onclick="javascript:{showHide(\'DomainButtons\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;/div&gt;    &lt;/div&gt;		    &lt;div style="display:table-row;" class="SPLUsettingAltRows"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Saved Player Names&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerListCheck" onclick="javascript:{showHide(\'PlayerList\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;/div&gt;    &lt;/div&gt;        &lt;div style="display:table-row;" class="SPLUsettingAltRows"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Enable Filters&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerFiltersCheck" onclick="javascript:{showHideFilters();}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;/div&gt;    &lt;/div&gt;        &lt;div style="display:table-row;" class="SPLUsettingAltRows"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Enable Groups&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerGroupsCheck" onclick="javascript:{showHideGroups();}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;/div&gt;    &lt;/div&gt;    &lt;div style="display:table-row;"&gt;&lt;div style="display:table-cell; text-align:left; padding-top:10px;"&gt;&lt;b&gt;Player Columns&lt;/b&gt;&lt;/div&gt;&lt;/div&gt;      &lt;div style="display:table-row;"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Name&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerNameColumnCheck" onclick="javascript:{hideColumn(\'PlayerNameColumn\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerNameColumnReset" onclick="javascript:{SPLU.Settings.PlayerNameColumn.Reset=document.getElementById(\'SPLU.PlayerNameColumnReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;" class="SPLUsettingAltRows"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Username&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerUsernameColumnCheck" onclick="javascript:{hideColumn(\'PlayerUsernameColumn\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerUsernameColumnReset" onclick="javascript:{SPLU.Settings.PlayerUsernameColumn.Reset=document.getElementById(\'SPLU.PlayerUsernameColumnReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Team / Color&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerColorColumnCheck" onclick="javascript:{hideColumn(\'PlayerColorColumn\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerColorColumnReset" onclick="javascript:{SPLU.Settings.PlayerColorColumn.Reset=document.getElementById(\'SPLU.PlayerColorColumnReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;" class="SPLUsettingAltRows"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Starting Position&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerPositionColumnCheck" onclick="javascript:{hideColumn(\'PlayerPositionColumn\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerPositionColumnReset" onclick="javascript:{SPLU.Settings.PlayerPositionColumn.Reset=document.getElementById(\'SPLU.PlayerPositionColumnReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Score&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerScoreColumnCheck" onclick="javascript:{hideColumn(\'PlayerScoreColumn\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerScoreColumnReset" onclick="javascript:{SPLU.Settings.PlayerScoreColumn.Reset=document.getElementById(\'SPLU.PlayerScoreColumnReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;" class="SPLUsettingAltRows"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Rating&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerRatingColumnCheck" onclick="javascript:{hideColumn(\'PlayerRatingColumn\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerRatingColumnReset" onclick="javascript:{SPLU.Settings.PlayerRatingColumn.Reset=document.getElementById(\'SPLU.PlayerRatingColumnReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;"&gt;    &lt;div tyle="display:table-cell; text-align:right;"&gt;Win&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerWinColumnCheck" onclick="javascript:{hideColumn(\'PlayerWinColumn\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerWinColumnReset" onclick="javascript:{SPLU.Settings.PlayerWinColumn.Reset=document.getElementById(\'SPLU.PlayerWinColumnReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;" class="SPLUsettingAltRows"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;New&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerNewColumnCheck" onclick="javascript:{hideColumn(\'PlayerNewColumn\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PlayerNewColumnReset" onclick="javascript:{SPLU.Settings.PlayerNewColumn.Reset=document.getElementById(\'SPLU.PlayerNewColumnReset\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;/div&gt;    &lt;div style="display:table-row;"&gt;&lt;div style="display:table-cell; text-align:left; padding-top:10px;"&gt;&lt;b&gt;Other Stuff&lt;/b&gt;&lt;/div&gt;&lt;/div&gt;      &lt;div style="display:table-row;" class="SPLUsettingAltRows"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Pop-Up Text&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.PopUpTextCheck" onclick="javascript:{SPLU.Settings.PopUpText.Visible=document.getElementById(\'SPLU.PopUpTextCheck\').checked;}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Summary Sentence&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.SummaryTextFieldCheck" onclick="javascript:{showHide(\'SummaryTextField\');}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;/div&gt;    &lt;/div&gt;      &lt;div style="display:table-row;" class="SPLUsettingAltRows"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Noreen\'s Win Comments&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.WinCommentsCheck" onclick="javascript:{SPLU.Settings.WinComments.Visible=document.getElementById(\'SPLU.WinCommentsCheck\').checked; if(SPLU.Settings.WinComments.Visible){NoreenWinComment();}}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;/div&gt;    &lt;/div&gt;    &lt;div style="display:table-row;"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Sort Players: Alpha&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.SortPlayersAlphaCheck" onclick="javascript:{if(document.getElementById(\'SPLU.SortPlayersAlphaCheck\').checked){SPLU.Settings.SortPlayers.Order=\'Alpha\';}else{SPLU.Settings.SortPlayers.Order=\'None\';} loadPlayers();}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;/div&gt;    &lt;/div&gt;    &lt;div style="display:table-row;" class="SPLUsettingAltRows"&gt;    &lt;div style="display:table-cell; text-align:right;"&gt;Sort Groups: Alpha&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;input type="checkbox" id="SPLU.SortGroupsAlphaCheck" onclick="javascript:{if(document.getElementById(\'SPLU.SortGroupsAlphaCheck\').checked){SPLU.Settings.SortGroups.Order=\'Alpha\';}else{SPLU.Settings.SortGroups.Order=\'None\';} loadPlayers();}"&gt;&lt;/input&gt;&lt;/div&gt;    &lt;div style="display:table-cell; text-align:center;"&gt;&lt;/div&gt;    &lt;/div&gt;        &lt;/div&gt;      &lt;div style="display:table; padding-top:15px;"&gt;    &lt;div style="display:table-row;"&gt;    &lt;div style="display:table-cell; padding-right:10px;"&gt;&lt;a href="javascript:{void(0);}" onClick="javascript:{saveSettings(\'Saved\');}" class="BRbutn" style="border:2px solid black;padding:2px 4px;border-radius:5px;background-color:lightGrey; color:black;"&gt;Save Settings&lt;/a&gt;&lt;/div&gt;    &lt;div style="display:table-cell;width:135px;" id="SPLU.SettingsStatus"&gt;&lt;/div&gt;    &lt;div style="display:table-cell;" id="SPLU.SettingsReset"&gt;&lt;a href="javascript:{void(0);}" onClick="javascript:{resetSettings();saveSettings(\'Settings Reset. Please close SPLU.\');}" style="color:red;"&gt;!&lt;/a&gt;&lt;/div&gt;    &lt;/div&gt;&lt;/div&gt;      &lt;/div&gt;';  tmpDiv.innerHTML+=tmpHTML;
BRlogSettings.appendChild(tmpDiv);


var BRlogFavs=document.createElement('div');
BRlogFavs.id='BRlogFavs';
BRlogFavs.setAttribute("style","display:none; background-color: #FFAEC5; font-style:initial; color:black; padding: 13px;border:2px solid #F30F27;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:100px;");
var tmpDiv=document.createElement('div');
var tmpHTML='&lt;div id="hideFavsButton" style="position: absolute; right: 0px; top: 2px;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogFavs\').style.display=\'none\';}" style="border:2px solid #F30F27;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2336662.png"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;span style="font-variant:small-caps; font-weight:bold;"&gt;'
+'&lt;center&gt;Favorites&lt;/center&gt;'
+'&lt;br /&gt;'
+'&lt;/span&gt;'
+'&lt;div id="SPLU.FavoritesStatus"&gt;&lt;/div&gt;'
+'&lt;div id="SPLU.FavoritesList" style="overflow-y:auto; width:220px;"&gt;'
+'&lt;/div&gt;';
tmpDiv.innerHTML+=tmpHTML;
BRlogFavs.appendChild(tmpDiv);

var BRlogExpansions=document.createElement('div');
BRlogExpansions.id='BRlogExpansions';
BRlogExpansions.setAttribute("style","display:none; background-color: #B269FB; font-style:initial; color:white; padding: 13px;border:2px solid blue;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:75px; max-width:250px;");
var tmpDiv=document.createElement('div');
var tmpHTML='&lt;div id="hideExpansionsButton" style="position: absolute; right: 0px; top: 2px;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogExpansions\').style.display=\'none\';}" style="border:2px solid blue;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2336662.png"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;form name="BRexpLogForm"&gt;'
+'&lt;center&gt;&lt;b&gt;Expansion Logging&lt;/b&gt;&lt;/center&gt;'
+'&lt;div style="display:table;width:250px;"&gt;'
+'&lt;div style="display:table-row;"&gt;'
+'&lt;div id="SPLU.ExpansionsHeading" style="display:table-cell;padding-bottom:5px;border-top:2px solid blue;border-top-left-radius:20px;border-top-right-radius:20px;"&gt;'
+'&lt;center&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{showExpansionTab();}"&gt;Expansions&lt;/a&gt;'
+'&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.FamilyHeading" style="display:table-cell;padding-bottom:5px;border-top-left-radius:20px;border-top-right-radius:20px;"&gt;'
+'&lt;center&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{showFamilyTab();}"&gt;Family&lt;/a&gt;'
+'&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.ExpansionPane" style="overflow-y:auto;margin-top:10px;margin-bottom:10px;"&gt;&lt;/div&gt;'
+'&lt;div id="SPLU.FamilyPane" style="overflow-y:auto;margin-top:10px;margin-bottom:10px;display:none;"&gt;&lt;/div&gt;'
+'&lt;div id="SPLU.ExpansionPaneControls"&gt;'
+'&lt;div style="padding-top:10px;"&gt;Expansion Play Quantity: '
+'&lt;div id="SPLU.fakeExpQtyBox" style="display:inline-block;padding:0px 2px; -moz-appearance:textfield; -webkit-appearance:textfield;"&gt;'
+'&lt;input type="text" id="BRexpPlayQTY"/ value=".1" style="width:40px;border:none;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{saveExpansionQuantity();}" style="vertical-align:middle;" id="SPLU.SaveExpQtyButton"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2345639.png"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;div style="display:table; padding-top:10px;"&gt;'
+'&lt;div style="display:table-row;"&gt;'
+'&lt;div style="display:table-cell; padding-top:10px;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogExpansions\').style.display=\'none\';}" style="border:2px solid blue;padding:2px 4px;border-radius:5px;background-color:lightGrey;margin-top:10px;"&gt;OK&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;div style="display:table-cell; padding-top:10px; padding-left:10px;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{clearExpansions();}" style="border:2px solid blue;padding:2px 4px;border-radius:5px;background-color:lightGrey;margin-top:10px;"&gt;Clear Selection&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.ExpansionsPaneStatus" style="display:table-cell; padding-top:10px; padding-left:10px;"&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/form&gt;';
tmpDiv.innerHTML+=tmpHTML;
BRlogExpansions.appendChild(tmpDiv);

var BRlogLocations=document.createElement('div');
BRlogLocations.id='BRlogLocations';
BRlogLocations.setAttribute("style","display:none; background-color: #F5C86C; padding: 13px;border:2px solid #249631;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:100px;");
var tmpDiv=document.createElement('div');
var tmpHTML='&lt;div id="hideLocationsButton" style="position: absolute; right: 0px; top: 2px;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogLocations\').style.display=\'none\';}" style="border:2px solid #249631;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2336662.png"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;span style="font-variant:small-caps; font-weight:bold;"&gt;'
+'&lt;center&gt;Saved Locations&lt;/center&gt;'
+'&lt;br/&gt;'
+'&lt;/span&gt;'
+'&lt;div id="SPLU.LocationsList" style="overflow-y:auto; width:200px;"&gt;&lt;/div&gt;'
+'&lt;div style="padding-top:10px;display:inline;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{saveLocations();}" class="SPLUbuttons" style="margin-right:6px;color:black;border:2px solid #249631"&gt;Save&lt;/a&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{addLocation();}" class="SPLUbuttons" style="color:black; border:2px solid #249631"&gt;New&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.LocationsStatus" style="display:inline;padding-left:5px;"&gt;&lt;/div&gt;';
tmpDiv.innerHTML+=tmpHTML;
BRlogLocations.appendChild(tmpDiv);

var BRlogPlayers=document.createElement('div');
BRlogPlayers.id='BRlogPlayers';
BRlogPlayers.setAttribute("style","display:none; background-color: #F7FB6F; padding: 13px;border:2px solid #00F; border-radius:15px; box-shadow:10px 10px 5px #888; min-width:275px;");
var tmpDiv=document.createElement('div');
var tmpHTML='&lt;div id="hidePlayersButton" style="position: absolute; right: 0px; top: 2px;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hidePopText();showPlayersTab();document.getElementById(\'BRlogPlayers\').style.display=\'none\';}" style="border:2px solid #00F;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2336662.png"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;span style="font-variant:small-caps; font-weight:bold;"&gt;'
+'&lt;center&gt;Saved Players&lt;/center&gt;'
+'&lt;br/&gt;'
+'&lt;/span&gt;'
+'&lt;div style="display: table; width: 254px;"&gt;'
+'&lt;div style="display:table-row;"&gt;'
+'&lt;div id="SPLU.PlayersHeading" style="display:table-cell; padding-bottom: 5px;border-top: 2px solid blue; border-top-left-radius: 20px; border-top-right-radius: 20px;"&gt;'
+'&lt;center&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{showPlayersTab();}"&gt;Players&lt;/a&gt;'
+'&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.FiltersHeading" style="display:table-cell; padding-bottom: 5px;border-top-left-radius: 20px; border-top-right-radius: 20px;"&gt;'
+'&lt;center&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{showFiltersTab();}"&gt;Filters&lt;/a&gt;'
+'&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.GroupsHeading" style="display:table-cell; padding-bottom: 5px;border-top-left-radius: 20px; border-top-right-radius: 20px;"&gt;'
+'&lt;center&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{showGroupsTab();}"&gt;Groups&lt;/a&gt;'
+'&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div style="display:table-row;"&gt;'
+'&lt;div id="SPLU.PlayersSubHeading" style="display: table-cell; height: 15px;"&gt;'
+'&lt;div id="SPLU.FiltersDeleteCell" style="display:none;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{deleteFilter();}" style="vertical-align:middle; padding-right:5px;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2346458.png"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.GroupsDeleteCell" style="display:none;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{deleteGroup();}" style="vertical-align:middle; padding-right:5px;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2346458.png"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.FiltersSubHeading" style="display: table-cell;"&gt;'
+'&lt;center&gt;'
+'&lt;select id="SPLU.FiltersSubSelect" style="margin:2px;display:none;" onChange="javascript:{setFilter(\'edit\');}"&gt;&lt;/select&gt;'
+'&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.GroupsSubHeading" style="display: table-cell;"&gt;'
+'&lt;center&gt;'
+'&lt;select id="SPLU.GroupsSubSelect" style="margin:2px;display:none;" onChange="javascript:{setGroup(\'edit\');}"&gt;&lt;/select&gt;'
+'&lt;/center&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;';
tmpHTML+="&lt;div style='display:table;'&gt;&lt;div style='display:table-row;'&gt;&lt;div style='display:table-cell;width:22px;'&gt;&lt;/div&gt;&lt;div style='display:table-cell;width:84px;'&gt;&lt;center&gt;Name&lt;/center&gt;&lt;/div&gt;&lt;div style='display:table-cell;width:84px;'&gt;&lt;center&gt;Username&lt;/center&gt;&lt;/div&gt;&lt;div style='display:table-cell;width:64px;' name='SPLUplayerEditColumn'&gt;&lt;center&gt;Color&lt;/center&gt;&lt;/div&gt;&lt;div style='display:none;width:64px;' name='SPLUplayerFilterColumn'&gt;&lt;/div&gt;&lt;/div&gt;&lt;/div&gt;";
tmpHTML+='&lt;div id="SPLU.PlayersList" style="overflow-y:auto;"&gt;&lt;/div&gt;'
+'&lt;div id="SPLU.PlayersPaneControls"&gt;'
+'&lt;div style="padding-top:10px;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{savePlayers();}" class="SPLUbuttons" style="margin-right:6px;color:black;" id="SavePlayerListBtn"&gt;Save&lt;/a&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{addPlayer();}" class="SPLUbuttons" style="color:black;"&gt;New&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.PlayersStatus" style="display:inline;padding-left:5px;"&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.FiltersPaneControls" style="display:none;"&gt;'
+'&lt;div style="padding-top:10px;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{saveFilters();}" class="SPLUbuttons" style="margin-right:6px;color:black;" id="SavePlayerFilterBtn"&gt;Save Filters&lt;/a&gt;'
+'&lt;div id="SPLU.fakeFilterBox" style="display:inline-block;padding:0px 2px; -moz-appearance:textfield; -webkit-appearance:textfield;"&gt;'
+'&lt;input type="text" id="SPLU.NewFilterName" placeholder="Add a new Filter" style="width:100px;border:none;"&gt;&lt;/input&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{addFilter();}" style="color:black;"&gt;&lt;img src="//cf.geekdo-static.com/images/icons/silkicons/add.png"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.FiltersStatus" style="display:inline;padding-left:5px;"&gt;&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.GroupsPaneControls" style="display:none;"&gt;'
+'&lt;div style="padding-top:10px;"&gt;&lt;a href="javascript:{void(0);}" onClick="javascript:{saveGroups();}" class="SPLUbuttons" style="margin-right:6px;color:black;" id="SavePlayerGroupsBtn"&gt;Save Groups&lt;/a&gt;'
+'&lt;div id="SPLU.fakeGroupBox" style="display:inline-block;padding:0px 2px; -moz-appearance:textfield; -webkit-appearance:textfield;"&gt;'
+'&lt;input type="text" id="SPLU.NewGroupName" placeholder="Add a new Group" style="width:100px;border:none;"&gt;&lt;/input&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{addGroup();}" style="color:black;"&gt;&lt;img src="//cf.geekdo-static.com/images/icons/silkicons/add.png"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.GroupsStatus" style="display:inline;padding-left:5px;"&gt;&lt;/div&gt;'
+'&lt;/div&gt;';
tmpDiv.innerHTML+=tmpHTML;
BRlogPlayers.appendChild(tmpDiv);

var BRlogPlays=document.createElement('div');
BRlogPlays.id='BRlogPlays';
BRlogPlays.setAttribute("style","display:none; background-color: #F1F8FB; padding: 13px;border:2px solid #249631;border-radius:15px; box-shadow:10px 10px 5px #888; min-width:100px;");
var tmpDiv=document.createElement('div');
var tmpHTML='&lt;div id="hidePlaysButton" style="position: absolute; right: 0px; top: 2px;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{hidePopText();document.getElementById(\'BRlogPlays\').style.display=\'none\';}" style="border:2px solid #249631;padding:0px 8px;border-top-right-radius: 15px; border-bottom-left-radius: 5px;background-color:lightGrey;font-size:x-large;font-weight:900;color:red;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2336662.png"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;span style="font-variant:small-caps; font-weight:bold;"&gt;'
+'&lt;center&gt;Logged Plays&lt;/center&gt;'
+'&lt;/span&gt;'
+'&lt;div&gt;'
+'&lt;input type="text" id="SPLU.PlaysLogger" value="'+LoggedInAs+'" onClick="javascript:{listFetchedPlayers();}" onKeyPress="eventPlaysPlayerEnter(event);"/&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{getRecentPlays(false);}"&gt;Get Recent&lt;/a&gt;'
+' | '
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{getRecentPlays(true);}"&gt;Get All&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.PlaysPlayers" style="position: absolute; background-color: rgb(205, 237, 251); width: 126px; padding: 3px; border: 1px solid blue; display:none;"&gt;list&lt;/div&gt;'
+'&lt;div id="SPLU.PlaysStatus"&gt;&lt;/div&gt;'
+'&lt;div id="SPLU.PlaysMenu" style="display:none;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{showHidePlaysFilters();}"&gt;&lt;img src="https://cf.geekdo-images.com/images/pic2477108.png"&gt;&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.PlaysFilters" style="border: 1px solid blue; border-radius: 5px; padding: 3px; display:none;"&gt;'
+'&lt;div id="SPLU.PlaysFiltersStatus" style="float:right;"&gt;&lt;/div&gt;'
+'&lt;div&gt;'
+'&lt;select id="SPLU.SelectPlaysFilter" onChange="javascript:{addPlaysFilter();}"&gt;'
+'&lt;option value="add"&gt;Add a Filter&lt;/option&gt;'
+'&lt;option value="---" disabled&gt;---&lt;/option&gt;'
+'&lt;option value="playername"&gt;Player Name&lt;/option&gt;'
+'&lt;option value="username"&gt;User Name&lt;/option&gt;'
+'&lt;option value="gamename"&gt;Game Name&lt;/option&gt;'
+'&lt;option value="location"&gt;Location&lt;/option&gt;'
+'&lt;option value="comments"&gt;Comments&lt;/option&gt;'
+'&lt;/select&gt;'
+'&lt;div id="SPLU.PlaysFiltersCurrent"&gt;&lt;/div&gt;'
+'&lt;div id="SPLU.PlaysFiltersGoBtn"style="float:right;margin-top:-20px;margin-right:5px;display:none;"&gt;'
+'&lt;a href="javascript:{void(0);}" onClick="javascript:{loadPlays(document.getElementById(\'SPLU.PlaysLogger\').value);}"&gt;go&lt;/a&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;/div&gt;'
+'&lt;div id="SPLU.PlaysList" style="overflow-y:auto; width:275px;"&gt;&lt;/div&gt;';
tmpDiv.innerHTML+=tmpHTML;
BRlogPlays.appendChild(tmpDiv);

function showFavsPane(source){
if(source=="button"&amp;&amp;document.getElementById('BRlogFavs').style.display=="table-cell"){
document.getElementById('BRlogFavs').style.display="none";
return;
}
hidePanes();
document.getElementById('SPLU.FavoritesList').style.maxHeight=document.getElementById('BRlogMain').clientHeight-95+"px";
document.getElementById('BRlogFavs').style.display="table-cell";
var tmpHTML='&lt;div style="display:table;"&gt;';
var size=0;
for(key in SPLU.Favorites){
if(SPLU.Favorites.hasOwnProperty(key)){size++};
if(size % 2==1){
tmpHTML+='&lt;div style="display:table-row;"&gt;';
} 
tmpHTML+='&lt;div style="display:table-cell; max-width:110px; padding-top:10px;"&gt;&lt;a href="javascript:{void(0);}" onClick="javascript:{chooseFavorite('+key+');}"&gt;&lt;img src="'+SPLU.Favorites[key].thumbnail+'"&gt;&lt;/a&gt;&lt;a href="javascript:{void(0);}" onClick="javascript:{deleteFavorite('+key+');}"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2333696.png" style="vertical-align:top; position: relative; margin-left: -8px; margin-top: -8px;"/&gt;&lt;/a&gt;&lt;br/&gt;'+SPLU.Favorites[key].title+'&lt;/div&gt;';
if(size % 2==0){
tmpHTML+='&lt;/div&gt;';
}
}
tmpHTML+='&lt;/div&gt;';
document.getElementById('SPLU.FavoritesList').innerHTML=tmpHTML;
document.getElementById('SPLU.FavoritesStatus').innerHTML='&lt;center&gt;You have '+size+' Favorites.&lt;/center&gt;&lt;br/&gt;';
}


function showSettingsPane(source){
if(source=="button"&amp;&amp;document.getElementById('BRlogSettings').style.display=="table-cell"){
document.getElementById('BRlog').style.minWidth="";
document.getElementById('BRlogSettings').style.display="none";
return;
}
hidePanes();
document.getElementById('BRlog').style.minWidth="610px";
document.getElementById('BRlogSettings').style.display="table-cell";
}

function showExpansionsPane(source){
if(source=="button"&amp;&amp;document.getElementById('BRlogExpansions').style.display=="table-cell"){
document.getElementById('BRlogExpansions').style.display="none";
return;
}
hidePanes();
document.getElementById('SPLU.ExpansionPane').style.height=document.getElementById('BRlogMain').clientHeight-155+"px";
document.getElementById('SPLU.FamilyPane').style.height=document.getElementById('BRlogMain').clientHeight-155+"px";
document.getElementById('BRlogExpansions').style.display="table-cell";
if(SPLUgameID!=0&amp;&amp;SPLUprevGameID!=SPLUgameID&amp;&amp;!SPLUexpansionsLoaded){
getExpansions();
}
}

function showPlaysPane(source){
if(source=="button"&amp;&amp;document.getElementById('BRlogPlays').style.display=="table-cell"){
document.getElementById('BRlogPlays').style.display="none";
return;
}
hidePanes();
document.getElementById('SPLU.PlaysList').style.height=document.getElementById('BRlogMain').clientHeight-155+"px";
document.getElementById('BRlogPlays').style.display="table-cell";
}

function showLocationsPane(source){
if(source=="button"&amp;&amp;document.getElementById('BRlogLocations').style.display=="table-cell"){
document.getElementById('BRlogLocations').style.display="none";
return;
}
hidePanes();
document.getElementById('SPLU.LocationsList').style.height=document.getElementById('BRlogMain').clientHeight-100+"px";
document.getElementById('BRlogLocations').style.display="table-cell";
SPLUlocationCount=0;
var tmpHTML="&lt;div style='display:table;' id='EditLocationsTable'&gt;";
for(var key in SPLU.Locations){
if (SPLU.Locations.hasOwnProperty(key)) {
SPLUlocationCount++;
tmpHTML+="&lt;div style='display:table-row;' id='EditLocationsRow"+key+"'&gt;";
tmpHTML+='&lt;div style="display:table-cell;padding:1px;"&gt;&lt;a href="javascript:{void(0);}" onClick="javascript:{document.getElementById(\'EditLocationsTable\').removeChild(document.getElementById(\'EditLocationsRow'+key+'\'));}" style="color:red;margin:2px;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2346458.png"&gt;&lt;/a&gt;&lt;/div&gt;';
tmpHTML+="&lt;div style='display:table-cell;padding:1px;'&gt;&lt;input type='text' size='25' class='EditLocationsField' tabindex='"+(1000+SPLUlocationCount)+"' style='border:none;' value=\""+decodeURIComponent(SPLU.Locations[key].Name)+"\"/&gt;&lt;/div&gt;";
tmpHTML+="&lt;/div&gt;";
}
}
tmpHTML+='&lt;/div&gt;';
document.getElementById('SPLU.LocationsList').innerHTML=tmpHTML;
addLocation();
}

function addLocation(){
SPLUlocationCount++;
var tmpDiv=document.createElement('div');
tmpDiv.style.display="table-row";
tmpDiv.id="EditLocationsRow"+SPLUlocationCount;
var tmpHTML='&lt;div style="display:table-cell;padding:1px;"&gt;&lt;a href="javascript:{void(0);}" onClick="javascript:{document.getElementById(\'EditLocationsTable\').removeChild(document.getElementById(\'EditLocationsRow'+SPLUlocationCount+'\'));}" style="color:red;margin:2px;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2346458.png"&gt;&lt;/a&gt;&lt;/div&gt;';
tmpHTML+="&lt;div style='display:table-cell;padding:1px;'&gt;&lt;input type='text' size='25' class='EditLocationsField' tabindex='"+(1000+SPLUlocationCount)+"' style='border:none;'/&gt;&lt;/div&gt;";
tmpDiv.innerHTML=tmpHTML;
document.getElementById('EditLocationsTable').appendChild(tmpDiv);
}

function saveLocations(){
document.getElementById('SPLU.LocationsStatus').innerHTML="Thinking...";
SPLU.Locations={};
var locations=document.getElementsByClassName('EditLocationsField');
for(i=0;i&lt;locations.length;i++){
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
document.getElementById('SPLU.LocationsStatus').innerHTML="&lt;img style='vertical-align:bottom;padding-top:5px;' src='//cf.geekdo-static.com/mbs/mb_3264_0.gif'&gt;&lt;span style='background-color:red;color:white;font-weight:bold;'&gt;Error Code: "+responseJSON.target.status+"&lt;/span&gt; Try saving again.";
}
};
xmlhttp.open("POST","/geekplay.php",true);
xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
xmlhttp.send("version=2&amp;objecttype=thing&amp;objectid=98000&amp;playid="+SPLUplayId+"&amp;action=save&amp;quantity=0&amp;comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&amp;playdate=1452-04-15&amp;B1=Save");
}

function showPlayersPane(source){
if(source=="button"&amp;&amp;document.getElementById('BRlogPlayers').style.display=="table-cell"){
document.getElementById('BRlogPlayers').style.display="none";
return;
}
hidePanes();
showPlayersTab();
document.getElementById('SPLU.PlayersList').style.height=document.getElementById('BRlogMain').clientHeight-155+"px";
document.getElementById('BRlogPlayers').style.display="table-cell";
SPLUplayerCount=0;
var tmpHTML="&lt;div style='display:table;' id='EditPlayersTable'&gt;";
var players=[];
if(SPLU.Settings.SortPlayers.Order=="Alpha"){
players = Object.keys(SPLU.Players).sort();
}else{
players = Object.keys(SPLU.Players);
}
for(var key=0;key&lt;players.length;key++){
var tmp="";
if (SPLU.Players.hasOwnProperty(players[key])) {
SPLUplayerCount++;
if(SPLUplayerCount % 2==1){
tmp="background-color:#E5EA3C;";
}else{
tmp="";
}
tmpHTML+="&lt;div style='display:table-row;' id='EditPlayersRow"+players[key]+"'&gt;";
tmpHTML+="&lt;div style='display:table-cell;' name='SPLUplayerEditColumn'&gt;"+'&lt;a href="javascript:{void(0);}" onClick="javascript:{document.getElementById(\'EditPlayersTable\').removeChild(document.getElementById(\'EditPlayersRow'+players[key]+'\'));deletePlayer(\''+players[key]+'\')}" style="vertical-align:middle; padding-right:5px;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2346458.png"&gt;&lt;/a&gt;&lt;/div&gt;';
tmpHTML+="&lt;div style='display:table-cell;padding-right:2px;' name='SPLUplayerEditColumn'&gt;&lt;input type='text' size='12' tabindex='"+(1100+(SPLUplayerCount*5))+"' class='EditPlayersField' id='SPLUplayerName"+players[key]+"' value=\""+decodeURIComponent(SPLU.Players[players[key]].Name)+"\"/&gt;&lt;/div&gt;";
tmpHTML+="&lt;div style='display:table-cell;padding-right:2px;' name='SPLUplayerEditColumn'&gt;&lt;input type='text' size='12' tabindex='"+(1101+(SPLUplayerCount*5))+"' id='SPLUplayerUsername"+players[key]+"' value=\""+decodeURIComponent(SPLU.Players[players[key]].Username)+"\"/&gt;&lt;/div&gt;";
tmpHTML+="&lt;div style='display:table-cell;padding-right:2px;' name='SPLUplayerEditColumn'&gt;&lt;input type='text' size='8' tabindex='"+(1102+(SPLUplayerCount*5))+"' id='SPLUplayerColor"+players[key]+"' value=\""+decodeURIComponent(SPLU.Players[players[key]].Color)+"\"/&gt;&lt;input type='hidden' id='SPLUplayerID"+players[key]+"' value='"+players[key]+"'&gt;&lt;/div&gt;";
tmpHTML+="&lt;div style='display:none;width:22px;' name='SPLUplayerStaticColumn'&gt;&lt;/div&gt;";
tmpHTML+="&lt;div style='display:none;width:84px;"+tmp+"' name='SPLUplayerStaticColumn'&gt;"+decodeURIComponent(SPLU.Players[players[key]].Name)+"&lt;/div&gt;";
tmpHTML+="&lt;div style='display:none;width:84px;"+tmp+"' name='SPLUplayerStaticColumn'&gt;"+decodeURIComponent(SPLU.Players[players[key]].Username)+"&lt;/div&gt;";
tmpHTML+="&lt;div style='display:none;width:64px;"+tmp+"' name='SPLUplayerFilterColumn'&gt;&lt;center&gt;&lt;input type='checkbox' name='SPLUfilterChecks' style='vertical-align:middle;' value='"+players[key]+"' onClick='javascript:{updateFilters(this);}'&gt;&lt;/input&gt;&lt;/center&gt;&lt;/div&gt;";
tmpHTML+="&lt;div style='display:none;width:64px;"+tmp+"' name='SPLUplayerGroupColumn'&gt;&lt;center&gt;&lt;input type='checkbox' name='SPLUgroupChecks' style='vertical-align:middle;' value='"+players[key]+"' onClick='javascript:{updateGroups(this);}'&gt;&lt;/input&gt;&lt;/center&gt;&lt;/div&gt;";
tmpHTML+="&lt;/div&gt;";
}
}
tmpHTML+='&lt;/div&gt;';
document.getElementById('SPLU.PlayersList').innerHTML=tmpHTML;
addPlayer();
}

function addPlayer(){
SPLUplayerCount++;
var tmpDiv=document.createElement('div');
tmpDiv.style.display="table-row";
tmpDiv.id="EditPlayersRow"+SPLUplayerCount;
var tmpHTML="&lt;div style='display:table-cell;' name='SPLUplayerEditColumn'&gt;"+'&lt;a href="javascript:{void(0);}" onClick="javascript:{document.getElementById(\'EditPlayersTable\').removeChild(document.getElementById(\'EditPlayersRow'+SPLUplayerCount+'\'));}" style="vertical-align:middle;"&gt;&lt;img src="http://cf.geekdo-images.com/images/pic2346458.png"&gt;&lt;/a&gt;&lt;/div&gt;';
tmpHTML+="&lt;div style='display:table-cell;' name='SPLUplayerEditColumn'&gt;&lt;input type='text' size='12' tabindex='"+(1100+(SPLUplayerCount*5))+"' class='EditPlayersField' id='SPLUplayerName"+SPLUplayerCount+"'/&gt;&lt;/div&gt;";
tmpHTML+="&lt;div style='display:table-cell;' name='SPLUplayerEditColumn'&gt;&lt;input type='text' size='12' tabindex='"+(1101+(SPLUplayerCount*5))+"' id='SPLUplayerUsername"+SPLUplayerCount+"'/&gt;&lt;/div&gt;";
tmpHTML+="&lt;div style='display:table-cell;' name='SPLUplayerEditColumn'&gt;&lt;input type='text' size='8' tabindex='"+(1102+(SPLUplayerCount*5))+"' id='SPLUplayerColor"+SPLUplayerCount+"'/&gt;&lt;input type='hidden' id='SPLUplayerID"+SPLUplayerCount+"' value='-1'&gt;&lt;/div&gt;";
tmpDiv.innerHTML=tmpHTML;
document.getElementById('EditPlayersTable').appendChild(tmpDiv);
}

function savePlayers(){
document.getElementById('SPLU.PlayersStatus').innerHTML="Thinking...";
SPLU.Players={};
var players=document.getElementsByClassName('EditPlayersField');
for(i=0;i&lt;players.length;i++){
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
document.getElementById('SPLU.PlayersStatus').innerHTML="&lt;img style='vertical-align:bottom;padding-top:5px;' src='//cf.geekdo-static.com/mbs/mb_3264_0.gif'&gt;&lt;span style='background-color:red;color:white;font-weight:bold;'&gt;Error Code: "+responseJSON.target.status+"&lt;/span&gt; Try saving again.";
}
};
xmlhttp.open("POST","/geekplay.php",true);
xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
xmlhttp.send("version=2&amp;objecttype=thing&amp;objectid=98000&amp;playid="+SPLUplayId+"&amp;action=save&amp;quantity=0&amp;comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&amp;playdate=1452-04-15&amp;B1=Save");
}

function deletePlayer(id){
for(var key in SPLU.Groups){
var index=SPLU.Groups[key].indexOf(id);
if(index&gt;=0){
SPLU.Groups[key].splice(index,1);
document.getElementById('SPLU.PlayersStatus').innerHTML="&lt;span style='color:red;'&gt;You have unsaved groups and/or filters.&lt;/span&gt;";
document.getElementById('SPLU.GroupsStatus').innerHTML="&lt;span style='color:red;'&gt;You have unsaved groups.&lt;/span&gt;";
}
}
for(var key in SPLU.Filters){
var index=SPLU.Filters[key].indexOf(id);
if(index&gt;=0){
SPLU.Filters[key].splice(index,1);
document.getElementById('SPLU.PlayersStatus').innerHTML="&lt;span style='color:red;'&gt;You have unsaved groups and/or filters.&lt;/span&gt;";
document.getElementById('SPLU.FiltersStatus').innerHTML="&lt;span style='color:red;'&gt;You have unsaved filters.&lt;/span&gt;";
}
}
}

function setPlayerPaneColumn(name,value){
tmp=document.getElementsByName(name);
for(i=0;i&lt;tmp.length;i++){
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
if (index&gt;-1) {
SPLU.Filters[SPLUcurrentFilter].splice(index, 1);
}
}
loadPlayers();
document.getElementById('SPLU.FiltersStatus').innerHTML="&lt;span style='color:red;'&gt;You have unsaved filters.&lt;/span&gt;";
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
for(i=0;i&lt;checks.length;i++){
checks[i].checked=false;
}
filter.value="";
document.getElementById('SPLU.FiltersStatus').innerHTML="&lt;span style='color:red;'&gt;You have unsaved filters.&lt;/span&gt;";
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
document.getElementById('SPLU.FiltersStatus').innerHTML="&lt;img style='vertical-align:bottom;padding-top:5px;' src='//cf.geekdo-static.com/mbs/mb_3264_0.gif'&gt;&lt;span style='background-color:red;color:white;font-weight:bold;'&gt;Error Code: "+responseJSON.target.status+"&lt;/span&gt; Try saving again.";
}
};
xmlhttp.open("POST","/geekplay.php",true);
xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
xmlhttp.send("version=2&amp;objecttype=thing&amp;objectid=98000&amp;playid="+SPLUplayId+"&amp;action=save&amp;quantity=0&amp;comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&amp;playdate=1452-04-15&amp;B1=Save");
}

function deleteFilter(){
var filter=document.getElementById('SPLU.FiltersSubSelect').value;
if(filter!="---"){
delete SPLU.Filters[filter];
setFilter("delete");
document.getElementById('SPLU.FiltersStatus').innerHTML="&lt;span style='color:red;'&gt;You have unsaved filters.&lt;/span&gt;";
}
}

function updateGroups(id){
if(document.getElementById('SPLU.GroupsSubSelect').value!=""){
if(id.checked){
SPLU.Groups[SPLUcurrentGroup].push(id.value);
}else{
var index=SPLU.Groups[SPLUcurrentGroup].indexOf(id.value);
if (index&gt;-1) {
SPLU.Groups[SPLUcurrentGroup].splice(index, 1);
}
}
document.getElementById('SPLU.GroupsStatus').innerHTML="&lt;span style='color:red;'&gt;You have unsaved groups.&lt;/span&gt;";
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
for(i=0;i&lt;checks.length;i++){
checks[i].checked=false;
}
group.value="";
document.getElementById('SPLU.GroupsStatus').innerHTML="&lt;span style='color:red;'&gt;You have unsaved groups.&lt;/span&gt;";
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
document.getElementById('SPLU.GroupsStatus').innerHTML="&lt;span style='color:red;'&gt;You have unsaved groups.&lt;/span&gt;";
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
document.getElementById('SPLU.GroupsStatus').innerHTML="&lt;img style='vertical-align:bottom;padding-top:5px;' src='//cf.geekdo-static.com/mbs/mb_3264_0.gif'&gt;&lt;span style='background-color:red;color:white;font-weight:bold;'&gt;Error Code: "+responseJSON.target.status+"&lt;/span&gt; Try saving again.";
}
};
xmlhttp.open("POST","/geekplay.php",true);
xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
xmlhttp.send("version=2&amp;objecttype=thing&amp;objectid=98000&amp;playid="+SPLUplayId+"&amp;action=save&amp;quantity=0&amp;comments="+fixedEncodeURIComponent(JSON.stringify(SPLUremote))+"&amp;playdate=1452-04-15&amp;B1=Save");
}

function insertGroup(group){
for(i=0;i&lt;SPLU.Groups[group].length;i++){
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
listenerForPopText("SaveGamePlayBtn","Submit and Clear All Fields");
listenerForPopText("SaveGamePlayBtnDupe","Submit but Keep Player Data Onscreen");
listenerForPopText("favoritesGoTo","Choose from your Favorites list");
listenerForPopText("favoritesAddToList","Add to Favorites");
listenerForPopText("expansionLoggingButton","Log an expansion");
listenerForPopText("ResetSettingsOption","Check these items to clear their values when you press &lt;b&gt;Submit &amp; Duplicate&lt;/b&gt;");
listenerForPopText("SPLU.DateFieldReset","Date will also reset when clicking &lt;b&gt;Submit&lt;/b&gt;");
listenerForPopText("hideSettingsButton","Shut this Drawer");
listenerForPopText("hideExpansionsButton","Shut this Drawer");
listenerForPopText("hideFavsButton","Shut this Drawer");
listenerForPopText("SPLU.SettingsReset","Reset all settings to default.  Close and re-open SPLU after clicking this.");
listenerForPopText("showPlayersPaneBtn","Edit All Players");
listenerForPopText("showLocationsPaneBtn","Edit All Locations");
listenerForPopText("SPLU.SaveLocationButton","Save This Location");
listenerForPopText("BRplaysBtn","View/Edit Play History")
listenerForPopText("ResetFormBtn","Clear All Fields")
listenerForPopText("DeleteGamePlayBtn","Delete this Play")

var observer=new MutationObserver(function(){
if(document.getElementById('selimage0').innerHTML.slice(0,4)=="&lt;div"){
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
