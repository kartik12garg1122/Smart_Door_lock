import ShopNavbar from '../components/shop/ShopNavbar'
import HeroBanner from '../components/shop/HeroBanner'
import DealsCarousel from '../components/shop/DealsCarousel'
import CategoryGrid from '../components/shop/CategoryGrid'
import KeepShoppingCarousel from '../components/shop/KeepShoppingCarousel'
import RecommendedCarousel from '../components/shop/RecommendedCarousel'
import ShopFooter from '../components/shop/ShopFooter'

export default function ShopPage() {
  return (
    <div className="shop-root min-h-screen" style={{ background: '#131921', fontFamily: 'Inter, sans-serif' }}>
      <ShopNavbar />

      {/* Page offset for fixed navbar */}
      <div style={{ paddingTop: '96px' }}>
        <HeroBanner />

        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
          <DealsCarousel />
          <CategoryGrid />
          <KeepShoppingCarousel />
          <RecommendedCarousel />
        </div>

        <ShopFooter />
      </div>
    </div>
  )
}
