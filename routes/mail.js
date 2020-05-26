const express=require('express')
const router=express.Router()

const nodemailer=require('nodemailer')

let transporter=nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:'filefly.send@gmail.com',
    pass:'Asdfgh1!'
  }
})

router.post('/send',(req,res)=>{
    try{
        let link=`https://filefly-download.herokuapp.com/download/file/${req.body.id}`
        let mailOptions={
            from:'filefly.send@gmail.com',
            to:req.body.email,
            subject:'Notification from FileFly',
            text:`Hi there!\n\nYou have received some files through FileFly. You can download it from here: ${link}! \n\nThank you :)`
        }
        transporter.sendMail(mailOptions,(err,data)=>{
            if(err){
                res.setHeader('Access-Control-Allow-Origin', 'https://filefly-send.herokuapp.com/');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
                res.setHeader('Access-Control-Allow-Credentials', true);
                res.status(500)
                res.json({msg:'Internal server error'})
            }else{
                res.setHeader('Access-Control-Allow-Origin', 'https://filefly-send.herokuapp.com/');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
                res.setHeader('Access-Control-Allow-Credentials', true);
                res.status(200)
                res.json({msg:'Mail sent'})
            }
        })
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

module.exports=router