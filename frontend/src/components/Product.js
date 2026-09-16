import React from 'react'
import { Card } from 'react-bootstrap'
import Rating from './Rating.js'
import { Link } from 'react-router-dom'

function Product({product}) {
  return (
    <Card className='p-3 rounded h-100'>
        <Link to={`/product/${product._id}`}>
            <Card.Img src={product.image} variant='top' style={{aspectRatio: '1', objectFit: 'cover'}}/>
        </Link>
        <Card.Body className='d-flex flex-column flex-grow-1'>
            <Link to={`/product/${product._id}`}>
                <Card.Title
                    as="div"
                    title={product.name}
                    style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}
                >
                    <strong>{product.name}</strong>
                </Card.Title>
            </Link>
            <Card.Text as="div">
                <div className="my-3">
                    {product.sellerName && (
                        <div>
                            <Link to={`/seller/${product.user}`} onClick={(e) => e.stopPropagation()}>
                                {product.sellerName}
                            </Link>
                        </div>
                    )}
                    {product.sellerRatingCount > 0 ? (
                        <Rating value={product.sellerRating} text={`(${product.sellerRatingCount})`} color={'#f8e825'}/>
                    ) : (
                        <span className='text-muted'>No reviews yet</span>
                    )}
                </div>
            </Card.Text>
            <Card.Text as="h3" className='mt-auto mb-0'>
                ${product.price}
            </Card.Text>
        </Card.Body>

    </Card>
  )
}

export default Product
