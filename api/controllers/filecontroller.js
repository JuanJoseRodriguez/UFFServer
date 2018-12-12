var mongoose = require('mongoose');
var modelo  = mongoose.model('uffremoverModel');
var serialize = require('node-serialize');

let fs = require('fs');
const { exec } = require('child_process');

//GET - Return all fils in the DB
exports.findAll = function(req, res) {
    modelo.find(function(err, files) {
    if(err) res.send(500, err.message);
    res.status(200).jsonp(files)
    })
}

//POST Load file into the server
exports.uploadFile =  function (req, res){

    var form = new formidable.IncomingForm()

    //Check if file is a javaScript file
    form.onPart = function (part,err) {
        if(!part.filename || part.filename.match(/\.(js)$/i)) {
            this.handlePart(part);
        }
        else {
            console.log(part.filename + ' is not allowed')
        }
    }

    form.parse(req)
    //Set path where the file is gonna be uploaded
    form.on('fileBegin', function (name, file){
        file.path = './uploads/' + file.name
        file.fullpath = '/home/ubuntu/tesis/uploads/' + file.name
        //file.path = './' + file.name
        //file.fullpath = '/home/bitnami/api/' + file.name
    })

    form.on('file', function (name, file){
      //Optimize file with uffremover
        var fatherid;
        var uns = fs.readFileSync(file.path);
        // create model
        var f = new modelo(
          {
            fatherid: null, //Solo se completa si es un archivo hijo.
            name : file.name,
            path : file.path,
            fullpath : file.fullpath,
            data: uns,
            uses : 0
          }
        )
        // save model into mongodb
        f.save(function(err, f) {
            if(err) return res.status(500).send( err.message);
            fatherid = f._id;

        });

        //Init uffremover
        exec('uff optimize_file_browser ' + file.path + ' profiling.txt ' , (err, stdout, stderr) => {
          if (err) {
            // node couldn't execute the command
            console.log(err)
            return;
          }
          var dataOptimized = fs.readFileSync('./uploads/app-optimized-min.js').toString();
          var dir = './uff';
          fs.readdir(dir, (err, files) => {
          	files.forEach((fi) => {
              var dat = fs.readFileSync(dir + '/' + fi);
              var f = new modelo(
                {
                  fatherid: fatherid,
                  name : fi,
                  path : null,
                  fullpath : null,
                  data: dat,
                  uses : 0
                }
              )

              //save model into mongodb
              f.save(function(err, f) {
                  if(err)
                    console.log('Error al guardar!!: ' + f);
                  else
                    console.log('Se guardo con exito: ', f.name);
                    dataOptimized = dataOptimized.replace('uff/'+fi, 'http://18.222.186.18:3000/filesuffId/'+f._id);
                    console.log('dataOptimized1: ', dataOptimized);
              });
          })
          console.log('dataOptimized2: ', dataOptimized)
          exec('sudo sh uffscript.sh' , (err, stdout, stderr) => {
            if (err) {
              // node couldn't execute the command
              console.log(err)
              return;
            } else {

            }
        });
        });
          //console.log('STDOUT: ' +  stdout);
          //console.log('STDERR: ' +  stderr);
        });// End uffremover

        res.status(200).jsonp(f)

    })
  }

  //GET - return a specified file
  exports.download = function(req, res) {
      modelo.find({"_id":req.params.id}, function(err, files) {
        if(err) return res.send(500, err.message);
        var filename = files[0].name;
        var fileLocation = files[0].fullpath;
        res.download(fileLocation,filename)
      });
  }

  //DELETE - Delete with specified ID
  exports.delete = function(req, res) {
      modelo.findById(req.params.id, function(err, art) {
          modelo.remove({"_id":req.params.id}, function(err) {
              if(err) return res.status(500).send(err.message);
              res.status(200).send();
          })
      });
  }


  //GET - return a specified file as string by file name
  exports.downloadStr = function(req, res) {
        fs.readFile('./uploads/' + req.params.name, 'utf-8', (err, data) => {
          if(err) {
            console.log('error: ', err);
          } else {
            res.status(200).send(data)
          }
        });

  }

    //GET - return a specified file as string by file id
    exports.downloadStrbyId = function(req, res) {
      modelo.findById({"_id":req.params.id}, function(err, file) {
        if(err) return res.send(500, err.message);
        console.log('GET /strfile/' + req.params.id);
        console.log('GETSTR ' + file.data);
        res.status(200).send(file.data);
      });
      // console.log('download by str by id -> ' + req.params.id)
      //   modelo.findById({"_id":req.params.id}, function(err, file) {
      //     if(err) return res.send(500, err.message);
      //     var fileLocation = file.fullpath;
      //     fs.readFile(fileLocation, 'utf-8', (err, data) => {
      //       if(err) {
      //         console.log('error: ', err);
      //       } else {
      //         res.status(200).send(data)
      //       }
      //     });
      //   });
    }
