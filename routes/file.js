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

router.get('/info', (req,res)=>{
    gfs.files.find().toArray((err, files)=>{
        try{
          if(err || files.length==0){
            res.setHeader('Access-Control-Allow-Origin', 'https://filefly-send.herokuapp.com/');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            res.setHeader('Access-Control-Allow-Credentials', true);
            res.status(404)
            res.json({msg:'Invalid id/ id expired'})
          }else{
            let file=files.filter((file)=>{
                return file._id==req.body.id
            })
            res.setHeader('Access-Control-Allow-Origin', 'https://filefly-send.herokuapp.com/');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            res.setHeader('Access-Control-Allow-Credentials', true);
            res.status(200)
            res.json({
                filename:file[0].aliases[0],
                id:file[0]._id,
                size:file[0].length,
                uploadDate:file[0].uploadDate,
                expiresAt:(Math.ceil(90000-(Date.now()-file[0].aliases[1])/1000)/(60*60)).toFixed(1)
            })
          }
        }
        catch(err){
          res.setHeader('Access-Control-Allow-Origin', 'https://filefly-send.herokuapp.com/');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
          res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
          res.setHeader('Access-Control-Allow-Credentials', true);
          res.status(500)
          res.json({msg:'Internal server error'})
        }
    })
})

module.exports=router