document.addEventListener("DOMContentLoaded", function(){
	var url = new URL(window.location.href);
	var ws = new WebSocket("ws://" + url.host + "/ws");

	ws.onopen = function() {
		var session_id = url.searchParams.get("session_id");
		ws.send(JSON.stringify({action: 'register', session_id: session_id}));
		ws.send(JSON.stringify({action: 'get_current_state'}));
		document.getElementById('main_content').style.display = 'block';
		document.getElementById('noconnectionalert').style.display = 'none';
	};

	ws.onmessage = function (evt) {
	   msg = JSON.parse(evt.data);
	   switch (msg['action']) {
		case 'track_name_change':
			document.getElementById('track_name').innerText = msg['track_name'];
			break;
		case 'progress_change':
			var progress_bar = document.getElementById('progress_bar');
			progress_bar.style.width = msg['progress_bar_width'];
			progress_bar.setAttribute('aria-valuenow', msg['progress_bar_width']);
			progress_bar.innerText = msg['track_time_left'];
			break;
		case 'play_paused':
			document.getElementById('icon_play').style.display = 'block';
			document.getElementById('icon_pause').style.display = 'none';
			break;
		case 'play_started':
			document.getElementById('icon_pause').style.display = 'block';
			document.getElementById('icon_play').style.display = 'none';
			break;
		default:
			console.log('unhandled action: ' + msg['action']);
		}
	};

	ws.onclose = function(){
		document.getElementById('main_content').style.display = 'none';
		document.getElementById('noconnectionalert').style.display = 'block';
	};

	document.getElementById('play_pause').onclick = function(){
		ws.send(JSON.stringify({action: 'play_pause'}));
	};

	document.getElementById('prev').onclick = function(){
		ws.send(JSON.stringify({action: 'prev'}));
	};

	document.getElementById('next').onclick = function(){
		ws.send(JSON.stringify({action: 'next'}));
	};


});