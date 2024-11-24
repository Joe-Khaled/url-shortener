const express=require('express');
const router=express.Router();
const { connectToDb, getDb } = require('../db');
//DB connection 
const {ObjectId}=require('mongodb');
let db
connectToDb((err)=>{
    if(!err){
        db=getDb()
    }
})
router.get('/url', async (req, res) => {
    try {
        const urls = await db.collection('urls').find().toArray(); // Convert the cursor to an array
        console.log(urls); // Add a log to see the data in the console
        res.render('../views/index.ejs', { urls: urls }); // Ensure 'urls' is passed as an object
    } catch (err) {
        console.error("Error fetching URLs from the database: ", err);
        res.status(500).send("Internal Server Error");
    }
});

function operation(urlInput,aliasInput,myKey){
    let dash=0,bDash=0;
        for(let i=urlInput.length;i>=0;i--)
        {
            if(urlInput[i]=='/'){
                bDash=i;break;
            }
            if(urlInput[i]=='-')dash=i;
        }
        if(dash==0)
        {
            myKey+=`NoPattern${Math.random().toFixed(3)}`;
        }
        else
        {
            myKey+=urlInput.substr(bDash+1,dash-bDash-1);
        }
        aliasInput+=myKey;
        return aliasInput;
}
let alias='';
router.post('/my-form',(req,res)=>{
    let urlInput=req.body.urlInput;
    let aliasInput=req.body.aliasInput;
    // console.log(urlInput,aliasInput);
    let protocol=urlInput.substr(0,5);
    // console.log(protocol);
    if(protocol[4]=='s')
    {
        const firstDot=urlInput.indexOf('.');
        let myKey=urlInput.substr(8,firstDot-8);
        myKey+='-';
        // console.log(myKey);
        alias=operation(urlInput,aliasInput,myKey);
    }
    else 
    {
        const firstDot=urlInput.indexOf('.');
        let myKey=urlInput.substr(7,firstDot-7);
        myKey+='-';
        alias=operation(urlInput,aliasInput,myKey);
    }
    db.collection('urls')
    .insertOne({'original':urlInput,'alias':alias});
    res.send(`URL: ${urlInput} has been shortened to Alias: ${alias}`);
})
module.exports=router;