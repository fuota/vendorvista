import { Container} from 'react-bootstrap';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import HomeScreen from './screens/HomeScreen.js';
import ProductScreen from './screens/ProductScreen.js';
import CartScreen from './screens/CartScreen.js';
import LoginScreen from './screens/LoginScreen.js';
import RegisterScreen from './screens/RegisterScreen.js';



function App() {
  return (
    <Router>
      <Header/>
      <main className='py-3'>
        <Container>
          <Routes>
            <Route path='/login' element={<LoginScreen/>}/>
            <Route path='/register' element={<RegisterScreen/>}/>
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
