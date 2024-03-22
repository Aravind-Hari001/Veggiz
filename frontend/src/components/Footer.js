import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendURL } from '../JS/constants'

function Footer() {
    const [categories, setCategory] = useState([])
    useEffect(() => {
        axios.get(backendURL + 'get-category')
            .then((response) => {
                setCategory(response.data)
            }).catch((err) => { })
    }, [])
    let currentDate = new Date()
    return (
        <>
            <link href={window.location.origin + "/assets/css/footer.css"} rel="stylesheet"></link>
            <section className='user-footer'>
                <div className='content'>
                    <div className='contact'>
                        <h1>Contact Us</h1>
                        <ul className='contact-details'>
                            <div>
                                <li>Cell :</li>
                                <ul>
                                    <li><i class='bx bxs-phone-call' ></i> 9876543210,</li>
                                    <li><i class='bx bxs-phone-call' ></i> 8976543210</li>
                                </ul>
                            </div>
                            <div>
                                <li>Email :</li>
                                <ul>
                                    <li><i class='bx bx-envelope' ></i> veggiz@gmail.com</li>
                                </ul>
                            </div>
                        </ul>
                    </div>
                    <div className='categories'>
                        <h1>Categories</h1>
                        <ol className='category-items'>
                            {
                                categories.map(c => {
                                    return (<li onClick={() => window.location.href = "/category/" + c.name}>{c.name}</li>)
                                })
                            }
                        </ol>
                    </div>
                </div>
                <p>&copy;{currentDate.getFullYear()} Veggiz. All rights reserved.</p>
            </section>
        </>
    )
}

export default Footer