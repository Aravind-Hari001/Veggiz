import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import Header from './Header'
import Footer from './Footer'
import axios from 'axios'
import { backendURL } from '../../JS/constants'
import Page404 from '../Page404'

function DashBoard() {
    const [cookies, setCookie] = useCookies();
    const [orders, setOrder] = useState([]);
    const [products, setProduct] = useState([]);
    const [users, setUser] = useState([]);
    const [total, setTotal] = useState([]);
    const [deleteId, setDelete] = useState([]);
    const [countNew, setNew] = useState(0)
    const [delUser, setDelUser] = useState(null)
    const [count, setCount] = useState([0, 0])
    let orderItemCount= 0;
    useEffect(() => {
        axios.get(backendURL + 'admin/get-orders')
            .then(response => {
                setOrder(response.data)
                let c = 0
                for (let x of response.data) {
                    if (x.delivery_status == 0) {
                        c++;
                    }
                }
                setNew(c);
            })
            .catch(err => {
                try {

                }
                catch (e) { }
            })
    }, [])
    useEffect(() => {
        axios.get(backendURL + 'admin/get-user')
            .then(response => {
                setUser(response.data)
            })
            .catch(err => {
                try {

                }
                catch (e) { }
            })
    }, [delUser])
    useEffect(() => {
        axios.get(backendURL + 'admin/get-count-user-page')
            .then(response => {
                setCount([response.data[0][0].users, response.data[1][0].amount])
            })
            .catch(err => {
                try {

                }
                catch (e) { }
            })
        try {
            document.querySelector('.nav-new-order p').innerHTML = countNew;
        } catch (e) { }
    }, [orders, users])
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                viewNew();
            } catch (error) { }
        };
        fetchOrders();
        const intervalId = setInterval(fetchOrders, 60000);
        return () => clearInterval(intervalId);
    }, []);

    const viewNew = () => {
        axios.get(backendURL + 'admin/get-orders')
            .then(response => {
                setOrder(response.data)
                let c = 0
                for (let x of response.data) {
                    if (x.delivery_status == 0) {
                        c++;
                    }
                }
                setNew(c);
            })
            .catch(err => {
                try {

                }
                catch (e) { }
            })
    }
    const showProducts = (data) => {
        document.querySelector('.products').classList.remove('d-none')
        axios.get(backendURL + 'admin/get-order-products?data=' + data)
            .then(response => {
                setProduct(response.data[0])
                setTotal(response.data[1])
                orderItemCount=0;
            })
            .catch(err => {
                try {

                }
                catch (e) { }
            })
    }
    const handelPayment = (id, data, status) => {
        if (status > 0) {
            return;
        }
        axios.put(backendURL + 'admin/update-payment-status-order?id=' + id + "&data=" + data)
            .then(response => {
                if (response.data == 'success') {
                    viewNew();
                }
            })
            .catch(err => {
                try {

                }
                catch (e) { }
            })
    }
    const handelOrder = (id, data, status) => {
        if (status > 0) return;
        axios.put(backendURL + 'admin/update-delivery-status-order?id=' + id + "&data=" + data)
            .then(response => {
                if (response.data == 'success') {
                    viewNew();
                }
            })
            .catch(err => {
                try {

                }
                catch (e) { }
            })
    }
    const hideCard = (isfor) => {
        document.querySelector(isfor).classList.add('d-none')
        if (isfor == '.products') setTotal(0);
        if (isfor == '.alert-card') setDelete(null)
    }
    const showAlertCard = (isfor) => {
        if (isfor == 'order') document.querySelector('.alert-order').classList.remove('d-none')
        if (isfor == 'user') document.querySelector('.alert-user').classList.remove('d-none')
    }
    const cancerOrder = () => {
        axios.delete(backendURL + 'admin/cancer-order?id=' + deleteId[0] + "&user=" + deleteId[1] + "&user_id=" + deleteId[2])
            .then(response => {
                if (response.data == 'success') {
                    viewNew();
                    setDelete(null)
                }
            })
            .catch(err => {
                try {

                }
                catch (e) { }
            })
    }
    const deleteUser = () => {
        axios.delete(backendURL + 'admin/delete-user?id=' + deleteId)
            .then(response => {
                if (response.data == 'success') {
                    setDelUser(1);
                    setDelete(null);
                }
            })
            .catch(err => {
                try {

                }
                catch (e) { }
            })
    }
    if (cookies.veggiz_admin) {
        return (
            <>
                <link href={window.location.origin + "/assets/css/admin_dashboard.css"} rel="stylesheet"></link>
                <Header></Header>
                <section className='dashboard container'>
                    <div className='alert-card alert-order d-none'>
                        <p>Are You surely want to Cancel this Order?</p>
                        <div>
                            <button className='btn btn-sm btn-primary' onClick={() => { cancerOrder(); hideCard('.alert-order') }}>Ok</button>
                            <button className='btn btn-sm btn-danger' onClick={() => hideCard('.alert-order')}>Cancel</button>
                        </div>
                    </div>
                    <div className='alert-card alert-user d-none'>
                        <p>Are You surely want to Delete this user?</p>
                        <div>
                            <button className='btn btn-sm btn-primary' onClick={() => { deleteUser(); hideCard('.alert-user') }}>Ok</button>
                            <button className='btn btn-sm btn-danger' onClick={() => hideCard('.alert-user')}>Cancel</button>
                        </div>
                    </div>
                    {/* counts */}
                    <div className='counts'>
                        <div className='card'>
                            <div className='header'>
                                <h2>New Orders</h2>
                            </div>
                            <div className='card-body'>
                                <i class='bx bx-message-rounded-add'></i>
                                <p>{countNew}</p>
                            </div>
                        </div>
                        <div className='card'>
                            <div className='header'>
                                <h2>Users</h2>
                            </div>
                            <div className='card-body'>
                                <i class='bx bx-user-plus'></i>
                                <p>{count[0]}</p>
                            </div>
                        </div>
                        <div className='card'>
                            <div className='header'>
                                <h2>Sales</h2>
                            </div>
                            <div className='card-body'>
                                <i class='bx bx-money-withdraw'></i>
                                <p>{count[1]}</p>
                            </div>
                        </div>
                    </div>
                    {/* products */}
                    <div class="row products d-none">
                        <div class="col-lg-6">
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
                                                    ++orderItemCount;
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
                                                <th>{orderItemCount}</th>
                                                <th colSpan={2}>Grand Total</th>
                                                <th>{total}</th>
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
                                    <div className='cover-refresh'>
                                        {(countNew > 0) ?
                                            <p className='new-msg'>{countNew + " New"}</p> : null
                                        }
                                        <button className='btn btn-primary btn-sm' onClick={() => viewNew()}>Refresh</button>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <table class="table datatable table-responsive">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Mobile</th>
                                                <th>Address</th>
                                                <th>Payment Type</th>
                                                <th>Pay Id</th>
                                                <th>Date</th>
                                                <th>Delivery Status</th>
                                                <th>Payment Status</th>
                                                <th>Products</th>
                                                <th>Cancel Order</th>
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
                                                            <td>{(order.pay_id && order.pay_id != 0) ? order.pay_id : '--'}</td>
                                                            <td>{order.date.replace('T', ' (').slice(0, order.date.length - 4) + ')'}</td>
                                                            <td className='order'>
                                                                <p onClick={() => handelOrder(order.id, order.product, order.delivery_status)} style={{ color: (order.delivery_status == 0) ? "red" : "goldenrod" }}>
                                                                    {(order.delivery_status == 0) ? "Waiting" : "Shifted"}
                                                                </p>
                                                            </td>
                                                            <td className='payment'>
                                                                <p onClick={() => handelPayment(order.id, order.product, order.payment)} style={{ color: (order.payment == 0) ? "red" : "green" }}>
                                                                    {(order.payment == 0) ? "Pending" : "Paied"}
                                                                </p>
                                                            </td>
                                                            <td><button className='btn btn-primary btn-sm' onClick={() => showProducts(order.product)}>View</button></td>
                                                            <td><p style={{ color: "red", textDecoration: "underline" }} onClick={() => { showAlertCard('order'); setDelete([order.id, order.user_status, order.user_id]) }}>Cancer</p></td>
                                                        </tr>
                                                    )
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* users */}
                    <div class="row user">
                        <div class="col-lg-12">
                            <div class="card">
                                <div className='header'>
                                    <div className="title">Users</div>
                                </div>
                                <div class="card-body">
                                    <table class="table datatable table-responsive">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Mobile</th>
                                                <th>Email</th>
                                                <th>Address</th>
                                                <th>Password</th>
                                                <th>Date</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                users.map(u => {
                                                    return (
                                                        <tr>
                                                            <td>{u.name}</td>
                                                            <td>{u.mobile}</td>
                                                            <td>{u.email}</td>
                                                            <td>{u.address}</td>
                                                            <td>{u.password}</td>
                                                            <td>{u.date}</td>
                                                            <td><button className='btn btn-danger btn-sm' onClick={() => { showAlertCard('user'); setDelete(u.id) }}>Delete</button></td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Footer></Footer>
            </>
        )
    } else {
        return (<Page404></Page404>)
    }
}

export default DashBoard