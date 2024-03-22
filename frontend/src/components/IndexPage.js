import React from "react";
import { click_menu, getLocation, searchElement } from "../JS/home";

function IndexPage() {

        return (
                <>
                <link rel="stylesheet" href="assets/css/index.css"></link>
                        <div class="login-signup">
                                <div class="cut"><i class='bx bx-x'></i></div>
                                <div class="title">
                                        <div>
                                                <h1>Login</h1>
                                                <p>or <span>create an account</span></p>
                                        </div>
                                        <div>
                                                <img src="assets/images/vegable.png" alt="" />
                                        </div>
                                </div>
                                <form action="" class="input-login-signup">
                                        <input type="text" placeholder="Phone Number" />
                                        <button type="submit">Login</button>
                                        <label>Forget Password</label>
                                </form>
                        </div>
                        <div class="section-1">
                                <div class="wrapper">
                                        <div class="box-1">
                                                <div class="nav">
                                                        <div class="logo"><img src="assets/images/logo.png" alt="" /><label>Daily</label>
                                                        </div>
                                                        <div class="menu">
                                                                <ul>
                                                                        <li onClick={() => click_menu('login')}>Login</li>
                                                                        <li onClick={() => click_menu('signup')}>Sign Up</li>
                                                                </ul>
                                                        </div>
                                                </div>
                                                <div class="msg">
                                                        <h2>Purchase products from your home.</h2>
                                                </div>
                                                <div class="search">
                                                        <input type="text" placeholder="Enter your delivery location" onChange={() => searchElement()} />
                                                        <div class="cover-locat-me">
                                                                <div class="locate-me" onClick={() => getLocation()}>
                                                                        <i class='bx bx-current-location'></i>
                                                                        <label>Locate Me</label>
                                                                </div>
                                                        </div>
                                                </div>
                                                <div class="searchElementList d-none"><ul></ul></div>
                                                <div class="delivery">
                                                        <img src="assets/images/delivery_service.jpg" alt="" />
                                                </div>
                                        </div>
                                        <div class="box-2">
                                                <div class="animated-text">
                                                        <span class="letter">D</span>
                                                        <span class="letter">a</span>
                                                        <span class="letter">i</span>
                                                        <span class="letter">l</span>
                                                        <span class="letter">y</span>
                                                        <br />
                                                        <span class="letter">P</span>
                                                        <span class="letter">r</span>
                                                        <span class="letter">o</span>
                                                        <span class="letter">d</span>
                                                        <span class="letter">u</span>
                                                        <span class="letter">c</span>
                                                        <span class="letter">t</span>
                                                        <span class="letter">s</span>
                                                        <span class="letter">.</span>
                                                        <span class="letter">.</span>
                                                        <span class="letter">.</span>
                                                </div>
                                        </div>
                                </div>
                        </div>

                </>
        );
}

export default IndexPage;
