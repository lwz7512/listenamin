/**
 * scraping listenaminute website data
 * 
 * @2020/05/26
 */
const fs = require('fs');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const jsonfile = require('jsonfile');

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const website = 'https://www.listenaminute.com/';

const pages = []
const file = 'topics.json';
const topics = jsonfile.readFileSync(file)
topics.forEach(function(t, i){
  t.children.forEach(function(w, j){
    var filename = w.href.split('/')[1].split('.')[0]
    var task = {
      url: website + w.href,
      file: 'topics/'+t.name+'/'+filename+'.json',
      path: t.name.toLowerCase()+'/'
    }
    pages.push(task)
  })
  
})
console.log(pages.slice(1, 100))

const downloadPage = (tasks, cb) => {
  if(!tasks.length){
    cb();
    return;
  }
  console.log('>>> remaining books length: '+tasks.length);
  
  var task = tasks.pop();//remove, and get the last one...
  console.log('request: ', task.url)
  request(task.url, function (error, response, body) {

    var $ = cheerio.load(body);
    var mp3 = null
    var txt = null
    
    $('article audio source').each(function(i, e){
      if(i==0) mp3 = $(e).attr("src")
    })
    
    $('article table p').each(function(i, e){
      var decoded = entities.decode($(e).text())
      if(i==0) txt = decoded
    })

    var json = {
      mp3: website + task.path + mp3,
      txt: txt
    }
    console.log('write one file: ', task.file)
    var writefile = path.join(__dirname, task.file);
    fs.writeFileSync(writefile, JSON.stringify(json, null, 4))

    downloadPage(tasks, cb);//continue downloading book..

  }) // end of request

}

// downloadPage(pages, function(){
//   console.log('>>> all page details downloaded!');
// });

// var page = 'https://www.listenaminute.com/a/accidents.html'
// request(page, function (error, response, body) {
//   var $ = cheerio.load(body);
//   // <source src="accidents.mp3" type="audio/mp3">
//   $('article audio source').each(function(i, e){
//     if(i==0) console.log($(e).attr("src"))
//   })
//   $('article table p').each(function(i, e){
//     var decoded = entities.decode($(e).text())
//     if(i==0) console.log(decoded)
//   })
// })

// const table = fs.readFileSync('./table.html', 'utf8');
// // console.log(table);
// const $ = cheerio.load(table);

// const trGroups = []
// const jsonStruc= []

// $('tr').each(function(i, tr){
//   // console.log(i)
//   // console.log($.html(tr))
//   if($(tr).hasClass('abc')) trGroups.push([])

//   trGroups[trGroups.length-1].push(tr)
//   // console.log(i)
//   // console.log($.html(tr))
// })

// console.log('trGroups length: ', trGroups.length)

// trGroups.forEach(function(rows, i){
//   console.log('>>> rows num:', rows.length)

//   let header = []

//   // first round
//   rows.forEach(function(row, i){
//     console.log('-- row: ', i)
//     if (i) return

//     $(row).find('td').each(function(j, td){
//       let alphabetical = $(td).text()
//       let o = {}
//       o.name = alphabetical
//       o.children = []
//       jsonStruc.push(o)
//       header.push(o)
//     })
//   })

//   console.log('header: ', header)

//   // second round
//   rows.forEach(function(row, i){
//     if(!i) return

//     let tds = $(row).find('td')
    
//     let firstCell = tds[0]
//     let a0 = $(firstCell).find('a')
//     console.log('a0:', $.html(a0))

//     let a00Text = $(a0[0]).text()
//     let a00Href = $(a0[0]).attr("href")
//     let word0 = {
//       topic: a00Text,
//       href: a00Href
//     }
//     // console.log(word0)
//     if(a00Text && a00Href) {
//       // console.log('>>> push: ', a00Text + ' --> ' + header[0]['name'])
//       header[0]['children'].push(word0)
//     }

//     let secodCell = tds[1]
//     let a1 = $(secodCell).find('a')
//     let a10Text = $(a1[0]).text()
//     let a10Href = $(a1[0]).attr("href")
//     let word1 = {
//       topic: a10Text,
//       href: a10Href
//     }
//     if(a10Text && a10Href) {
//       // console.log('>>> push: ', a10Text + ' --> ' + header[1]['name'])
//       header[1]['children'].push(word1)
//     }

//     let thirdCell = tds[2]
//     let a2 = $(thirdCell).find('a')
//     let a20Text = $(a2[0]).text()
//     let a20Href = $(a2[0]).attr("href")
//     let word2 = {
//       topic: a20Text,
//       href: a20Href
//     }
//     if(a20Text && a20Href) {
//       // console.log('>>> push: ', a20Text + ' --> ' + header[2]['name'])
//       header[2]['children'].push(word2)
//     }

//   })
// })

// console.log(jsonStruc)
// fs.writeFileSync('topics.json', JSON.stringify(jsonStruc, null, 4))

// request(url, function (error, response, body) {
//   console.error('error:', error); // Print the error if one occurred
//   // Print the response status code if a response was received
//   console.log('statusCode:', response && response.statusCode); 
//   // console.log('body:', body); // Print the HTML for the Google homepage.

//   // fs.writeFile('index.html', body, function (err) {
//   //   if (err) throw err;
//   //   console.log('Replaced!');
//   // });

//   var $ = cheerio.load(body);
//   $('table').each(function(i, e){
//     console.log(i)
//     // console.log(e)
//     // fs.writeFile('table.html', $.html(e), function (err) {
//     //   if (err) throw err;
//     //   console.log('Replaced!');
//     // });
//   })
// });
