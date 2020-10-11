
const apiKeyList = ["AIzaSyAKkNJJh2kbSgl31RObQuuEaS_6oRzT30Q", "AIzaSyAvPUsjjqCxjx9ZlIZh-EcdiBAFbJOeoO0", "AIzaSyB56E3cgBh0TMpNi5WQJT9AMFtChFIeEIo"];
var apiKey = apiKeyList[0];
var listVid = [];
var listVideo;
var player;

var bg = document.getElementsByClassName('bg')[0];
var musicPlayer = document.getElementsByClassName('player')[0];
var prev = document.getElementsByClassName('btn-prev')[0];
var next = document.getElementsByClassName('btn-next')[0];
var repeat = document.getElementsByClassName('btn-repeat')[0];
var form = document.getElementsByClassName('form')[0];
var newPlaylistId = document.getElementsByClassName('input')[0];
var ok = document.getElementsByClassName('ok')[0];
var body = document.getElementsByTagName('body')[0];

var tag = document.createElement('script');
var btn = document.getElementById('btn');
var btn2 = document.getElementById('btn2');
var icon = document.getElementById('icon');
var icon2 = document.getElementById('icon2');
var para = document.getElementById('title');

var progressBar = document.getElementById('progress-bar')
var currentTime = document.getElementById('current-time');
var duration = document.getElementById('duration');

var rand, time_update_interval;
var repeatStatus = 0;

//Request Playlist Item
const getPlayListItems = async playlistID => {
	var token;
	var resultArr = [];
    const result = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
      params: {
        part: 'id,snippet',
        maxResults: 50,
        playlistId: playlistID,
        key: apiKey
      }
    })
    //Get NextPage Token
	token = result.data.nextPageToken;
	resultArr.push(result.data);
	while (token) {
		let result = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
      	params: {
        part: 'id,snippet',
        maxResults: 50,
        playlistId: playlistID,
        key: apiKey,
		pageToken: token
      	}
    	})
		token = result.data.nextPageToken;
		resultArr.push(result.data);
	}	
	return resultArr;
};

//Get Title video and videoId 
getPlayListItems("PLWZvGxtWFBkjehOm4MkAuUpe-cfmstdPH")
.then(data => {
	data.forEach(item => {
    	item.items.forEach(i => listVid.push({title: i.snippet.title, idVid: i.snippet.resourceId.videoId}));
	});
	//create random index
    rand = Math.floor(Math.random()*listVid.length);
    checkPrivate();
    tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})
.catch(err => {
	changeAPIKey(apiKeyList[1], err);
});


function changeAPIKey(newKey, err) {
	if (err.response.data.error.errors[0].reason == "dailyLimitExceeded") {
		apiKey = newKey;
		getPlayListItems("PLWZvGxtWFBkjehOm4MkAuUpe-cfmstdPH")
		.then(data => {
			data.forEach(item => {
	    	item.items.forEach(i => listVid.push({title: i.snippet.title, idVid: i.snippet.resourceId.videoId}));
			
			rand = Math.floor(Math.random()*listVid.length);
		    checkPrivate();
		    tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		});
		})
		.catch(err => {
			changeAPIKey(apiKeyList[2], err);
		});

		
	}
}


function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
	  height: '0',
	  width: '0',
	  videoId: listVid[rand].idVid,
	  events: {
	    'onReady': this.onPlayerReady.bind(this),
	    'onStateChange': onPlayerStateChange
	  }
	});
}

function onPlayerReady(event) {
	player.setPlaybackQuality("small");
	btn.style.display = "block";
	prev.style.display = "block";
	next.style.display = "block";
	btn2.style.display = "block";
	repeat.style.display = "block";
	form.style.display = "flex";
	para.innerHTML = listVid[rand].title;
	playButton(player.getPlayerState() !== 5);

	// Update the controls on load
	this.updateTimerDisplay();
	this.updateProgressBar();

	// Clear any old interval.
	clearInterval(time_update_interval);

	// Start interval to update elapsed time display and
	// the elapsed part of the progress bar every second.
	var time_update_interval = setInterval(() => {
		this.updateTimerDisplay();
		this.updateProgressBar();
	}, 1000);
}

//On click button
btn.onclick = changeStatusPlay;
prev.onclick = prevSong;
next.onclick = nextSong;
repeat.onclick = repeatVideo;
ok.onclick = changePlaylistId;

function playButton(play) {
	icon.src = play ? "icons/pause.svg" : "icons/play.svg";
}

function changeStatusPlay() {
	if (player.getPlayerState() == 1 || player.getPlayerState() == 3) {
		pauseVideo();
		playButton(false);
	} else if (player.getPlayerState() != 0) {
		playVideo();
    	playButton(true);
	} 
}

function onPlayerStateChange(event) {
    if (event.data === 0) {
    	playButton(false); 
    }
}

function playVideo() {
	player.playVideo();
}

function pauseVideo() {
	player.pauseVideo();
}

function stopVideo() {
	player.stopVideo();
}

//previous song
function prevSong() {
	if (repeatStatus == 1) {
		repeat.style.opacity = "0.3";
		repeatStatus = 0;
	}
	playButton(false);
	stopVideo();
	if (rand - 1 < 0) {
		rand = listVid.length - 1;
	} else {
		rand -= 1;
	}
	checkPrivateBack();
	player.loadVideoById({videoId:listVid[rand].idVid});
	para.innerHTML = listVid[rand].title;
	playButton(true);			
}

//next song
function nextSong() {
	if (repeatStatus == 1) {
		repeat.style.opacity = "0.3";
		repeatStatus = 0;
	}
	playButton(false);
	stopVideo();
	if (rand + 1 == listVid.length) {
		rand = 0;
	} else {
		rand += 1;
	}
	checkPrivate();
	player.loadVideoById({videoId:listVid[rand].idVid});
	para.innerHTML = listVid[rand].title;
	playButton(true);

}

// on Song end
function nextVideo() {
	if (repeatStatus == 1) {
		player.loadVideoById({videoId:listVid[rand].idVid});
	} else {
		rand = Math.round(Math.random()*listVid.length);
		checkPrivate();
		player.loadVideoById({videoId:listVid[rand].idVid});
		para.innerHTML = listVid[rand].title;
	}
	
}

//Repeat
function repeatVideo () {
	if (repeatStatus == 0) {
        //repeat.style.opacity = "0.8";
        //document.getElementById('btn-repeat').innerHTML = 'repeat';
        document.getElementById('btn-repeat').src = './icons/repeat.svg'
        document.getElementById('btn-repeat').title = 'Lặp lại: bật'
		repeatStatus = 1;
	} else {
        //repeat.style.opacity = "0.3";
        //document.getElementById('btn-repeat').innerHTML = 'no repeat';
        document.getElementById('btn-repeat').src = './icons/norepeat.svg'
        document.getElementById('btn-repeat').title = 'Lặp lại: tắt'
        repeatStatus = 0;
	}
}

//Check private or deleted video
function checkPrivate() {
	if (listVid[rand].title == "Private video" || listVid[rand].title == "Deleted video") {
		if (rand == listVid.length - 1) {
			rand = 0;
		} else {
			rand += 1;
		}
		checkPrivate();
	}
};

function checkPrivateBack() {
	if (listVid[rand].title == "Private video" || listVid[rand].title == "Deleted video") {
		if (rand == 0) {
			rand = listVid.length - 1;
		} else {
			rand -= 1;
		}		
		checkPrivateBack();
	}
};

//on New Playlist
function changePlaylistId () {
	var newId = newPlaylistId.value;
	if (newId == "") {
		return;
	}

	listVid = [];
	btn.style.display = "none";
	prev.style.display = "none";
	next.style.display = "none";
	btn2.style.display = "none";
	repeat.style.display = "none";
	para.innerHTML = "Loading...";

	getPlayListItems(newId)
	.then(data => {
		data.forEach(item => {
	    	item.items.forEach(i => listVid.push({title: i.snippet.title, idVid: i.snippet.resourceId.videoId}));
		});
	    rand = Math.floor(Math.random()*listVid.length);
	    checkPrivate();
	    btn.style.display = "block";
		prev.style.display = "block";
		next.style.display = "block";
		btn2.style.display = "block";
		repeat.style.display = "block";
		para.innerHTML = listVid[rand].title;			    
		player.loadVideoById({videoId:listVid[rand].idVid});
		playButton(true);
	});	

}

//Check song end
setInterval(function() {
	if (player.getPlayerState() == 0) {
		nextVideo();
		playButton(true);
		this.progressBar.value = 0;
	}
}, 3000);


this.progressBar.on('mouseup touchend', function (e) {

    // Calculate the new time for the video.
    // new time in seconds = total duration in seconds * ( value of range input / 100 )
    var newTime = this.player.getDuration() * (e.target.value / 100);

    // Skip video to new time.
    player.seekTo(newTime);

});

function updateProgressBar()
{
	this.progressBar.value  = (this.player.getCurrentTime() / this.player.getDuration()) * 100;
}

function updateTimerDisplay() {
	this.currentTime.innerHTML = this.formatTime(this.player.getCurrentTime());
	this.duration.innerHTML = this.formatTime(this.player.getDuration());
}

function formatTime(time)
{
	time = Math.round(time);
	let minutes = Math.floor(time / 60);
	let seconds = time - minutes * 60;

	seconds = seconds < 10 ? '0' + seconds : seconds;

	return minutes + ":" + seconds;
}