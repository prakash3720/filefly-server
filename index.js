const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const cors=require('cors')

const upload=require('./routes/upload')
const download=require('./routes/download')

const deleteMiddleware=require('./middlewares/delete')

app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(deleteMiddleware)

app.use('/upload',upload)
app.use('/download',download)

app.listen(process.env.PORT||5000);