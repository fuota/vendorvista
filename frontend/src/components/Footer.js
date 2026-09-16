import React from 'react'
import { Container, Row, Col} from 'react-bootstrap'

function Footer() {
  return (
    <div>
       <footer>
        <Container>
          <Row>
            <Col className='text-center py-3'>Copy &copy; 2026 VendorVista</Col>
          </Row>
        </Container>
       </footer>
    </div>
  )
}

export default Footer;
