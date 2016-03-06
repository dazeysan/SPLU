  function showFavoritesEdit(id){
    SPLUfavoritesPlayers=[];
    SPLUfavoritesEditing=id;
    document.getElementById('SPLU.FavoritesList').style.display="none";
    editDiv=document.getElementById('SPLU.FavoritesEdit');
    editDiv.style.display="";
    document.getElementById('SPLUfavoritesEditTitle').value=SPLU.Favorites[id].title;
    document.getElementById('SPLUfavoritesEditIcon').value=SPLU.Favorites[id].thumbnail;
    var select=document.getElementById('SPLUfavoritesEditLocation');
    select.options.length=0;
    if(SPLU.Favorites[id].location===undefined){
      SPLU.Favorites[id].location=-2;
      select.options[0]=new Option("-no change-", "-2", true, true);
    }else{
      select.options[0]=new Option("-no change-", "-2", true, false);
    }
    if(SPLU.Favorites[id].location==-1){
      select.options[1]=new Option("-blank-", "-1", true, true);
    }else{
      select.options[1]=new Option("-blank-", "-1", true, false);
    }
    i=2;
    for(key in SPLU.Locations){
      if(key==SPLU.Favorites[id].location){
        select.options[i]=new Option(decodeURIComponent(SPLU.Locations[key].Name), key, true, true);
      }else{
        select.options[i]=new Option(decodeURIComponent(SPLU.Locations[key].Name), key, true, false);
      }
      i++;
    }
    var select=document.getElementById('SPLUfavoritesEditPlayers');
    select.options.length=0;
    select.options[0]=new Option("Add Player", "0", false, true);
    i=1;
    for(key in SPLU.Players){
      select.options[i]=new Option(decodeURIComponent(SPLU.Players[key].Name), key, true, false);
      i++;
    }
    document.getElementById('SPLUfavoritesEditPlayersList').innerHTML="";
    if(SPLU.Favorites[id].players!==undefined){
      for(p=0;p<SPLU.Favorites[id].players.length;p++){
        addPlayerToFavorite(SPLU.Favorites[id].players[p]);
      }
    }
  }

    function saveFavoriteEdits(){
    tmpFav=SPLU.Favorites[SPLUfavoritesEditing];
    tmpFav.title=document.getElementById('SPLUfavoritesEditTitle').value;
    tmpFav.thumbnail=document.getElementById('SPLUfavoritesEditIcon').value;
    if(document.getElementById('SPLUfavoritesEditLocation').value==-2 && tmpFav.location!==undefined){
      delete tmpFav.location;
    }else{
      tmpFav.location=document.getElementById('SPLUfavoritesEditLocation').value;
    }
    for(var i=SPLUfavoritesPlayers.length-1;i>=0;i--){
      if(SPLUfavoritesPlayers[i]==-1) {
          SPLUfavoritesPlayers.splice(i, 1);
      }
    }
    if(SPLUfavoritesPlayers.length==0){
      if(tmpFav.players!==undefined){
        delete tmpFav.location;
      }
    }else{
      tmpFav.players=SPLUfavoritesPlayers;
    }
    console.log(tmpFav);
    SPLUremote.Favorites[SPLUfavoritesEditing]=SPLU.Favorites[SPLUfavoritesEditing];
    saveSooty("SPLUfavoritesEditStatus","Thinking...","Saved",function(){
      if (document.getElementById('BRlogFavs').style.display=="table-cell") {
        showFavsPane("edit");
      }
    });
  }

          +'<div id="SPLU.FavoritesEdit" style="width:220px;display:none;">'
          +'Title: <input type="text" id="SPLUfavoritesEditTitle"/><br/>'
          +'Icon: <input type="text" id="SPLUfavoritesEditIcon"/><br/>'
          +'Location: <select id="SPLUfavoritesEditLocation"></select>'
          +'Add Player: <select id="SPLUfavoritesEditPlayers" onChange="javascript:{addPlayerToFavorite(\'choose\');}"></select>'
          +'<div id="SPLUfavoritesEditPlayersList"></div>'
          +'<div style="padding-top:10px;">'
            +'<a href="javascript:{void(0);}" onclick="javascript:{saveFavoriteEdits();}" class="SPLUbuttons" style="margin-right:6px;color:black;border:2px solid #249631">Save</a>'
            +'<a href="javascript:{void(0);}" onclick="javascript:{document.getElementById(\"SPLU.FavoritesEdit\").style.display=\"none\";document.getElementById(\"SPLU.FavoritesList\").style.display="";}" class="SPLUbuttons" style="margin-right:6px;color:black; border:2px solid #249631">Cancel</a>'
            +'<a href="javascript:{void(0);}" onclick="javascript:{deleteFavorite(\'edit\');}" class="SPLUbuttons" style="margin-right:6px;color:black;border:2px solid #249631">Delete</a>'
          +'</div>'
          +'<div id="SPLUfavoritesEditStatus" style="display:inline;padding-left:5px;"></div>'
        +'</div>';

        
        
  function addPlayerToFavorite(id){
    tmpPlayer="";
    select=document.getElementById('SPLUfavoritesEditPlayers');
    if(id=="choose"){
      tmpPlayer=decodeURIComponent(SPLU.Players[select.value].Name);
      id=select.value;
    }else{
      tmpPlayer=decodeURIComponent(SPLU.Players[id].Name);
    }
    tmpDiv=document.createElement('div');
    tmpHTML='<div>'
      +'<a href="javascript:{void(0);}" onclick="javascript:{this.parentNode.parentNode.removeChild(this.parentNode);SPLUfavoritesPlayers['+SPLUfavoritesPlayers.length+']=\'-1\';}" style="margin:2px;"><img src="https://raw.githubusercontent.com/dazeysan/SPLU/master/Images/delete_row_small.png"></a>'
      +tmpPlayer;
      +'</div>';
    tmpDiv.innerHTML+=tmpHTML;
    document.getElementById('SPLUfavoritesEditPlayersList').appendChild(tmpDiv);
    SPLUfavoritesPlayers.push(id);
    select.selectedIndex=0;
  }
  
