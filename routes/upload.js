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

const nodemailer=require('nodemailer')

let transporter=nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:'filefly.send@gmail.com',
    pass:'Asdfgh1!'
  }
})

router.post('/new/:email', upload.single('file'), (req,res)=>{
    try{
      let link=`https://filefly-send.herokuapp.com/download/file/${req.file.id}`
      let mailOptions={
          from:'filefly.send@gmail.com',
          to:req.params.email,
          subject:'Notification from FileFly',
          text:`Hi there!\n\nYou have received some files through FileFly. You can download it from here: ${link} \n\nThank you :)`
      }
      transporter.sendMail(mailOptions,(err,data)=>{
        if(err){
          res.status(500)
          res.json({msg:'Internal server error'})
        }else{
          res.status(200)
          res.json({
            filename:req.file.originalname,
            id:req.file.id,
            size:req.file.size,
            uploadDate:req.file.uploadDate
          })
        }
      })
    }
    catch(err){
      res.status(500)
      res.json({msg:'Internal server error'})
    }
})

module.exports=router