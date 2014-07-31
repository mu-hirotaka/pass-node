$(function() {
  var FADE_TIME = 150;
  var TYPING_TIMER_LENGTH = 400;
  var COLORS = [ '#e21400', '#91580f', '#f8a700', '#f78b00' ];
  var $window = $(window);
  var $usernameInput = $('.usernameInput');
  var $messages = $('.messages');
  var $inputMessage = $('.inputMessage');

  var $loginPage = $('.login.page');
  var $chatPage = $('.chat.page');
  var $passButton = $('.pass-button');

  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

//  var socket = io.connect('http://localhost:3000');
  var socket = io();

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there're" + data.numUsers + " participants";
    }
    log(message);
  }

  function setUsername () {
    username = cleanInput($usernameInput.val().trim());
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      socket.emit('add user', username);
    }
  }

  function sendMessage () {
    var message = $inputMessage.val();
    message = cleanInput(message);
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      socket.emit('new message', message);
    }
  }

  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  function addChatMessage (data, options) {
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>').text(data.username).css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">').text(data.message);
    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>').data('username', data.username).addClass(typingClass).append($usernameDiv, $messageBodyDiv);
    addMessageElement($messageDiv, options);
  }

  function addMessageElement (el, options) {
    var $el = $(el);
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    }
    else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  function cleanInput (input) {
    return $('<div\>').text(input).text();
  }

  function updateTyping () {
    if (connected) {

    }
  }

  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  function getUsernameColor (username) {
    var hash = 7;
    for (var i=0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  $window.keydown(function (event) {
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on('input', function () {
    updateTyping();
  });

  $loginPage.click(function () {
    $currentInput.focus();
  });

  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  $passButton.on('click', function () {
      addChatMessage({
        username: username,
        message: 'pass'
      });
      socket.emit('pass', 'pass');
      $passButton.attr("disabled", "disabled");
  });

  socket.on('login', function (data) {
    connected = true;
    $('.sc-position').text(data.position);
    $('.sc-point').text(data.point);
    $('.boss-hp-value').text(data.bossHp);
    addParticipantsMessage(data);
  });

  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  socket.on('pass', function (data) {
    addChatMessage(data);
    $passButton.removeAttr("disabled");
  });

  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);
  });

  socket.on('point up', function (data) {
    $('.sc-point').text(data.point);
  });
 
  socket.on('boss damaged', function (data) {
    $('.boss-hp-value').text(data.after);
    $('.boss-hp').animate({width: data.width}, 800);
  });
 
});
