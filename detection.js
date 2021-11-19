//Code for image detection


window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();



'use strict';

//window.addEventListener('load', function(){
//  img_find();
//});

//window.addEventListener("load", img_find, false);
window.urlsDetected = [];
window.urlsWithText = [];

let observer = new MutationObserver(mutations => {
  let flag = false;
  for(let mutation of mutations) {
       for(let addedNode of mutation.addedNodes) {
           if (addedNode.nodeName === "IMG" || addedNode.getElementsByTagName("img")) {
               console.log("Inserted image", addedNode);
               flag = true;
               haveAlerted = false;
               break;
            }
        }
        if(flag)
        {
            break;
        }
   }
   if(window.location.href.includes('twitter.com') )
   {
      let videoDetected = false;
      for(let mutation of mutations) {
        for(let addedNode of mutation.addedNodes) {
            if (addedNode.nodeName === "video" || addedNode.getElementsByTagName("video")) {
                console.log("Detected video", addedNode);
                videoDetected = true;
                break;
            }
        }
        if(videoDetected)
        {
          break;
        }
      }
      if(videoDetected) {
        twitter_find();
      }     
   }
   else if (window.location.href.includes('reddit.com')) {
    let videoDetected = false;
    for(let mutation of mutations) {
      for(let addedNode of mutation.addedNodes) {
          if (addedNode.nodeName === "video" || addedNode.getElementsByTagName("video")) {
              console.log("Detected video", addedNode);
              videoDetected = true;
              break;
          }
      }
      if(videoDetected)
      {
        break;
      }
    }
    if(videoDetected) {
      reddit_find();
    }     

   }
   else if(flag) {
     //setTimeout(runWhenPageLoaded, 8000);
     img_find();
   }
});

// observer.observe(document, { childList: true, subtree: true });
// var haveAlerted = false;
// setInterval(()=> {
//   var imgs = document.getElementsByTagName("img");
//   var allProcessed = true;
//   for (var i = 0; i < imgs.length; i++) 
//   {
//     if(imgs[i].src.toLowerCase().includes(".gif") && !imgs[i].alt){
//       allProcessed = false;
//     }
//   }
//   if(!imgs.length)
//   {
//     allProcessed = false;
//   }
//   if(allProcessed && !haveAlerted) {
//     haveAlerted = true;
//     alert('Page is accessibility ready!');
//   }
// }, 2000);

function img_find() 
{
  var url = "https://gifdescriptionsservice.azurewebsites.net/gif/uploadvideo";
  chrome.storage.sync.get(['modelVariant'], function(result) {
    console.log('Value currently is ' + result.modelVariant);
    if(result.modelVariant === "enhanced") {
      url = "https://gifdescriptorservice.azurewebsites.net/gif/uploadvideo"
    }
  });
  setTimeout(runWhenPageLoaded, 3000);
  function runWhenPageLoaded() {
    var imgs = document.getElementsByTagName("img");
    var imgSrcs = [];      
    var counter = 0;
    var detected = false;
    for (var i = 0; i < imgs.length; i++) 
    {
      if(imgs[i].src.toLowerCase().includes(".gif") && !imgs[i].alt){        
        imgSrcs.push({ img: imgs[i],  url: imgs[i].src, alt: imgs[i].alt});
        
        //Upload File
        //getImageFormUrl(imgs[i].src, function (blobImage, urlReturned) {
          var formData = new FormData();
          //formData.append("gifImage", blobImage);
          formData.append("originalUri", imgs[i].src);

          var requestOptions = {
            method: 'POST',
            body: formData,
            redirect: 'follow'
          };
          
          fetch(url, requestOptions)
            .then(response => response.json())
            .then(result => { 
              var origImage = imgSrcs.find(p => p.url == result.originalImageUri);
              counter++;
              origImage.img.alt = result.description;
              origImage.img.style.cssText += " border:10px solid green;"
              if(result?.detectedText)
              {
                origImage.img.alt += ". Text detected in image which says - " + result?.detectedText;
              }
              console.log(result);
              if(counter === imgs.length)
              {
                alert('Page accessibility ready!');
              }
            })
            .catch(error => {
              sleep(1000)
              .then(() =>
              {
                console.log("Original attempt failed and will retry");
                fetch(url, requestOptions)
                  .then(response => response.json())
                  .then(result => { 
                    var origImage = imgSrcs.find(p => p.url == result.originalImageUri);
                    counter++;
                    origImage.img.alt = result.description;
                    origImage.img.style.cssText += " border:10px solid green;"
                    if(result?.detectedText)
                    {
                      origImage.img.alt += ". Text detected in image which says - " + result?.detectedText;
                    }
                    console.log(result);
                    if(counter === imgs.length)
                    {
                      alert('Page accessibility ready!');
                    }
                  })
                  .catch(error => {
                      sleep(2000)
                      .then(() => {
                        console.log("Second attempt failed and will retry third time");
                        fetch(url, requestOptions)
                          .then(response => response.json())
                          .then(result => { 
                            var origImage = imgSrcs.find(p => p.url == result.originalImageUri);
                            counter++;
                            origImage.img.alt = result.description;
                            
                            if(result?.detectedText)
                            {
                              origImage.img.alt += ". Text detected in image which says - " + result?.detectedText;
                            }
                            console.log(result);
                            if(counter === imgs.length)
                            {
                              alert('Page accessibility ready!');
                            }
                          })
                          .catch(error => {
                            counter++;
                            console.log('error', error)
                            if(counter === imgs.length)
                            {
                              alert('Page accessibility ready!');
                            }
                          });

                      })
                    console.log('error', error)
                  });
              });

              console.log('error', error)
            });
      //});
      } 
    }
    if(!detected)
    {

    }

    console.log("Finishing up");
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function getImageFormUrl(url, callback) {
    var img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = function (a) {
    var canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(this, 0, 0);
  
    var dataURI = canvas.toDataURL("image/gif");
      
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);
  
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
  
    return callback(new Blob([ia], { type: mimeString }), url);
    }
    
    img.src = url;
  }

  function uploadFile(url){
    var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(url);

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

        fetch("https://localhost:5001/gif", requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error));
  }
}

function twitter_find()
{
  var url = "https://gifdescriptionsservice.azurewebsites.net/gif/uploadvideo";
  chrome.storage.sync.get(['modelVariant'], function(result) {
    console.log('Value currently is ' + result.modelVariant);
    if(result.modelVariant === "enhanced") {
      url = "https://gifdescriptorservice.azurewebsites.net/gif/uploadvideo"
    }
  });
  setTimeout(runWhenTwitterLoaded, 2000);
  function runWhenTwitterLoaded()
  {
    var imgs = document.getElementsByTagName("video");
    var imgSrcs = [];      
    var counter = 0;
    for (var i = 0; i < imgs.length; i++) 
    {
      if(imgs[i].src.toLowerCase().includes(".mp4")   && !imgs[i].alt){
        if(window.urlsDetected.includes(imgs[i].src.toLowerCase()))
        {
          continue;
        }
        else
        {
          window.urlsDetected.push(imgs[i].src.toLowerCase());
        }

        imgSrcs.push({ img: imgs[i],  url: imgs[i].src, alt: imgs[i].alt});
        
        //Upload File        
        var formData = new FormData();        
        formData.append("originalUri", imgs[i].src);

        var requestOptions = {
          method: 'POST',
          body: formData,
          redirect: 'follow'
        };

        fetch(url, requestOptions)
          .then(response => response.json())
          .then(result => { 
            var origImage = imgSrcs.find(p => p.url == result.originalImageUri);
            counter++;
            origImage.img.ariaLabel = result.description;            
            origImage.img.tabIndex = 0;
            if(result?.detectedText)
            {
              origImage.img.ariaLabel += ". Text detected in image which says - " + result?.detectedText;
            }
            console.log(result);
            if(counter === imgs.length)
            {
              alert('Page accessibility ready!');
            }
          })
          .catch(error => {
            counter++;
          });

      }
    }
  }
}

function reddit_find()
{
  var url = "https://gifdescriptionsservice.azurewebsites.net/gif/uploadvideo";
  chrome.storage.sync.get(['modelVariant'], function(result) {
    console.log('Value currently is ' + result.modelVariant);
    if(result.modelVariant === "enhanced") {
      url = "https://gifdescriptorservice.azurewebsites.net/gif/uploadvideo"
    }
  });
  setTimeout(runWhenTwitterLoaded, 2000);
  function runWhenTwitterLoaded()
  {
    var imgs = document.getElementsByTagName("video");
    var imgSrcs = [];      
    var counter = 0;
    for (var i = 0; i < imgs.length; i++) 
    {
      let current = imgs[i].getElementsByTagName('source')[0];
      if(current.src.toLowerCase().includes("format=mp4")   && !current.alt){
        if(window.urlsDetected.includes(current.src.toLowerCase()))
        {
          continue;
        }
        else
        {
          window.urlsDetected.push(current.src.toLowerCase());
        }

        imgSrcs.push({ img: imgs[i],  url: current.src, alt: current.alt});
        
        //Upload File        
        var formData = new FormData();        
        formData.append("originalUri", current.src);

        var requestOptions = {
          method: 'POST',
          body: formData,
          redirect: 'follow'
        };

        fetch(url, requestOptions)
          .then(response => response.json())
          .then(result => { 
            var origImage = imgSrcs.find(p => p.url == result.originalImageUri);
            counter++;
            origImage.img.ariaLabel = result.description;
            origImage.img.tabIndex = 0;
            if(result?.detectedText)
            {
              origImage.img.ariaLabel += ". Text detected in image which says - " + result?.detectedText;              
            }
            console.log(result);
            if(counter === imgs.length)
            {
              alert('Page accessibility ready!');
            }
          })
          .catch(error => {
            counter++;
          });

      }
    }
  }
}