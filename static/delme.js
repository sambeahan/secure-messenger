var message = 'dsfdsgfds';
var div = document.createElement('div');
div.innerText = 'yay'
div.onclick = function(){
    console.log('yeet',message)
};
document.body.appendChild(div)