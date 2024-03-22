import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import ManageProduct from './components/admin/ManageProduct';
import { CookiesProvider } from 'react-cookie';
import Product from './components/product';
import Header from './components/Header';
import Category from './components/Category';
import DashBoard from './components/admin/DashBoard';
import Page404 from './components/Page404';
import Orders from './components/Orders';

function App() {
  return (
    <CookiesProvider defaultSetOptions={{ path: '/' }}>
    <div className="App">
      <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/product/:id' element={<Product />}></Route>
          <Route path='/category/:name' element={<Category />}></Route>
          <Route path='/search' element={<Header/>}></Route>
          <Route path='/orders' element={<Orders/>}></Route>
          <Route path='/admin' element={<DashBoard />}></Route>
          <Route path='/admin/manage-products' element={<ManageProduct />}></Route>
          <Route path='/*' element={<Page404 />}></Route>
      </Routes>
    </div>
    </CookiesProvider>
  );
}

export default App;
