import React, {useEffect, useState, useRef} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Row, Col, Form, Button } from 'react-bootstrap'
import Product from '../components/Product.js'
import { listProducts } from '../actions/productActions.js';
import Loader from '../components/Loader.js'
import Message from '../components/Message.js'
import { CATEGORIES } from '../constants/categories'

const PAGE_SIZE = 8

function HomeScreen() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  const category = searchParams.get('category') || ''
  const [searchTerm, setSearchTerm] = useState(keyword)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef(null)

  const productList = useSelector(state => state.productList)
  const {loading, error, products} = productList

  useEffect(() => {
    dispatch(listProducts(keyword, category))
  }, [dispatch, keyword, category])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [keyword, category])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, products.length))
      }
    }, {rootMargin: '200px'})

    observer.observe(node)
    return () => observer.disconnect()
  }, [products.length, visibleCount])

  const submitSearch = (e) => {
    e.preventDefault()
    const next = {}
    if (searchTerm.trim()) next.keyword = searchTerm.trim()
    if (category) next.category = category
    setSearchParams(next)
  }

  const selectCategory = (name) => {
    const next = {}
    if (name !== category) next.category = name
    if (keyword) next.keyword = keyword
    setSearchParams(next)
  }

  const visibleProducts = products.slice(0, visibleCount)
  const heading = keyword ? `Search Results for "${keyword}"` : (category || 'Latest Listings')

  return (
    <div>
      <Form className='d-flex my-3' onSubmit={submitSearch}>
        <Form.Control
          type='text'
          placeholder='Search listings...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='me-2'
        />
        <Button type='submit' variant='primary'>Search</Button>
      </Form>

      <div className='d-flex flex-nowrap overflow-auto pb-2 mb-4' style={{gap: '1.5rem'}}>
        {CATEGORIES.map((cat) => {
          const active = category === cat.name
          return (
            <div
              key={cat.slug}
              onClick={() => selectCategory(active ? '' : cat.name)}
              style={{cursor: 'pointer', flex: '0 0 auto', width: '100px', textAlign: 'center'}}
            >
              <div
                className='rounded-circle mb-2 d-flex align-items-center justify-content-center'
                style={{
                  width: '90px', height: '90px', margin: '0 auto',
                  backgroundColor: active ? '#212529' : '#f1f3f5',
                  border: active ? '3px solid #212529' : '1px solid #dee2e6',
                }}
              >
                <i className={cat.icon} style={{fontSize: '2rem', color: active ? '#fff' : '#495057'}}></i>
              </div>
              <div style={{fontSize: '0.85rem', fontWeight: active ? 'bold' : 'normal'}}>{cat.name}</div>
            </div>
          )
        })}
      </div>

      <h1>{heading}</h1>
      {loading ? <Loader/>
        : error ? <Message variant='danger'>{error}</Message>
        : products.length === 0 ? <Message>No listings found</Message>
        :
          <>
            <Row className='g-4'>
              {visibleProducts.map(product => (
                <Col key={product._id} sm={12} md={6} lg={4} xl={3} className='d-flex'>
                  <Product product = {product}/>
                </Col>
              ))}
            </Row>
            {visibleCount < products.length && (
              <div ref={sentinelRef} className='text-center py-4'>
                <Loader/>
              </div>
            )}
          </>
      }

    </div>
  )
}

export default HomeScreen
