import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from './Header'
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { backendURL } from '../JS/constants';
import Footer from './Footer';

function Product() {
    const [product, setProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null)
    const [cart, setCart] = useState({})
    const [cookies, setCookie] = useCookies();
    const { id } = useParams()
    useEffect(() => {
        axios.get(backendURL + 'get-product?id=' + id)
            .then(response => {
                if (response.data == "error")
                    setError("Unable to fetch data")
                else
                    setProduct(response.data)
            })
            .catch(err => { })
    }, [])
    useEffect(() => {
        try {
            if (cookies.cart) {
                for (const x in cookies.cart) {
                    if (cookies.cart[x][2] == id) {
                        let add_btn = document.querySelector('.product .wrapper .product-name .btn-' + cookies.cart[x][2])
                        let add_sub_btn = document.querySelector('.product .wrapper .product-name .btn-' + cookies.cart[x][2] + '-add')
                        add_btn.classList.add('d-none')
                        add_sub_btn.classList.remove('d-none')
                        document.querySelector('.product .wrapper .product-name .count-click-' + cookies.cart[x][2]).innerHTML = cookies.cart[x][0];
                        break;
                    }
                }
                setCart(cookies.cart)
                addCart(cookies.cart)
            }
        } catch (err) { }
    }, [product])
    const handelClickAddButton = (btn, p_name, price) => {
        let add_btn = document.querySelector('.product .wrapper .product-name .btn-' + btn)
        let add_sub_btn = document.querySelector('.product .wrapper .product-name .btn-' + btn + '-add')
        add_btn.classList.add('d-none')
        add_sub_btn.classList.remove('d-none')
        let cartData = cart;
        cartData[p_name] = [1, price, btn]
        setCart(cartData)
        setCookie('cart', cartData, { path: '/' });
        addCart(cartData)
        document.querySelector('.product .wrapper .product-name .count-click-' + btn).innerHTML = cartData[p_name][0];
    }
    const clickAdd = (pid, p_name) => {
        let cartData = cookies.cart;
        cartData[p_name][0] += 1
        setCart(cartData)
        setCookie('cart', cartData, { path: '/' });
        addCart(cartData)
        document.querySelector('.product .wrapper .product-name .count-click-' + pid).innerHTML = cartData[p_name][0];
    }
    const clickSub = (btn, p_name) => {
        let cartData = cookies.cart;
        if (cartData[p_name][0] > 1) {
            cartData[p_name][0] -= 1;
            setCart(cartData);
            setCookie('cart', cartData, { path: '/' });
            addCart(cartData)
            document.querySelector('.product .wrapper .product-name .count-click-' + btn).innerHTML = cartData[p_name][0];
        }
        else {
            cartData[p_name] = [0, 0];
            setCart(cartData);
            setCookie('cart', cartData, { path: '/' });
            addCart(cartData)
            document.querySelector('.product .wrapper .product-name .btn-' + btn).classList.remove('d-none')
            document.querySelector('.product .wrapper .product-name .btn-' + btn + '-add').classList.add('d-none')
        }
    }
    const addCart = (cart) => {
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
            for (let i of tmp) i.innerHTML = "₹" + price
        }
        else {
            let countItem = document.querySelector('.header nav .cart-div .items-count')
            countItem.querySelector('p').classList.remove('d-none')
            countItem.querySelector('.items-in-cart').classList.add('d-none')
        }
    }
    return (
        <>
            <link href={window.location.origin + "/assets/css/product.css"} rel="stylesheet"></link>
            <Header cartState={setCart}></Header>
            <section className='product'>
                {
                    product.map(p => {
                        return (
                            <div className='wrapper'>
                                <div className='whole-cover'>
                                    <div className='cover-inner'>
                                        <div className='img-cover'>
                                            <img src={backendURL + "uploads/" + p['image']} alt={p['product_name']} />
                                        </div>
                                        <div className='product-name'>
                                            <div className='product-data'>
                                                <p className='p-name'>{p.product_name}</p>
                                                <p className='mrp'>MRP ₹{p.discount != 0 ? Math.round(p.price - ((p.price / 100) * p.discount)) : p.price} <span>{p.measures}</span></p>
                                            </div>
                                            <div className={'btn-add btn-' + p.id} onClick={() => handelClickAddButton(p.id, p.product_name, Math.round(p.price - ((p.price / 100) * p.discount)))}>
                                                <p>Add</p>
                                            </div>
                                            <div className={'btn-add-sub d-none btn-' + p.id + '-add'}>
                                                <span onClick={() => clickAdd(p.id, p.product_name)}>+</span>
                                                <span className={'count-click count-click-' + p.id}></span>
                                                <span onClick={() => clickSub(p.id, p.product_name)}>-</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='product-details'>
                                    <h1>Product Details</h1>
                                    <div>
                                        <h3>Nature Of Product</h3>
                                        <p className='cover-veg'>
                                            <img src={window.location.origin + '/assets/images/' + ((p.veg == '1') ? "veg.jpg" : "non-veg.png")} />
                                            {p.veg == 1 ? "Veg" : "Non Veg"}
                                        </p>
                                    </div>
                                    <div>
                                        <h3>Unit</h3>
                                        <p>{p.measures}</p>
                                    </div>
                                    <div>
                                        <h3>Life Time</h3>
                                        <p>{(p.life_time != 0) ? p.life_time : "Refer packing of product"}</p>
                                    </div>
                                    <div>
                                        <h3>Country Of Orgin</h3>
                                        <p>{p.orgin}</p>
                                    </div>
                                    <div>
                                        <h3>Package Type</h3>
                                        <p>{p.package_type}</p>
                                    </div>
                                    <div>
                                        <h3>Package Type</h3>
                                        <p>{p.package_type}</p>
                                    </div>
                                    <div>
                                        <h3>Customer Care Details</h3>
                                        <p>Email: veggiz@.com</p>
                                    </div>
                                    <div>
                                        <h3>Return Policy</h3>
                                        <p>This product cannot be returned. However, if the item is
                                            damaged, defective, incorrect, or has expired, you can request a replacement within 72
                                            hours of delivery. If you receive an incorrect item, you may request a replacement or return
                                            it only if it remains sealed, unopened, unused, and in its original condition.
                                        </p>
                                    </div>
                                </div>
                            </div>)
                    })
                }
            </section>
            <Footer></Footer>
        </>
    )
}

export default Product