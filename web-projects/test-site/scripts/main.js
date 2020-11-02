let myImage = document.querySelector('img');

myImage.onclick = function() {
    let mySrc = myImage.getAttribute('src');
    if(mySrc === 'https://EijiGorilla.github.io/web-projects/test-site/images/fire-fox.jpg') {
        myImage.setAttribute('src','https://EijiGorilla.github.io/web-projects/test-site/images/firefox2.jpg');
    } else {
        myImage.setAttribute('src','https://EijiGorilla.github.io/web-projects/test-site/images/fire-fox.jpg')
    }
}