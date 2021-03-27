const Jimp = require('jimp');
var Zip = require("adm-zip");
var uuidv4 = require("uuidv4");
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminWebp = require('imagemin-webp');
const imageminPngquant = require('imagemin-pngquant');
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const fs=require("fs");
const fa=require("fs");
const filepath = "../PATH/TO/IMAGE.PNG";
const tempPath = "../PATH/TO/IMAGE_AFTER_JIMP_RESIZE.PNG";
const outputPath = "uploadsrezised";
const JIMP_QUALITY = 70;
const RESIZE_WIDTH = 600; //px
const app=express();
let sess;
/******FUNCTIONS*****/
function wait (timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, timeout);
  });
}
/******FIN FUNCTIONS*****/
// enable files upload
app.use(fileUpload({
    createParentPath: true
}));
//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
/**serves main page**/
//make uploads directory static
app.use(express.static('uploads'));
app.post("/subirarchivo", function(req, res) {
    sess=req.session;
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        }
		else {
		    let fileone = req.files.file;
		    fileone.mv('./uploads/' + fileone.name);
			let rootorigin = './uploads/' + fileone.name;
			let rootdest = './uploadsresized/';
			let rootdestfinal = './uploadsresized/' + fileone.name;
			let fmime=fileone.mimetype;
			let stats;
		    res.send({
		        status: true,
		        message: 'File is uploaded',
		        data:{
		            name: fileone.name,
		            mimetype: fileone.mimetype,
		            size: fileone.size,
					rutafinal:rootdestfinal
		        }
		    });
			if(fileone.mimetype=="image/jpeg"){
				const files = imagemin([rootorigin], {
					destination: rootdest,
					plugins: [
					  imageminJpegtran({progressive: true})
					]
				});
			}
			else if(fileone.mimetype=="image/png"){
				try{
					const files = imagemin([rootorigin], {
						destination: rootdest,
						plugins: [
						  imageminPngquant(
								{quality: [0.3,0.5]},
							)
						]
					});
				}
				catch(err){
					console.log(error + " " + rootorigin);
				}
			}
			else if(fileone.mimetype=="image/webp"){
				const files = imagemin([rootorigin], {
					destination: rootdest,
					plugins: [
					  imageminWebp({strip: true},{quality: "30-50" })
					]
				});
			}
        }
    }
	catch (err) {
		console.log(err);
        res.status(500).send(err);
    }
});

app.get("/getresized/:file/", function(req, res) {
	let data;
	const nombre=req.params.file;
	let pesof1;
	let ruta1;
	let numbersize1;
	let numberf1;
	let stats1;
	let pesof2;
	let ruta2;
	let numbersize2;
	let numberf2;
	let stats2;
	let result;
	ruta1='./uploadsresized/' + nombre;
	if(fs.existsSync(ruta1)){
		stats1 = fs.statSync(ruta1);
		numbersize1=stats1.size;
		numberf1=numbersize1;
	}
	ruta2='./uploads/' + nombre;
	if(fa.existsSync(ruta2)){
		stats2 = fa.statSync(ruta2);
		numbersize2=stats2.size;
		numberf2=numbersize2;
	}
	result=parseFloat(numberf2/numberf1);

	data=[{
		nombre:req.params.file,
		pesof: numberf2,
		pesoi: numberf1,
		porcent:result
	}];
	res.json(data);
});
app.get("/ifarchivo/:file", function(req, res) {
	//crear algoritmo para verificar si existe un arhivo en esa dirección
	const nombre=req.params.file;
	try {
		const urlfull="./uploads/" + nombre;
		if (fs.existsSync(urlfull)) {
			//file exists
			res.send({resp:"OK"})
		}
		else{
			res.send({resp:"Fail"})
		}
	}
	catch(err) {
	  console.error(err)
	}
});
app.post("/updatetable", function(req, res) {
	//crear algoritmo para verificar si existe un arhivo en esa dirección
	const imgs=req.body.imagenes;
	let jsonimgs=JSON.parse(imgs);
	let numbersize1;
	let numbersize2;
	let numberimg=0;
	let stats1;
	let stats2;
	let numberf1;
	let numberf2;
	console.log(jsonimgs[0].imagen);
	numberimg=jsonimgs[0].imagen.length;
	for(i=0;i<numberimg;i++){
		let imagen=jsonimgs[0].imagen[i];
		ruta1='./uploads/' + imagen.nombre;
		if(fs.existsSync(ruta1)){
			stats1 = fs.statSync(ruta1);
			console.log("***STATS****");
			console.log(stats1);
			numbersize1=stats1.size;
			numberf1=numbersize1;
			console.log("***STATS****");
			ruta2='./uploadsresized/' + imagen.nombre;
			if(fs.existsSync(ruta2)){
				stats2 = fs.statSync(ruta2);
				numbersize2=stats2.size;
				numberf2=numbersize2;
			}
			else{
				console.log("La Ruta no Existe");
			}
		}
		else{
			console.log("La Ruta no Existe");
		}		
		jsonimgs[0].imagen[i].pesoo=numbersize1;
		jsonimgs[0].imagen[i].pesof=numbersize2;
		jsonimgs[0].imagen[i].porcent=100 - Number(parseFloat((numbersize2*100)/numbersize1));
		/*JPEG no muestra un porcentaje de compresión del 50% según lo ajustado sino un numero arbitrario */
		console.log(jsonimgs[0].imagen[i]);
	}
	res.send(JSON.stringify(jsonimgs));
});

app.post("/rmfiles", function(req, res) {
	try{
		const dirPath='./uploadsresized/';
		const files=fs.readdirSync(dirPath);
		if (files.length > 0){
			for (var i = 0; i < files.length; i++) {
				var filePath = dirPath + '/' + files[i];
				if(fs.statSync(filePath).isFile()){
					fs.unlinkSync(filePath);
				}
				else{
					rmDir(filePath);
				}
			}
		}

		dirPath='./uploads/';
		files=fs.readdirSync(dirPath);
		if (files.length > 0){
			for (var i = 0; i < files.length; i++) {
				var filePath = dirPath + '/' + files[i];
				if(fs.statSync(filePath).isFile()){
					fs.unlinkSync(filePath);
				}
				else{
					rmDir(filePath);
				}
			}
		}

		res.send({"respuesta": "OK"}) 
	}
	catch(e){
		return e;
	}
});

app.post("/zipimages", function(req, res) {
	//get jeson stringified
	let datos=req.body;
	let jsonimgs=JSON.parse(datos.imagenes);
	let numberimg;
	let uuid_=uuidv4.uuid();
	let imagen;
	let ruta;
	var zip = new Zip();
	var pathToZip = './zipped/zipped-' + uuid_ + '.zip';
	var pathToZipret = '/zipped/zipped-' + uuid_ + '.zip';
	console.log(datos.imagenes.length);
	numberimg=jsonimgs[0].imagen.length;
	console.log("NUMERO DE IMAGENES");	
	console.log(numberimg);
	for(i=0;i<numberimg;i++){
		imagen=jsonimgs[0].imagen[i].nombre;
		console.log(imagen);
		ruta='./uploadsresized/' + imagen;
		zip.addLocalFile(ruta);
	}
	zip.writeZip(pathToZip);
	res.send({'file': pathToZipret});
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});
