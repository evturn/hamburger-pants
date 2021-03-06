
$(document).ready(function() {
  var mainController = new MainController();
  mainController.init();
});


var MainController = function() {

	var self = this;


  //These allows us to bind and trigger on the object from anywhere in the app.
	self.appEventBus = _.extend({}, Backbone.Events);
	self.viewEventBus = _.extend({}, Backbone.Events);

	self.init = function() {
		// creates ChatClient from socketclient.js, passes in 
		// appEventBus as vent, connects
		self.chatClient = new ChatClient({ vent: self.appEventBus });
		self.chatClient.connect();

    // loginModel
		self.loginModel = new LoginModel();

    // The ContainerModel gets passed a viewState, LoginView, which
    // is the login page. That LoginView gets passed the viewEventBus
    // and the LoginModel.
		self.containerModel = new ContainerModel({ viewState: new LoginView({vent: self.viewEventBus, model: self.loginModel})});

		// next, a new ContainerView is intialized with the newly created containerModel
		// the login page is then rendered.
		self.containerView = new ContainerView({ model: self.containerModel });
		self.containerView.render();
	};



  ////////////  Busses ////////////
    // These Busses listen to the socketclient
   //    ---------------------------------


  //// viewEventBus Listeners /////
  
	self.viewEventBus.on("login", function(username) {
    // socketio login, sends name to socketclient, socketclient sends it to chatserver
    self.chatClient.login(username);
  });
	self.viewEventBus.on("chat", function(chat) {
    // socketio chat, sends chat to socketclient, socketclient to chatserver
    self.chatClient.chat(chat);
  });
  self.viewEventBus.on("typing", function() {
    self.chatClient.updateTyping();
  });


  //// appEventBus Listeners ////

  // after the 'welcome' event triggers on the sockeclient, the loginDone event triggers.
	self.appEventBus.on("loginDone", function() {

		// new model and view created for chatroom
		self.chatroomModel = new ChatroomModel();
		self.chatroomView  = new ChatroomView({vent: self.viewEventBus, model: self.chatroomModel });

		// viewstate is changed to chatroom after login.
		self.containerModel.set("viewState", self.chatroomView);
    autosize($('textarea.message-input'));
		$('.chatbox-content')[0].scrollTop = $('.chatbox-content')[0].scrollHeight;
	});

  // error listeners
	self.appEventBus.on("loginNameBad", function(username) {
		self.loginModel.set("error", "Invalid Name");
	});
	self.appEventBus.on("loginNameExists", function(username) {
		self.loginModel.set("error", "Name already exists");
	});


  // after 'onlineUsers' event emits, the 'usersInfo' event triggers
	self.appEventBus.on("usersInfo", function(data) {

    //data is an array of usernames, including the new user

		// This method gets the online users collection from chatroomModel.
		// onlineUsers is the collection
		var onlineUsers = self.chatroomModel.get("onlineUsers");

   // users is array of the current user models
		var users = _.map(data, function(item) {
			return new UserModel({username: item});
		});

    // this resets the collection with the updated array of users
		onlineUsers.reset(users);
	});

  // adds new user to users collection, sends default joining message
	self.appEventBus.on("userJoined", function(username) {
		self.chatroomModel.addUser(username);
		self.chatroomModel.addChat({sender: "Mayor McCheese", message: username + " joined room." });
	});

	// removes user from users collection, sends default leaving message
	self.appEventBus.on("userLeft", function(username) {
		self.chatroomModel.removeUser(username);
		self.chatroomModel.addChat({sender: "Grimace", message: username + " left room." });
	});

	// chat passed from socketclient, adds a new chat message using chatroomModel method
	self.appEventBus.on("chatReceived", function(chat) {
		self.chatroomModel.addChat(chat);
		$('.chatbox-content')[0].scrollTop = $('.chatbox-content')[0].scrollHeight;
	});
};






// var thomJones =
// 		{
// 			name: 'Thom Jones',
// 			avatar: 'assets/img/thom-jones.jpg',
// 			id: 1
// 		};
// var tomJones = 
// 		{
// 			name: 'Tom Jones',
// 			avatar: 'assets/img/tom-jones.jpg',
// 			id: 2
// 		};
// var ev = 
// 		{
// 			name: 'Evan Turner',
// 			avatar: 'http://evturn.com/assets/img/ev-winter-yellow.jpg',
// 			id: 3
// 		};

// var convo1 = new Conversation({				
// 					users: [tomJones, thomJones],
// 					messages:	[
// 							{
// 								timestamp: new Date(),
// 								content: 'Craig, it\'s important. I just spilled salsa all over my filas.',
// 								sender: tomJones
// 							},
// 							{
// 								timestamp: new Date(),
// 								content: 'I\m not Craig!',
// 								sender: thomJones
// 							},
// 							{
// 								timestamp: new Date(),
// 								content: 'Fuck the hell off!',
// 								sender: thomJones
// 							}
// 						]
// 					});
// var convo2 = new Conversation({
// 				users: [tomJones, thomJones],			
// 				messages:	[
// 						{
// 							timestamp: new Date(),
// 							content: 'Craig, it\'s important. I just spilled salsa all over my filas.',
// 							sender: tomJones
// 						},
// 						{
// 							timestamp: new Date(),
// 							content: 'I\m not Craig!',
// 							sender: thomJones
// 						},
// 						{
// 							timestamp: new Date(),
// 							content: 'Just ate a bisquit',
// 							sender: tomJones
// 						}
// 					]
// 				});
// var convo3 = new Conversation({
// 				users: [ev, thomJones],
// 				messages:	[
// 						{
// 							timestamp: new Date(),
// 							content: 'Craig, it\'s important. I just spilled salsa all over my filas.',
// 							sender: tomJones
// 						},
// 						{
// 							timestamp: new Date(),
// 							content: 'I\m not Craig!',
// 							sender: thomJones
// 						},
// 						{
// 							timestamp: new Date(),
// 							content: 'Please leave my wife in this',
// 							sender: ev
// 						}
// 					]});

// var u2 = new User(thomJones);

// var u1 = new User({
// 			name: 'Tom Jones',
// 			avatar: 'http://a5.files.biography.com/image/upload/c_fill,cs_srgb,dpr_1.0,g_face,h_300,q_80,w_300/MTE1ODA0OTcyMDA1Njg4ODQ1.jpg',
// 			inbox: 
// 				[
// 					convo1,
// 					convo2,
// 					convo3
// 				],	
// 			id: 1
// 		});


// new WOW(
//     { offset: 120 }
// ).init();


// new Chatbox();
