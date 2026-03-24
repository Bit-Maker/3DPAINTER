function Home()  {
    return(
         <footer className="bg-dark text-light py-5 mt-5">
      <div className="container" style={{zIndex: "100000", position: "fixed"}}>
        <div className="row">
          <div className="col-lg-8 mb-4">
            <h2 className="h4 text-primary mb-3">
              How to Design Roblox Clothes with BloxTailor
            </h2>
            <p className="text-secondary">
              <strong>BloxTailor</strong> is the premier 3D clothing creator for
              <strong>Roblox</strong>, designed to help you create
              professional-quality shirts and pants with ease. Whether you are
              an experienced UGC creator or a beginner, our real-time 3D editor
              provides the tools you need to bring your designs to life.
            </p>

            <h3 className="h5 mt-4 mb-3">Step-by-Step Guide:</h3>
            <ul className="text-secondary">
              <li className="mb-2">
                <strong>Choose Your Template:</strong> Start with a standard
                <strong>Roblox shirt template</strong> or pants layout to ensure
                your design fits perfectly.
              </li>
              <li className="mb-2">
                <strong>Paint in 3D:</strong> Use our advanced brush tools and
                layer system to paint directly onto the 3D character model. See
                exactly how your clothing looks from every angle in real-time.
              </li>
              <li className="mb-2">
                <strong>Custom Brushes & Layers:</strong> Take advantage of
                layers to add intricate details, shading, and textures without
                ruining your base design.
              </li>
              <li className="mb-2">
                <strong>Export & Upload:</strong> Once finished, export the
                high-quality texture map and upload it directly to the
                <strong>Roblox Marketplace</strong>.
              </li>
            </ul>
          </div>

          <div className="col-lg-4 mb-4">
            <h3 className="h5 text-primary mb-3">Why choose BloxTailor?</h3>
            <p className="text-secondary">
              Unlike traditional 2D editors, our 3D engine eliminates the
              guesswork of how textures wrap around character limbs. BloxTailor
              is <strong>free to use</strong>, mobile-friendly, and optimized
              for high-performance designing.
            </p>
            <hr className="border-secondary" />
            <p className="small text-muted">
              &copy; 2026 BloxTailor. Online 3D Roblox Clothing Editor. <br />
              Not affiliated with Roblox Corporation.
            </p>
          </div>
        </div>
      </div>
    </footer>
    )
}

export default Home;