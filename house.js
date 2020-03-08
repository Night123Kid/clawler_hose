const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const fs         = require("fs");
const levelup = require('levelup');
const app = express();

var pageIndex = 1;
var totalPage = 10;
var result_list = [];

HouseList();

function HouseList(page) {
    let URL = "https://hf.ke.com/ershoufang/pg"+page;
  request(URL, function (error, response, body) {
    if (!error && response.statusCode == 200) {

      // 获取列表页数据
      var house_listArr = [];

      const $ = cheerio.load(body);
      const houseList = $('.sellListContent ');

      houseList.find('li .clear').each(function(index,value) {

              let title = $(value).find('.title a').text();
              let href = $(value).find('.title a').attr('href');
              let address = decode($(value).find('.address .flood .positionInfo a').html());
              let concern = $(value).find(".followInfo").text();
              concern = concern.substring(30,concern.indexOf('/')).trim();
                 // console.log(concern);
              house_listArr.push({
                      title : title, 
                      href : href, 
                      address : address, 
                      concern : concern
                  });
          });

                // console.log(house_listArr);
                // console.log(house_listArr.length);
      if (pageIndex == totalPage) { //结束递归
                  //保存数组进内存  开始获取info
                  
                  result_list = result_list.concat(house_listArr);
                  console.log(result_list.length);
                  // result_list=JSON.stringify(result_list);

                  result_list.forEach((elm,index)=>{
                      // console.log(result_list[index]['href']);
                      // href = ;
                      houseDetail(result_list[index]['href']);
                  })

                  // fs.writeFile("lists.json",result_list,"utf-8",(error)=>{
                  //     if(error==null){
                  //         console.log("爬取成功");
                  //     }
                  //   });
              } else { //递归
                  pageIndex++;
                  // console.log(pageIndex);
                  HouseList(pageIndex)
                  result_list = result_list.concat(house_listArr); 

                  // console.log(house_listArr);
              }
    }else{
      console.log(error);
                return;
    }
  });
}


function houseDetail(href) {
  // console.log(href);
    request(href, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            // 获取列表页数据
            var house_detailArr = [];

            const $ = cheerio.load(body);
            const HouseDetail = $('.overview');

            // var img = $(body).find("#topImg  .imgContainer .new-default-icon").attr('src');
            // console.log(img); 

            var price = $(".price ").find('.total').text()+"万";
            // console.log(price);  
            var unitPrice = $(".unitPrice ").find('.unitPriceValue').text()+"元/平米";
            var room = $(".room ").find('.mainInfo').text()+$(".room ").find('.subInfo').text();
               
            house_detailArr.push({
                price : price, 
                unitPrice : unitPrice, 
                room : room, 
            });
            console.log(house_detailArr);   
        }else{
            console.log(error);
            return;
        }
        
    })
}

function decode(str) {
    return str.replace(/&#x(\w+)/g, function (match, s) {
        return String.fromCharCode(parseInt(s, 16));
    }).replace(/;/ig, "");
};
