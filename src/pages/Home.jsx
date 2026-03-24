import React from "react";
import { Link } from "react-router-dom";
import video from "../assets/blox tailor.mp4";

function Home() {
  return (
    <div className="bg-black text-light min-vh-100 font-sans" style={{ overflowX: "hidden" }}>
      
      {/* NAVBAR (Transparente com logo vibrante) */}
      <nav className="navbar navbar-expand-lg py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="container">
          <Link className="navbar-brand fw-bold fs-3 text-white" to="/">
            Blox<span style={{ color: "#00E5FF" }}>Tailor</span>
          </Link>
          <div className="d-flex gap-3">
            <Link 
              to="/shirt" 
              className="btn btn-sm px-4 rounded-pill fw-bold"
              style={{ border: "2px solid #00E5FF", color: "#00E5FF", backgroundColor: "transparent" }}
              onMouseOver={(e) => { e.target.style.backgroundColor = "#00E5FF"; e.target.style.color = "#000"; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#00E5FF"; }}
            >
              Clothing Editor
            </Link>
            <Link 
              to="/mesh" 
              className="btn btn-sm px-4 rounded-pill fw-bold text-light border-0"
              style={{ background: "linear-gradient(90deg, #FF007A, #7928CA)"}}
            >
              Mesh Painter
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION (Textos brancos, Destaque em Gradiente Neon e Video com Glow) */}
      <header className="d-flex align-items-center py-5" style={{ minHeight: "85vh", position: "relative" }}>
        {/* Glow de fundo sutil */}
        <div style={{ position: "absolute", top: "10%", left: "10%", width: "300px", height: "300px", background: "#7928CA", filter: "blur(150px)", opacity: 0.3, zIndex: 0 }}></div>

        <div className="container" style={{ zIndex: 1 }}>
          <div className="row align-items-center">
            <div className="col-lg-7 text-center text-lg-start pe-lg-5">
              <span 
                className="badge text-uppercase mb-3 py-2 px-3 fw-bold" 
                style={{ background: "rgba(0, 229, 255, 0.1)", color: "#00E5FF", border: "1px solid #00E5FF" }}
              >
                Tailor your best idea with our 3D Roblox Clothing Editor
              </span>
              
              <h1 className="display-3 fw-bolder mb-4 text-white" style={{ letterSpacing: "-1px" }}>
                Design Custom <br/>
                <span style={{ background: "linear-gradient(to right, #00E5FF, #FF007A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Roblox Shirts
                </span> <br/>
                in Real-Time 3D.
              </h1>
              
              {/* Removido o text-secondary (cinza) e trocado por branco levemente opaco */}
              <p className="lead mb-5 pe-lg-5 text-light" style={{ opacity: 0.9 }}>
                Elevate your clothes creation. Paint directly onto 3D models with Blox Tailor. No more 2D guesswork—see your designs come to life instantly.
              </p>
              
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                <Link 
                  to="/shirt" 
                  className="btn btn-lg px-5 py-3 fw-bold rounded-pill border-0 shadow-lg text-black"
                  style={{ background: "linear-gradient(90deg, #00E5FF, #0088FF)" }}
                >
                  Launch Shirt Editor
                </Link>
                <Link 
                  to="/mesh" 
                  className="btn btn-lg px-5 py-3 fw-bold rounded-pill text-white"
                  style={{ border: "2px solid rgba(255, 255, 255, 0.2)", background: "rgba(255, 255, 255, 0.05)" }}
                  onMouseOver={(e) => { e.target.style.borderColor = "#FF007A"; }}
                  onMouseOut={(e) => { e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"; }}
                >
                  Paint 3D Meshes
                </Link>
              </div>
            </div>
            
            {/* HERO VIDEO AREA (Com sombra Neon) */}
            <div className="col-lg-5 mt-5 mt-lg-0">
              <div 
                className="rounded-4 overflow-hidden" 
                style={{ 
                  boxShadow: "0 0 50px rgba(0, 229, 255, 0.3)", 
                  border: "2px solid rgba(0, 229, 255, 0.5)" 
                }}
              >
                <video 
                  className="w-100 h-100 object-fit-cover" 
                  controls 
                  src={video}
                  autoPlay 
                  loop 
                  muted
                  style={{ display: "block" }}
                ></video>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES SECTION FOR SEO (Cards escuros com bordas que brilham) */}
      <section className="py-5 position-relative" style={{ background: "#050505" }}>
        <div className="container py-5">
          <div className="row text-center mb-5">
            <div className="col-lg-8 mx-auto">
              <h2 className="fw-bold text-white mb-3">Professional Tools for Roblox Designers</h2>
              <p className="text-light" style={{ opacity: 0.8 }}>
                Stop struggling with flat 2D templates. BloxTailor is optimized to give you full control over your aesthetic, 
                boosting your workflow and organic reach in the Roblox Marketplace.
              </p>
            </div>
          </div>
          
          <div className="row g-4">
            {/* Card 1 */}
            <div className="col-md-4">
              <div className="p-5 rounded-4 h-100" style={{ background: "#0a0a0a", borderTop: "4px solid #00E5FF", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                <h3 className="h5 text-white mb-3 fw-bold">3D Shirt & Pants Editor</h3>
                <p className="text-light mb-0" style={{ opacity: 0.7 }}>
                  Select standard templates and paint directly on the avatar. Seamlessly wrap your textures around limbs without distortion.
                </p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="col-md-4">
              <div className="p-5 rounded-4 h-100" style={{ background: "#0a0a0a", borderTop: "4px solid #FF007A", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                <h3 className="h5 text-white mb-3 fw-bold">Custom Mesh Painter</h3>
                <p className="text-light mb-0" style={{ opacity: 0.7 }}>
                  Import your custom .OBJ or .FBX files. Utilize our smart Auto-UV tools to isolate faces and paint UGC accessories perfectly.
                </p>
              </div>
            </div>
            {/* Card 3 */}
            <div className="col-md-4">
              <div className="p-5 rounded-4 h-100" style={{ background: "#0a0a0a", borderTop: "4px solid #7928CA", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                <h3 className="h5 text-white mb-3 fw-bold">Advanced Layering</h3>
                <p className="text-light mb-0" style={{ opacity: 0.7 }}>
                  Manage opacity, blend modes, and clipping. Preserve your base layers while adding intricate shading and details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION FOR SEO (Cards escuros com bordas que brilham) */}
      <section className="py-5 position-relative" style={{ background: "#050505" }}>
        <div className="container py-5">
          <div className="row text-center mb-5">
            <div className="col-lg-8 mx-auto">
              <h2 className="fw-bold text-white mb-3">Free Shading Templates</h2>
              <p className="text-light" style={{ opacity: 0.8 }}>
                We have an array of free shadings, you can test all the options, and decide what is the best for your design
              </p>
            </div>
          </div>
          
          
        </div>
      </section>

      {/* FOOTER INTEGRATED (Cores vivas nos títulos e checkmarks) */}
      <footer className="bg-black py-5" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mb-4 pe-lg-5">
              <h2 className="h4 mb-3 fw-bold" style={{ color: "#00E5FF" }}>
                How to Design Roblox Clothes with BloxTailor
              </h2>
              <p className="text-light lh-lg" style={{ opacity: 0.85 }}>
                <strong className="text-white">BloxTailor</strong> is the premier 3D clothing creator for
                <strong className="text-white"> Roblox</strong>, designed to help you create
                professional-quality shirts and pants with ease. Whether you are
                an experienced UGC creator or a beginner, our real-time 3D editor
                provides the tools you need to bring your designs to life.
              </p>

              <h3 className="h5 mt-5 mb-4 text-white fw-bold">Step-by-Step Guide:</h3>
              <ul className="text-light lh-lg list-unstyled" style={{ opacity: 0.85 }}>
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 fs-5" style={{ color: "#FF007A" }}>✦</span>
                  <span><strong className="text-white">Choose Your Template:</strong> Start with a standard <strong>Roblox shirt template</strong> or pants layout to ensure your design fits perfectly.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 fs-5" style={{ color: "#FF007A" }}>✦</span>
                  <span><strong className="text-white">Paint in 3D:</strong> Use our advanced brush tools and layer system to paint directly onto the 3D character model. See exactly how your clothing looks from every angle in real-time.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 fs-5" style={{ color: "#FF007A" }}>✦</span>
                  <span><strong className="text-white">Custom Brushes & Layers:</strong> Take advantage of layers to add intricate details, shading, and textures without ruining your base design.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 fs-5" style={{ color: "#FF007A" }}>✦</span>
                  <span><strong className="text-white">Export & Upload:</strong> Once finished, export the high-quality texture map and upload it directly to the <strong>Roblox Marketplace</strong>.</span>
                </li>
              </ul>
            </div>

            <div className="col-lg-4 mb-4">
              <div className="p-4 rounded-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <h3 className="h5 mb-3 fw-bold" style={{ color: "#7928CA" }}>Why choose BloxTailor?</h3>
                <p className="text-light mb-4" style={{ opacity: 0.8 }}>
                  Unlike traditional 2D editors, our 3D engine eliminates the
                  guesswork of how textures wrap around character limbs. BloxTailor
                  is <strong className="text-white">free to use</strong>, web-based, and optimized
                  for high-performance designing.
                </p>
                <Link 
                  to="/shirt" 
                  className="btn w-100 mb-2 fw-bold text-black"
                  style={{ background: "#00E5FF" }}
                >
                  Start Creating Now
                </Link>
              </div>
              
              <div className="mt-5 text-lg-end text-start">
                <p className="text-light mb-1" style={{ opacity: 0.5, fontSize: "0.85rem" }}>
                  &copy; {new Date().getFullYear()} BloxTailor. Online 3D Roblox Clothing Editor.
                </p>
                <p className="text-light" style={{ opacity: 0.5, fontSize: "0.75rem" }}>
                  Not affiliated with Roblox Corporation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;