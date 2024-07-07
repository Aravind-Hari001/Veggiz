import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import Header from './Header'
import Footer from './Footer'
import axios from 'axios'
import { backendURL } from '../../JS/constants'
import Page404 from '../Page404'
function ManageProduct() {
    const [cookies, setCookie] = useCookies();
    const [products, setProduct] = useState([]);
    const [catagories, setCatagory] = useState([]);
    const [group, setGroup] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [pageNo, setPageNo] = useState(1);
    const [count, setCount] = useState([0, 0, 0]);
    const [submitFor, setSubmitFor] = useState([])
    const [currentCatagory, setCurrentCatagory] = useState(null)
    const [DeleteData, setDeleteData] = useState(null)

    useEffect(() => {
        axios.get(backendURL + 'admin/get-catagories')
            .then(response => {
                setCatagory(response.data);
                setCurrentCatagory(response.data[0]['name'])
                axios.get(backendURL + 'admin/get-product?catagory=' + response.data[0]['name'] + '&page=' + pageNo)
                    .then(response => {
                        if (response.data == "error")
                            setError("Unable to fetch data")
                        else {
                            setProduct(response.data[0])
                            let pageCount = response.data[1][0]['count'];
                            let arr = []
                            if (Math.ceil(pageCount / 5) > 1) {
                                for (let i = 1; i <= Math.ceil(pageCount / 20); i++) {
                                    if (i == pageNo)
                                        arr.push(<button class='btn btn-outline-primary btn-sm active' onClick={() => handelPage(i, "product")}>{i}</button>);
                                    else
                                        arr.push(<button class='btn btn-outline-primary btn-sm' onClick={() => handelPage(i, "product")}>{i}</button>);
                                }
                                setPage(arr);
                            }
                            else {
                                setPage([]);
                            }
                        }
                    })
                    .catch(error => {
                        setError(error.message);
                        setLoading(false);
                    });

                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, []);
    useEffect(() => {
        axios.get(backendURL + 'admin/get-group')
            .then(response => {
                if (response.data == "error")
                    setError("Unable to fetch data")
                else
                    setGroup(response.data)
            })
            .catch(err => { })
    }, [])
    useEffect(() => {
        axios.get(backendURL + 'admin/count-product-page')
            .then(response => {
                if (response.data == "error")
                    setError("Unable to fetch data")
                else
                    setCount([response.data[0][0]['product'], response.data[1][0]['catagory'], response.data[2][0]['group']])
            })
            .catch(err => { })
    }, [])
    const submitAddProduct = () => {
        let form = document.forms['add-product']
        let formData = new FormData();
        let msg = document.querySelector('.add-product .msg');
        msg.style = "color:red"
        formData.append('catagory', form['catagory'].value)
        formData.append('name', form['product-name'].value)
        formData.append('price', form['product-price'].value)
        formData.append('measures', form['measures'].value)
        formData.append('veg', form['veg'].value)
        formData.append('orgin', form['orgin'].value)
        formData.append('package', form['package'].value)
        let errorr = false;
        formData.forEach((data) => {
            if (data === "null" || data == 'undefined' || (typeof (data) === 'string' && data.trim() === "")) {
                msg.innerHTML = "*Fill all the fields"
                errorr = true
                return
            }
        })
        formData.append('life-time', form['life-time'].value)
        formData.append('image', (form['product-image'].files[0] == undefined) ? "null" : form['product-image'].files[0])
        formData.append('discount', form['discount'].value.trim())
        formData.append('description', form['description'].value)
        if (formData.get('discount') != '' && formData.get('discount') > 100) {
            errorr = true;
            msg.innerHTML = "*Discount must <=100"
        }
        if (!errorr) {
            if (submitFor[0] == 'add') {
                axios.post(backendURL + 'admin/add-product', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then((response) => {
                    msg.innerHTML = response.data;
                    msg.style = "color:green;";
                    document.querySelector('.add-product form').reset()
                    handelChangeCatagory()
                }).catch((err) => {
                    try {
                        msg.innerHTML = err.response.data;
                    } catch (e) { }
                })
            }
            else if (submitFor[0] == 'edit') {
                formData.append('id', submitFor[1])
                axios.put(backendURL + 'admin/edit-product', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then((response) => {
                    if (response.status == 200) {
                        alert("Edited Successfully")
                        document.querySelector('.add-product form').reset()
                        hideDisplayCard('.add-product')
                        handelChangeCatagory()
                        return;
                    }
                }).catch((err) => {
                    try {
                        msg.innerHTML = err.response.data;
                    } catch (e) { }
                })
            }
        }
    }
    const showDisplayCard = (isfor, id = null) => {
        if (isfor == '.add-product' || isfor == 'edit-product') {
            let form = document.querySelector('.add-product form');
            form.reset()
            let heading = document.querySelector('.add-product h2');
            let submit_button = document.querySelector('.add-product form button');
            heading.innerHTML = "Add Product"
            submit_button.innerHTML = "Add"
            submit_button.classList.remove('btn-info')
            submit_button.classList.add('btn-primary')

            if (isfor == '.add-product')
                setSubmitFor(['add'])
            else
                setSubmitFor(['edit', id])

            document.querySelector('.add-product .msg').innerHTML = ""
            let select = document.querySelector('.add-product .select')
            select.style = "border:black 1px solid;outline:none;border-radius:5px;";
            select.querySelector('select').style.color = "black";
            select.querySelector('select').innerHTML = "<option selected disabled value='null'>Select category</option>";
            if (catagories.length > 0) {
                catagories.map((res) => {
                    let option = document.createElement('option')
                    option.text = res['name'];
                    select.querySelector('select').append(option);
                })
            }
            else {
                let select = document.querySelector('.add-product .select')
                select.style = "border:red 1px solid;outline:none;border-radius:5px;";
                select.querySelector('select').style.color = "red";
                select.querySelector('select').innerHTML = "<option selected disabled value='null'>fail to fetch catagories</option>";
            }
            if (isfor == 'edit-product') {
                heading.innerHTML = "Edit Product"
                submit_button.innerHTML = "Edit"
                submit_button.classList.remove('btn-primary')
                submit_button.classList.add('btn-info')

                let edit_form = document.forms['add-product'];
                let data = products.filter((data) => { return data.id == id })
                select.querySelector('select').innerHTML = `<option selected value='${currentCatagory}'>${currentCatagory}</option>`;
                catagories.map((res) => {
                    if (res['name'] != currentCatagory) {
                        let option = document.createElement('option')
                        option.text = res['name'];
                        select.querySelector('select').append(option);
                    }
                })
                edit_form['product-name'].value = data[0].product_name;
                edit_form['product-price'].value = data[0].price;
                edit_form['measures'].value = data[0].measures;
                edit_form['discount'].value = data[0].discount;
                edit_form['description'].value = data[0].description;
                document.querySelector('.add-product form .veg').innerHTML = `<option selected disabled>${(data[0].veg == 1) ? "Veg" : (data[0].veg == 0) ? "Non-Veg" : "None"}</option> 
                                        ${(data[0].veg != 1) ? '<option>Veg</option>' : null}
                                        ${(data[0].veg != 0) ? '<option>Non-Veg</option>' : null}
                                        ${(data[0].veg != 2) ? '<option>None</option>' : null}`;
                edit_form['life-time'].value = data[0].life_time;
                edit_form['orgin'].value = data[0].orgin;
                edit_form['package'].value = data[0].package_type;
            }
        }
        document.querySelector('.add-product').classList.remove('d-none')
    }

    const hideDisplayCard = (isfor) => {
        document.querySelector(isfor).classList.add('d-none')
    }
    const getCatagory = () => {
        if (catagories.length > 0) {
            return catagories.map((catagory) => <option>{catagory['name']}</option>)
        }
        else {
            return (<option selected disabled>Fail to fetch catagory</option>)
        }
    }
    const handelChangeCatagory = () => {
        let selected = document.querySelector('.products select');
        setLoading(true)
        axios.get(backendURL + 'admin/get-product?catagory=' + selected.value + '&page=' + pageNo)
            .then(response => {
                console.log(Math.ceil(response.data[1][0]['count']/ 5));
                setCurrentCatagory(selected.value)
                if (response.data == "error")
                    setError("Unable to fetch data")
                else {
                    setProduct(response.data[0])
                    let pageCount = response.data[1][0]['count'];
                    let arr = []
                    if (Math.ceil(pageCount / 5) > 1) {
                        for (let i = 1; i < Math.ceil(pageCount / 20); i++) {
                            if (i == pageNo)
                                arr.push(<button class='btn btn-outline-primary btn-sm active' onClick={() => handelPage(i, "product")}>{i}</button>);
                            else
                                arr.push(<button class='btn btn-outline-primary btn-sm' onClick={() => handelPage(i, "product")}>{i}</button>);
                        }
                        setPage(arr);
                    }
                    else {
                        setPage([])
                    }

                }
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
        axios.get(backendURL + 'admin/count-product-page')
            .then(response => {
                if (response.data == "error")
                    setError("Unable to fetch data")
                else
                    setCount([response.data[0][0]['product'], response.data[1][0]['catagory'], response.data[2][0]['group']])
            })
            .catch(err => { })
    }
    const showDeleteCard = (isfor, id) => {

        let card = document.querySelector('.delete-card')
        card.classList.remove('d-none')
        document.querySelector('.delete-card .msg').innerHTML = ""
        if (isfor == 'product') {
            setDeleteData(['product', id])
        }
        else if (isfor == 'catagory') {
            setDeleteData(['catagory', id])
        }
        else if (isfor == 'group') {
            setDeleteData(['group', id])
        }
    }
    const deleteData = () => {
        let msg = document.querySelector('.delete-card .msg')
        msg.innerHTML = ""
        if (DeleteData[0] == 'produt') {
            axios.delete(backendURL + 'admin/delete-product?id=' + DeleteData[1]).then((response) => {
                if (response.status == 200) {
                    alert("Deleted Successfully")
                    hideDisplayCard('.delete-card')
                    handelChangeCatagory()
                    return;
                }
            }).catch((err) => {
                try {
                    msg.innerHTML = err.response.data;
                } catch (e) { }
            })
        }
        else if (DeleteData[0] == 'catagory') {
            axios.delete(backendURL + 'admin/delete-catagory?id=' + DeleteData[1]).then((response) => {
                if (response.status == 200) {
                    alert("Deleted Successfully")
                    hideDisplayCard('.delete-card')
                    refreshData('catagory')
                    return;
                }
            }).catch((err) => {
                try {
                    msg.innerHTML = err.response.data;
                } catch (e) { }
            })
        }
        else if (DeleteData[0] == 'group') {
            axios.delete(backendURL + 'admin/delete-group?id=' + DeleteData[1]).then((response) => {
                if (response.status == 200) {
                    alert("Deleted Successfully")
                    hideDisplayCard('.delete-card')
                    refreshData('group')
                    return;
                }
            }).catch((err) => {
                try {
                    msg.innerHTML = err.response.data;
                } catch (e) { }
            })
        }
    }
    const handelPage = (page, isfor) => {
        if (isfor == 'product') {
            let selected = document.querySelector('.products select').value;
            let pages = document.querySelectorAll('.products .card-footer button');
            setPageNo(page)
            for (let i = 0; i < pages.length; i++)
                pages[i].classList.remove('active');
            pages[page - 1].classList.add('active')
            axios.get(backendURL + 'admin/get-product?catagory=' + selected + '&page=' + page)
                .then(response => {
                    if (response.data == "error")
                        setError("Unable to fetch data")
                    else {
                        setProduct(response.data[0])
                    }
                    setLoading(false);
                })
                .catch(error => {
                    setError(error.message);
                    setLoading(false);
                });
        }
    }
    const handelSearch = (isfor) => {
        if (isfor == 'product') {
            let txt = document.querySelector('.products .header input').value;
            txt = txt.trim().toLowerCase()
            if (txt == 'veg' || txt == 'non-veg') (txt == 'veg') ? txt = 1 : txt = 0;
            if (txt.length > 0) {
                axios.get(backendURL + 'admin/get-search-product?catagory=' + currentCatagory + '&search=' + txt)
                    .then(response => {
                        if (response.data == "error")
                            setError("Unable to fetch data")
                        else {
                            setProduct(response.data)
                        }
                        setLoading(false);
                    })
                    .catch(error => {
                        setError(error.message);
                        setLoading(false);
                    });
            }
            else {
                handelChangeCatagory();
            }
        }
        else if (isfor == 'catagory') {
            let txt = document.querySelector('.catagory .header input').value;
            txt = txt.trim().toLowerCase()
            if (txt.length > 0) {
                axios.get(backendURL + 'admin/get-search-catagory?search=' + txt)
                    .then(response => {
                        if (response.data == "error")
                            setError("Unable to fetch data")
                        else {
                            setCatagory(response.data)
                        }
                        setLoading(false);
                    })
                    .catch(error => {
                        setError(error.message);
                        setLoading(false);
                    });
            }
            else {
                refreshData('catagory');
            }
        }
        else if (isfor == 'group') {
            let txt = document.querySelector('.group .header input').value;
            txt = txt.trim().toLowerCase()
            if (txt.length > 0) {
                axios.get(backendURL + 'admin/get-search-group?search=' + txt)
                    .then(response => {
                        if (response.data == "error")
                            setError("Unable to fetch data")
                        else {
                            setGroup(response.data)
                        }
                        setLoading(false);
                    })
                    .catch(error => {
                        setError(error.message);
                        setLoading(false);
                    });
            }
            else {
                refreshData('group');
            }
        }
    }
    const showCatagoryCard = (isfor, id = null, catagoryName = null, groupName = null) => {
        if (isfor == '.add-catagory' || isfor == 'edit-catagory') {
            let form = document.querySelector('.add-catagory form');
            form.reset()
            let heading = document.querySelector('.add-catagory h2');
            let submit_button = document.querySelector('.add-catagory form button');
            heading.innerHTML = "Add Catagory"
            submit_button.innerHTML = "Add"
            submit_button.classList.remove('btn-info')
            submit_button.classList.add('btn-primary')

            if (isfor == '.add-catagory')
                setSubmitFor(['add'])
            else
                setSubmitFor(['edit', id])

            document.querySelector('.add-catagory .msg').innerHTML = ""
            let select = document.querySelector('.add-catagory .select')
            select.style = "border:black 1px solid;outline:none;border-radius:5px;";
            select.querySelector('select').style.color = "black";
            select.querySelector('select').innerHTML = "<option selected disabled value='null'>Select Group</option>";
            if (group.length > 0) {
                group.map((res) => {
                    let option = document.createElement('option')
                    option.text = res['name'];
                    select.querySelector('select').append(option);
                })
            }
            else {
                let select = document.querySelector('.add-catagory .select')
                select.style = "border:red 1px solid;outline:none;border-radius:5px;";
                select.querySelector('select').style.color = "red";
                select.querySelector('select').innerHTML = "<option selected disabled value='null'>fail to fetch Group</option>";
            }
            if (isfor == 'edit-catagory') {
                heading.innerHTML = "Edit Catagory"
                submit_button.innerHTML = "Edit"
                submit_button.classList.remove('btn-primary')
                submit_button.classList.add('btn-info')

                let edit_form = document.forms['add-catagory'];
                select.querySelector('select').innerHTML = `<option selected value='${groupName}'>${groupName}</option>`;
                group.map((res) => {
                    if (res['name'] != groupName) {
                        let option = document.createElement('option')
                        option.text = res['name'];
                        select.querySelector('select').append(option);
                    }
                })
                edit_form['catagory-name'].value = catagoryName;
            }
        }
        document.querySelector('.add-catagory').classList.remove('d-none')

    }
    const submitCatagory = () => {
        let form = document.forms['add-catagory']
        let formData = new FormData();
        let msg = document.querySelector('.add-catagory .msg');
        msg.style = "color:red"
        formData.append('group', form['group'].value)
        formData.append('name', form['catagory-name'].value)
        let errorr = false;
        formData.forEach((data) => {
            if (data === "null" || (typeof (data) === 'string' && data.trim() === "")) {
                msg.innerHTML = "*Fill all the fields"
                errorr = true
                return
            }
        })
        formData.append('image', (form['category-image'].files[0] == undefined) ? "null" : form['category-image'].files[0])
        if (!errorr) {
            if (submitFor[0] == 'add') {
                axios.post(backendURL + 'admin/add-catagory', formData)
                    .then((response) => {
                        msg.innerHTML = response.data;
                        msg.style = "color:green;";
                        document.querySelector('.add-catagory form').reset()
                        refreshData('catagory')
                    }).catch((err) => {
                        try {
                            msg.innerHTML = err.response.data;
                        } catch (e) { }
                    })
            }
            else if (submitFor[0] == 'edit') {
                formData.append('id', submitFor[1])
                axios.put(backendURL + 'admin/edit-catagory', formData)
                    .then((response) => {
                        if (response.status == 200) {
                            alert("Edited Successfully")
                            document.querySelector('.add-catagory form').reset()
                            hideDisplayCard('.add-catagory')
                            refreshData('catagory')
                            return;
                        }
                    }).catch((err) => {
                        try {
                            msg.innerHTML = err.response.data;
                        }
                        catch (e) { }
                    })
            }
        }
    }
    const showGroupCard = (isfor, id = null, groupName = null) => {
        if (isfor == '.add-group' || isfor == 'edit-group') {
            let form = document.querySelector('.add-group form');
            form.reset()
            let heading = document.querySelector('.add-group h2');
            let submit_button = document.querySelector('.add-group form button');
            heading.innerHTML = "Add Group"
            submit_button.innerHTML = "Add"
            submit_button.classList.remove('btn-info')
            submit_button.classList.add('btn-primary')

            if (isfor == '.add-group')
                setSubmitFor(['add'])
            else
                setSubmitFor(['edit', id])

            document.querySelector('.add-group .msg').innerHTML = ""
            if (isfor == 'edit-group') {
                heading.innerHTML = "Edit Group"
                submit_button.innerHTML = "Edit"
                submit_button.classList.remove('btn-primary')
                submit_button.classList.add('btn-info')

                let edit_form = document.forms['add-group'];
                edit_form['group-name'].value = groupName;
            }
        }
        document.querySelector('.add-group').classList.remove('d-none')
    }
    const submitGroup = () => {
        let form = document.forms['add-group']
        let formData = new FormData();
        let msg = document.querySelector('.add-group .msg');
        msg.style = "color:red"
        formData.append('name', form['group-name'].value);
        let errorr = false;
        formData.forEach((data) => {
            if ((typeof (data) === 'string' && data.trim() === "")) {
                msg.innerHTML = "*Fill all the fields"
                errorr = true
                return
            }
        })
        if (!errorr) {
            if (submitFor[0] == 'add') {
                axios.post(backendURL + 'admin/add-group', formData)
                    .then((response) => {
                        msg.innerHTML = response.data;
                        msg.style = "color:green;";
                        document.querySelector('.add-group form').reset()
                        refreshData('group')
                    }).catch((err) => {
                        try {
                            msg.innerHTML = err.response.data;
                        } catch (e) { }
                    })
            }
            else if (submitFor[0] == 'edit') {
                formData.append('id', submitFor[1])
                axios.put(backendURL + 'admin/edit-group', formData)
                    .then((response) => {
                        if (response.status == 200) {
                            alert("Edited Successfully")
                            document.querySelector('.add-group form').reset()
                            hideDisplayCard('.add-group')
                            refreshData('group')
                            return;
                        }
                    }).catch((err) => {
                        try {
                            msg.innerHTML = err.response.data;
                        }
                        catch (e) { }
                    })
            }
        }
    }
    const refreshData = (isfor) => {
        if (isfor == 'catagory') {
            axios.get(backendURL + 'admin/get-catagories')
                .then(response => {
                    if (response.data == "error")
                        setError("Unable to fetch data")
                    else
                        setCatagory(response.data)
                })
                .catch(err => { })
        }
        else if (isfor == 'group') {
            axios.get(backendURL + 'admin/get-group')
                .then(response => {
                    if (response.data == "error")
                        setError("Unable to fetch data")
                    else
                        setGroup(response.data)
                })
                .catch(err => { })
        }
        axios.get(backendURL + 'admin/count-product-page')
            .then(response => {
                if (response.data == "error")
                    setError("Unable to fetch data")
                else
                    setCount([response.data[0][0]['product'], response.data[1][0]['catagory'], response.data[2][0]['group']])
            })
            .catch(err => { })
    }
    const handelHomeView = (id) => {
        axios.put(backendURL + 'admin/set-view-category?id=' + id)
            .then(response => {
                if (response.data == "error")
                    alert("Unable to set")
                else {
                    axios.get(backendURL + 'admin/get-catagories')
                        .then(response => {
                            for (const x of response.data) {
                                if(x.show==1){
                                    document.querySelector('.addView-'+x.id).checked=true;
                                }   
                                else{
                                    document.querySelector('.addView-'+x.id).checked=false;
                                }
                            }
                        })
                        .catch(err => { })
                }
            })
            .catch(err => { })

    }
    if (cookies.veggiz_admin) {
        return (
            <>
                <link href={window.location.origin + "/assets/css/admin_manageProduct.css"} rel="stylesheet"></link>
                <Header></Header>
                <div className='delete-card d-none'>
                    <div class="cut" onClick={() => hideDisplayCard('.delete-card')}><i class='bx bx-x'></i></div>
                    <p className="msg"></p>
                    <p>Are you surly want to delete this?</p>
                    <div className='btns'>
                        <button className='btn btn-primary form-control mx-2' onClick={() => deleteData()}>Ok</button>
                        <button className='btn btn-danger form-control' onClick={() => hideDisplayCard('.delete-card')}>Cancel</button>
                    </div>
                </div>
                <div className="display-card add-product d-none">
                    <div className='display-card-header'>
                        <h2>Add Products</h2>
                        <div class="cut" onClick={() => hideDisplayCard('.add-product')}><i class='bx bx-x'></i></div>
                    </div>
                    <p className="msg"></p>
                    <form method="post" name='add-product' onSubmit={(e) => e.preventDefault()} enctype="multipart/form-data">
                        <div class="input-group select">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Secect category *</span>
                            </div>
                            <select name="catagory" class="form-control">
                                <option selected disabled value={null}>Select category</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Product Name *</span>
                            </div>
                            <input type="text" name="product-name" class="form-control" placeholder="Product Name" required />
                        </div>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Price INR *</span>
                            </div>
                            <input type="text" name="product-price" class="form-control" placeholder="Product Price" required />
                        </div>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Unit Of Measures 1pic/kg *</span>
                            </div>
                            <input type="text" name="measures" class="form-control" placeholder="measures eg:2pic/kg" required />
                        </div>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Discount</span>
                            </div>
                            <input type="number" name="discount" class="form-control" placeholder="Discount" />
                        </div>
                        <div class="input-group select">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Secect Veg or Non-Veg *</span>
                            </div>
                            <select name="veg" class="form-control veg">
                                <option>Veg</option>
                                <option>Non-Veg</option>
                                <option>None</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Description</span>
                            </div>
                            <input type="text" name="description" class="form-control" placeholder="Description" />
                        </div>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Life Time</span>
                            </div>
                            <input type="text" name="life-time" class="form-control" placeholder="Life Time Eg:1month" />
                        </div>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Country Of Orgin</span>
                            </div>
                            <input type="text" name="orgin" class="form-control" placeholder="Country Of Orgoin" required />
                        </div>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Package Type</span>
                            </div>
                            <input type="text" name="package" class="form-control" placeholder="Package type Eg:Glass Box" required />
                        </div>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Product Image</span>
                            </div>
                            <input type="file" name="product-image" class="form-control" placeholder="image" />
                        </div>
                        <button type="submit" onClick={() => submitAddProduct()} class="form-control btn btn-primary">Add</button>
                    </form>
                </div>

                <div className="display-card add-catagory d-none">
                    <div className='display-card-header'>
                        <h2>Add Catagory</h2>
                        <div class="cut" onClick={() => hideDisplayCard('.add-catagory')}><i class='bx bx-x'></i></div>
                    </div>
                    <p className="msg"></p>
                    <form method="post" name='add-catagory' onSubmit={(e) => e.preventDefault()} enctype="multipart/form-data">
                        <div class="input-group select">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Secect Group *</span>
                            </div>
                            <select name="group" class="form-control">
                                <option selected disabled value={null}>Select Group</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Category Name *</span>
                            </div>
                            <input type="text" name="catagory-name" class="form-control" placeholder="Catagory Name" required />
                        </div>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Category Image</span>
                            </div>
                            <input type="file" name="category-image" class="form-control" placeholder="image" />
                        </div>
                        <button type="submit" onClick={() => submitCatagory()} class="form-control btn btn-primary">Add</button>
                    </form>
                </div>

                <div className="display-card add-group d-none">
                    <div className='display-card-header'>
                        <h2>Add Group</h2>
                        <div class="cut" onClick={() => hideDisplayCard('.add-group')}><i class='bx bx-x'></i></div>
                    </div>
                    <p className="msg"></p>
                    <form method="post" name='add-group' onSubmit={(e) => e.preventDefault()} enctype="multipart/form-data">
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Group Name *</span>
                            </div>
                            <input type="text" name="group-name" class="form-control" placeholder="Group Name" required />
                        </div>
                        <button type="submit" onClick={() => submitGroup()} class="form-control btn btn-primary">Add</button>
                    </form>
                </div>
                <section className="section container">
                    {/* counts */}
                    <div className='counts'>
                        <div className='card'>
                            <div className='header'>
                                <h2>Products</h2>
                            </div>
                            <div className='card-body'>
                                <i class='bx bx-package'></i>
                                <p>{count[0]}</p>
                            </div>
                        </div>
                        <div className='card'>
                            <div className='header'>
                                <h2>categories</h2>
                            </div>
                            <div className='card-body'>
                                <i class='bx bx-category'></i>
                                <p>{count[1]}</p>
                            </div>
                        </div>
                        <div className='card'>
                            <div className='header'>
                                <h2>Groups</h2>
                            </div>
                            <div className='card-body'>
                                <i class='bx bxs-cube-alt'></i>
                                <p>{count[2]}</p>
                            </div>
                        </div>
                    </div>
                    {/* products */}
                    <div class="row products">
                        <div class="col-lg-12">
                            <div class="card">
                                <div className='header'>
                                    <div className="title" colSpan={3}>Products</div>
                                    <select onChange={() => handelChangeCatagory()}>{getCatagory()}</select>
                                    <input type="search" onKeyUp={() => handelSearch('product')} placeholder='Search Products'></input>
                                    <button className='btn btn-primary btn-sm' onClick={() => showDisplayCard('.add-product')}>Add +</button>
                                </div>
                                <div class="card-body">
                                    <table class="table datatable table-responsive">
                                        <thead>
                                            <tr>
                                                <th>Image</th>
                                                <th>Name</th>
                                                <th>Price</th>
                                                <th>Discount</th>
                                                <th>Selling Price</th>
                                                <th>Unit</th>
                                                <th>Nature Of Product</th>
                                                <th>Life Time</th>
                                                <th>Country Orgin</th>
                                                <th>Package</th>
                                                <th>Discription</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(product => (
                                                <tr>
                                                    {
                                                        (product.image == 'null') ? <td className='text-danger'>Not Uploade</td> :
                                                            <td><img src={backendURL + "uploads/" + product.image} alt="Not Loaded" /></td>
                                                    }
                                                    <td>{product.product_name}</td>
                                                    <td>{product.price.toString().split(';').map(p => {
                                                        return (<li>{p}</li>)
                                                    })}</td>
                                                    <td>{product.discount}</td>
                                                    <td>{product.price.toString().split(';').map(p => {
                                                        return (<li>{Math.round(p - ((p / 100) * product.discount))}</li>)
                                                    })}</td>
                                                    <td>{product.measures.toString().split(';').map(p => {
                                                        return (<li>{p}</li>)
                                                    })}</td>
                                                    <td>{(product.veg == 1) ? "Veg" : (product.veg == 0) ? "Non-Veg" : 'None'}</td>
                                                    <td>{product.life_time}</td>
                                                    <td>{product.orgin}</td>
                                                    <td>{product.package_type}</td>
                                                    <td>{product.description}</td>
                                                    {window.screen.width > 1000 ?
                                                        (<td className='action-btns'>
                                                            <button className='btn btn-warning btn-sm' onClick={() => showDisplayCard('edit-product', product.id)}><i class='bx bx-edit'></i></button>
                                                            <button className='mx-2 btn btn-danger btn-sm' onClick={() => showDeleteCard('product', product.id)}><i class='bx bx-trash'></i></button>
                                                        </td>) :
                                                        (<td className='action-btns d-flex'>
                                                            <button className='btn btn-warning btn-sm' onClick={() => showDisplayCard('edit-product', product.id)}><i class='bx bx-edit'></i></button>
                                                            <button className='mx-2 btn btn-danger btn-sm' onClick={() => showDeleteCard('product', product.id)}><i class='bx bx-trash'></i></button>
                                                        </td>)
                                                    }
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className='card-footer'>
                                    <div className='page-group'>{page.length > 0 ? page.map(page => page) : null}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Catagory */}
                    <div className='row my-2'>
                        <div class="catagory col-lg-6 col-md-12">
                            <div class="card">
                                <div className='header'>
                                    <div className="title" colSpan={3}>Category</div>
                                    <input type="search" onKeyUp={() => handelSearch('catagory')} placeholder='Search Catagory'></input>
                                    <button className='btn btn-primary btn-sm' onClick={() => showCatagoryCard('.add-catagory')}>Add +</button>
                                </div>
                                <div class="card-body">
                                    <table class="table datatable table-responsive">
                                        <thead>
                                            <tr>
                                                <th>Image</th>
                                                <th>Category Name</th>
                                                <th>Group</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {catagories.map(catagory => (
                                                <tr>
                                                    <td><img src={backendURL + "uploads/" + catagory.image} alt={catagory.name} /></td>
                                                    <td>{catagory.name}</td>
                                                    <td>{catagory.group_name}</td>
                                                    {window.screen.width > 1000 ?
                                                        (<td className='action-btns'>
                                                            <button className='btn btn-warning btn-sm' onClick={() => showCatagoryCard('edit-catagory', catagory.id, catagory.name, catagory.group_name)}><i class='bx bx-edit'></i></button>
                                                            <button className='mx-2 btn btn-danger btn-sm' onClick={() => showDeleteCard('catagory', catagory.id)}><i class='bx bx-trash'></i></button>
                                                            <input type='checkbox' title='show this category in home page' checked={catagory.show==1?true:false} className={`addView-${catagory.id}`} onClick={() => handelHomeView(catagory.id)} />
                                                        </td>) :
                                                        (<td className='action-btns d-flex'>
                                                            <button className='btn btn-warning btn-sm' onClick={() => showCatagoryCard('edit-catagory', catagory.id, catagory.name, catagory.group_name)}><i class='bx bx-edit'></i></button>
                                                            <button className='mx-2 btn btn-danger btn-sm' onClick={() => showDeleteCard('catagory', catagory.id)}><i class='bx bx-trash'></i></button>
                                                            <input type='checkbox' title='show this category in home page' checked={catagory.show==1?true:false} className={`addView-${catagory.id}`} onClick={() => handelHomeView(catagory.id)} />
                                                        </td>)
                                                    }
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        {/* group */}
                        <div class="group col-lg-6 col-md-12">
                            <div class="card">
                                <div className='header'>
                                    <div className="title" colSpan={3}>Group</div>
                                    <input type="search" onKeyUp={() => handelSearch('group')} placeholder='Search Group'></input>
                                    <button className='btn btn-primary btn-sm' onClick={() => showGroupCard('.add-group')}>Add +</button>
                                </div>
                                <div class="card-body">
                                    <table class="table datatable table-responsive">
                                        <thead>
                                            <tr>
                                                <th>Group Name</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.map(group => (
                                                <tr>
                                                    <td>{group.name}</td>
                                                    {window.screen.width > 1000 ?
                                                        (<td className='action-btns'>
                                                            <button className='btn btn-warning btn-sm' onClick={() => showGroupCard('edit-group', group.id, group.name)}><i class='bx bx-edit'></i></button>
                                                            <button className='mx-2 btn btn-danger btn-sm' onClick={() => showDeleteCard('group', group.id)}><i class='bx bx-trash'></i></button>
                                                        </td>) :
                                                        (<td className='action-btns d-flex'>
                                                            <button className='btn btn-warning btn-sm' onClick={() => showGroupCard('edit-group', group.id, group.name)}><i class='bx bx-edit'></i></button>
                                                            <button className='mx-2 btn btn-danger btn-sm' onClick={() => showDeleteCard('group', group.id)}><i class='bx bx-trash'></i></button>
                                                        </td>)
                                                    }
                                                </tr>
                                            ))}
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
    }
    else {
        return (<Page404></Page404>)
    }
}

export default ManageProduct