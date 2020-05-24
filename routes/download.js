const express=require('express')
const router=express.Router()

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

router.get('/file/:id', (req,res)=>{
    gfs.files.find().toArray((err, files)=>{
        try{
          if(err || files.length==0){
            res.status(404)
            res.json({msg:'Invalid id/ id expired'})
          }else{
            let file=files.filter((file)=>{
                return file._id==req.params.id
            })
            let filename=file[0].aliases[0]
            filename=filename+"-firefly.zip"
            res.status(200)
            var readstream = gfs.createReadStream({_id:req.params.id})
            res.set('Content-Type', file[0].contentType)
            res.set('Content-Disposition','attachment; filename="'+ filename + '"');
            res.attachment(filename)
            readstream.pipe(res)
          }
        }
        catch(err){
          res.status(500)
          res.json({msg:'Internal server error'})
        }
    })
})

module.exports=router