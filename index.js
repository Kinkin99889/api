const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
const req = require("express/lib/request");

const url ="https://kimetsu-no-yaiba.fandom.com/wiki/Kimetsu_no_Yaiba_Wiki";
const characterUrl = "https://kimetsu-no-yaiba.fandom.com/wiki/";
//setup
const app =express();
app.use(bodyParser.json({limit:"50mb"}));
app.use(cors());
dotenv.config();
app.use(
    bodyParser.urlencoded({
        limit: "50mb",
        extended:true,
        parameterLimit:50000,   
    })
);
// routes


// get all characters
app.get ("/v1",(res,resp)=>{
    const thumbnails = [];
    const limit =Number(res.query.limit);

    try{
        axios(url).then((res)=>{
            
            const html =res.data;
            const $ = cheerio.load(html);
            $(".portal",html).each(function(){
                const name = $(this).find("a").attr("title");
                const url = $(this).find("a").attr("href");
                const img =$(this).find("a > img").attr("data-src");
                thumbnails.push({
                    name: name,
                    url:"http://localhost:8000/v1"+url.split("/wiki")[1],
                    img:img,

                })
            })
            if(limit && limit>0){
                resp.status(200).json(thumbnails.slice(0,limit))
            }else{
            resp.status(200).json(thumbnails);
            }
        })

    }catch(err){
        resp.status(500).json(err);
    }
})

//lay thong tin nanh vat
app.get("/v1/:charater",(res,resp)=>{
    // console.log(res.params.charater);
    let cheUrl =characterUrl+res.params.charater;
    let che =res.params.charater
    const titles =[];
    const details =[];
    const characters = [];
    const characterObj={};
    const galleries =[];

    try{
        axios(cheUrl).then((res)=>{
            const html = res.data;
            const $ = cheerio.load(html);

            //lay gallery 
            $(".wikia-gallery-item",html).each(function(){
                const gallery = $(this).find("a >img").attr("data-src");
                galleries.push(gallery)
            })

            $("aside",html).each(function(){

            const img = $(this).find("img").attr("src"); 

            //lay tieu de cuar tieu de nhan vat
                const title = $(this).find("section > div >h3").each(function(){
                    titles.push($(this).text());
                });
            // lay chi tiet nhan vat
            $(this).find("section >div >div").each(function(){
              details.push($(this).text());
            });
            //img
            if (img !== undefined){
            
            // tao doi tuong voi tieu de va chi tiet
            for (let i=0;i<titles.length ; i++){
                characterObj[titles[i].toLowerCase()] = details[i];

            }   
            characters.push ({
                name: che.replace("_",""),
                gallry:galleries,
                image: img ,
                ...characterObj
            })
        }
            });
            resp.status(200).json(characters);         
        });
        
    }catch(err){
        resp.status(500).json(err);
    }
})




// run port 
app.listen(8000, ()=>{
    console.log("start")
})

