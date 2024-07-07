const express = require('express');
const route = express.Router();
const url = require('url');
const path = require('path');
const fs = require('fs');
const { select, dml } = require('../model/sql');
const formidable = require('formidable');

route.get('/get-catagories', (req, res) => {
    select("SELECT `catagories`.*, `group`.`name` AS `group_name` FROM `catagories` INNER JOIN `group` ON `catagories`.`group_id` = `group`.`id` ORDER BY `catagories`.`name`", (err, result) => {
        if (err) res.status(500).send('error')
        else res.json(result)
    })
})
route.get('/get-group', (req, res) => {
    select("SELECT * FROM `group` ORDER BY `name`", (err, result) => {
        if (err) res.status(500).send('error')
        else res.json(result)
    })
})
route.get('/get-product', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    select("SELECT `id` FROM `catagories` WHERE  `name`='" + qdata.catagory + "'", (err, result) => {
        if (err) res.send('error')
        else {
            select("SELECT COUNT(`id`) AS `count` FROM `product` WHERE `catagory_id`=" + result[0].id, (err, count) => {
                let page = (qdata.page > 1) ? ((qdata.page - 1) * 20) : 0;
                select("SELECT * FROM `product` WHERE  `catagory_id`=" + result[0].id + " LIMIT 20 OFFSET " + page, (err, result) => {
                    if (err) res.status(500).send('error')
                    else res.status(200).json([result, count])
                })
            })

        }
    })
})
route.get('/get-search-product', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    let veg = (qdata.search == 'veg') ? "1" : ('non-veg'.indexOf(qdata.search) != -1 || 'non veg'.indexOf(qdata.search) != -1) ? '0' : '-'
    select("SELECT `id` FROM `catagories` WHERE  `name`='" + qdata.catagory + "'", (err, result) => {
        if (err) res.send('error')
        else {
            let search = "(LOCATE('" + qdata.search + "',`product_name`)!=0  OR  LOCATE('" + qdata.search + "',`price`)!=0  OR LOCATE('" + qdata.search + "',`measures`)!=0 OR LOCATE('" + qdata.search + "',`discount`)!=0 OR LOCATE('" + veg + "',`veg`)!=0 OR LOCATE('" + qdata.search + "',`life_time`)!=0 OR LOCATE('" + qdata.search + "',`orgin`)!=0 OR LOCATE('" + qdata.search + "',`package_type`)!=0 )";
            select("SELECT * FROM `product` WHERE  `catagory_id`=" + result[0].id + " AND  (" + search + ")", (err, result) => {
                if (err) res.status(500).send('error')
                else res.status(200).json(result)
            })
        }
    })
})
route.get('/get-search-catagory', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    let search = "LOCATE('" + qdata.search + "',`catagories`.`name`)!=0 OR LOCATE('" + qdata.search + "', `group`.`name`)!=0 ";
    select("SELECT `catagories`.*, `group`.`name` AS `group_name` FROM `catagories` INNER JOIN `group` ON `catagories`.`group_id` = `group`.`id` WHERE " + search, (err, result) => {
        if (err) res.status(500).send('error')
        else res.status(200).json(result)
    })
})
route.get('/get-search-group', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    select("SELECT * FROM `group` WHERE  LOCATE('" + qdata.search + "',`name`)!=0 ", (err, result) => {
        if (err) res.status(500).send('error')
        else res.status(200).json(result)
    })
})
route.get('/count-product-page', (req, res) => {
    select("SELECT	COUNT(`product_name`) AS `product` FROM `product`", (err, product) => {
        if (err) res.status(500).send('error')
        else {
            select("SELECT COUNT(`name`) AS `catagory` FROM `catagories`", (err, catagory) => {
                if (err) res.status(500).send('error')
                else {
                    select("SELECT COUNT(`name`) AS `group` FROM `group`", (err, group) => {
                        if (err) res.status(500).send('error')
                        else {
                            res.status(200).json([product, catagory, group])
                        }
                    })
                }
            })
        }
    })
})
const randPattern = () => {
    let arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
    let randInt = Math.floor(Math.random() * 10)
    return arr[randInt] + Math.floor(Math.random() * 100)
}
route.post('/add-product', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, file) {
        let data = {
            catagory: fields['catagory'][0],
            name: fields['name'][0],
            price: fields['price'][0],
            measures: fields['measures'][0],
            discount: (fields['discount'][0] == '') ? 0 : fields['discount'],
            veg: (fields['veg'][0] == 'Veg') ? 1 : (fields['veg'][0] == 'Non-Veg')?0:2,
            life_time: fields['life-time'][0],
            orgin: fields['orgin'][0],
            package: fields['package'][0],
            description:fields['description'][0]
        }

        if (file.image) {
            let image = file.image[0];
            let allow = false;
            let allowType = ['svg','png', 'webp','avif']

            for (let type of allowType) {
                if (image['mimetype'].indexOf(type) != -1) {
                    allow = true
                }
            }
            if (!allow) {
                res.status(400).send("Invalid File type.(png,webp,avif,svg) only accepted.")
            }
            if (image['size'] / 1024 > 50) {
                res.status(400).send("File Size is too Large.(size)<=50kb.")
                allow = false;
            }

            if (allow) {
                select("SELECT * FROM `product` WHERE  `product_name`='" + data.name + "'", (err, result) => {
                    if (err) {
                        res.status(500).send("Fail to Add. Server side issue")
                    }
                    else if (result.length == 0) {
                        select("SELECT `id` FROM  `catagories` WHERE `name`='" + data.catagory + "'", (err, result) => {
                            if (result.length != 0) {
                                let cid = result[0].id;
                                let oldpath = image['filepath'];
                                let newName = randPattern() + image['originalFilename']
                                let newpath = path.join(__dirname, '..', 'static', 'uploads', newName);

                                fs.copyFile(oldpath, newpath, (err) => {
                                    if (err) res.status(500).send("Fail to upload img. Server side issue");
                                    else {
                                        let sql = "INSERT INTO `product`(`catagory_id`, `product_name`, `price`, `measures`, `discount`, `image`,`veg`,`life_time`,`orgin`,`package_type`,`description`) ";
                                        let values = "VALUES ('" + cid + "','" + data.name + "','" + data.price + "','" + data.measures + "','" + data.discount + "','" + newName + "','" + data.veg + "','" + data.life_time + "','" + data.orgin + "','" + data.package + "','"+data.description+"')";
                                        dml(sql + values, (err) => {
                                            if (err) {
                                                fs.unlink(newpath, (err) => {
                                                    res.status(500).send("Fail to Add. Server side issue")
                                                });
                                            }
                                            else {
                                                res.status(200).send("Added Successfully")
                                            }
                                        })
                                    }
                                });
                            }
                            else res.status(400).send("Invalid Catagory");
                        })
                    }
                    else {
                        res.status(400).send("Product already Exist")
                    }
                });

            }
        }
        else {
            select("SELECT * FROM `product` WHERE  `product_name`='" + data.name + "'", (err, result) => {
                if (err) {
                    res.status(500).send("Fail to Add. Server side issue")
                }
                else if (result.length == 0) {
                    select("SELECT `id` FROM  `catagories` WHERE `name`='" + data.catagory + "'", (err, result) => {
                        if (result.length != 0) {
                            let cid = result[0].id;
                            let sql = "INSERT INTO `product`(`catagory_id`, `product_name`, `price`, `measures`, `discount`, `image`,`veg`,`life_time`,`orgin`,`package_type`,`description`) ";
                            let values = "VALUES ('" + cid + "','" + data.name + "','" + data.price + "','" + data.measures + "','" + data.discount + "','null','" + data.veg + "','" + data.life_time + "','" + data.orgin + "','" + data.package + "','"+data.description+"')";
                            dml(sql + values, (err) => {
                                if (err) {
                                    res.status(500).send("Fail to Add. Server side issue")
                                }
                                else {
                                    res.status(200).send("Added Successfully")
                                }
                            })
                        }
                    })
                }
                else {
                    res.status(400).send("Product Name already Exist")
                }
            })
        }

    })
})
route.put('/edit-product', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, file) {
        let data = {
            catagory: fields['catagory'][0],
            name: fields['name'][0],
            price: fields['price'][0],
            measures: fields['measures'][0],
            discount: (fields['discount'][0] == '') ? 0 : fields['discount'],
            veg: (fields['veg'][0] == 'Veg') ? 1 : (fields['veg'][0] == 'Non-Veg')?0:2,
            life_time: fields['life-time'][0],
            orgin: fields['orgin'][0],
            package: fields['package'][0],
            description:fields['description'][0],
            id: fields['id'][0]
        }
        if (file.image) {
            let image = file.image[0];
            let allow = false;
            let allowType = ['svg', 'png', 'webp','avif']

            for (let type of allowType) {
                if (image['mimetype'].indexOf(type) != -1) {
                    allow = true
                }
            }
            if (!allow) {
                res.status(400).send("Invalid File type.(svg,png,avif,webp) only accepted.")
            }
            if (image['size'] / 1024 > 50) {
                res.status(400).send("File Size is too Large.(size)<=50kb.")
                allow = false;
            }
            if (allow) {
                select("SELECT `id` FROM  `catagories` WHERE `name`='" + data.catagory + "'", (err, result) => {
                    if (result.length != 0) {
                        let cid = result[0].id;
                        let oldpath = image['filepath'];
                        let newName = randPattern() + image['originalFilename']
                        let newpath = path.join(__dirname, '..', 'static', 'uploads', newName);
                        fs.copyFile(oldpath, newpath, (err) => {
                            if (err) res.status(500).send("Fail to upload img. Server side issue");
                            else {
                                select("SELECT `image` FROM `product` WHERE `id`=" + data.id, (err, result) => {
                                    let old_img = result[0]['image'];
                                    let sql = "UPDATE `product` SET `catagory_id`='" + cid + "', `product_name`='" + data.name + "', `price`='" + data.price + "', `measures`='" + data.measures + "', `discount`='" + data.discount + "',`veg`='" + data.veg + "',`life_time`='" + data.life_time + "',`orgin`='" + data.orgin + "',`package_type`='" + data.package + "', `image`='" + newName + "', `description`='"+data.description+"' WHERE `id`=" + data.id;
                                    dml(sql, (err) => {
                                        if (err) {
                                            fs.unlink(newpath, (err) => {
                                                res.status(500).send("Fail to Edit. Server side issue")
                                            });
                                        }
                                        else {
                                           
                                            fs.unlink(path.join(__dirname, '..', 'static','uploads', old_img), (err) => {
                                                if (err) console.log(err);
                                            })
                                            res.status(200).send("success")
                                            res.end()
                                        }
                                    })
                                })
                            }
                        });
                    }
                    else res.status(400).send("Invalid Catagory");
                })

            }
        }
        else {
            select("SELECT `id` FROM  `catagories` WHERE `name`='" + data.catagory + "'", (err, result) => {
                if (result.length != 0) {
                    let cid = result[0].id;
                    let sql = "UPDATE `product` SET `catagory_id`='" + cid + "', `product_name`='" + data.name + "', `price`='" + data.price + "', `measures`='" + data.measures + "', `discount`='" + data.discount + "',`veg`='" + data.veg + "',`life_time`='" + data.life_time + "',`orgin`='" + data.orgin + "',`package_type`='" + data.package + "',`description`='"+data.description+"' WHERE `id`=" + data.id;
                    dml(sql, (err) => {
                        if (err) {
                            res.status(500).send("Product Name already exist");
                        }
                        else {
                            res.status(200).send("Edited Successfully")
                            res.end()
                        }
                    })
                }
            })
        }
    })

})
route.post('/add-catagory', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, file) {
        let data = {
            name: fields['name'][0],
            group: fields['group'][0],
        }
        if (file.image) {
            let image = file.image[0];
            let allow = false;
            let allowType = ['avif', 'svg', 'png', 'webp']

            for (let type of allowType) {
                if (image['mimetype'].indexOf(type) != -1) {
                    allow = true
                }
            }
            if (!allow) {
                res.status(400).send("Invalid File type.(avif,png,svg,webp) only accepted.")
            }
            if (image['size'] / 1024 > 50) {
                res.status(400).send("File Size is too Large.(size)<=50kb.")
                allow = false;
            }

            if (allow) {
                select("SELECT `id` FROM  `group` WHERE `name`='" + data.group + "'", (err, result) => {
                    if (result.length != 0) {
                        let gid = result[0].id;
                        let oldpath = image['filepath'];
                        let newName = randPattern() + image['originalFilename']
                        let newpath = path.join(__dirname, '..', 'static', 'uploads', newName);

                        fs.copyFile(oldpath, newpath, (err) => {
                            if (err) res.status(500).send("Fail to upload img. Server side issue");
                            else {
                                let sql = "INSERT INTO `catagories` (`name`,`group_id`,`image`) VALUES ('" + data.name + "','" + gid + "','" + newName + "')";
                                dml(sql, (err) => {
                                    if (err) {
                                        fs.unlink(newpath, (err) => {
                                            res.status(500).send("Fail to Add. Category may be already exist.")
                                        });
                                    }
                                    else {
                                        res.status(200).send("Added Successfully")
                                        res.end()
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
        else {
            select("SELECT `id` FROM  `group` WHERE `name`='" + data.group + "'", (err, result) => {
                if (result.length != 0) {
                    let gid = result[0].id;
                    let sql = "INSERT INTO `catagories` (`name`,`group_id`,`image`) VALUES ('" + data.name + "','" + gid + "','" + newName + "')";
                    dml(sql, (err) => {
                        if (err) {
                            res.status(500).send("Fail to Add. Category may be already exist.")
                        }
                        else {
                            res.status(200).send("Added Successfully")
                            res.end()
                        }
                    })
                }
            })
        }
    })
})
route.put('/edit-catagory', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields, file) => {
        if (err) console.log(err);
        let data = {
            name: fields['name'][0],
            group: fields['group'][0],
            id: fields['id'][0]
        }
        if (file.image) {
            let image = file.image[0];
            let allow = false;
            let allowType = ['avif', 'svg', 'png', 'webp']

            for (let type of allowType) {
                if (image['mimetype'].indexOf(type) != -1) {
                    allow = true
                }
            }
            if (!allow) {
                res.status(400).send("Invalid File type.(avif,png,svg,webp) only accepted.")
            }
            if (image['size'] / 1024 > 50) {
                res.status(400).send("File Size is too Large.(size)<=50kb.")
                allow = false;
            }

            if (allow) {
                select("SELECT `id` FROM  `group` WHERE `name`='" + data.group + "'", (err, result) => {
                    if (result.length != 0) {
                        let gid = result[0].id;
                        let oldpath = image['filepath'];
                        let newName = randPattern() + image['originalFilename']
                        let newpath = path.join(__dirname, '..', 'static', 'uploads', newName);

                        fs.copyFile(oldpath, newpath, (err) => {

                            if (err) res.status(500).send("Fail to upload img. Server side issue");
                            else {
                                select("SELECT `image` FROM `catagories` WHERE `id`=" + data.id, (err, result) => {
                                    let old_img = result[0]['image'];
                                    let sql = "UPDATE `catagories` SET `name`='" + data.name + "' ,`group_id`='" + gid + "',`image`='" + newName + "' WHERE `id`=" + data.id;
                                    dml(sql, (err) => {
                                        if (err) {
                                            fs.unlink(newpath, (err) => {
                                                res.status(500).send("Fail to Edit. Server side issue")
                                            });
                                        }
                                        else {
                                            fs.unlink(path.join(__dirname, '..', 'static', 'uploads', old_img), (err) => {
                                                if (err) console.log(err);
                                            })
                                            res.status(200).send("success")
                                            res.end()
                                        }
                                    })
                                })
                            }
                        })
                    }
                })
            }
        }
        else {
            select("SELECT `id` FROM  `group` WHERE `name`='" + data.group + "'", (err, result) => {
                if (result.length != 0) {
                    let gid = result[0].id;
                    let sql = "UPDATE `catagories` SET `name`='" + data.name + "' ,`group_id`='" + gid + "' WHERE `id`=" + data.id;
                    dml(sql, (err) => {
                        if (err) {
                            res.status(500).send("Category Name already exist");
                        }
                        else {
                            res.status(200).send("Edited Successfully")
                            res.end()
                        }
                    })
                }
            })
        }

    })
})
route.put('/set-view-category',(req,res)=>{
    let id = url.parse(req.url, true).query.id;
    select("SELECT `show` FROM  `catagories` WHERE `id`='" + id + "'", (err, result) => {
        let change=0;
        (result[0].show==0)?change=1:change=0;
        dml("UPDATE `catagories` SET `show`="+change+" WHERE id="+id,(err)=>{
            if (err) {
                res.status(500).send("error");
            }
            else {
                res.status(200).send("set successfully")
                res.end()
            }
        })
    });

})
route.post('/add-group', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        let data = {
            name: fields['name'][0],
        }
        let sql = "INSERT INTO `group` (`name`) VALUES ('" + data.name + "')";
        dml(sql, (err) => {
            if (err) {
                res.status(500).send("Group Name already exist");
            }
            else {
                res.status(200).send("Added Successfully")
                res.end()
            }
        })
    })
})
route.put('/edit-group', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        let data = {
            name: fields['name'][0],
            id: fields['id'][0]
        }
        let sql = "UPDATE `group` SET `name`='" + data.name + "' WHERE `id`=" + data.id;
        dml(sql, (err) => {
            if (err) {
                res.status(500).send("Fail to Edit. Server side issue");
            }
            else {
                res.status(200).send("Edited Successfully")
                res.end()
            }
        })
    })
})
route.delete('/delete-product', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    dml("DELETE FROM `product` WHERE `id`=" + qdata.id, (err) => {
        if (err) {
            res.status(500).send("Fail to Delete. Server side issue");
        }
        else {
            res.status(200).send("success")
            res.end()
        }
    })
})
route.delete('/delete-catagory', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    select("SELECT `id` FROM  `product` WHERE `catagory_id`='" + qdata.id + "'", (err, result) => {
        if (result.length == 0) {
            dml("DELETE FROM `catagories` WHERE `id`=" + qdata.id, (err) => {
                if (err) {
                    res.status(500).send("Fail to Delete. Server side issue");
                }
                else {
                    res.status(200).send("success")
                }
            })
        }
        else {
            res.status(400).send("The category was used by product. Still you can able to edit this.")
        }
    })
})
route.delete('/delete-group', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    select("SELECT `id` FROM  `catagories` WHERE `group_id`='" + qdata.id + "'", (err, result) => {
        if (result.length == 0) {
            dml("DELETE FROM `group` WHERE `id`=" + qdata.id, (err) => {
                if (err) {
                    res.status(500).send("Fail to Delete. Server side issue");
                }
                else {
                    res.status(200).send("success")
                }
            })
        }
        else {
            res.status(400).send("The Group was used by category. Still you can able to edit this.")
        }
    })
})
// dash board
route.get('/get-orders', (req, res) => {
    select("SELECT `orders`.*,SUBSTRING_INDEX(`orders`.`product`,'=',-1) AS `user_status`,`user`.`name`,`user`.`mobile`,`user`.`address` FROM `orders` INNER JOIN `user` ON `user`.`id`=`orders`.`user_id`  WHERE SUBSTRING_INDEX(`product`,'=',-1)='1'", (err, user) => {
        if (err) res.status(500).send('Serverside issue. unable to fetch data');
        else {
            select("SELECT `orders`.*,SUBSTRING_INDEX(`orders`.`product`,'=',-1) AS `user_status`,`tmp_user`.`name`,`tmp_user`.`mobile`,`tmp_user`.`address` FROM `orders` INNER JOIN `tmp_user` ON `tmp_user`.`id`=`orders`.`user_id` WHERE SUBSTRING_INDEX(`product`,'=',-1)='0'", (err, tmp_user) => {
                if (err) res.status(500).send('Serverside issue. unable to fetch data');
                user.push(...tmp_user)
                res.status(200).json(user);
            })
        }
    })
})
route.get('/get-order-products', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    let data = qdata.data.split('=')[0].split(';');  //(prod_id:quantity:price_index(or)mesures_index;=user_id)
    let sql = "SELECT * FROM `product` WHERE "
    for (let i = 0; i < data.length - 1; i++) {
        if (i < data.length - 2) {
            sql += "`id`=" + data[i].split(':')[0] + " OR "
        }
        else {
            sql += "`id`=" + data[i].split(':')[0]
        }
    }
    select(sql, (err, result) => {
        if (err) res.status(500).send('Serverside issue. unable to fetch data');
        else {
            let total = 0;
            for (let i = 0; i < data.length - 1; i++) {
                for (let j = 0; j < result.length; j++) {
                    if (data[i].split(':')[0] == result[j]['id']) {
                        result[j]['quantity'] = data[i].split(':')[1];
                        result[j]['price']=result[j]['price'].toString().split(';')[data[i].split(':')[2]];
                        result[j]['total'] = data[i].split(':')[1] * Math.round(result[j]['price'] - ((result[j]['price'] / 100) * result[j].discount))
                        result[j]['measures']=result[j]['measures'].toString().split(';')[data[i].split(':')[2]];
                        total += result[j]['total']
                    }
                }
            }
            res.status(200).json([result, total]);
        }
    })
})
route.put('/update-payment-status-order', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    select("SELECT `delivery_status` FROM `orders` WHERE `id`=" + qdata.id, (err, result) => {
        if (err) res.status(500).send('error')
        else {
            if (result[0].delivery_status == 0) {
                dml("UPDATE `orders` SET `payment`=1 WHERE `id`=" + qdata.id, (err) => {
                    if (err) res.status(500).send('error')
                    else {
                        res.status(200).send('success')
                    }
                })
            }
            else {
                let data = qdata.data.split('=')[0].split(';');
                let user = qdata.data.split('=')[1]
                let sql = "SELECT * FROM `product` WHERE "
                for (let i = 0; i < data.length - 1; i++) {
                    if (i < data.length - 2) {
                        sql += "`id`=" + data[i].split(':')[0] + " OR "
                    }
                    else {
                        sql += "`id`=" + data[i].split(':')[0]
                    }
                }
                select(sql, (err, result) => {
                    if (err) res.status(500).send('Serverside issue. unable to fetch data');
                    else {
                        let total = 0;
                        for (let i = 0; i < data.length - 1; i++) {
                            for (let j = 0; j < result.length; j++) {
                                if (data[i].split(':')[0] == result[j]['id']) {
                                    result[j]['total'] = data[i].split(':')[1] * Math.round(result[j]['price'] - ((result[j]['price'] / 100) * result[j].discount))
                                    total += result[j]['total'];
                                }
                            }
                        }
                        dml("INSERT INTO `sales`(`amount`) VALUES('" + total + "')", (err) => {
                            if (err) res.status(500).send('error')
                            else {
                                if (user == 0) {
                                    select("SELECT `user_id` FROM `orders` WHERE `id`=" + qdata.id, (err, result) => {
                                        if (result.length > 0) {
                                            dml("DELETE FROM `tmp_user` WHERE `id`=" + result[0].user_id, (err) => {
                                                if (err) { }
                                                dml("DELETE FROM `orders` WHERE `id`=" + qdata.id, (err) => {
                                                    if (err) res.status(500).send('error')
                                                    else {
                                                        res.status(200).send('success')
                                                    }
                                                })
                                            })
                                        }
                                    })

                                }
                                else {
                                    dml("DELETE FROM `orders` WHERE `id`=" + qdata.id, (err) => {
                                        if (err) res.status(500).send('error')
                                        else {
                                            res.status(200).send('success')
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            }
        }
    })
})
route.put('/update-delivery-status-order', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    select("SELECT `payment`,`delivery_status` FROM `orders` WHERE `id`=" + qdata.id, (err, result) => {
        if (err) res.status(500).send('error')
        else {
            if (result[0].payment == 0 && result[0].delivery_status == 0) {
                dml("UPDATE `orders` SET `delivery_status`=1 WHERE `id`=" + qdata.id, (err) => {
                    if (err) res.status(500).send('error')
                    else {
                        res.status(200).send('success')
                    }
                })
            }
            else {
                let data = qdata.data.split('=')[0].split(';');
                let user = qdata.data.split('=')[1]
                let sql = "SELECT * FROM `product` WHERE "
                for (let i = 0; i < data.length - 1; i++) {
                    if (i < data.length - 2) {
                        sql += "`id`=" + data[i].split(':')[0] + " OR "
                    }
                    else {
                        sql += "`id`=" + data[i].split(':')[0]
                    }
                }
                select(sql, (err, result) => {
                    if (err) res.status(500).send('Serverside issue. unable to fetch data');
                    else {
                        let total = 0;
                        for (let i = 0; i < data.length - 1; i++) {
                            for (let j = 0; j < result.length; j++) {
                                if (data[i].split(':')[0] == result[j]['id']) {
                                    result[j]['total'] = data[i].split(':')[1] * Math.round(result[j]['price'] - ((result[j]['price'] / 100) * result[j].discount))
                                    total += result[j]['total'];
                                }
                            }
                        }
                        dml("INSERT INTO `sales`(`amount`) VALUES('" + total + "')", (err) => {
                            if (err) res.status(500).send('error')
                            else {
                                if (user == 0) {
                                    select("SELECT `user_id` FROM `orders` WHERE `id`=" + qdata.id, (err, result) => {
                                        if (result.length > 0) {
                                            dml("DELETE FROM `tmp_user` WHERE `id`=" + result[0].user_id, (err) => {
                                                if (err) { }
                                                dml("DELETE FROM `orders` WHERE `id`=" + qdata.id, (err) => {
                                                    if (err) res.status(500).send('error')
                                                    else {
                                                        res.status(200).send('success')
                                                    }
                                                })
                                            })
                                        }
                                    })

                                }
                                else {
                                    dml("DELETE FROM `orders` WHERE `id`=" + qdata.id, (err) => {
                                        if (err) res.status(500).send('error')
                                        else {
                                            res.status(200).send('success')
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            }
        }
    })
})
route.delete('/cancer-order', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    dml("DELETE FROM `orders` WHERE `id`=" + qdata.id, (err) => {
        if (err) res.status(500).send('error')
        else {
            if (qdata.user == 0) {
                dml("DELETE FROM `tmp_user` WHERE `id`=" + qdata.user_id, (err) => {
                    if (err) res.status(500).send('error')
                    else {
                        res.status(200).send('success')
                    }
                })
            }
            else res.status(200).send('success')
        }
    })
})
route.get('/get-user', (req, res) => {
    select("SELECT * FROM `user`", (err, result) => {
        if (err) res.status(500).send('error')
        else {
            res.status(200).json(result)
        }
    })
})
route.delete('/delete-user', (req, res) => {
    let qdata = url.parse(req.url, true).query;
    dml("DELETE FROM `user` WHERE `id`=" + qdata.id, (err) => {
        if (err) res.status(500).send('error')
        else {
            res.status(200).send('success')
        }
    })
})
route.get("/get-count-user-page", (req, res) => {
    select("SELECT COUNT(`id`) AS `users` FROM `user`", (err, user) => {
        if (err) res.status(500).send('error')
        else {
            select("SELECT SUM(`amount`) AS `amount` FROM `sales`", (err, amount) => {
                if (err) res.status(500).send('error')
                else {
                    res.status(200).json([user, amount])
                }
            })
        }
    })
})
// header
route.put('/edit-admin', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields, file) => {
        if (err) console.log(err);
        let data = {
            mobile: fields['mobile'][0],
            pass: fields['password'][0],
            con_pass: fields['con-password'][0]
        }
        if (data.pass!=data.con_pass) {
            if (err) res.status(400).send('Passwords are mismatch')
        }
        select("SELECT * FROM `user` WHERE `mobile`='"+data.mobile+"'",(err,result)=>{
            
            if (result.length==0) {
                dml("UPDATE `admin` SET `mobile`='" + data.mobile + "',`password`='" + data.pass + "' WHERE `status`='0'", (err) => {
                    if (err) res.status(500).send('server side issue')
                    else {
                        res.status(200).send("success");
                    }
                })      
            }
            else{
                res.status(400).send('Mobile number is already exist')
            }
        })
    })
})
route.put('/edit-delivery-man', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields, file) => {
        if (err) console.log(err);
        let data = {
            mobile: fields['mobile'][0],
            pass: fields['password'][0],
            con_pass: fields['con-password'][0]
        }
        if (data.pass!=data.con_pass) {
            if (err) res.status(400).send('Passwords are mismatch')
        }
        select("SELECT * FROM `user` WHERE `mobile`='"+data.mobile+"'",(err,result)=>{
            
            if (result.length==0) {
                dml("UPDATE `admin` SET `mobile`='" + data.mobile + "',`password`='" + data.pass + "' WHERE `status`='1'", (err) => {
                    if (err) res.status(500).send('server side issue')
                    else {
                        res.status(200).send("success");
                    }
                })      
            }
            else{
                res.status(400).send('Mobile number is already exist')
            }
        })
    })
})
const adminRoutes = route;

module.exports = { adminRoutes };