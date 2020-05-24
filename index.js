const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const mongoose=require('mongoose')
const cors=require('cors')

const upload=require('./routes/upload')
const file=require('./routes/file')
const download=require('./routes/download')
const mail=require('./routes/mail')

const deleteMiddleware=require('./middlewares/delete')

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cors())

app.use(deleteMiddleware)
app.use('/upload',upload)
app.use('/file',file)
app.use('/download',download)
app.use('/mail',mail)

mongoose.connect('mongodb+srv://prakash:1234@cluster0-ilxzm.gcp.mongodb.net/firefly?retryWrites=true&w=majority').then(()=>{
    app.listen(process.env.PORT||5000);
}).catch(err=>console.log(err))