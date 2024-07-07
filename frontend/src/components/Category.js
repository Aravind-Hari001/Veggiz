import React, { useEffect, useState } from 'react'
import Header from './Header'
import axios from 'axios';
import { useParams } from 'react-router-dom'
import { useCookies } from 'react-cookie'
import { backendURL } from '../JS/constants';
import Footer from './Footer';

function Category() {
    const [cookies, setCookie] = useCookies();
    const [cart, setCart] = useState({})
    const [products, setProducts] = useState([[], []])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);
    const [currentCategory, setCurrentCategory] = useState(null);
    const { name } = useParams()
    const [sortBy, setSortBy] = useState(['product_name', 0]);

    useEffect(() => {
        let cname = (currentCategory) ? currentCategory : name;
        axios.get(backendURL + 'get-product-from-category?name=' + cname + "&sort=" + sortBy[0] + "&order=" + sortBy[1])
            .then(response => {
                if (response.data == "error")
                    setError("Unable to fetch data")
                else {
                    setProducts(response.data)
                }
            })
            .catch(err => { })
        if (!currentCategory) setCurrentCategory(name);
    }, [sortBy])
    useEffect(() => {
        if (!cookies.cart) {
            setCookie('cart', {}, { path: '/' });
        }
        if (cookies.cart) {
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
                    setCart(cookies.cart)
                }
            }
        }
    }, [currentCategory, products])
    const handelClick_AddButton = (btn, p_name, product) => {
        let selling = product.price;
        let measures = product.measures;
        try {
            let p = document.querySelector('.p' + product.id);
            measures = p.querySelector('select').value;
            selling = product.price.toString().split(';')[product.measures.toString().split(';').indexOf(measures)];
        } catch (e) { }
        selling = Math.round(selling - (selling / 100) * product.discount);
        let add_btn = document.querySelector('.btn-' + btn)
        let add_sub_btn = document.querySelector('.btn-' + btn + '-add')
        add_btn.classList.add('d-none')
        add_sub_btn.classList.remove('d-none')
        let cartData = cart;
        cartData[p_name] = [1, selling, btn, measures]
        setCart(cartData)
        setCookie('cart', cartData, { path: '/' });
        add_Cart(cartData)
        let count_item = document.querySelectorAll('.count-click-' + btn)
        for (const count of count_item)
            count.innerHTML = cartData[p_name][0];
    }
    const click_Add = (pid, p_name) => {
        let cartData = cookies.cart;
        cartData[p_name][0] += 1
        setCart(cartData);
        setCookie('cart', cartData, { path: '/' });
        add_Cart(cartData)
        let counters = document.querySelectorAll('.count-click-' + pid)
        for (const couter of counters) {
            couter.innerHTML = cartData[p_name][0];
        }
    }
    const click_Sub = (btn, p_name) => {
        let cartData = cookies.cart;
        if (cartData[p_name][0] > 1) {
            cartData[p_name][0] -= 1;
            setCart(cartData);
            setCookie('cart', cartData, { path: '/' });
            add_Cart(cartData)
            let counters = document.querySelectorAll('.count-click-' + btn);
            for (const couter of counters) {
                couter.innerHTML = cartData[p_name][0];
            }
        }
        else {

            cartData[p_name] = [0, 0,null,null];
            setCart(cartData);
            setCookie('cart', cartData, { path: '/' });
            add_Cart(cartData);
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
            for (let i of tmp) i.innerHTML = "₹" + price
        }
        else {
            let countItem = document.querySelector('.header nav .cart-div .items-count')
            countItem.querySelector('p').classList.remove('d-none')
            countItem.querySelector('.items-in-cart').classList.add('d-none')
        }
    }
    const clickProduct = (pid) => {
        window.location.href = "/product/" + pid
    }
    const changeCategory = (name) => {
        setLoading('product')
        axios.get(backendURL + 'get-product-from-category?name=' + name + "&sort=" + sortBy[0] + "&order=" + sortBy[1])
            .then(response => {
                setProducts(response.data)
                setLoading(false);
                setCurrentCategory(name)
            })
            .catch(err => {
                setLoading(false)
            })
    }
    const sortProduct = () => {
        let selectedOrder = document.querySelector('.category-nav div select').value;
        switch (selectedOrder) {
            case "Price(Low to High)":
                setSortBy(['price', 0]);
                break;
            case "Price(High to Low)":
                setSortBy(['price', 1]);
                break;
            case "Discount(Low to High)":
                setSortBy(['discount', 0]);
                break;
            case "Discount(High to Low)":
                setSortBy(['discount', 1]);
                break;
            default:
                setSortBy(['product_name', 0]);
                break;
        }
    }
    const changeMeasures = (product) => {
        let p = document.querySelector('.p' + product.id);
        let measures = p.querySelector('select').value;
        let price = product.price.toString().split(';')[product.measures.toString().split(';').indexOf(measures)];
        let selling = (product.discount) ? Math.round(price - (price / 100) * product.discount) : price;
        p.querySelector('.selling-price').innerHTML = '₹' + selling;
        if (product.discount) p.querySelector('.actual-price').innerHTML = '₹' + price;
        try {
            let cartData = cart;
            cartData[product.product_name] = [cart[product.product_name][0], selling, cart[product.product_name][2], measures]
            setCart(cartData)
            setCookie('cart', cartData, { path: '/' });
            add_Cart(cartData)
        } catch (e) { }
    }
    return (
        <>
            <Header updateCart={setCart}></Header>
            <link href={window.location.origin + "/assets/css/category.css"} rel="stylesheet"></link>
            <section className='category'>
                <div className='cover-category'>
                    <div className='relevent-category'>
                        <ul>
                            {
                                products[1].map(c => {
                                    return (<li className={(c.name == currentCategory) ? 'active' : null} onClick={() => changeCategory(c.name)}>
                                        <div>
                                            <img src={backendURL + "uploads/" + c.image} alt={c.name} />
                                            <p>{c.name}</p>
                                        </div>
                                    </li>)
                                })
                            }
                        </ul>
                    </div>

                    <div className='cover-product'>
                        <div className='category-nav'>
                            <h6>{currentCategory}</h6>
                            <div>
                                <p>Sort&nbsp;By</p>
                                <select onChange={() => sortProduct()}>
                                    <option><p>{"Name(A to Z)"}</p></option>
                                    <option><p>{"Price(Low to High)"}</p></option>
                                    <option><p>{"Price(High to Low)"}</p></option>
                                    <option><p>{"Discount(Low to High)"}</p></option>
                                    <option><p>{"Discount(High to Low)"}</p></option>
                                </select>
                            </div>
                        </div>

                        <div className='product'>
                            <div className='wrapper'>
                                {
                                    products[0].map(p => {
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

                        </div>
                    </div>
                </div>

            </section>
            <Footer></Footer>
        </>
    )
}

export default Category