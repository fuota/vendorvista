import { Container} from 'react-bootstrap';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import HomeScreen from './screens/HomeScreen.js';
import ProductScreen from './screens/ProductScreen.js';
import CartScreen from './screens/CartScreen.js';
import LoginScreen from './screens/LoginScreen.js';
import RegisterScreen from './screens/RegisterScreen.js';
import ProfileScreen from './screens/ProfileScreen.js';
import ShippingScreen from './screens/ShippingScreen.js';
import PaymentScreen from './screens/PaymentScreen.js';
import PlaceOrderScreen from './screens/PlaceOrderScreen.js';
import OrderScreen from './screens/OrderScreen.js';
import MyOrdersScreen from './screens/MyOrdersScreen.js';
import CreateListingScreen from './screens/CreateListingScreen.js';
import EditListingScreen from './screens/EditListingScreen.js';
import MyListingsScreen from './screens/MyListingsScreen.js';
import InboxScreen from './screens/InboxScreen.js';
import ChatScreen from './screens/ChatScreen.js';
import SellerProfileScreen from './screens/SellerProfileScreen.js';



function App() {
  return (
    <Router>
      <Header/>
      <main className='py-3'>
        <Container>
          <Routes>
            <Route path='/login' element={<LoginScreen/>}/>
            <Route path='/register' element={<RegisterScreen/>}/>
            <Route path='/profile' element={<ProfileScreen/>}/>
            <Route path='/myorders' element={<MyOrdersScreen/>}/>
            <Route path='/sell' element={<CreateListingScreen/>}/>
            <Route path='/mylistings' element={<MyListingsScreen/>}/>
            <Route path='/inbox' element={<InboxScreen/>}/>
            <Route path='/chat/:id' element={<ChatScreen/>}/>
            <Route path='/seller/:id' element={<SellerProfileScreen/>}/>
            <Route path='/product/:id/edit' element={<EditListingScreen/>}/>
            <Route path='/shipping' element={<ShippingScreen/>}/>
            <Route path='/payment' element={<PaymentScreen/>}/>
            <Route path='/placeorder' element={<PlaceOrderScreen/>}/>
            <Route path='/order/:id' element={<OrderScreen/>}/>
            <Route path='/' element={<HomeScreen/>} exact/> //just render the HomeScreen component when the path is '/'
            <Route path='/product/:id' element={<ProductScreen/>}/> //just render the HomeScreen component when the path is '/'
            <Route path='/cart/:id?' element={<CartScreen/>}/>
          </Routes>       
        </Container>
      </main>
      <Footer/>
        
    </Router>
    
  );
}

export default App;
