import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { backendURL, key, key_secret } from '../JS/constants';

const Header = (updateCart) => {
    const [cookies, setCookie] = useCookies();
    const [cartProduct, setCartProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null)
    const [searchProducts, setSearchProducts] = useState([[], []])
    const [user, setUser] = useState('login')
    const [hidePassword, setHidePassword] = useState(true)
    const [editUser, setEditUser] = useState(false)
    const [buyNow, setBuyNow] = useState(false)

    useEffect(() => {
        if (!cookies.cart) {
            setCookie('cart', {}, { path: '/' });
        }
        if (cartProduct.length > 0 || cookies.cart) {
            for (const x in cookies.cart) {
                if (cookies.cart[x][0] != 0) {
                    let add_btn = document.querySelectorAll('.btn-' + cookies.cart[x][2])
                    let add_sub_btn = document.querySelectorAll('.btn-' + cookies.cart[x][2] + '-add')
                    for (const btn of add_btn)
                        btn.classList.add('d-none')
                    for (const btn of add_sub_btn)
                        btn.classList.remove('d-none')
                    let count_item = document.querySelectorAll('.count-click-' + cookies.cart[x][2])
                    for (const count of count_item)
                        count.innerHTML = cookies.cart[x][0];
                    add_Cart(cookies.cart)
                }
            }
        }
    }, [cartProduct, searchProducts])
    useEffect(() => {
        try {
            if ((window.localStorage.getItem('user') || cookies.cart[0].name) && editUser != 'edit') {
                let id = window.localStorage.getItem('user').split(',')[0]
                axios.get(backendURL + 'get-user?id=' + id)
                    .then((response) => {
                        setUser(response.data)
                    }).catch((err) => { })
            }
        } catch (e) { }
    }, [editUser])
    useEffect(() => {
        if (buyNow) {
            showOrderForm();
        }
        if (localStorage.getItem('user') && editUser == 'edit') {
            showEditForm();
        }
    }, [buyNow, editUser])
    const handelClick_AddButton = (btn, p_name, product) => {
        let selling = product.price;
        let measures = product.measures;
        try {
            let p = document.querySelector('.p' + product.id);
            measures = p.querySelector('select').value;
            selling = product.price.toString().split(';')[product.measures.toString().split(';').indexOf(measures)];
        } catch (e) { }
        selling = Math.round(selling - (selling / 100) * product.discount);
        let add_btn = document.querySelectorAll('.btn-' + btn)
        let add_sub_btn = document.querySelectorAll('.btn-' + btn + '-add')
        for (const btn of add_btn)
            btn.classList.add('d-none')
        for (const btn of add_sub_btn)
            btn.classList.remove('d-none')
        let cartData = cookies.cart;
        cartData[p_name] = [1, selling, btn, measures]
        setCookie('cart', cartData, { path: '/' });
        add_Cart(cartData)
        let count_item = document.querySelectorAll('.count-click-' + btn)
        for (const count of count_item)
            count.innerHTML = cartData[p_name][0];
    }
    const click_Add = (pid, p_name) => {
        let cartData = cookies.cart;
        cartData[p_name][0] += 1
        setCookie('cart', cartData, { path: '/' });
        add_Cart(cartData)
        try {
            updateCart['updateCart'](cartData)
        } catch (e) { }
        let counters = document.querySelectorAll('.count-click-' + pid)
        for (const couter of counters) {
            couter.innerHTML = cartData[p_name][0];
        }
    }
    const click_Sub = (btn, p_name) => {
        let cartData = cookies.cart;
        if (cartData[p_name][0] > 1) {
            cartData[p_name][0] -= 1;
            setCookie('cart', cartData, { path: '/' });
            add_Cart(cartData)
            try {
                updateCart['updateCart'](cartData)
            } catch (e) { }
            let counters = document.querySelectorAll('.count-click-' + btn);
            for (const couter of counters) {
                couter.innerHTML = cartData[p_name][0];
            }
        }
        else {
            let currentProducts = []
            for (const product of cartProduct) {
                if (product['product_name'] !== p_name) {
                    currentProducts.push(product);
                }
            }
            setCartProduct(currentProducts);
            cartData[p_name] = [0, 0, null, null];
            setCookie('cart', cartData, { path: '/' });
            add_Cart(cartData);
            try {
                updateCart['updateCart'](cartData)
            } catch (e) { }
            let btn1 = document.querySelectorAll('.btn-' + btn)
            let btn2 = document.querySelectorAll('.btn-' + btn + '-add')
            for (const btn of btn1) {
                btn.classList.remove('d-none');
            }
            for (const btn of btn2) {
                btn.classList.add('d-none')
            }
        }
    }
    const add_Cart = (cart) => {
        let itemsCount = 0;
        let price = 0;
        for (const x in cart) {
            if (cart[x][0] != 0) {
                itemsCount += cart[x][0];
                price += cart[x][0] * cart[x][1]
            }
        }
        if (itemsCount > 0 && price > 0) {
            let countItem = document.querySelector('.header nav .cart-div .items-count')
            countItem.querySelector('p').classList.add('d-none')
            let tmp = document.querySelectorAll('.items-in-cart')
            for (let i of tmp) i.classList.remove('d-none')
            tmp = document.querySelectorAll('.items-in-cart .count')
            for (let i of tmp) i.innerHTML = itemsCount + " items"
            tmp = document.querySelectorAll('.items-in-cart .price')
            for (let i of tmp) i.innerHTML = "₹" + price;
            try {
                document.querySelector('.items-in-cart .charges').innerHTML = (price < 500) ? " + ₹15 delivery charge" :
                    (price >= 1000) ? "<i class='bx bx-gift'></i> You have a gift" : ""
            } catch (e) { }
        }
        else {
            let countItem = document.querySelector('.header nav .cart-div .items-count')
            countItem.querySelector('p').classList.remove('d-none')
            countItem.querySelector('.items-in-cart').classList.add('d-none')
        }
    }
    const handelClickCart = () => {
        let cartCard = document.querySelector(".header .cart-products");
        if (window.screen.width > 1000)
            cartCard.style = "display:unset;width: 30%;padding:20px;overflow:visible;";
        else
            cartCard.style = "display:unset;width: 100%;padding:20px;overflow:visible;";
        cartCard.querySelector('.coverContent').classList.remove('d-none')
        if (cookies.cart) {
            let id = []
            for (const x in cookies.cart) {
                if (cookies.cart[x][0] != 0) {
                    id.push(cookies.cart[x][2])
                }
            }
            if (id.length > 0) {
                axios.get(backendURL + 'get-cart-product?id=' + id)
                    .then(response => {
                        if (response.data == "error")
                            setError("Unable to fetch data")
                        else
                            setCartProduct(response.data)
                    })
                    .catch(err => { })
            }
            else {

            }
        }
    }
    const closeCartCard = () => {
        let cartCard = document.querySelector(".header .cart-products");
        cartCard.style = "width: 0;padding:0;overflow:hidden;";
        cartCard.querySelector('.coverContent').classList.add('d-none')
    }
    const handelFocuseSearch = () => {
        if (window.location.pathname != '/search')
            window.location.href = "/search";
    }
    const handelSearchProduct = () => {
        let txt = document.querySelector('.header nav .search-div input').value;
        txt = txt.trim().toLowerCase()
        if (txt.length > 0) {
            axios.get(backendURL + 'get-search-product?search=' + txt)
                .then(response => {
                    if (response.data == "error")
                        setError("Unable to fetch data")
                    else {
                        setSearchProducts(response.data)
                    }
                    setLoading(false);
                })
                .catch(error => {
                    setError(error.message);
                    setLoading(false);
                });
        }
        else {
            setSearchProducts([[], []])
        }
    }
    const clickProduct = (pid) => {
        window.location.href = "/product/" + pid
    }
    const showLaginCard = () => {
        let loginCard = document.querySelector('.login-signup')
        loginCard.style = "width:30%;padding:20px;overflow:visible;"
        loginCard.querySelector('.coverContent').classList.remove('d-none')
        if (window.screen.width <= 1000) {
            loginCard.style = "width:100%;padding:20px;overflow:visible;";
            loginCard.querySelector('.coverContent').classList.add('d-none')
        }
        try {
            if (hidePassword) {
                document.querySelector('.check-cover input').checked = false;
                document.querySelector('#password').type = "password";
            }
            else {
                document.querySelector('.check-cover input').checked = true;
                document.querySelector('#password').type = "text";
            }
        } catch (e) { }
    }
    useEffect(() => {
        try {
            document.querySelector('.input-login-signup').reset()
            if (user == 'login') {
                document.querySelector('.check-cover input').checked = false;
                document.querySelector('#password').type = "password";
                setHidePassword(true)
            }
        } catch (e) { }
    }, [user])
    const closeLoginCard = () => {
        let loginCard = document.querySelector('.login-signup');
        loginCard.style = "width:0;padding:0;overflow:hidden;"
        loginCard.querySelector('.coverContent').classList.add('d-none');
        try { loginCard.querySelector("form msg").innerHTML = "" } catch (e) { }
        setEditUser(false)
        setBuyNow(false)
        if (user == 'forget_password') setUser('login');
    }
    const submitLogin = (isfor) => {
        let msg = document.querySelector('.login-signup msg');
        msg.style = "color:red";
        let formData = null;
        let error = false;
        if (isfor == "login") {
            let form = document.forms['login-form']
            formData = new FormData();
            formData.append('mobile', form['mobile'].value)
            formData.append('password', form['password'].value)
        }
        else if (isfor == 'create' || isfor == 'edit') {
            let form = document.forms['create-form']
            formData = new FormData();
            formData.append('mobile', form['mobile'].value)
            formData.append('name', form['name'].value)
            formData.append('email', form['email'].value)
            formData.append('address', form['address'].value)
            formData.append('password', form['password'].value)
            formData.append('con-pass', form['con-password'].value)

            if (formData.get('password') != formData.get('con-pass')) {
                msg.innerHTML = "Passwords are mismatch";
                error = true; return;
            }
            if (formData.get('password').length < 8 || formData.get('password').length > 15) {
                msg.innerHTML = "Passwords must be minimum 8 and maximum 15 characters";
                error = true; return;
            }
            if (formData.get('mobile').length != 10) {
                msg.innerHTML = "Length of Mobile Number must be 10";
                error = true; return;
            }
        }
        else if (isfor == 'forget-pass') {
            let form = document.forms['forget-password-form']
            formData = new FormData();
            formData.append('email', form['email'].value)
        }
        formData.forEach((data) => {
            if ((typeof (data) === 'string' && data.trim() === "")) {
                msg.innerHTML = "*Fill all the fields"
                error = true
                return
            }
        })
        if (isfor != 'forget-pass') {
            if (formData.get('mobile').toString().trim().length != 10) {
                msg.innerHTML = "Length of Mobile Number must be 10";
                error = true; return;
            }
        }

        if (!error) {
            if (isfor == 'login') {
                axios.post(backendURL + 'login', formData)
                    .then((response) => {
                        if (response.data == 'veggiz_admin') {
                            setCookie('veggiz_admin', true, { path: '/' });
                            window.location.href = "/admin";
                        }
                        else if (response.data == 'veggiz_delivery_man') {
                            setCookie('veggiz_delivery_person', true, { path: '/' });
                            window.location.href = "/orders";
                        }
                        else {
                            msg.style = "color:green;";
                            document.querySelector('.input-login-signup').reset()
                            setUser(response.data)
                            window.localStorage.setItem('user', [response.data[0].id, response.data[0].name])
                        }
                    }).catch((err) => {
                        try {
                            msg.innerHTML = err.response.data;
                        } catch (e) { }
                    })
            }
            else if (isfor == 'create' || isfor == 'edit') {
                let action = (isfor == 'create') ? axios.post(backendURL + 'create-user', formData) : axios.put(backendURL + 'edit-user', formData);

                action.then((response) => {
                    if (response.status == 200) {
                        msg.innerHTML = response.data;
                        msg.style = "color:green;";
                        document.querySelector('.input-login-signup').reset()
                        if (isfor == 'create')
                            setUser('login')
                        else
                            alert("Edited Successfully")
                        setEditUser(false)
                        return;
                    }
                }).catch((err) => {
                    try {
                        msg.innerHTML = err.response.data;
                    }
                    catch (e) { }
                })
            }
            else if (isfor == 'forget-pass') {
                axios.post(backendURL + 'forget-pass', formData)
                    .then((response) => {
                        msg.style = "color:green;";
                        msg.innerHTML = response.data;
                        document.querySelector('.input-login-signup').reset()
                    }).catch((err) => {
                        try {
                            msg.innerHTML = err.response.data;
                        } catch (e) { }
                    })
            }
        }
    }
    const logout = () => {
        setUser('login');
        window.localStorage.removeItem('user');
    }
    const showPassword = () => {
        if (hidePassword) {
            document.querySelector('#password').type = "text"
            return setHidePassword(false)
        }
        document.querySelector('#password').type = "password"
        return setHidePassword(true)
    }
    const showEditForm = () => {
        let form = document.forms['create-form'];
        if (typeof (user) == 'object') {
            form['name'].value = user[0].name;
            form['email'].value = user[0].email;
            form['address'].value = user[0].address;
            form['mobile'].value = user[0].mobile;
            form['password'].value = user[0].password;
            form['con-password'].value = user[0].password;
        }
    }
    const paymentGatway = () => {
        let msg = document.querySelector('.login-signup .pay-alert');
        msg.style = "color:red";
        let formData = null;
        let error = false;
        let form = document.forms['order-form']
        formData = new FormData();
        formData.append('mobile', form['mobile'].value)
        formData.append('name', form['name'].value)
        formData.append('address', form['address'].value)
        formData.append('product', JSON.stringify(cookies.cart));

        if (user != 'login' && user != 'create' && user != 'forget_password') {
            formData.append('login', "1");
        }
        else formData.append('login', '0');
        formData.forEach((data) => {
            if ((typeof (data) === 'string' && data.trim() === "")) {
                msg.innerHTML = "*Fill all the fields"
                error = true
                return;
            }
        })
        if (formData.get('mobile').length != 10) {
            msg.innerHTML = "Length of Mobile Number must be 10";
            error = true; return;
        }
        if (!error && buyNow == 'cash') {
            axios.post(backendURL + 'place-order-cash', formData)
                .then((response) => {
                    msg.style = "color:green;";
                    document.querySelector('.input-login-signup').reset()
                    let alert_crd = document.querySelector('.alert-card')
                    alert_crd.classList.remove('d-none')
                    alert_crd.querySelector('.alert-msg .msg').innerHTML = response.data;
                    alert_crd.querySelector('.orderId').classList.add('d-none')
                    alert_crd.querySelector('.paymentId').classList.add('d-none')
                    alert_crd.querySelector('.notes').classList.add('d-none')
                    localStorage.setItem('cart', '')
                    setCookie('cart', '', { path: '/' });
                }).catch((err) => {
                    try {
                        msg.innerHTML = err.response.data;
                    } catch (e) { }
                })
        }
        else if (!error && buyNow == 'net-banking') {
            setLoading('load-create-order')
            axios.post(backendURL + 'create-order', formData)
                .then((response) => {
                    setLoading(false);
                    let options = {
                        key: response.data.key,
                        amount: response.data.amount * 100,
                        currency: "INR",
                        name: formData.get('name'),
                        description: "Payment by " + formData.get('name') + " (Mobile: " + formData.get('mobile') + ")",
                        image: window.location.origin + "/assets/images/logo.png",
                        handler: function (resp) {
                            let orderData = new FormData();
                            orderData.append('key', resp.razorpay_payment_id)
                            orderData.append("orderId", response.data.orderId)
                            axios.put(backendURL + 'update-order', orderData)
                                .then((result) => {
                                    msg.style = "color:green";
                                    msg.innerHTML = "";
                                    closeLoginCard()
                                    let alert_crd = document.querySelector('.alert-card')
                                    alert_crd.classList.remove('d-none')
                                    alert_crd.querySelector('.orderId').classList.remove('d-none')
                                    alert_crd.querySelector('.paymentId').classList.remove('d-none')
                                    alert_crd.querySelector('.notes').classList.remove('d-none')
                                    alert_crd.querySelector('.msg').innerHTML = result.data;
                                    alert_crd.querySelector('.orderId span').innerHTML = response.data.orderId;
                                    alert_crd.querySelector('.paymentId span').innerHTML = resp.razorpay_payment_id;
                                    localStorage.setItem('cart', '')
                                    setCookie('cart', '', { path: '/' });
                                }).catch(err => {
                                    try {
                                        msg.style = "color:red";
                                        msg.innerHTML = err.response.data;
                                    }
                                    catch (e) { }
                                })
                        },
                        prefill: {
                            name: formData.get('name'),
                            contact: formData.get('mobile')
                        },
                        notes: {
                            address: "Razorpay Corporate office"
                        },
                        theme: {
                            color: "#3399cc"
                        }
                    };
                    let pay = new window.Razorpay(options);
                    pay.on('payment.failed', (response) => {
                        alert("payment Failed")
                    })
                    pay.open();
                }).catch((err) => {
                    setLoading(false);
                    try {
                        msg.innerHTML = err.response.data;
                    }
                    catch (e) { }
                })

        }
    }
    const hidePaymentCard = () => {
        document.querySelector('.payment-card').classList.add('d-none')
    }
    const hideAlertCard = () => {
        document.querySelector('.alert-card').classList.add('d-none');
        window.location.href = window.location.pathname;

    }
    const showPaymentCard = () => {
        let price = 0, itemsCount = 0;
        let cart = cookies.cart;
        for (const x in cart) {
            if (cart[x][0] != 0) {
                itemsCount += cart[x][0];
                price += cart[x][0] * cart[x][1]
            }
        }
        if (itemsCount > 0 && price > 0 && price >= 100) {
            document.querySelector('.cart-products msg').innerHTML = ""
            document.querySelector('.payment-card').classList.remove('d-none')
        }
        else {
            document.querySelector('.cart-products msg').innerHTML = "purchase minmum 100₹";
        }
    }
    const showOrderForm = () => {
        let form = document.forms['order-form'];
        if (typeof (user) == 'object') {
            form['name'].value = user[0].name;
            form['email'].value = user[0].email;
            form['address'].value = user[0].address;
            form['mobile'].value = user[0].mobile;
        }
    }
    const changeMeasures = (product) => {
        let p = document.querySelector('.p' + product.id);
        let measures = p.querySelector('select').value;
        let price = product.price.toString().split(';')[product.measures.toString().split(';').indexOf(measures)];
        let selling = (product.discount) ? Math.round(price - (price / 100) * product.discount) : price;
        p.querySelector('.selling-price').innerHTML = '₹' + selling;
        if (product.discount) p.querySelector('.actual-price').innerHTML = '₹' + price;
        let cartData = {}
        try {
            cartData = cookies.cart;
            cartData[product.product_name] = [cookies.cart[product.product_name][0], selling, cookies.cart[product.product_name][2], measures]
            setCookie('cart', cartData, { path: '/' });
            add_Cart(cartData)
        } catch (e) { }
    }
    return (
        <>
            <link href={window.location.origin + "/assets/css/user_header.css"} rel="stylesheet"></link>
            <div className='payment-card d-none'>
                <div class="cut" onClick={() => hidePaymentCard()}><i class='bx bx-x'></i></div>
                <div className='cash-on-delivery' onClick={() => { setBuyNow('cash'); showLaginCard(); hidePaymentCard(); }}>
                    <i class='bx bx-money-withdraw'></i>
                    <p>cash on delivery</p>
                </div>
                <div className='net-banking' onClick={() => { setBuyNow('net-banking'); showLaginCard(); hidePaymentCard(); }}>
                    <i class='bx bxl-paypal'></i>
                    <p>online payment</p>
                </div>
            </div>
            <div className='alert-card d-none'>
                <div class="cut" onClick={() => hideAlertCard()}><i class='bx bx-x'></i></div>
                <div className='alert-msg'>
                    <i class='bx bx-cart-download'></i>
                    <p className='msg'></p>
                </div>
                <div>
                    <p className='orderId'>OrderId: <span></span></p>
                    <p className='paymentId'>Payment Id: <span></span></p>
                    <p className='notes'>Dear customers, note order & payment Id for any refund relevant activities.</p>
                </div>
            </div>
            <section className='header'>
                <nav>
                    <div className='logo-div'>
                        <img src={window.location.origin + '/assets/images/logo.png'} alt='logo' onClick={() => window.location.href = '/'} />
                    </div>
                    <div className='location-div'>
                        <span className='other'>Place:</span>
                        <span className='location'>
                            {(user != 'login' && user != 'create' && user != 'forget_password') ? user[0].address : "Only for Sivakasi"}
                        </span>
                        <i></i>
                        {/* <i class='bx bx-chevron-down'></i> */}
                    </div>
                    <div className='search-div'>
                        <div className='cover-search'>
                            <i class='bx bx-search'></i>
                            <input type='search' placeholder='Search Product' onFocus={() => handelFocuseSearch()} onChange={() => handelSearchProduct()} />
                        </div>
                    </div>
                    <div className='log-in-out-div' onClick={() => showLaginCard()}>
                        <i class='bx bx-user-circle' ></i>
                    </div>
                    <div className='cart-div'>
                        <div className='cover-cart' onClick={() => handelClickCart()}>
                            <i class='bx bx-cart-alt' ></i>
                            <div className='items-count'>
                                <p>My Cart</p>
                                <div className='items-in-cart d-none'>
                                    <span className='count'></span>
                                    <span className='price'></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
                <div className='cart-products'>
                    <div className='coverContent d-none'></div>
                    <div className='cart-header'>
                        <h6>My Cart</h6>
                        <div class="cut" onClick={() => closeCartCard()}><i class='bx bx-x'></i></div>
                    </div>
                    <msg></msg>
                    {(cartProduct.length) ?
                        (<div className='cover-cart-items'>
                            <ul>
                                {cartProduct.map(p => {
                                    return ((cookies.cart[p.product_name])?(<li>
                                        <div className={'cart-product-container'}>
                                            <div className='img-cover'><img src={backendURL + "uploads/" + p.image} alt={p.product_name} /></div>
                                            <div className='cart-product-data'>
                                                <p>{p.product_name}</p>
                                                {/* <p>{p.measures.toString().split(';')[p.price.toString().split(';').indexOf(Math.floor(Number(cookies.cart[p.product_name][1]) / (1 - (p.discount / 100))).toString())]}</p> */}
                                                <p>{cookies.cart[p.product_name][3]}</p>
                                                <p>
                                                    <strong>₹{cookies.cart[p.product_name][1]}</strong>
                                                    <span>{p.discount != 0 ? Math.floor(Number(cookies.cart[p.product_name][1]) / (1 - (p.discount / 100))) : null}</span>
                                                </p>
                                            </div>
                                            <div className={'btn-add btn-' + p.id} onClick={() => handelClick_AddButton(p.id, p.product_name, p)}>
                                                <p>Add</p>
                                            </div>
                                            <div className={'btn-add-sub d-none btn-' + p.id + '-add'}>
                                                <span onClick={() => click_Add(p.id, p.product_name)}>+</span>
                                                <span className={'count-click count-click-' + p.id}></span>
                                                <span onClick={() => click_Sub(p.id, p.product_name)}>-</span>
                                            </div>
                                        </div>
                                    </li>):null)
                                })}
                            </ul>
                            <div className='buy-now'>
                                <div className='items-in-cart'>
                                    <span className='count'></span>
                                    <span className='price'></span>
                                    <span className='charges'></span>
                                </div>
                                <button onClick={() => showPaymentCard()}>Buy Now</button>
                            </div>
                        </div>)
                        :
                        (<div className='empty-cart'>
                            <div><img src={window.location.origin + "/assets/images/empty_cart.gif"} alt='Empty Cart' /></div>
                            <h6>You don't have any items in your cart</h6>
                            <button onClick={() => closeCartCard()}>Start Shoping</button>
                        </div>)
                    }
                </div>

                <div className="login-signup">
                    <div className='coverContent d-none'></div>
                    <div className="cut" onClick={() => closeLoginCard()}><i className='bx bx-x'></i></div>
                    <div className="title">
                        {(buyNow) ? (
                            <div>
                                <h1>Fill Detaile to place order</h1>
                            </div>
                        ) :
                            (user == 'login') ?
                                (<div>
                                    <h1>Login</h1>
                                    <p>or <span onClick={() => setUser('create')}>create an account</span></p>
                                </div>) :
                                (user == "create") ? (<div>
                                    <h1>Sign Up</h1>
                                    <p>or <span onClick={() => setUser('login')}>Login</span></p>
                                </div>) :
                                    (user == 'forget_password') ?
                                        (
                                            <div>
                                                <h1>Forget Password</h1>
                                                <p>or <span onClick={() => setUser('login')}>Login</span></p>
                                            </div>
                                        )
                                        :
                                        (<div className='userName'>
                                            <h1>{user[0].name}</h1>
                                        </div>)
                        }
                        <div>
                            <i class='bx bx-user-circle' ></i>
                        </div>
                    </div>
                    {(buyNow) ? (
                        <form method='post' onSubmit={(e) => e.preventDefault()} name="order-form" class="input-login-signup create">
                            <msg class="pay-alert"></msg>
                            <input type="number" name="mobile" placeholder="Phone Number" required />
                            <input type="text" name="name" placeholder="Name" required />
                            <input type="email" name="email" placeholder="Email (optional)" />
                            <input type="text" name="address" placeholder="Enter Your address" required />
                            <button type="submit" onClick={() => paymentGatway()}>Continue</button>
                        </form>
                    ) :
                        (user == 'login') ?
                            (<form method='post' onSubmit={(e) => e.preventDefault()} name="login-form" class="input-login-signup">
                                <msg></msg>
                                <input type="number" placeholder="Phone Number" name='mobile' required />
                                <input type="pasword" placeholder="Password" name='password' required id="password" />
                                <div className='check-cover'>
                                    <input type="checkbox" onChange={() => showPassword()} />
                                    <label>show password</label>
                                </div>
                                {/* <label className='forget-password' onClick={() => setUser('forget_password')}>Forget Password</label> */}
                                <button type="submit" onClick={() => submitLogin('login')}>Login</button>
                            </form>) :
                            (user == 'create' || editUser) ?
                                (<form method='post' onSubmit={(e) => e.preventDefault()} name="create-form" class="input-login-signup create">
                                    <msg></msg>
                                    <input type="number" name="mobile" placeholder="Phone Number" id='c-mobile' required />
                                    <input type="text" name="name" placeholder="Name" required />
                                    <input type="email" name="email" placeholder="Email" required />
                                    <input type="text" name="address" placeholder="Enter Your address" required />
                                    <input type='password' name="password" placeholder='Password' required />
                                    <input type='password' name="con-password" placeholder='Confirm Password' required />
                                    <button type="submit" onClick={() => (!editUser) ? submitLogin('create') : submitLogin('edit')}>Continue</button>
                                </form>) :
                                (user == 'forget_password') ?
                                    (
                                        <form method='post' onSubmit={(e) => e.preventDefault()} name="forget-password-form" class="input-login-signup forget-pass">
                                            <msg>Enter email id for recover</msg>
                                            <input type="email" placeholder="Email" name='email' required />
                                            <button type="submit" onClick={() => submitLogin('forget-pass')}>Get My Password</button>
                                        </form>
                                    )
                                    :
                                    (
                                        <div className='user-data'>
                                            <ul>
                                                <li>Email:<span>{user[0].email}</span></li>
                                                <li>Mobile:<span>{user[0].mobile}</span></li>
                                                <li>Address:<span>{user[0].address}</span></li>
                                            </ul>
                                            <label className='edit-user' onClick={() => { setEditUser('edit') }}><i class='bx bx-edit'></i> EDIT</label>
                                            <button className='log-out' onClick={() => logout()}>LOGOUT</button>
                                        </div>
                                    )
                    }
                </div>
            </section >

            <section className='search-products container'>
                <div className='categories'>
                    <ul>
                        {
                            searchProducts[1].map(c => {
                                return (<li onClick={() => window.location.href = "/category/" + c.name}>{c.name}</li>)
                            })
                        }
                    </ul>
                </div>
                <div className='wrapper'>
                    {
                        searchProducts[0].map(p => {
                            return (
                                <div className={'content p' + p.id}>
                                    <div className='cover-img' onClick={() => clickProduct(p.id)}><img src={backendURL + "uploads/" + p.image} alt={p.product_name} /></div>
                                    <div className='product-name' onClick={() => clickProduct(p.id)}><p>{p.product_name}</p></div>
                                    <div className='measures'>
                                        {(p.measures.toString().split(';').length > 1) ?
                                            (cookies.cart[p.product_name]) ?
                                                (cookies.cart[p.product_name][1]) ?
                                                    <select onChange={() => changeMeasures(p)}>
                                                        <option>{p.measures.toString().split(';')[p.price.toString().split(';').indexOf(Math.floor(Number(cookies.cart[p.product_name][1]) / (1 - (p.discount / 100))).toString())]}</option>
                                                        {
                                                            p.measures.toString().split(';').map(m => {
                                                                return (p.measures.toString().split(';')[p.price.toString().split(';').indexOf(Math.floor(Number(cookies.cart[p.product_name][1]) / (1 - (p.discount / 100))).toString())] != m) ?
                                                                    (<option>{m}</option>) : null;
                                                            })}
                                                    </select>
                                                    :
                                                    <select onChange={() => changeMeasures(p)}>{p.measures.toString().split(';').map(m => {
                                                        return (<option>{m}</option>)
                                                    })}</select> : <select onChange={() => changeMeasures(p)}>{p.measures.toString().split(';').map(m => {
                                                        return (<option>{m}</option>)
                                                    })}</select> :
                                            <p>{p.measures}</p>}
                                        {(p.veg != 2) ? <img src={window.location.origin + '/assets/images/' + ((p.veg == '1') ? "veg.jpg" : "non-veg.png")} /> : null}
                                    </div>
                                    <div className='cover-price'>
                                        {(cookies.cart[p.product_name]) ?
                                            (cookies.cart[p.product_name][1] != 0) ?
                                                <div className='price'>
                                                    <p className='selling-price'>₹{cookies.cart[p.product_name][1]}</p>
                                                    {(p.discount != 0) ? <p className='actual-price strike'>₹{Math.floor(Number(cookies.cart[p.product_name][1]) / (1 - (p.discount / 100)))}</p> : null}
                                                </div> : <div className='price'>
                                                    <p className='selling-price'>₹{Math.round(Number(p.price.toString().split(';')[0]) - ((Number(p.price.toString().split(';')[0]) / 100) * p.discount))}</p>
                                                    {(p.discount != 0) ? <p className='actual-price strike'>₹{p.price.toString().split(';')[0]}</p> : null}
                                                </div>
                                            :
                                            <div className='price'>
                                                <p className='selling-price'>₹{Math.round(Number(p.price.toString().split(';')[0]) - ((Number(p.price.toString().split(';')[0]) / 100) * p.discount))}</p>
                                                {(p.discount) ? <p className='actual-price strike'>₹{p.price.toString().split(';')[0]}</p> : null}
                                            </div>
                                        }
                                        <div className={'btn-add btn-' + p.id} onClick={() => handelClick_AddButton(p.id, p.product_name, p)}>
                                            <p>Add</p>
                                        </div>
                                        <div className={'btn-add-sub d-none btn-' + p.id + '-add'}>
                                            <span onClick={() => click_Add(p.id, p.product_name)}>+</span>
                                            <span className={'count-click count-click-' + p.id}></span>
                                            <span onClick={() => click_Sub(p.id, p.product_name)}>-</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </section>
        </>
    )
}

export default Header