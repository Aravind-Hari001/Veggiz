const { backendURL } = require("./constants")

const click_menu = (element) => {
    let content = document.querySelector('.login-signup')
    if(window.screen.width<=800) 
        content.style = "width:100%;padding:20px;"
    else 
        content.style = "width:30%;padding:40px;"
    if (element === 'signup') {
        document.querySelector('.login-signup .title h1').innerHTML = "Sign up"
        let login = document.querySelector('.login-signup .title p span')
        login.innerHTML = "login"
        login.addEventListener('click', () => click_menu('login'))
        let form = document.querySelector('.login-signup form')
        form.innerHTML = `
            <input type="text" name="mobile" placeholder="Phone Number" required>
            <input type="text" name="name" placeholder="Name" required>
            <input type="text" name="email" placeholder="Email" required>
            <button type="submit">Continue</button>
        `
        form.action = "create_user"
    }
    else {
        document.querySelector('.login-signup .title h1').innerHTML = "Login"
        let create = document.querySelector('.login-signup .title p span')
        create.innerHTML = "create an account"
        create.addEventListener('click', () => click_menu('signup'))
        let form = document.querySelector('.login-signup form')
        form.innerHTML = `
        <input type="text" name="mobile"  placeholder="Phone Number" required>
        <button type="submit" on>Login</button>
        <label>Forget Password?</label>`
        form.action = "login_user"
        form.getElementsByTagName('label')[0].addEventListener('click', () => {
            window.location.href = "#"
        })
    }
    let body = document.querySelector('body')
    body.appendChild(document.createElement('cover'));

    let cover = document.querySelector('cover')
    cover.style = "z-index:5;background:rgba(0,0,0,0.4);position:absolute;width:100%;height:100%;top:0;left:0;"
    cover.addEventListener('click', () => {
        close_menu()
    })
    document.querySelector('.cut').addEventListener('click', () => {
        close_menu()
    })
    const close_menu = () => {
        let content = document.querySelector('.login-signup')
        content.style = "width:0;padding:0;"
        let cover = document.querySelector('cover')
        cover.style = "display:none;"
    }
}


const searchElement = () => {
    let input = document.querySelector('.search input').value.toLowerCase();
    if (input.length > 2) {
        document.querySelector('.searchElementList ul').innerHTML = ""
        document.querySelector('.searchElementList').classList.add('d-none')
        fetch(backendURL+'cities?search_q='+input).then(response => response.json()).then(data => {
            console.log(data);
            for (const city of data[0]) {
                // if ((city).toLowerCase().indexOf(input) !== -1) {
                    document.querySelector('.searchElementList').classList.remove('d-none')
                    document.querySelector('.searchElementList ul').innerHTML += `<a href='product.html'><li><i class='bx bx-location-plus'></i>  ${city + ' , ' + 'Tamil Nadu'}</li></a>`
                // }
            }
        })
    }
    else {
        document.querySelector('.searchElementList').classList.add('d-none')
    }
}
// document.querySelector('.search input').addEventListener('keyup', searchElement)





// get location
const getLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.querySelector(".search input").value = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    document.querySelector(".search input").value = latitude + ",-" + longitude;
    alert(latitude + ",-" + longitude)
}

function showError(error) {
    // switch(error.code) {
    //     case error.PERMISSION_DENIED:
    //         alert("User denied the request for Geolocation.");
    //         break;
    //     case error.POSITION_UNAVAILABLE:
    //         alert("Location information is unavailable.")
    //         break;
    //     case error.TIMEOUT:
    //         alert("The request to get user location timed out.");
    //         break;
    //     case error.UNKNOWN_ERROR:
    //         alert("An unknown error occurred.");
    //         break;
    // }
}
// document.querySelector('.locate-me').addEventListener('click',getLocation)
module.exports = { click_menu, getLocation, searchElement }