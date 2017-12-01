
console.log("Injected");
if (window.location.origin == "https://music.yandex.ru") {
	var ws = new WebSocket("ws://127.0.0.1:8080/ws");
	var qr_url = "http://127.0.0.1:8080/qr/?session_id=";
	var session_id = null;
	ws.onopen = function() {
	   ws.send(JSON.stringify({action: 'register'}));
	};
	ws.onmessage = function (evt) {
		console.log(evt.data);
		msg = JSON.parse(evt.data);;
		switch (msg['action']) {
			case 'play_pause':
				document.getElementsByClassName('player-controls__btn player-controls__btn_play')[0].click();
				var track_container = document.getElementsByClassName('player-controls__track-container')[0];
				var track_name = track_container.getElementsByClassName('link')[0].innerText + ' - ' + track_container.getElementsByClassName('link')[1].innerText;
				ws.send(JSON.stringify({action: 'track_name_change', track_name: track_name}));
				break;
			case 'prev':
				document.getElementsByClassName('player-controls__btn player-controls__btn_prev')[0].click();
				play_status();
				break;
			case 'next':
				document.getElementsByClassName('player-controls__btn player-controls__btn_next')[0].click();
				play_status();
				break;
			case 'registered':
				var sidebar = document.getElementsByClassName('sidebar')[0];
				sidebar.innerHTML = '<img src="' + qr_url + msg['session_id'] + '" alt="Отскань телефоном" style="width: 100%;">';
				break;
			case 'get_current_state':
				var track_container = document.getElementsByClassName('player-controls__track-container')[0];
				var track_name = track_container.getElementsByClassName('link')[0].innerText + ' - ' + track_container.getElementsByClassName('link')[1].innerText;
				ws.send(JSON.stringify({action: 'track_name_change', track_name: track_name}));
				play_status();
				break;
			default:
				console.log(msg['action']);
		}
	};
	ws.onclose = function(){
		var sidebar = document.getElementsByClassName('sidebar')[0];
		sidebar.innerHTML = '<div class="typo-caps" style="text-align: center">Соединение потеряно</div>';
		alert("Соединение потеряно")
	};

	var track_container = document.getElementsByClassName('player-controls__track-container')[0];
	track_container.addEventListener("DOMNodeInserted", function (event) {
		console.log('track_name_change')
	  var track_name = track_container.getElementsByClassName('link')[0].innerText + ' - ' + track_container.getElementsByClassName('link')[1].innerText;
	  ws.send(JSON.stringify({action: 'track_name_change', track_name: track_name}));
	}, false);

	var play_status = function(){
		if (document.getElementsByClassName('player-controls__btn player-controls__btn_play')[0].classList.contains('player-controls__btn_pause')) {
			ws.send(JSON.stringify({action: 'play_started'}));
		}else{
			ws.send(JSON.stringify({action: 'play_paused'}));
		}
	};

	var button_play_pause = document.getElementsByClassName('player-controls__btn player-controls__btn_play')[0];

	button_play_pause.onclick = play_status;

	var progress_bar = document.getElementsByClassName('progress__bar progress__text')[0];
	progress_bar.addEventListener("DOMNodeInserted", function (event) {
		var percents = document.getElementsByClassName('progress__bar progress__progress')[0].getElementsByClassName('progress__line')[0].style.width;
		var time_left = progress_bar.getElementsByClassName('progress__left')[0].innerText;
		var time_right = progress_bar.getElementsByClassName('progress__right')[0].innerText;
		ws.send(JSON.stringify({action: 'progress_change', progress_bar_width: percents, track_length: time_right, track_time_left: time_left}));
	}, false);
}else{
	alert('Работает только на яндекс музыке!')
}