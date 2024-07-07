const express = require('express');
const route = express.Router();
const url = require('url');
const path = require('path');
const fs = require('fs');
const { select, dml } = require('../model/sql');
const formidable = require('formidable');
const nodemailer = require('nodemailer');

const KEY = 'rzp_test_nJxm4RCOTlFAL3'
const KEY_SECRET = 'Y5KyXTd8xKsoCKt4lFE5Fd2k'

route.get('/get-some-products', (req, res) => {
    select("SELECT `id`,`name` FROM `catagories` WHERE `show`=1", (err, cId) => {
        if (err) res.status(500).send('error')
        else {
            let sql = "SELECT * FROM `product` WHERE ";
            for (let i = 0; i < cId.length; i++) {
                if (i < cId.length - 1)
                    sql += "`catagory_id`=" + cId[i].id + " OR "
                else
                    sql += "`catagory_id`=" + cId[i].id
            }
            select(sql, (err, result) => {
                if (err) res.status(500).send("error")
                else res.status(200).json([result, cId]);
            })
        }
    })
})
route.get('/get-category', (req, res) => {
    select("SELECT * FROM `catagories`", (err, result) => {
        if (err) res.status(500).send('Server Side issue')
        else {
            res.status(200).json(result)
        }
    })
})
route.get('/get-product', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    select("SELECT * FROM `product` WHERE `id`=" + qdata.id, (err, result) => {
        if (err) res.status(500).send('error')
        else {
            res.status(200).json(result)
        }
    })
})
route.get('/get-product-from-category', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    select("SELECT * FROM `catagories` WHERE `group_id`=(SELECT `group_id` FROM `catagories` WHERE `name`='" + qdata.name + "')", (err, category) => {
        if (err) res.status(500).send('error. server side issue')
        else if (category.length != 0) {
            let id = null;
            for (x of category) {
                if (x.name == qdata.name) {
                    id = x.id; break;
                }
            }
            if (id) {
                let sql = (qdata.sort != 'discount') ? "SELECT * FROM `product` WHERE `catagory_id`=" + id + " ORDER BY `" + qdata.sort + "` " + ((qdata.order == 0) ? "ASC" : "DESC") :
                    "SELECT * FROM `product` WHERE `catagory_id`=" + id + " AND `discount`!=0 ORDER BY `" + qdata.sort + "` " + ((qdata.order == 0) ? "ASC" : "DESC")
                select(sql, (err, products) => {
                    if (err) res.status(500).send('server side issue');
                    else {
                        res.status(200).json([products, category]);
                    }
                })
            }
        }
    })
})
route.get('/get-cart-product', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    let sql = "SELECT * FROM `product` WHERE "
    qdata.id = qdata.id.split(',')
    for (let i = 0; i < qdata.id.length; i++) {
        if (i < (qdata.id.length - 1))
            sql += "`id`=" + qdata.id[i] + " OR ";
        else
            sql += "`id`=" + qdata.id[i];
    }
    select(sql, (err, result) => {
        if (err) res.status(500).send('error')
        else {
            res.status(200).json(result)
        }
    })
})
route.get('/get-user', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    select("SELECT * FROM `user` WHERE `id`=" + qdata.id, (err, result) => {
        if (err) res.status(500).send('error')
        else {
            res.status(200).json(result)
        }
    })
})
route.get('/get-search-product', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    let veg = (qdata.search == 'veg') ? "1" : ('non-veg'.indexOf(qdata.search) != -1 || 'non veg'.indexOf(qdata.search) != -1) ? '0' : '-'
    let search = "LOCATE('" + qdata.search + "',`product_name`)!=0   OR  LOCATE('" + qdata.search + "',`price`)!=0  OR LOCATE('" + qdata.search + "',`measures`)!=0 OR LOCATE('" + qdata.search + "',`discount`)!=0 OR LOCATE('" + veg + "',`veg`)!=0 OR LOCATE('" + qdata.search + "',`life_time`)!=0 OR LOCATE('" + qdata.search + "',`orgin`)!=0 OR LOCATE('" + qdata.search + "',`package_type`)!=0 ";
    select("SELECT * FROM `product` WHERE " + search, (err, result) => {
        if (err) res.status(500).send('error')
        else {
            let sql = "SELECT * FROM `catagories` WHERE ";
            let cid = [], c = 0;
            for (let x of result) {
                for (let i = 0; i < cid.length; i++) {
                    if (x.catagory_id == cid[i]) {
                        c++; break;
                    }
                }
                if (c == 0) cid.push(x.catagory_id); c = 0;
            }
            for (let i = 0; i < cid.length; i++) {
                if (i < cid.length - 1)
                    sql += "`id`='" + cid[i] + "' OR ";
                else
                    sql += "`id`='" + cid[i] + "'";
            }
            select(sql, (err, category) => {
                if (!category) category = [];
                res.status(200).json([result, category])
            })

        }
    })
})
route.post('/create-order', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        let data = {
            name: fields['name'][0],
            mobile: fields['mobile'][0],
            address: fields['address'][0],
            product: JSON.parse(fields['product'][0]),
            login: fields['login'][0]
        }
        let cart = data.product;
        let sql = "SELECT * FROM `product` WHERE "
        let arr = []
        let order_data = ""
        for (const x in cart) {
            if (cart[x][0] != 0) {
                arr.push([x, cart[x][2]])
            }
        }
        for (let i = 0; i < arr.length; i++) {
            if (i < arr.length - 1) {
                sql += "`id`='" + arr[i][1] + "' OR "
            }
            else {
                sql += "`id`='" + arr[i][1] + "'";
            }
        }
        select(sql, (err, result) => {
            if (err) res.status(500).send("server side issue");
            else {
                let price = 0;
                for (const x of result) {
                    let measures=cart[x.product_name][3];
                    let index=x.measures.toString().split(';').indexOf(measures);
                    let tmp_price=Number(x.price.toString().split(';')[index])*cart[x.product_name][0];
                    tmp_price = Math.round(tmp_price - ((tmp_price / 100) * x.discount));
                    price+=tmp_price;
                    // price += Math.round(price - ((price / 100) * x.discount));
                    order_data += cart[x.product_name][2] + ":" + cart[x.product_name][0] + ":"+index+";"

                }
                if (price >= 100) {
                    select("SELECT `id` FROM `user` WHERE `mobile`='" + data.mobile + "' AND `name`='" + data.name + "'", (err, user) => {
                        if (user.length > 0 && fields.login != '0') {
                            order_data += "=1";
                            dml("INSERT INTO `orders`(`user_id`,`product`,`price`,`payment`,`payment_type`,`pay_id`) VALUES('" + user[0].id + "','" + order_data + "','" + price + "','0','1','0')", (err) => {
                                if (err) {
                                    res.status(500).send("server side issue.unable to place order.")
                                }
                                else {
                                    select("SELECT `id` FROM `orders` WHERE `user_id`='" + user[0].id + "' AND `price`='" + price + "' AND `payment`='0' AND `payment_type`='1'", (err, result) => {
                                        if (err) res.status(500).send("server side issue.unable to place order.");
                                        if (result.length > 0) {
                                            res.status(200).json({ "amount": price, "key": KEY, "orderId": result[0].id })
                                        }
                                    })
                                }
                            })
                        }
                        else {
                            if (data.mobile.length == 10) {
                                dml("INSERT INTO `tmp_user`(`name`, `mobile`, `address`) VALUES ('" + data.name + "','" + data.mobile + "','" + data.address + "')", (err) => {
                                    if (err) {
                                        res.status(500).send("server side issue.unable to place order.")
                                    }
                                    else {
                                        select("SELECT `id` FROM `tmp_user` WHERE `mobile`='" + data.mobile + "' AND `name`='" + data.name + "'", (err, tmp_user) => {
                                            if (tmp_user.length > 0) {
                                                order_data += "=0";
                                                dml("INSERT INTO `orders`(`user_id`,`product`,`price`,`payment`,`payment_type`,`pay_id`) VALUES('" + tmp_user[0].id + "','" + order_data + "','" + price + "','0','1','0')", (err) => {
                                                    if (err) {
                                                        res.status(500).send("server side issue.unable to place order.")
                                                    }
                                                    else {
                                                        select("SELECT `id` FROM `orders` WHERE `user_id`='" + tmp_user[0].id + "' AND `price`='" + price + "' && `payment`='0' && `payment_type`='1'", (err, result) => {
                                                            if (err) res.status(500).send("server side issue.unable to place order.");
                                                            if (result.length > 0) {
                                                                res.status(200).json({ "amount": price, "key": KEY, "orderId": result[0].id })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                            else {
                                                res.status(500).send("server side issue.unable to place order.")
                                            }
                                        })
                                    }
                                })
                            }
                            else {
                                res.status(400).send("Length of Mobile Number must be 10")
                            }
                        }

                    })
                }
                else {
                    res.status(500).send("purchase minmum 100₹")
                }
            }
        })

    })
})
route.put('/update-order', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        let data = {
            payId: fields['key'][0],
            orderId: Number(fields['orderId'][0]),
        }

        dml("UPDATE `orders` SET `payment`='1',`date` = CURRENT_TIME(),`pay_id`='" + data.payId + "' WHERE `id`=" + data.orderId, (err) => {
            if (err) res.status(500).send("Payment is not updated. Contuct us for refund.");
            else {
                res.status(200).send("Your Order was placed successfully!")
            }
        })
    })
})
route.post('/create-user', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        let data = {
            mobile: fields['mobile'][0],
            name: fields['name'][0],
            email: fields['email'][0],
            address: fields['address'],
            password: fields['password'][0],
            con_pass: fields['con-pass'][0]
        }
        if (data.password != data.con_pass) return res.status(400).send('paswords are mismatch');
        if (data.password.length < 8 || data.password.length > 15) return res.status(400).send('Passwords must be minimum 8 and maximum 15 characters');
        if (data.mobile.length != 10) return res.status(400).send("Length of Mobile Number must be 10");
        select("SELECT `id` FROM  `user` WHERE `mobile`='" + data.mobile + "' or `email`='" + data.email + "'", (err, result) => {
            if (result.length == 0) {
                select("SELECT `id` FROM  `admin` WHERE `mobile`='" + data.mobile + "'", (err, result) => {
                    if (result.length == 0) {
                        let sql = "INSERT INTO `user` (`name`,`mobile`,`email`,`address`,`password`) VALUES ('" + data.name + "','" + data.mobile + "','" + data.email + "','" + data.address + "','" + data.password + "')";
                        dml(sql, (err) => {
                            if (err) {
                                res.status(500).send("unable create. Server side issue");
                            }
                            else {
                                res.status(200).send("Created Successfully")
                            }
                        })
                    }
                    else {
                        res.status(400).send("Mobile Number or Email Id already exist");
                    }
                })
            }
            else { res.status(400).send("Mobile Number or Email Id already exist"); }
        })
    })
})
route.put('/edit-user', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        let data = {
            mobile: fields['mobile'][0],
            name: fields['name'][0],
            email: fields['email'][0],
            address: fields['address'],
            password: fields['password'][0],
            con_pass: fields['con-pass'][0]
        }
        if (data.password != data.con_pass) return res.status(400).send('paswords are mismatch');
        if (data.password.length < 8 || data.password.length > 15) return res.status(400).send('Passwords must be minimum 8 and maximum 15 characters');

        let sql = "UPDATE `user` SET `name`='" + data.name + "',`mobile`='" + data.mobile + "',`email`='" + data.email + "',`address`='" + data.address + "',`password`='" + data.password + "' WHERE `mobile`= '" + data.mobile + "'";
        dml(sql, (err) => {
            if (err) {
                res.status(500).send("unable create. Server side issue");
            }
            else {
                res.status(200).send("Edited Successfully")
            }
        })

    })
})
route.post('/login', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        let data = {
            mobile: fields['mobile'][0],
            password: fields['password'][0]
        }
        select("SELECT * FROM  `admin` WHERE `mobile`='" + data.mobile + "' AND `password`='" + data.password + "' AND `status`='0'", (err, result) => {
            if (err) {
                res.status(500).send("unable login. Server side issue");
            }
            if (result.length != 0) {
                res.status(200).send("veggiz_admin");
            }
            else {
                select("SELECT * FROM  `user` WHERE `mobile`='" + data.mobile + "' AND `password`='" + data.password + "'", (err, result) => {
                    if (err) {
                        res.status(500).send("unable login. Server side issue");
                    }
                    if (result.length != 0) {
                        res.status(200).json(result);
                    }
                    else {
                        select("SELECT * FROM  `admin` WHERE `mobile`='" + data.mobile + "' AND `password`='" + data.password + "' AND `status`='1'",(err,result)=>{
                            if (err) {
                                res.status(500).send("unable login. Server side issue");
                            }
                            if (result.length != 0) {
                                res.status(200).send("veggiz_delivery_man");
                            }
                            else{
                                res.status(400).send('mobile or password is not found')
                            }
                        })
                    }
                })
            }
        })

    })
})
route.post('/forget-pass', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        let data = {
            email: fields['email'][0]
        }
        select("SELECT `password` FROM  `user` WHERE `email`='" + data.email + "'", (err, result) => {
            if (err) {
                res.status(500).send("unable login. Server side issue");
            }
            if (result.length != 0) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: '',
                        pass: ''
                    }
                });

                function sendRecoveryEmail(userEmail, newPassword) {
                    const mailOptions = {
                        from: '',
                        to: userEmail,
                        subject: 'Veggiz - Recovered Password',
                        text: `Your password is: ${newPassword}`
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error(error);
                        } else {
                            // console.log('Email sent: ' + info.response);
                            res.status(200).send("Password is recovered. please check your email.")
                        }
                    });
                }

                const userEmail = data.email;
                const newPassword = result[0].password;

                sendRecoveryEmail(userEmail, newPassword);
            }
            else res.status(400).send('Ivalid Email Id. User is not exist.')
        })

    })
})
route.post('/place-order-cash', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        let data = {
            name: fields['name'][0],
            mobile: fields['mobile'][0],
            address: fields['address'][0],
            product: JSON.parse(fields['product'][0]),
            login: fields['login'][0]
        }
        let cart = data.product;
        let sql = "SELECT * FROM `product` WHERE ";
        let arr = []
        let order_data = "";
        for (const x in cart) {
            if (cart[x][0] != 0) {
                arr.push([x, cart[x][2]])
            }
        }
        for (let i = 0; i < arr.length; i++) {
            if (i < arr.length - 1) {
                sql += "`id`='" + arr[i][1] + "' OR "
            }
            else {
                sql += "`id`='" + arr[i][1] + "'";
            }
        }
        select(sql, (err, result) => {
            if (err) res.status(500).send("server side issue");
            else {
                let price = 0;
                for (const x of result) {
                    let measures=cart[x.product_name][3];
                    let index=x.measures.toString().split(';').indexOf(measures);
                    let tmp_price=Number(x.price.toString().split(';')[index])*cart[x.product_name][0];
                    tmp_price = Math.round(tmp_price - ((tmp_price / 100) * x.discount));
                    price+=tmp_price;
                    order_data += cart[x.product_name][2] + ":" + cart[x.product_name][0] + ":"+index+";"
                }
                if (price >= 100) {
                    select("SELECT `id` FROM `user` WHERE `mobile`='" + data.mobile + "'", (err, user) => {
                        if (user.length > 0 && fields.login != '0') {
                            order_data += "=1";
                            dml("INSERT INTO `orders`(`user_id`,`product`,`price`,`payment`,`payment_type`,`pay_id`) VALUES('" + user[0].id + "','" + order_data + "','" + price + "','0','0','0')", (err) => {
                                if (err) {
                                    res.status(500).send("server side issue.unable to place order.")
                                }
                                else {
                                    res.status(200).send('Your Order was placed successfully!')
                                }
                            })
                        }
                        else {
                            if (data.mobile.length == 10) {
                                dml("INSERT INTO `tmp_user`(`name`, `mobile`, `address`) VALUES ('" + data.name + "','" + data.mobile + "','" + data.address + "')", (err) => {
                                    if (err) {
                                        res.status(500).send("server side issue.unable to place order.")
                                    }
                                    else {
                                        select("SELECT `id` FROM `tmp_user` WHERE `mobile`='" + data.mobile + "'", (err, tmp_user) => {
                                            if (tmp_user.length > 0) {
                                                order_data += "=0";
                                                dml("INSERT INTO `orders`(`user_id`,`product`,`price`,`payment`,`payment_type`,`pay_id`) VALUES('" + tmp_user[0].id + "','" + order_data + "','" + price + "','0','0','0')", (err) => {
                                                    if (err) {
                                                        res.status(500).send("server side issue.unable to place order.")
                                                    }
                                                    else {
                                                        res.status(200).send('Your Order was placed successfully!')
                                                    }
                                                })
                                            }
                                            else {
                                                res.status(500).send("server side issue.unable to place order.")
                                            }
                                        })
                                    }
                                })
                            }
                            else {
                                res.status(400).send("Length of Mobile Number must be 10")
                            }
                        }

                    })
                }
                else {
                    res.status(500).send("purchase minmum 100₹")
                }
            }
        })
    })
})

const userRoutes = route;
module.exports = { userRoutes };