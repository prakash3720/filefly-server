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

router.post('/new', upload.single('file'), (req,res)=>{
    try{
      res.setHeader('Access-Control-Allow-Origin', 'https://filefly-download.herokuapp.com/');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.status(200)
      res.json({
          filename:req.file.originalname,
          id:req.file.id,
          size:req.file.size,
          uploadDate:req.file.uploadDate
      })
    }
    catch(err){
      res.setHeader('Access-Control-Allow-Origin', 'https://filefly-download.herokuapp.com/');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.status(500)
      res.json({msg:'Internal server error'})
    }
})

module.exports=router