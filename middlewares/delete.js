const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const crypto = require('crypto');
const path = require('path');
const multer=require('multer')
const GridFsStorage = require('multer-gridfs-storage');
let gfs;
const conn = mongoose.createConnection('mongodb+srv://prakash:1234@cluster0-ilxzm.gcp.mongodb.net/firefly?retryWrites=true&w=majority');

conn.once('open', function () {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads')
})

const storage = new GridFsStorage({
    url: 'mongodb+srv://prakash:1234@cluster0-ilxzm.gcp.mongodb.net/firefly?retryWrites=true&w=majority',
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads',
            aliases:[file.originalname,Date.now()]
          };
          resolve(fileInfo);
        });
      });
    }
});

const upload = multer({ storage });

module.exports=(req,res,next)=>{
  gfs.files.find().toArray((err, files)=>{
    try{
      if(err){
        res.status(500)
        res.json({msg:'Internal server error'})
      }else{
        if(files.length!=0){
          let i
          for(i=0;i<files.length;i++){
            let file=files[i]
            if(((Date.now()-file.aliases[1])/1000)>90000){
              gfs.files.remove({_id:file._id},(err, gridStore)=>{
                gfs.db.collection('uploads.chunks').remove({files_id:file._id},(err)=>{
                  if(i==files.length){
                    next()
                  }
                })
              });
            }
          }
          if(i==files.length){
            next()
          }
        }else{
          next()
        }
      }
    }
    catch(err){
      res.status(500)
      res.json({msg:'Internal server error'})
    }
  })
}