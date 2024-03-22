import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import axios from 'axios'
import { backendURL } from '../../JS/constants'
function Header() {
    const [cookies, setCookie] = useCookies();
    const [countNew, setNew] = useState(0)
    const [editFor, setEditFor] = useState(null)
    useEffect(() => {
        axios.get(backendURL + 'admin/get-orders')
            .then(response => {
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
    const hideCard = (isfor) => {
        if (isfor == '.menu') {
            let menu = document.querySelector('.menu')
            menu.style = "width:0;padding:0;overflow:hidden;"
        }
        else if (isfor == '.edit-admin') {
            let edit_card = document.querySelector(isfor)
            edit_card.querySelector('.msg').innerHTML = ""
            edit_card.querySelector('form').reset()
            edit_card.classList.add('d-none');
        }
    }
    const showMenu = () => {
        let menu = document.querySelector('.menu')
        menu.style = "width:80%;padding:20px;overflow:visible;"
    }
    const logout = () => {
        setCookie('veggiz_admin', false, { path: '/' });
        window.location.href = "/"
    }
    const showEdit = () => {
        document.querySelector('.edit-admin').classList.remove('d-none');

    }
    const submitEditAdmin = () => {
        let form = document.forms['edit-admin'];
        let formData = new FormData();
        let msg = document.querySelector('.edit-admin .msg');
        msg.style = "color:red"
        formData.append('mobile', form['mobile'].value)
        formData.append('password', form['password'].value)
        formData.append('con-password', form['con-password'].value)
        let error = false;
        formData.forEach((data) => {
            if (data === "null" || (typeof (data) === 'string' && data.trim() === "")) {
                msg.innerHTML = "*Fill all the fields"
                error = true
                return
            }
        })
        if (formData.get('mobile').length != 10) {
            msg.innerHTML = "Length of Mobile Number must be 10";
            error = true; return;
        }
        if (formData.get('password') != formData.get('con-password')) {
            msg.innerHTML = "Passwords are mismatch";
            error = true; return;
        }
        if (!error) {
            if (editFor == 'admin') {
                axios.put(backendURL + 'admin/edit-admin', formData)
                    .then((response) => {
                        hideCard('.edit-admin');
                        alert("Edited Successfully!")
                    }).catch((err) => {
                        try {
                            msg.innerHTML = err.response.data;
                        } catch (e) { }
                    })
            }
            else if(editFor=='deliveryman'){
                axios.put(backendURL + 'admin/edit-delivery-man', formData)
                    .then((response) => {
                        hideCard('.edit-admin');
                        alert("Edited Successfully!")
                    }).catch((err) => {
                        try {
                            msg.innerHTML = err.response.data;
                        } catch (e) { }
                    })
            }
        }
    }
    return (
        <>
            <link href={window.location.origin + "/assets/css/admin_header.css"} rel="stylesheet"></link>
            <section className='admin-header'>
                <div className='edit-admin d-none'>
                    <div className='edit-card-header'>
                        <h2>{(editFor == 'admin') ? "Edit Admin" : "Edit Delivery Man"}</h2>
                        <div class="cut" onClick={() => hideCard('.edit-admin')}><i class='bx bx-x'></i></div>
                    </div>
                    <p className="msg"></p>
                    <form method="post" name='edit-admin' onSubmit={(e) => e.preventDefault()}>
                        <input type="number" name="mobile" class="form-control" placeholder="Mobile" required />
                        <input type="password" name="password" class="form-control" placeholder="Password" required />
                        <input type="password" name="con-password" class="form-control" placeholder="Confirm Password" required />
                        <button type="submit" onClick={() => submitEditAdmin()} class="form-control btn btn-primary">Edit</button>
                    </form>
                </div>
                <nav>
                    <div className='app-menu'>
                        {
                            (window.screen.width <= 1000) ?
                                <div className='menu-icon' onClick={() => showMenu()}>
                                    <i class='bx bx-menu'></i>
                                </div>
                                : null
                        }
                        <div className='logo'>
                            <img src={window.location.origin + "/assets/images/logo.png"} alt={"logo"} />
                            <p>Admin</p>
                        </div>
                        {(window.screen.width > 1000) ?
                            <div className={'nav-dashboard ' + ((window.location.pathname == '/admin') ? 'active' : '')} onClick={() => window.location.href = "/admin"}>
                                <i class='bx bxs-dashboard'></i>
                                <p>DashBoard</p>
                            </div> : null
                        }
                        {(window.screen.width > 1000) ?
                            <div className={'nav-product ' + ((window.location.pathname == '/admin/manage-products') ? 'active' : '')} onClick={() => window.location.href = "/admin/manage-products"}>
                                <i class='bx bx-package'></i>
                                <p>Products</p>
                            </div> : null
                        }
                        <div className='nav-new-order' onClick={() => window.location.href = "/admin"}>
                            <i class='bx bx-bell'></i>
                            <p>{countNew}</p>
                        </div>
                    </div>
                    <div className='admin-menu'>
                        {(window.screen.width > 1000) ?
                            <div className='nav-edit-user' onClick={() => { setEditFor('admin'); showEdit() }}>
                                <i class='bx bx-edit'></i>
                                <p>Edit Admin</p>
                            </div> : null
                        }
                        {(window.screen.width > 1000) ?
                            <div className='nav-edit-user' onClick={() => { setEditFor('deliveryman'); showEdit() }}>
                                <i class='bx bx-edit'></i>
                                <p>Edit DeliverMan</p>
                            </div> : null
                        }
                        {(window.screen.width > 1000) ?
                            <div className='nav-logout' onClick={() => logout()}>
                                <i class='bx bx-user-x'></i>
                                <p>Logout</p>
                            </div> : null
                        }
                    </div>
                </nav>
                <menu className='d-non menu'>
                    <div className='menu-card-header'>
                        <h2>Menu</h2>
                        <div class="cut" onClick={() => hideCard('.menu')}><i class='bx bx-x'></i></div>
                    </div>
                    <div className='menu-items'>
                        <div className={'nav-dashboard ' + ((window.location.pathname == '/admin') ? 'active' : '')} onClick={() => window.location.href = "/admin"}>
                            <i class='bx bxs-dashboard'></i>
                            <p>DashBoard</p>
                        </div>
                        <div className={'nav-product ' + ((window.location.pathname == '/admin/manage-products') ? 'active' : '')} onClick={() => window.location.href = "/admin/manage-products"}>
                            <i class='bx bx-package'></i>
                            <p>Products</p>
                        </div>
                        <div className='nav-edit-user' onClick={() => { setEditFor('admin'); showEdit() }}>
                            <i class='bx bx-edit'></i>
                            <p>Edit Admin</p>
                        </div>
                        <div className='nav-edit-user' onClick={() => { setEditFor('deliveryman'); showEdit() }}>
                            <i class='bx bx-edit'></i>
                            <p>Edit DeliveryMan</p>
                        </div>
                        <div className='nav-logout' onClick={() => logout()}>
                            <i class='bx bx-user-x'></i>
                            <p>Logout</p>
                        </div>
                    </div>
                </menu>
            </section>
        </>
    )
}

export default Header