let myImage = document.querySelector('img');

myImage.onclick = function() {
    let mySrc = myImage.getAttribute('src');
    if(mySrc === 'https://EijiGorilla.github.io/web-projects/test-site/images/fire-fox.jpg') {
        myImage.setAttribute('src','https://EijiGorilla.github.io/web-projects/test-site/images/firefox2.jpg');
    } else {
        myImage.setAttribute('src','https://EijiGorilla.github.io/web-projects/test-site/images/fire-fox.jpg');
    }
}

let myButton = document.querySelector('button');
let myHeading = document.querySelector('h1');

function setUserName() {
    let myName = prompt('Please enter your name:');
    if(!myName) {
        setUserName();
    } else {
        localStorage.setItem('name', myName);
        myHeading.innerHTML = 'Mozilla is cool, ' + myName;
    }
}


myButton.onclick = function() {
    setUserName();
}