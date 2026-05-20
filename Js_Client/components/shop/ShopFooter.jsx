const FOOTER_COLS = [
  {
    title: 'Get to Know Us',
    links: ['About OrbitNova', 'Careers', 'Press Releases', 'OrbitNova Cares', 'Gift a Smile', 'Sustainability'],
  },
  {
    title: 'Make Money with Us',
    links: ['Sell products on OrbitNova', 'Sell on OrbitNova Business', 'Sell apps on OrbitNova', 'Advertise Your Products', 'Become an Affiliate'],
  },
  {
    title: 'Payment Products',
    links: ['OrbitNova Rewards Visa', 'OrbitNova Store Card', 'OrbitNova Business Card', 'Shop with Points', 'Credit Card Marketplace', 'Reload Your Balance'],
  },
  {
    title: 'Let Us Help You',
    links: ['Your Account', 'Your Orders', 'Your Wish List', 'Your Recommendations', 'Track Packages', 'Shipping Rates & Policies', 'Returns & Replacements', 'Help Center'],
  },
]

export default function ShopFooter() {
  return (
    <footer>
      {/* Back to top */}
      <div
        style={{
          background: '#37475A',
          textAlign: 'center',
          padding: '14px',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onMouseEnter={e => (e.currentTarget.style.background = '#485769')}
        onMouseLeave={e => (e.currentTarget.style.background = '#37475A')}
      >
        <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>↑ Back to top</span>
      </div>

      {/* Main footer */}
      <div style={{ background: '#232F3E', padding: '40px 0 24px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '32px',
            marginBottom: '40px',
          }}>
            {FOOTER_COLS.map(col => (
              <div key={col.title}>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                  {col.title}
                </h4>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {col.links.map(link => (
                    <li key={link}>
                      <a
                        href="#"
                        style={{ fontSize: '13px', color: '#ddd', textDecoration: 'none', transition: 'color 0.12s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#FF9900')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#ddd')}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ background: '#131921', padding: '20px 32px' }}>
        <div style={{
          maxWidth: '1440px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: '18px', color: '#fff' }}>orbit</span>
            <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: '18px', color: '#FF9900' }}>nova</span>
            <span style={{ fontSize: '11px', color: '#666', marginTop: '6px', marginLeft: '2px' }}>.com</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {['Conditions of Use', 'Privacy Notice', 'Consumer Health Data', 'Your Ads Privacy Choices'].map(item => (
              <a key={item} href="#" style={{ fontSize: '12px', color: '#aaa', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FF9900')}
                onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
              >
                {item}
              </a>
            ))}
          </div>
          <span style={{ fontSize: '12px', color: '#666' }}>© 2024, OrbitNova, Inc. or its affiliates</span>
        </div>
      </div>
    </footer>
  )
}
