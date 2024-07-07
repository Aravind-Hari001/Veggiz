import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useCookies } from 'react-cookie';
import { backendURL } from '../JS/constants'
import Header from './Header'
import Footer from './Footer';

function Home() {
  const [products, setProduct] = useState([]);
  const [categories, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null)
  const [cart, setCart] = useState({})
  const [cookies, setCookie] = useCookies();

  useEffect(() => {
    axios.get(backendURL + 'get-some-products')
      .then(response => {
        if (response.data == "error")
          setError("Unable to fetch data")
        else {
          let filter = []
          for (let i = 0; i < response.data[1].length; i++) {
            let tmp = [], present = false
            for (let j = 0; j < response.data[0].length; j++) {
              if (response.data[0][j].catagory_id == response.data[1][i].id) {
                present = true;
                tmp.push(response.data[0][j]);
              }
            }
            if (present) {
              tmp.push(response.data[1][i].name)
              filter.push(tmp)
            }
          }
          setProduct(filter)
        }
      })
      .catch(err => { })
  }, [])
  useEffect(() => {
    try {
      if (cookies.cart) {
        for (const x in cookies.cart) {
          if (cookies.cart[x][0] != 0) {
            let add_btn = document.querySelector('.products .card .card-body .content .btn-' + cookies.cart[x][2])
            let add_sub_btn = document.querySelector('.products .card .card-body .content .btn-' + cookies.cart[x][2] + '-add')
            add_btn.classList.add('d-none')
            add_sub_btn.classList.remove('d-none')
            document.querySelector('.products .card .card-body .content .count-click-' + cookies.cart[x][2]).innerHTML = cookies.cart[x][0];
          }
        }
        setCart(cookies.cart)
        addCart(cookies.cart)
      }
    } catch (err) { }
  }, [cart, products])
  useEffect(() => {
    setLoading('category');
    axios.get(backendURL + 'get-category')
      .then(response => {
        setLoading(false)
        setCategory(response.data)
      })
      .catch(err => { setLoading(false) })
  }, [])
  const scrollContent = (move, isfor) => {
    let card_body = document.querySelector('.products .card .card-' + isfor)
    let move_left = document.querySelector(`.products .card .scroller-${isfor} .move-left`)

    if (move == 'right') {
      card_body.scrollLeft = card_body.scrollLeft + (card_body.offsetWidth - 200);
      if (card_body.scrollWidth > card_body.offsetWidth)
        move_left.classList.remove('d-none')
    }
    else {
      card_body.scrollLeft = card_body.scrollLeft - (card_body.offsetWidth);
      if (card_body.scrollLeft <= (card_body.offsetWidth)) {
        move_left.classList.add('d-none')
        card_body.scrollLeft = 0;
      }
    }
  }
  const handelClickAddButton = (btn, p_name, product) => {
    let selling = product.price;
    let measures = product.measures;
    try {
      let p = document.querySelector('.p' + product.id);
      measures = p.querySelector('select').value;
      selling = product.price.toString().split(';')[product.measures.toString().split(';').indexOf(measures)];
    } catch (e) { }
    selling = Math.round(selling - (selling / 100) * product.discount);
    let add_btn = document.querySelector('.products .card .card-body .content .btn-' + btn)
    let add_sub_btn = document.querySelector('.products .card .card-body .content .btn-' + btn + '-add')
    add_btn.classList.add('d-none')
    add_sub_btn.classList.remove('d-none')
    let cartData = cart;
    cartData[p_name] = [1, selling, btn, measures]
    setCart(cartData)
    setCookie('cart', cartData, { path: '/' });
    addCart(cartData)
    document.querySelector('.products .card .card-body .content .count-click-' + btn).innerHTML = cartData[p_name][0];
  }
  const clickAdd = (pid, p_name) => {
    let cartData = cart;
    cartData[p_name][0] += 1
    setCart(cartData)
    setCookie('cart', cartData, { path: '/' });
    addCart(cartData)
    document.querySelector('.products .card .card-body .content .count-click-' + pid).innerHTML = cartData[p_name][0];
  }
  const clickSub = (btn, p_name) => {
    let cartData = cart;
    if (cartData[p_name][0] > 1) {
      cartData[p_name][0] -= 1;
      setCart(cartData);
      setCookie('cart', cartData, { path: '/' });
      addCart(cartData)
      document.querySelector('.products .card .card-body .content .count-click-' + btn).innerHTML = cartData[p_name][0];
    }
    else {
      cartData[p_name] = [0, 0,null,null];
      setCart(cartData);
      setCookie('cart', cartData, { path: '/' });
      addCart(cartData)
      document.querySelector('.products .card .card-body .content .btn-' + btn).classList.remove('d-none')
      document.querySelector('.products .card .card-body .content .btn-' + btn + '-add').classList.add('d-none')
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
  const clickProduct = (pid) => {
    window.location.href = "/product/" + pid
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
      addCart(cartData)
    } catch (e) { }
  }
  return (
    <>
      <link href={window.location.origin + "/assets/css/home.css"} rel="stylesheet"></link>
      <Header updateCart={setCart}></Header>
      <div className='banner'>
        <div className='banner-content'>
          <h1>Big Salles</h1>
          <h6>for your daily needs</h6>
        </div>
      </div>
      <section className='wrapper container'>
        <div className='categories-div'>
          {
            categories.map(c => {
              return (<div className='cover-category' onClick={() => window.location.href = "/category/" + c.name}>
                <img src={backendURL + 'uploads/' + c.image} alt={c.name} />
                <p>{c.name}</p>
              </div>)
            })
          }
        </div>
        <div className='products'>
          {
            products.map(product => {
              return (
                <div className='card'>
                  <div className='card-header'>
                    <h2>{product[product.length - 1]}</h2>
                    <h6 onClick={() => window.location.href = "/category/" + product[product.length - 1]}>View All</h6>
                  </div>
                  <div className={"card-" + product[product.length - 1].split(' ')[0] + ' card-body'}>
                    {
                      product.slice(0, product.length - 1).map(p => {

                        return (<div className={'content p' + (p.id)}>
                          <div className='inner-content'>
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
                            <div className={'btn-add btn-' + p.id} onClick={() => handelClickAddButton(p.id, p.product_name, p)}>
                              <p>Add</p>
                            </div>
                            <div className={'btn-add-sub d-none btn-' + p.id + '-add'}>
                              <span onClick={() => clickAdd(p.id, p.product_name)}>+</span>
                              <span className={'count-click count-click-' + p.id}></span>
                              <span onClick={() => clickSub(p.id, p.product_name)}>-</span>
                            </div>
                          </div>
                        </div>)
                      })
                    }
                    {(window.screen.width > 1000) ?
                      <div className={'scroller scroller-' + product[product.length - 1].split(' ')[0]}>
                        <div>
                          <div className='move-left d-none' onClick={() => scrollContent('left', product[product.length - 1].split(' ')[0])}><i class='bx bx-chevron-left'></i></div>
                        </div>
                        <div>
                          <div className='move-right' onClick={() => scrollContent('right', product[product.length - 1].split(' ')[0])}><i class='bx bx-chevron-right'></i></div>
                        </div>
                      </div> : null
                    }
                  </div>
                </div>)
            })
          }
        </div>
      </section>
      <Footer></Footer>
    </>
  )
}
export default Home;