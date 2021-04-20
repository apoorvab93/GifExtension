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

window.addEventListener("load", img_find, false);

function img_find() 
{
    setTimeout(runWhenPageLoaded, 6000);
    function runWhenPageLoaded() {
      var imgs = document.getElementsByTagName("img");
      var imgSrcs = [];
      for (var i = 0; i < imgs.length; i++) 
      {
        if(imgs[i].src.toLowerCase().includes(".gif")){
          imgSrcs.push({url: imgs[i].src, alt: imgs[i].alt});
          
          //Upload File
          getImageFormUrl(imgs[i].src, function (blobImage) {
            var formData = new FormData();
            formData.append("gifImage", blobImage);

            var requestOptions = {
              method: 'POST',
              body: formData,
              redirect: 'follow'
            };

            fetch("https://localhost:5001/gif/upload", requestOptions)
              .then(response => response.text())
              .then(result => console.log(result))
              .catch(error => console.log('error', error));
        });          

          // Upload File URL
          // uploadFile(imgs[i].src);
          //
        } else {
          console.log("Not included " + {url: imgs[i].src, alt: imgs[i].alt});
        }      
      }
      console.log("Finishing up");
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
    
      return callback(new Blob([ia], { type: mimeString }));
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




//function img_find() 
//{
//    var imgs = document.getElementsByTagName("img");
//    var imgSrcs = [];
//
//    for (var i = 0; i < imgs.length; i++) 
//    {
//      imgSrcs.push({url: imgs[i].src, alt: imgs[i].alt});
//      console.log({url: imgs[i].src, alt: imgs[i].alt});
//      
//    }
//
//
//    return imgSrcs;
//}















   