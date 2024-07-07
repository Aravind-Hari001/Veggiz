import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import Footer from './Footer'
import axios from 'axios'
import { backendURL } from '../JS/constants'
import Page404 from './Page404'

function Orders() {
    const [cookies, setCookie] = useCookies();
    const [products, setProduct] = useState([]);
    const [orders, setOrder] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);
    
    let total = 0;

    useEffect(() => {
        axios.get(backendURL + 'admin/get-orders')
            .then(response => {
                setOrder(response.data)
            })
            .catch(err => {
                try {

                }
                catch (e) { }
            })
    }, [])
    const showProducts = (data) => {
        document.querySelector('.products').classList.remove('d-none')
        axios.get(backendURL + 'admin/get-order-products?data=' + data)
            .then(response => {
                setProduct(response.data[0])
                setTotalAmount(response.data[1])
                total = 0;
            })
            .catch(err => {
                try {

                }
                catch (e) { }
            })
    }
    const hideCard = (isfor) => {
        document.querySelector(isfor).classList.add('d-none')
        total = 0;
    }
    if (cookies.veggiz_delivery_person) {
        return (
            <>
                <link href={window.location.origin + "/assets/css/orders.css"} rel="stylesheet"></link>
                {/* orders */}
                <div className='cover-orders container'>
                    <div className="row products d-none">
                        <div className="col-lg-6">
                            <div class="card">
                                <div className='header'>
                                    <div className="title">Products</div>
                                    <div className="cut" onClick={() => hideCard('.products')}><i class='bx bx-x'></i></div>
                                </div>
                                <div class="card-body">
                                    <table class="table datatable table-responsive">
                                        <thead>
                                            <tr>
                                                <th>Image</th>
                                                <th>Name</th>
                                                <th>Unit</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                                <th>Discount</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                products.map(p => {
                                                    ++total;
                                                    return (
                                                        <tr>
                                                            <td><img src={backendURL + "uploads/" + p.image} alt={p.name}></img></td>
                                                            <td>{p.product_name}</td>
                                                            <td>{p.measures}</td>
                                                            <td>{p.quantity}</td>
                                                            <td>{p.price}</td>
                                                            <td>{p.discount}</td>
                                                            <td>{p.total}</td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                            <tr>
                                                <th colSpan={3}>Total Items</th>
                                                <th>{total}</th>
                                                <th colSpan={2}>Grand Total</th>
                                                <th>{totalAmount}</th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* orders */}
                    <div class="row orders">
                        <div class="col-lg-12">
                            <div class="card">
                                <div className='header'>
                                    <div className="title">Orders</div>
                                </div>
                                <div class="card-body">
                                    <table class="table datatable table-responsive">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Mobile</th>
                                                <th>Address</th>
                                                <th>Payment Type</th>
                                                <th>Date</th>
                                                <th>Delivery Status</th>
                                                <th>Payment Status</th>
                                                <th>Products</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                orders.map(order => {
                                                    return (
                                                        <tr>
                                                            <td>{order.name}</td>
                                                            <td>{order.mobile}</td>
                                                            <td>{order.address}</td>
                                                            <td style={{ color: (order.payment_type == 1) ? "green" : "blue" }}>{(order.payment_type == 1) ? "Online" : "Cash"}</td>
                                                            <td>{order.date.replace('T', ' (').slice(0, order.date.length - 4) + ')'}</td>
                                                            <td className='order'>
                                                                <p style={{ color: (order.delivery_status == 0) ? "red" : "goldenrod" }}>
                                                                    {(order.delivery_status == 0) ? "Waiting" : "Shifted"}
                                                                </p>
                                                            </td>
                                                            <td className='payment'>
                                                                <p style={{ color: (order.payment == 0) ? "red" : "green" }}>
                                                                    {(order.payment == 0) ? "Pending" : "Paied"}
                                                                </p>
                                                            </td>
                                                            <td><button className='btn btn-primary btn-sm' onClick={() => showProducts(order.product)}>View</button></td>
                                                        </tr>
                                                    )
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer></Footer>
            </>
        )
    } else {
        return (<Page404></Page404>)
    }
}

export default Orders