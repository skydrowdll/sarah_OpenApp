var ScribeSpeak;
var token;
var TIME_ELAPSED;
var FULL_RECO;
var PARTIAL_RECO;
var AppToOpen = __dirname + '/OpenApp.json';
var AppToClose = __dirname + '/CloseApp.json';
var APP=[];
var PROCESUS=[];
var fichierLauncher = __dirname + '/bin/launcher.bat';
var fichierCloser = __dirname + '/bin/closer.bat';

exports.action = function(data, callback, config, SARAH){

	readApp();
	readProcesus();
	
	maConfig = config.modules.OpenApp;
	ScribeSpeak = SARAH.ScribeSpeak;
	
	FULL_RECO = SARAH.context.scribe.FULL_RECO;
	PARTIAL_RECO = SARAH.context.scribe.PARTIAL_RECO;
	TIME_ELAPSED = SARAH.context.scribe.TIME_ELAPSED;
	SARAH.context.scribe.activePlugin('Open App');
	var util = require('util');
	SARAH.context.scribe.hook = function(event) {
		checkScribe(event, data.action, SARAH, callback); 
	};
	
	token = setTimeout(function(){
		SARAH.context.scribe.hook("TIME_ELAPSED");
	},maConfig.timeout_msec);

}


function readApp() {
	var fs = require("fs");
	APP = [];
	fs.readFileSync(AppToOpen).toString().split('\n').forEach(function (line) { 
		line = line.toString().trim().replace(/[\n\r\t]/g, '');
		if (line!='') APP.push(line);
	});
}
function readProcesus() {
	var fs = require("fs");

	PROCESUS = [];
	fs.readFileSync(AppToClose).toString().split('\n').forEach(function (line) { 
		line = line.toString().trim().replace(/[\n\r\t]/g, '');
		if (line!='') PROCESUS.push(line);
	});
}

function checkScribe(event, action, SARAH, callback) {
	if (event==FULL_RECO) {
		clearTimeout(token);
		SARAH.context.scribe.hook = undefined;
		decodeScribe(SARAH.context.scribe.lastReco, action, SARAH, callback);
	} else if (event==TIME_ELAPSED) {
		SARAH.context.scribe.hook = undefined;
		if (SARAH.context.scribe.lastPartialConfidence >= 0.7 && 
			SARAH.context.scribe.compteurPartial>SARAH.context.scribe.compteur) 
			decodeScribe(SARAH.context.scribe.lastPartial, action, SARAH, callback);
		else {
			SARAH.context.scribe.activePlugin('aucun (Open App)');
			ScribeSpeak("Désolé je n'ai pas compris.", true);
			return callback();
		}
	} else {
	}
}


function decodeScribe(phrase, action, SARAH, callback) {
	console.log ("Phrase: " + phrase);
	// SCRIBE retourne toute la phrase dite par l'utilisateur
	
	var rgxp = /.* démarre (.+)|.* termine (.+)/i;

	// on s'assure que Google a bien compris
	var match = phrase.match(rgxp);
	//console.log("MATCH: " + match);
	if (!match || match.length <= 1){
		SARAH.context.scribe.activePlugin('aucun (Open App)');
		ScribeSpeak("Désolé je n'ai pas compris.", true);
		return callback();
	}
	
	// on peut maintenant s'occuper des mots qui sont recherchés
	if (typeof match[1] !== 'undefined') search = match[1].toLowerCase();
	else if (typeof match[2] !== 'undefined') search = match[2].toLowerCase();
	else search = match[4].toLowerCase();			// supprimer|retirer|enlever = 3e

	search = search.trim().toLowerCase();;
	
	var finded = false;

	if (action=="read") {
		console.log("application à démarrer: "+search);
	//	console.log("READING JSON FOR THE WORD: " + search);
		

		var rp = /\\/g
		var rp2 = /</g

		for (i=0;i<APP.length;i++) {
			try{
				var json = APP[i];
				json = json.replace(rp,"<");
				var obj = JSON.parse(json);
				var name = obj.name.toLowerCase();
				var launch = obj.directory.toLowerCase();
				var diskus = obj.disk;
				var match = name.match(search);
				if ( match ){
					launch = launch.replace("\\"," ");
					var files = diskus+":\\"+launch;
					finded = true;
					i = APP.length;
				}
			}catch(e){
				console.log("FATAL ERROR : "+e);
				SARAH.context.scribe.activePlugin('aucun (Open App)');
				return callback();
			}
		}

		SARAH.context.scribe.activePlugin('aucun (Open App)');

		if(finded){
			ScribeSpeak("Lancement de "+search, true);
			launch = launch.replace(rp2,"\\");
			var fs = require('fs');
			var stream = fs.createWriteStream(fichierLauncher);
			stream.once('open', function(fd) {
				stream.write('start '+diskus+':\\"'+launch+'"');
				stream.end();
			});
			var exec = require('child_process').exec;
			var process = '%CD%/plugins/OpenApp/bin/launcher.bat';
			exec(process);
		}else{
			ScribeSpeak("le programme "+search+ " n'a pas été trouvé.", true);
		}
	}

	if (action=="close") {


		for (i=0;i<PROCESUS.length;i++) {
			try{
				var json = PROCESUS[i];
				
				var obj = JSON.parse(json);
				var name = obj.name.toLowerCase();
				var processus = obj.process.toLowerCase();
				
				var match = name.match(search);
				if ( match ){
					console.log("name: "+name+" processus: "+processus);
					finded = true;
					i = PROCESUS.length;
				}

			}catch(e){
				console.log("FATAL ERROR : "+e);
				SARAH.context.scribe.activePlugin('aucun (Open App)');
				return callback();
			}
		}

		SARAH.context.scribe.activePlugin('aucun (Open App)');

		if(finded){
			ScribeSpeak("Férmeture de "+search+ ".", true);
			
			var fs = require('fs');
			var stream = fs.createWriteStream(fichierCloser);
			stream.once('open', function(fd) {
				stream.write('taskkill /f /im "'+processus+'"');
				stream.end();
			});

			var exec = require('child_process').exec;
			var process = '%CD%/plugins/OpenApp/bin/closer.bat';
			exec(process);
		}else{
			ScribeSpeak("le programme "+search+ " n'a pas été trouvé.", true);
		}
		
	}

	return callback();
}


function jsonParserName(stringValue) {

   var string = JSON.stringify(stringValue);
   var objectValue = JSON.parse(string);
   return objectValue['name'];
}

