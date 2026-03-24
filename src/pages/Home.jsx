import React from "react";
import { Link } from "react-router-dom";
import video from "../assets/blox tailor.mp4";
import textures from "../assets/textures.mp4";

function Home() {
  return (
    <div className="bg-black text-light min-vh-100 font-sans" style={{ overflowX: "hidden" }}>
      
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="container">
          <Link className="navbar-brand fw-bold fs-3 text-white" to="/" aria-label="BloxTailor Home">
            Blox<span style={{ color: "#00E5FF" }}>Tailor</span>
          </Link>
          <div className="d-flex gap-3">
            <Link 
              to="/shirt" 
              className="btn btn-sm px-4 rounded-pill fw-bold"
              style={{ border: "2px solid #00E5FF", color: "#00E5FF", backgroundColor: "transparent" }}
            >
              Shirt Editor
            </Link>
            <Link 
              to="/mesh" 
              className="btn btn-sm px-4 rounded-pill fw-bold text-light border-0"
              style={{ background: "linear-gradient(90deg, #FF007A, #7928CA)" }}
            >
              Mesh Painter
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* HERO SECTION - Foco em H1 e Palavras-Chave Principais */}
        <header className="d-flex align-items-center py-5" style={{ minHeight: "85vh", position: "relative" }}>
          <div style={{ position: "absolute", top: "10%", left: "10%", width: "300px", height: "300px", background: "#7928CA", filter: "blur(150px)", opacity: 0.2, zIndex: 0 }}></div>

          <div className="container" style={{ zIndex: 1 }}>
            <div className="row align-items-center">
              <div className="col-lg-7 text-center text-lg-start pe-lg-5">
                <span 
                  className="badge text-uppercase mb-3 py-2 px-3 fw-bold" 
                  style={{ background: "rgba(0, 229, 255, 0.1)", color: "#00E5FF", border: "1px solid #00E5FF" }}
                >
                  Advanced 3D Clothing Maker for Roblox UGC
                </span>
                
                <h1 className="display-3 fw-bolder mb-4 text-white" style={{ letterSpacing: "-1px" }}>
                  The Best <span style={{ background: "linear-gradient(to right, #00E5FF, #FF007A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    3D Roblox Clothing Editor
                  </span> for Designers.
                </h1>
                
                <p className="lead mb-5 pe-lg-5 text-light" style={{ opacity: 0.9 }}>
                  Create professional Roblox shirts, pants, and UGC accessories with <strong>Blox Tailor</strong>. 
                  Our real-time 3D texture painter eliminates 2D guesswork, allowing you to preview 
                  shading and folds instantly on your avatar.
                </p>
                
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                  <Link to="/shirt" className="btn btn-lg px-5 py-3 fw-bold rounded-pill border-0 shadow-lg text-black" style={{ background: "linear-gradient(90deg, #00E5FF, #0088FF)" }}>
                    Open Shirt Creator
                  </Link>
                  <Link to="/mesh" className="btn btn-lg px-5 py-3 fw-bold rounded-pill text-white" style={{ border: "2px solid rgba(255, 255, 255, 0.2)", background: "rgba(255, 255, 255, 0.05)" }}>
                    Texture 3D Meshes
                  </Link>
                </div>
              </div>
              
              <div className="col-lg-5 mt-5 mt-lg-0">
                <section className="rounded-4 overflow-hidden shadow-lg" style={{ border: "2px solid rgba(0, 229, 255, 0.4)" }}>
                  <video className="w-100 d-block" controls muted loop autoPlay title="BloxTailor 3D Editor Demo" src={video}></video>
                </section>
              </div>
            </div>
          </div>
        </header>

        {/* SHADING SECTION - Foco em Atração de Tráfego por Recursos Gratuitos */}
        <section className="py-5 bg-dark" style={{ background: "linear-gradient(180deg, #000 0%, #080808 100%)" }}>
          <div className="container py-5 text-center">
            <h2 className="fw-bold text-white mb-3">Free Roblox Shading Templates</h2>
            <p className="text-light mx-auto mb-5" style={{ opacity: 0.8, maxWidth: "700px" }}>
              Download and apply professional shading assets. Test multiple realistic textures, 
              wrinkles, and material finishes to make your clothing stand out in the Roblox Marketplace.
            </p>
            <div className="rounded-4 overflow-hidden mx-auto shadow-lg" style={{ maxWidth: "900px", border: "1px solid #333" }}>
              <video className="w-100 d-block" controls muted loop autoPlay title="Roblox Texture Shading Preview" src={textures}></video>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION - Estrutura de lista para leitura de Crawler */}
        <section className="py-5">
          <div className="container">
            <div className="row g-5">
              <div className="col-lg-8">
                <h2 className="h3 mb-4 fw-bold" style={{ color: "#00E5FF" }}>How to Design Roblox Clothes with BloxTailor</h2>
                <p className="text-light lh-lg mb-5">
                  <strong>Blox Tailor</strong> is a powerful web-based 3D editor designed for the Roblox community. 
                  Whether you're making your first shirt or a complex UGC accessory, our tools provide 
                  the precision of professional software like Blender, but directly in your browser.
                </p>

                <div className="row g-4">
                  {[
                    { title: "3D REAL TIME PREVIEW", desc: "Paint directly on the 3D model and see instant results. No more uploading to Roblox just to check for alignment errors." },
                    { title: "MIRROR MODE", desc: "Design faster with symmetrical brush strokes. Perfect for sleeves, pants, and complex patterns." },
                    { title: "PWA & MOBILE SUPPORT", desc: "Install BloxTailor as an app on Google Chrome. Work on your designs offline and on the go with full mobile optimization." },
                    { title: "PRO SHADING LIBRARY", desc: "Access an array of free high-quality shading templates to add depth and realism to your clothing assets." }
                  ].map((feat, i) => (
                    <article className="col-md-6 d-flex align-items-start" key={i}>
                      <span className="me-3 fs-5" style={{ color: "#FF007A" }}>✦</span>
                      <div>
                        <h3 className="h6 text-white fw-bold text-uppercase mb-2">{feat.title}</h3>
                        <p className="small text-light" style={{ opacity: 0.7 }}>{feat.desc}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="col-lg-4">
                <div className="p-4 rounded-4 sticky-top" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", top: "20px" }}>
                  <h3 className="h5 mb-3 fw-bold" style={{ color: "#7928CA" }}>Why BloxTailor?</h3>
                  <ul className="list-unstyled text-light small lh-lg">
                    <li className="mb-2">✓ 100% Free to use</li>
                    <li className="mb-2">✓ No Download Required</li>
                    <li className="mb-2">✓ Export High-Res Textures</li>
                    <li className="mb-2">✓ Optimized for Chromebooks & Mobile</li>
                  </ul>
                  <Link to="/shirt" className="btn w-100 mt-3 fw-bold text-black" style={{ background: "#00E5FF" }}>
                    Start Designing
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black py-5 border-top border-secondary border-opacity-10">
        <div className="container text-center">
          <p className="text-light mb-1" style={{ opacity: 0.5, fontSize: "0.85rem" }}>
            © {new Date().getFullYear()} <strong>Blox Tailor</strong> - Professional Roblox 3D Texturing Tool.
          </p>
          <p className="text-light" style={{ opacity: 0.3, fontSize: "0.75rem" }}>
            Not affiliated with Roblox Corporation. All assets are community-driven.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;