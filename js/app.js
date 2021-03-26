	let errors=false;
	let indice=0;
	let jsonarr;
	let arrarchivos;
	let rescomp;
	let stringtab;
	let respzip;
	let agreebit;

	if (window.localStorage){
		if (window.localStorage.getItem('imagenes') !== undefined && window.localStorage.getItem('imagenes')){
			rescomp=localStorage.getItem("imagenes");
			jsonarr=localStorage.getItem("imagenes");
		}
		if (window.localStorage.getItem('indice') !== undefined && window.localStorage.getItem('indice')){
			indice=localStorage.getItem("indice");
		}
	}
	function dibujarTabla(json){
		let tablestr="";
		let rutafinal="";
		let imgs;
		
		imgs=json;
		if(imgs[0]=='' || imgs[0]==undefined){
			console.log("NO DEFINIDO");
		}
		else{
			try{
				let jsonfin=JSON.parse(json);
				let lim=jsonfin[0].imagen.length;
				for(i=0;i<lim;i++){
					let peso2num=Number(parseFloat(jsonfin[0].imagen[i].pesoo)/1000)
					let peso_orig=peso2num.toFixed(2);
					let pesof2num=Number(parseFloat(jsonfin[0].imagen[i].pesof)/1000)
					let pesof_orig=pesof2num.toFixed(2);
					//Dibujar la tabla
					tablestr+="<tr>";
					tablestr+="<td class='has-text-centered'>";
						tablestr+=jsonfin[0].imagen[i].nombre;
					tablestr+="</td>";
					tablestr+="<td class='has-text-centered'>";
						tablestr+=peso_orig;
					tablestr+="</td>";
					tablestr+="<td class='has-text-centered'>";
						tablestr+=pesof_orig;
					tablestr+="</td>";
					tablestr+="<td class='has-text-centered'>";
					tablestr+='<progress class="progress is-primary" value=\"' + jsonfin[0].imagen[i].porcent + '\" max="100">' + jsonfin[0].imagen[i].porcent;
					tablestr+='%</progress>';
					tablestr+="</td>";
					tablestr+="<td class='has-text-centered'>";
					tablestr+='<a download href="' + location.href + "api/" + jsonfin[0].imagen[i].rutao + '"><input class="button is-primary" type="submit" value="Download"></a>';
					tablestr+="</td>";
					tablestr+="</tr>";
				}
				return tablestr;
			}
			catch(err){
				console.log(err);
			}
		}
	}

	try{
		stringtab=dibujarTabla(rescomp);
		console.log(stringtab);
		if(stringtab){
			g("#cuerpotabla").html(stringtab);
		}
	}
	catch(err){
		console.log(err);
	}
	var typed = new Typed('#subtanim', {
	  // Waits 1000ms after typing "First"
	  strings: ['First ^1000 sentence.', "Don't waste time and try it!" ],
	  typeSpeed: 70,
	});

	jsonarr=[
		{
			index:0,
			imagen:[]
		}
	];
	// "myAwesomeDropzone" is the camelized version of the HTML element's ID
	Dropzone.options.myAwesomeDropzone = {
	  paramName: "file", // The name that will be used to transfer the file
	  maxFilesize: 50, // MB
	  renameFile: function(file) {
	    let name = new Date().getTime();//or any other name you want to append with the filename
		let aux;
		let namef;
		let randomness = name * 27;
		aux=file.name;
		namef = "FILE-" + randomness + "-" + aux;
		file['customname']=namef;
		console.log("CUSTOM NAME");
		console.log(namef);
		return file.name = namef;
	  },
	  accept: function(file, done) {
		if (file.name == "justinbieber.jpg") {
		  done("Naha, you don't.");
		}
		else { done(); }
	  },
	  init: function() {
		this.on("error", function(msg){
			console.log(msg);
		});
		this.on("canceled", function(msg){
			console.log("CANCELED " + msg);
		});
		this.on("success", function(msg){
			console.log(msg);
			let rutao="./uploads/" + msg.customname;
			let rutaf="./uploadsresized/" + msg.customname;
			if (window.localStorage){
				if (window.localStorage.getItem('imagenes') !== undefined && window.localStorage.getItem('imagenes')){
					arrarchivos=localStorage.getItem("imagenes");
				    localStorage.removeItem('imagenes');
					localStorage.removeItem('indice');
				}
				if (window.localStorage.getItem('indice') !== undefined && window.localStorage.getItem('indice')){
					indice=localStorage.getItem("indice");
				}
				else{
					localStorage.setItem("indice",indice);
				}
				let aux={
				 'nombre':msg.customname,
				 'rutao':rutao,
				 'rutaf':rutaf,
				 'tipo':msg.type,
				 'aceptado':msg.accepted,
				 'uuid':msg.upload.uuid,
				 'pesof':'',
				 'pesoo':'',
				 'porcent':''
				};
				jsonarr[0].imagen.push(aux);
				indice++;
				localStorage.setItem("indice",indice);
				localStorage.setItem("imagenes",JSON.stringify(jsonarr));
				z=localStorage.getItem("imagenes");
				incimg=localStorage.getItem("indice");
				axios.post('http://localhost:3000/updatetable', {
					imagenes: JSON.stringify(jsonarr)
				})
				.then(function (response) {
					rescomp=response.data;
					localStorage.setItem("imagenes",JSON.stringify(rescomp));
					try{
						stringtab=dibujarTabla(JSON.stringify(rescomp));
						g("#cuerpotabla").html(stringtab);
					}
					catch(err){
						console.log(err);
					}
				})
				.catch(function (error) {
					console.log(error);
				});
			}
		});
		this.on("error", function(file, errorMessage) {
			errors = true;
		});
		this.on("queuecomplete", function() {
			if(errors){
				alert("There were errors!");
			}
			else{
				console.log("We're done!");
			}
		});
	  }
	};

	//GENERAL.JS CODING
	//dibujar la tabla con general.js / manejo de DOM. Obtener JSON y vaciarlo en la tabla
	genrl.docready(function(){
		if (window.localStorage){
			agreebit=localStorage.getItem("iagree");
			console.log(agreebit);
			if(agreebit!=undefined){
				if(agreebit!='yes'){
					g("#cookiescns").show();
				}
				else{
					g("#cookiescns").hide();
				}
			}
			else{
				g("#cookiescns").show();
			}
		}
		g("#eraselistbtn").click(function(){
			genrl.log("Haz hecho clic en Erase");
			localStorage.removeItem('imagenes');
			localStorage.removeItem('indice');
			g("#cuerpotabla").html("");
			jsonarr=[
				{
					index:0,
					imagen:[]
				}
			]
		});
		g("#downloadzipbtn").click(function(){
			genrl.log("Haz hecho clic en Zip");
			axios.post('http://localhost:3000/zipimages', {
				imagenes: localStorage.getItem('imagenes'),
			})
			.then(function (response) {
				respzip=response.data.file;
				location.replace(location.href + "api" + respzip);
				console.log(respzip);
			})
			.catch(function (error) {
				console.log(error);
			});
		});

		g("#agreebtn").click(function(){
			if (window.localStorage){
				agreebit=localStorage.getItem("iagree");
				console.log(agreebit);
				if(agreebit!=undefined){
					localStorage.removeItem("iagree");
				}
				localStorage.setItem("iagree","yes");
				g("#cookiescns").hide();
			}
		});

		g("#closecnsbtn").click(function(){
			if (window.localStorage){
				agreebit=localStorage.getItem("iagree");
				console.log(agreebit);
				if(agreebit!='yes' || agreebit==null || agreebit==undefined){
					localStorage.setItem("iagree","yes");
					g("#cookiescns").hide();
				}
			}
		});
	});
